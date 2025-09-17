// 🔄 Serviço de Sincronização Firebase → Supabase V2
// ===================================================

import { createClient } from '@supabase/supabase-js'
import { firebaseRTDB } from './firebase-rtdb'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

export class SyncService {
  private syncInterval: NodeJS.Timeout | null = null
  private isRunning = false
  private lastSyncTimes: Map<string, Date> = new Map()
  private unsubscribers: Map<string, () => void> = new Map()

  // Mapear estado Firebase → Supabase
  private mapStatus(firebaseStatus?: string): string {
    const statusMap: Record<string, string> = {
      'stats': 'reservado', // Typo comum no Firebase
      'booked': 'reservado',
      'reserved': 'reservado',
      'picking': 'em_recolha',
      'picked': 'recolhido',
      'delivering': 'em_entrega',
      'delivered': 'entregue',
      'completed': 'entregue',
      'cancelled': 'cancelado',
      'canceled': 'cancelado'
    }
    
    const status = firebaseStatus?.toLowerCase() || 'reservado'
    return statusMap[status] || status
  }

  // Converter preço para número
  private parsePrice(price: any): number {
    if (typeof price === 'number') return price
    if (typeof price === 'string') {
      const cleaned = price.replace(/[€$,]/g, '').trim()
      return parseFloat(cleaned) || 0
    }
    return 0
  }

  // Mapear reserva completa
  private mapReservation(firebaseData: any, id: string): any {
    return {
      booking_id: id || firebaseData.id || firebaseData.idClient,
      
      // Dados do cliente
      name_cliente: firebaseData.name,
      lastname_cliente: firebaseData.lastname,
      email_cliente: firebaseData.email,
      phone_number_cliente: firebaseData.phoneNumber,
      cidade_cliente: firebaseData.city,
      nif_cliente: firebaseData.taxNumber,
      nome_fiscal_cliente: firebaseData.taxName,
      
      // Veículo
      license_plate: firebaseData.licensePlate || '',
      car_info: firebaseData.carInfo,
      
      // Datas
      booking_date: firebaseData.bookingDate,
      check_in_previsto: firebaseData.checkIn,
      check_out_previsto: firebaseData.checkOut,
      
      // Valores
      booking_price: this.parsePrice(firebaseData.bookingPrice),
      parking_price: this.parsePrice(firebaseData.parkingPrice),
      delivery_price: this.parsePrice(firebaseData.deliveryPrice),
      corrected_price: this.parsePrice(firebaseData.correctedPrice),
      price_on_delivery: this.parsePrice(firebaseData.priceOnDelivery),
      
      // Estado e localização
      estado_reserva_atual: this.mapStatus(firebaseData.stats),
      park_name: firebaseData.parkBrand || firebaseData.park,
      parking_type: firebaseData.parkingType,
      spot_code: firebaseData.spot,
      row_code: firebaseData.row,
      alocation: firebaseData.alocation,
      
      // Extras
      return_flight: firebaseData.returnFlight,
      payment_method: firebaseData.paymentMethod,
      checkin_video_url: firebaseData.checkInVideo,
      car_location: firebaseData.carLocation,
      
      // Condutores
      condutor_recolha: firebaseData.condutorRecolha,
      condutor_entrega: firebaseData.condutorEntrega,
      
      // Metadata
      source: 'firebase_sync',
      sync_status: 'synced',
      last_sync_at: new Date().toISOString()
    }
  }

  // Sincronizar uma reserva
  async syncReservation(reservation: any, id: string): Promise<boolean> {
    try {
      const mapped = this.mapReservation(reservation, id)
      
      // Verificar se existe
      const { data: existing } = await supabase
        .from('reservas')
        .select('id_pk, updated_at_db')
        .eq('booking_id', mapped.booking_id)
        .single()

      if (existing) {
        // Atualizar apenas se mudou
        const { error } = await supabase
          .from('reservas')
          .update(mapped)
          .eq('booking_id', mapped.booking_id)
        
        if (error) throw error
      } else {
        // Inserir nova
        const { error } = await supabase
          .from('reservas')
          .insert([mapped])
        
        if (error) throw error
        console.log(`✅ Nova: ${mapped.booking_id}`)
      }

      return true
    } catch (error) {
      console.error(`❌ Erro em ${id}:`, error)
      return false
    }
  }

  // Sincronizar cidade/marca
  async syncLocation(city: string, brand: string): Promise<{success: number, errors: number}> {
    console.log(`🔄 Sincronizando ${city}/${brand}...`)
    
    const reservations = await firebaseRTDB.getReservations(city, brand)
    let success = 0
    let errors = 0

    // Processar em paralelo (máximo 5 de cada vez)
    const batchSize = 5
    for (let i = 0; i < reservations.length; i += batchSize) {
      const batch = reservations.slice(i, i + batchSize)
      
      const results = await Promise.all(
        batch.map(r => this.syncReservation(r, r.id!))
      )
      
      success += results.filter(r => r).length
      errors += results.filter(r => !r).length
    }

    this.lastSyncTimes.set(`${city}/${brand}`, new Date())
    
    console.log(`✅ ${city}/${brand}: ${success} OK, ${errors} erros`)
    return { success, errors }
  }

  // Sincronizar tudo
  async syncAll(): Promise<any> {
    if (this.isRunning) {
      console.log('⏳ Sincronização já em execução')
      return null
    }

    this.isRunning = true
    const startTime = Date.now()
    const results: any = {}

    try {
      const cities = await firebaseRTDB.getCities()
      
      for (const city of cities) {
        const brands = await firebaseRTDB.getBrands(city)
        results[city] = {}
        
        for (const brand of brands) {
          const result = await this.syncLocation(city, brand)
          results[city][brand] = result
          
          // Pequena pausa entre sincronizações
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      const duration = Date.now() - startTime
      console.log(`✅ Sincronização completa em ${duration/1000}s`)
      
      return {
        duration,
        results,
        timestamp: new Date()
      }
    } finally {
      this.isRunning = false
    }
  }

  // Iniciar sincronização em tempo real
  startRealtime(city: string, brand: string): void {
    const key = `${city}/${brand}`
    
    // Se já existe, parar primeiro
    if (this.unsubscribers.has(key)) {
      this.stopRealtime(city, brand)
    }

    console.log(`⚡ Tempo real ativo: ${key}`)
    
    const unsubscribe = firebaseRTDB.listenToReservations(
      city, 
      brand,
      async (reservations) => {
        // Sincronizar apenas as últimas 10
        const recent = reservations.slice(-10)
        
        for (const reservation of recent) {
          await this.syncReservation(reservation, reservation.id!)
        }
      }
    )

    this.unsubscribers.set(key, unsubscribe)
  }

  // Parar sincronização em tempo real
  stopRealtime(city?: string, brand?: string): void {
    if (city && brand) {
      const key = `${city}/${brand}`
      const unsubscribe = this.unsubscribers.get(key)
      
      if (unsubscribe) {
        unsubscribe()
        this.unsubscribers.delete(key)
        console.log(`🛑 Tempo real parado: ${key}`)
      }
    } else {
      // Parar todos
      this.unsubscribers.forEach((unsubscribe, key) => {
        unsubscribe()
        console.log(`🛑 Tempo real parado: ${key}`)
      })
      this.unsubscribers.clear()
    }
  }

  // Iniciar sincronização automática periódica
  startAutoSync(intervalMs: number = 300000): void { // 5 minutos por defeito
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    console.log(`🤖 Auto-sync iniciado (${intervalMs/1000}s)`)
    
    // Primeira sincronização imediata
    this.syncAll()
    
    // Depois periódica
    this.syncInterval = setInterval(() => {
      this.syncAll()
    }, intervalMs)
  }

  // Parar sincronização automática
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('🛑 Auto-sync parado')
    }
  }

  // Obter estatísticas
  async getStats(): Promise<any> {
    const firebaseStats = await firebaseRTDB.getStats()
    
    const { data: supabaseData } = await supabase
      .from('reservas')
      .select('source, sync_status, last_sync_at')
      .eq('source', 'firebase_sync')
    
    const recentSync = supabaseData?.filter(r => {
      if (!r.last_sync_at) return false
      const syncTime = new Date(r.last_sync_at)
      const hourAgo = new Date(Date.now() - 3600000)
      return syncTime > hourAgo
    }).length || 0

    return {
      firebase: firebaseStats,
      supabase: {
        total: supabaseData?.length || 0,
        recentSync,
        synced: supabaseData?.filter(r => r.sync_status === 'synced').length || 0
      },
      lastSyncTimes: Array.from(this.lastSyncTimes.entries()).map(([key, time]) => ({
        location: key,
        time: time.toISOString()
      })),
      isRunning: this.isRunning,
      hasAutoSync: !!this.syncInterval,
      activeRealtime: Array.from(this.unsubscribers.keys())
    }
  }
}

// Singleton
export const syncService = new SyncService()

// Auto-iniciar se configurado
if (process.env.AUTO_START_SYNC === 'true' && typeof window !== 'undefined') {
  setTimeout(() => {
    const interval = parseInt(process.env.SYNC_INTERVAL_MS || '300000')
    syncService.startAutoSync(interval)
    console.log('🚀 Sincronização automática iniciada')
  }, 5000) // Aguardar 5s após carregar a página
}
