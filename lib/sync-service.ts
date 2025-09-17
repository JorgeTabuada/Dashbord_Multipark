// 🔥 Sistema de Sincronização Firebase → Supabase
// ================================================

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, get } from 'firebase/database'
import { createClient } from '@supabase/supabase-js'

// Configurações
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Inicializar
const firebaseApp = initializeApp(FIREBASE_CONFIG)
const firebaseDb = getDatabase(firebaseApp)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Interface para mapear dados
interface FirebaseReservation {
  id: string
  city?: string
  parkBrand?: string
  licensePlate: string
  clientFirstName?: string
  clientLastName?: string
  clientEmail?: string
  clientPhone?: string
  bookingDate?: string
  checkInDatetime?: string
  checkOutDatetime?: string
  bookingPrice?: number
  status?: string
  parkingType?: string
  deliveryLocation?: string
  returnFlight?: string
  carInfo?: string
  paymentMethod?: string
  [key: string]: any
}

interface SupabaseReservation {
  booking_id: string
  cidade_cliente?: string
  park_name?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  email_cliente?: string
  phone_number_cliente?: string
  booking_date?: string
  check_in_previsto?: string
  check_out_previsto?: string
  booking_price?: number
  estado_reserva_atual?: string
  parking_type?: string
  delivery_location?: string
  return_flight?: string
  car_info?: string
  payment_method?: string
  source: string
  sync_status: string
  last_sync_at?: string
  [key: string]: any
}

export class FirebaseToSupabaseSync {
  private listeners: Map<string, any> = new Map()
  private syncInProgress = false
  private lastSyncTime: Date | null = null

  // Mapear campos Firebase → Supabase
  private mapReservation(firebaseData: FirebaseReservation): SupabaseReservation {
    return {
      booking_id: firebaseData.id,
      cidade_cliente: firebaseData.city,
      park_name: firebaseData.parkBrand,
      license_plate: firebaseData.licensePlate,
      name_cliente: firebaseData.clientFirstName,
      lastname_cliente: firebaseData.clientLastName,
      email_cliente: firebaseData.clientEmail,
      phone_number_cliente: firebaseData.clientPhone,
      booking_date: firebaseData.bookingDate,
      check_in_previsto: firebaseData.checkInDatetime,
      check_out_previsto: firebaseData.checkOutDatetime,
      booking_price: firebaseData.bookingPrice,
      estado_reserva_atual: this.mapStatus(firebaseData.status),
      parking_type: firebaseData.parkingType,
      delivery_location: firebaseData.deliveryLocation,
      return_flight: firebaseData.returnFlight,
      car_info: firebaseData.carInfo,
      payment_method: firebaseData.paymentMethod,
      source: 'firebase_sync',
      sync_status: 'synced',
      last_sync_at: new Date().toISOString()
    }
  }

  // Mapear estados
  private mapStatus(firebaseStatus?: string): string {
    const statusMap: Record<string, string> = {
      'booked': 'reservado',
      'picking_up': 'em_recolha',
      'picked_up': 'recolhido',
      'delivering': 'em_entrega',
      'delivered': 'entregue',
      'cancelled': 'cancelado',
      'completed': 'entregue'
    }
    return statusMap[firebaseStatus || ''] || 'reservado'
  }

  // Sincronizar uma reserva
  async syncSingleReservation(reservation: FirebaseReservation): Promise<boolean> {
    try {
      const mappedData = this.mapReservation(reservation)
      
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('reservas')
        .select('id_pk')
        .eq('booking_id', mappedData.booking_id)
        .single()

      if (existing) {
        // Atualizar
        const { error } = await supabase
          .from('reservas')
          .update(mappedData)
          .eq('booking_id', mappedData.booking_id)
        
        if (error) throw error
        console.log(`✅ Atualizada: ${mappedData.booking_id}`)
      } else {
        // Inserir nova
        const { error } = await supabase
          .from('reservas')
          .insert([mappedData])
        
        if (error) throw error
        console.log(`✅ Nova reserva: ${mappedData.booking_id}`)
      }

      return true
    } catch (error) {
      console.error('❌ Erro ao sincronizar reserva:', error)
      
      // Registar erro no log
      await supabase
        .from('sync_logs')
        .insert({
          table_name: 'reservas',
          operation: 'sync',
          firebase_id: reservation.id,
          status: 'error',
          error_message: String(error)
        })
      
      return false
    }
  }

  // Sincronizar todas as reservas de uma cidade/marca
  async syncAllReservations(city: string, brand: string): Promise<void> {
    if (this.syncInProgress) {
      console.log('⏳ Sincronização já em progresso...')
      return
    }

    this.syncInProgress = true
    console.log(`🔄 Iniciando sincronização: ${city}/${brand}`)

    try {
      const path = `reservations/${city}/${brand}`
      const reservationsRef = ref(firebaseDb, path)
      const snapshot = await get(reservationsRef)

      if (!snapshot.exists()) {
        console.log('📭 Sem reservas para sincronizar')
        return
      }

      const reservations = snapshot.val()
      const reservationIds = Object.keys(reservations)
      
      console.log(`📊 Total de reservas encontradas: ${reservationIds.length}`)

      let successCount = 0
      let errorCount = 0

      // Processar em lotes de 10
      const batchSize = 10
      for (let i = 0; i < reservationIds.length; i += batchSize) {
        const batch = reservationIds.slice(i, i + batchSize)
        
        const promises = batch.map(id => 
          this.syncSingleReservation({
            id,
            ...reservations[id]
          })
        )

        const results = await Promise.all(promises)
        successCount += results.filter(r => r).length
        errorCount += results.filter(r => !r).length

        console.log(`📦 Lote processado: ${i + batch.length}/${reservationIds.length}`)
      }

      // Registar estatísticas
      await supabase
        .from('sync_logs')
        .insert({
          table_name: 'reservas',
          operation: 'bulk_sync',
          status: 'success',
          error_message: `Sincronizadas: ${successCount}, Erros: ${errorCount}`
        })

      console.log(`✅ Sincronização completa! Sucesso: ${successCount}, Erros: ${errorCount}`)
      this.lastSyncTime = new Date()

    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // Ouvir mudanças em tempo real
  startRealtimeSync(city: string, brand: string): void {
    const path = `reservations/${city}/${brand}`
    const reservationsRef = ref(firebaseDb, path)
    
    console.log(`👂 Ouvindo mudanças em: ${path}`)

    const listener = onValue(reservationsRef, async (snapshot) => {
      if (!snapshot.exists()) return

      const data = snapshot.val()
      const keys = Object.keys(data)
      
      // Processar apenas as últimas 5 reservas (para evitar sobrecarga)
      const recentKeys = keys.slice(-5)
      
      for (const key of recentKeys) {
        await this.syncSingleReservation({
          id: key,
          ...data[key]
        })
      }
    })

    this.listeners.set(path, listener)
  }

  // Parar listeners
  stopRealtimeSync(city?: string, brand?: string): void {
    if (city && brand) {
      const path = `reservations/${city}/${brand}`
      const listener = this.listeners.get(path)
      if (listener) {
        listener()
        this.listeners.delete(path)
        console.log(`🛑 Parado: ${path}`)
      }
    } else {
      // Parar todos
      this.listeners.forEach((listener, path) => {
        listener()
        console.log(`🛑 Parado: ${path}`)
      })
      this.listeners.clear()
    }
  }

  // Sincronizar múltiplas cidades/marcas
  async syncMultipleLocations(locations: Array<{city: string, brand: string}>): Promise<void> {
    console.log(`🌍 Sincronizando ${locations.length} localizações...`)
    
    for (const location of locations) {
      await this.syncAllReservations(location.city, location.brand)
      
      // Aguardar um pouco entre sincronizações
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Obter estatísticas
  async getStats(): Promise<any> {
    const { data } = await supabase
      .from('reservas')
      .select('source, sync_status')
      .eq('source', 'firebase_sync')
    
    const stats = {
      total: data?.length || 0,
      synced: data?.filter(r => r.sync_status === 'synced').length || 0,
      pending: data?.filter(r => r.sync_status === 'pending').length || 0,
      lastSync: this.lastSyncTime
    }

    return stats
  }
}

// Singleton
export const syncService = new FirebaseToSupabaseSync()
