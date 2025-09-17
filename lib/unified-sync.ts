// 🔄 Sistema Unificado de Sincronização Firebase ↔ Supabase
// ============================================================

import { firebaseClient, FirebaseReservationData } from './firebase-client'
import { createClient } from '@supabase/supabase-js'

// Configuração Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Interface para reserva no Supabase
export interface SupabaseReservation {
  id?: number
  firebase_id: string
  city: string
  park_brand: string
  license_plate: string
  client_first_name?: string
  client_last_name?: string
  client_email?: string
  client_phone?: string
  booking_price?: number
  status: string
  created_at?: string
  updated_at?: string
  sync_status?: string
  firebase_last_sync?: string
  [key: string]: any
}

// Classe principal de sincronização
export class UnifiedSyncService {
  private isRunning = false
  private syncInterval?: NodeJS.Timeout

  constructor() {
    console.log('🔄 Unified Sync Service inicializado')
  }

  // ==========================================
  // MÉTODOS DE SINCRONIZAÇÃO
  // ==========================================

  // Sincronizar uma reserva do Firebase para Supabase
  async syncFirebaseToSupabase(firebaseData: FirebaseReservationData): Promise<boolean> {
    try {
      console.log('🔥➡️📦 Sincronizando:', firebaseData.idClient)

      // Transformar dados Firebase para Supabase
      const supabaseData = this.transformFirebaseToSupabase(firebaseData)

      // Verificar se já existe
      const { data: existing } = await supabase
        .from('reservations')
        .select('id')
        .eq('firebase_id', firebaseData.idClient)
        .single()

      let result
      if (existing) {
        // Atualizar
        result = await supabase
          .from('reservations')
          .update({
            ...supabaseData,
            firebase_last_sync: new Date().toISOString()
          })
          .eq('firebase_id', firebaseData.idClient)
      } else {
        // Criar
        result = await supabase
          .from('reservations')
          .insert({
            ...supabaseData,
            firebase_last_sync: new Date().toISOString(),
            sync_status: 'synced'
          })
      }

      if (result.error) {
        console.error('❌ Erro Supabase:', result.error.message)
        return false
      }

      console.log('✅ Sincronizado:', firebaseData.idClient)
      return true

    } catch (error) {
      console.error('❌ Erro na sincronização F→S:', error)
      return false
    }
  }

  // Sincronizar mudanças do Supabase para Firebase
  async syncSupabaseToFirebase(supabaseData: SupabaseReservation): Promise<boolean> {
    try {
      console.log('📦➡️🔥 Sincronizando de volta:', supabaseData.firebase_id)

      // Transformar dados Supabase para Firebase
      const firebaseUpdateData = this.transformSupabaseToFirebase(supabaseData)

      // Atualizar no Firebase
      await firebaseClient.updateReservation(
        supabaseData.city,
        supabaseData.park_brand,
        supabaseData.firebase_id,
        firebaseUpdateData
      )

      // Marcar como sincronizado no Supabase
      await supabase
        .from('reservations')
        .update({ 
          sync_status: 'synced',
          firebase_last_sync: new Date().toISOString()
        })
        .eq('firebase_id', supabaseData.firebase_id)

      console.log('✅ Sincronizado de volta:', supabaseData.firebase_id)
      return true

    } catch (error) {
      console.error('❌ Erro na sincronização S→F:', error)
      return false
    }
  }

  // ==========================================
  // SINCRONIZAÇÃO EM LOTE
  // ==========================================

  // Sincronizar todas as reservas de uma cidade/marca
  async syncCityBrand(city: string, brand: string): Promise<{ success: number; errors: number }> {
    console.log(`🏙️ Sincronizando ${city}/${brand}...`)

    try {
      // Obter reservas do Firebase (aumentar limite para pegar mais dados)
      const firebaseReservations = await firebaseClient.getAllReservations(city, brand, 5000)
      console.log(`📥 ${firebaseReservations.length} reservas encontradas no Firebase`)

      let success = 0
      let errors = 0

      for (const reservation of firebaseReservations) {
        const syncResult = await this.syncFirebaseToSupabase(reservation)
        if (syncResult) {
          success++
        } else {
          errors++
        }

        // Pequena pausa para não sobrecarregar
        await this.sleep(100)
      }

      console.log(`📊 ${city}/${brand}: ${success} ✅ | ${errors} ❌`)
      return { success, errors }

    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${city}/${brand}:`, error)
      return { success: 0, errors: 1 }
    }
  }

  // Sincronizar todas as localizações disponíveis
  async syncAll(): Promise<{ totalSuccess: number; totalErrors: number }> {
    console.log('🌍 Iniciando sincronização completa...')

    try {
      // Obter todas as cidades e marcas do Firebase
      const citiesAndBrands = await firebaseClient.getAllCitiesAndBrands()
      
      let totalSuccess = 0
      let totalErrors = 0

      for (const [city, brands] of Object.entries(citiesAndBrands)) {
        for (const brand of brands) {
          const result = await this.syncCityBrand(city.toLowerCase(), brand.toLowerCase())
          totalSuccess += result.success
          totalErrors += result.errors

          // Pausa entre localizações
          await this.sleep(1000)
        }
      }

      console.log(`🎯 Sincronização completa: ${totalSuccess} ✅ | ${totalErrors} ❌`)
      return { totalSuccess, totalErrors }

    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error)
      return { totalSuccess: 0, totalErrors: 1 }
    }
  }

  // ==========================================
  // TRANSFORMAÇÕES DE DADOS
  // ==========================================

  private transformFirebaseToSupabase(firebaseData: FirebaseReservationData): Partial<SupabaseReservation> {
    return {
      firebase_id: firebaseData.idClient,
      city: firebaseData.city?.toLowerCase() || '',
      park_brand: firebaseData.parkBrand?.toLowerCase() || '',
      // Verificar se licensePlate existe e não está vazio, senão usar firebase_id como fallback
      license_plate: (firebaseData.licensePlate && firebaseData.licensePlate.trim()) 
        ? firebaseData.licensePlate.toUpperCase().substring(0, 50) // Limitar tamanho
        : `FB-${firebaseData.idClient}`.substring(0, 50),
      client_first_name: firebaseData.name?.substring(0, 100) || null,
      client_last_name: firebaseData.lastname?.substring(0, 100) || null,
      client_email: firebaseData.email?.substring(0, 200) || null,
      client_phone: firebaseData.phoneNumber?.substring(0, 50) || null,
      booking_price: this.parsePrice(firebaseData.bookingPrice),
      status: this.mapFirebaseStatus(firebaseData.stats),
      check_in_datetime: this.parseFirebaseDate(firebaseData.checkIn),
      check_out_datetime: this.parseFirebaseDate(firebaseData.checkOut),
      physical_park: firebaseData.park?.substring(0, 100) || null,
      parking_row: firebaseData.row?.substring(0, 20) || null,
      parking_spot: firebaseData.spot?.substring(0, 20) || null,
      last_action_user: firebaseData.actionUser?.substring(0, 200) || null,
      last_action_description: firebaseData.action?.substring(0, 500) || null
    }
  }

  private transformSupabaseToFirebase(supabaseData: SupabaseReservation): Partial<FirebaseReservationData> {
    return {
      stats: this.mapSupabaseStatus(supabaseData.status),
      name: supabaseData.client_first_name,
      lastname: supabaseData.client_last_name,
      email: supabaseData.client_email,
      phoneNumber: supabaseData.client_phone,
      park: supabaseData.physical_park,
      row: supabaseData.parking_row,
      spot: supabaseData.parking_spot,
      actionUser: supabaseData.last_action_user || 'Supabase Sync',
      actionDate: new Date().toLocaleString('pt-PT'),
      action: supabaseData.last_action_description || 'Sincronização automática'
    }
  }

  // ==========================================
  // FUNÇÕES AUXILIARES
  // ==========================================

  private parsePrice(price: string | number | undefined): number | null {
    if (!price) return null
    if (typeof price === 'number') return price
    
    const cleanPrice = String(price).replace(/[^\d.,]/g, '').replace(',', '.')
    const parsed = parseFloat(cleanPrice)
    return isNaN(parsed) ? null : parsed
  }

  private parseFirebaseDate(dateString?: string): string | null {
    if (!dateString) return null
    
    try {
      // Formato Firebase: DD/MM/YYYY, HH:MM
      const [datePart, timePart] = dateString.split(', ')
      if (!datePart || !timePart) return null
      
      const [day, month, year] = datePart.split('/')
      const [hours, minutes] = timePart.split(':')
      
      const date = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day), 
        parseInt(hours), 
        parseInt(minutes)
      )
      
      return date.toISOString()
    } catch {
      return null
    }
  }

  private mapFirebaseStatus(firebaseStatus: string = ''): string {
    const statusMap: { [key: string]: string } = {
      'reservado': 'reservado',
      'em recolha': 'em_recolha',
      'recolhido': 'recolhido',
      'em entrega': 'em_entrega',
      'em movimento': 'em_movimento',
      'entregue': 'entregue',
      'cancelado': 'cancelado'
    }
    
    return statusMap[firebaseStatus] || 'reservado'
  }

  private mapSupabaseStatus(supabaseStatus: string = ''): string {
    const statusMap: { [key: string]: string } = {
      'reservado': 'reservado',
      'em_recolha': 'em recolha',
      'recolhido': 'recolhido',
      'em_entrega': 'em entrega',
      'em_movimento': 'em movimento',
      'entregue': 'entregue',
      'cancelado': 'cancelado'
    }
    
    return statusMap[supabaseStatus] || 'reservado'
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ==========================================
  // SINCRONIZAÇÃO AUTOMÁTICA
  // ==========================================

  startAutoSync(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('⚠️ Sincronização automática já está ativa')
      return
    }

    this.isRunning = true
    console.log(`🔄 Iniciando sincronização automática (${intervalMinutes}min)`)

    // Executar imediatamente
    this.syncAll()

    // Configurar intervalo
    this.syncInterval = setInterval(() => {
      if (this.isRunning) {
        console.log('⏰ Executando sincronização automática...')
        this.syncAll()
      }
    }, intervalMinutes * 60 * 1000)
  }

  stopAutoSync(): void {
    if (!this.isRunning) {
      console.log('⚠️ Sincronização automática não está ativa')
      return
    }

    this.isRunning = false
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }

    console.log('⏸️ Sincronização automática parada')
  }

  isAutoSyncRunning(): boolean {
    return this.isRunning
  }

  // ==========================================
  // ESTATÍSTICAS E MONITORAMENTO
  // ==========================================

  async getStats(): Promise<{
    firebase: { connected: boolean; error?: string }
    supabase: { connected: boolean; total: number; synced: number; pending: number }
    lastSync?: string
  }> {
    // Testar Firebase
    const firebaseConnected = await firebaseClient.testConnection()

    // Testar Supabase e obter estatísticas
    let supabaseStats = {
      connected: false,
      total: 0,
      synced: 0,
      pending: 0
    }

    try {
      const { data: totalData } = await supabase
        .from('reservations')
        .select('count(*)', { count: 'exact' })
      
      const { data: syncedData } = await supabase
        .from('reservations')
        .select('count(*)', { count: 'exact' })
        .eq('sync_status', 'synced')
      
      const { data: pendingData } = await supabase
        .from('reservations')
        .select('count(*)', { count: 'exact' })
        .eq('sync_status', 'pending')

      supabaseStats = {
        connected: true,
        total: (totalData as any)?.[0]?.count || 0,
        synced: (syncedData as any)?.[0]?.count || 0,
        pending: (pendingData as any)?.[0]?.count || 0
      }
    } catch (error) {
      console.error('Erro ao obter stats Supabase:', error)
    }

    return {
      firebase: { connected: firebaseConnected },
      supabase: supabaseStats,
      lastSync: new Date().toISOString()
    }
  }
}

// Instância singleton
export const unifiedSync = new UnifiedSyncService()

// Auto-start em produção
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_SYNC === 'true') {
  console.log('🚀 Auto-iniciando sincronização...')
  unifiedSync.startAutoSync(5) // A cada 5 minutos
}