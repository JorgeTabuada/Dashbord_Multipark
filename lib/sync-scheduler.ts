// Scheduler para sincronização automática entre Firebase e Supabase
import { firebaseClient } from './firebase-client'
import { 
  syncReservationToSupabase, 
  getSyncStats, 
  getReservationsToSync,
  markReservationAsSynced 
} from './firebase-sync'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

function getSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
  }

  if (!supabase) {
    throw new Error('Cliente Supabase não inicializado')
  }

  return supabase
}

export class SyncScheduler {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private syncIntervalMs = 5 * 60 * 1000 // 5 minutos por padrão

  constructor(intervalMs?: number) {
    if (intervalMs) {
      this.syncIntervalMs = intervalMs
    }
  }

  // Iniciar sincronização automática
  start() {
    if (this.isRunning) {
      console.log('Scheduler já está em execução')
      return
    }

    console.log(`Iniciando scheduler de sincronização (intervalo: ${this.syncIntervalMs / 1000}s)`)
    
    this.isRunning = true
    
    // Executar sincronização imediatamente
    this.performSync()
    
    // Configurar intervalo
    this.intervalId = setInterval(() => {
      this.performSync()
    }, this.syncIntervalMs)
  }

  // Parar sincronização automática
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler não está em execução')
      return
    }

    console.log('Parando scheduler de sincronização')
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.isRunning = false
  }

  // Executar sincronização completa
  async performSync() {
    if (!this.isRunning) return

    const supabaseClient = getSupabaseClient()

    console.log('Iniciando ciclo de sincronização...')

    try {
      // 1. Sincronizar do Firebase para Supabase
      await this.syncFromFirebaseToSupabase()
      
      // 2. Sincronizar do Supabase para Firebase
      await this.syncFromSupabaseToFirebase()
      
      // 3. Log de estatísticas
      const stats = await getSyncStats()
      console.log('Estatísticas de sincronização:', {
        total: stats.total,
        synced: stats.synced,
        pending: stats.pending,
        errors: stats.errors
      })
      
    } catch (error) {
      console.error('Erro no ciclo de sincronização:', error)

      // Log do erro
      await supabaseClient.from('sync_logs').insert({
        sync_type: 'scheduler',
        table_name: 'system',
        record_id: 'scheduler',
        operation: 'full_sync',
        success: false,
        error_message: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // Sincronizar mudanças recentes do Firebase para Supabase
  private async syncFromFirebaseToSupabase() {
    try {
      const supabaseClient = getSupabaseClient()

      console.log('Sincronizando Firebase → Supabase...')

      // Obter configuração de cidades e marcas
      const citiesAndBrands = await firebaseClient.getAllCitiesAndBrands()
      
      let totalSynced = 0
      let totalErrors = 0
      
      // Para cada cidade e marca, buscar reservas recentes (últimas 2 horas)
      for (const city of Object.keys(citiesAndBrands)) {
        const brands = citiesAndBrands[city]
        
        for (const brand of brands) {
          try {
            // Buscar reservas modificadas nas últimas 2 horas
            const recentReservations = await firebaseClient.getRecentReservations(
              city.toLowerCase(), 
              brand.toLowerCase(), 
              2
            )
            
            console.log(`${city}/${brand}: ${recentReservations.length} reservas recentes`)
            
            // Sincronizar cada reserva
            for (const reservation of recentReservations) {
              try {
                await syncReservationToSupabase(reservation)
                totalSynced++
              } catch (error) {
                console.error(`Erro ao sincronizar ${reservation.idClient}:`, error)
                totalErrors++
              }
            }
            
          } catch (error) {
            console.error(`Erro ao buscar reservas de ${city}/${brand}:`, error)
            totalErrors++
          }
        }
      }
      
      console.log(`Firebase → Supabase: ${totalSynced} sincronizadas, ${totalErrors} erros`)

      // Log do resultado
      await supabaseClient.from('sync_logs').insert({
        sync_type: 'scheduler_firebase_to_supabase',
        table_name: 'reservations',
        record_id: 'batch',
        operation: 'sync_recent',
        success: totalErrors === 0,
        sync_data: {
          synced: totalSynced,
          errors: totalErrors
        }
      })
      
    } catch (error) {
      console.error('Erro na sincronização Firebase → Supabase:', error)
      throw error
    }
  }

  // Sincronizar mudanças pendentes do Supabase para Firebase
  private async syncFromSupabaseToFirebase() {
    try {
      const supabaseClient = getSupabaseClient()

      console.log('Sincronizando Supabase → Firebase...')

      // Obter reservas que precisam ser sincronizadas
      const pendingReservations = await getReservationsToSync()
      
      console.log(`${pendingReservations.length} reservas pendentes para Firebase`)
      
      let totalSynced = 0
      let totalErrors = 0
      
      for (const reservation of pendingReservations) {
        try {
          // Converter dados para formato Firebase
          const firebaseData = this.transformSupabaseToFirebaseData(reservation)
          
          // Atualizar no Firebase
          await firebaseClient.updateReservation(
            reservation.city,
            reservation.park_brand,
            reservation.firebase_id,
            firebaseData
          )
          
          // Marcar como sincronizado
          await markReservationAsSynced(reservation.firebase_id)
          
          totalSynced++
          
        } catch (error) {
          console.error(`Erro ao sincronizar ${reservation.firebase_id} para Firebase:`, error)

          // Marcar como erro
          await supabaseClient
            .from('reservations')
            .update({ sync_status: 'error' })
            .eq('firebase_id', reservation.firebase_id)

          totalErrors++
        }
      }
      
      console.log(`Supabase → Firebase: ${totalSynced} sincronizadas, ${totalErrors} erros`)

      // Log do resultado
      await supabaseClient.from('sync_logs').insert({
        sync_type: 'scheduler_supabase_to_firebase',
        table_name: 'reservations',
        record_id: 'batch',
        operation: 'sync_pending',
        success: totalErrors === 0,
        sync_data: {
          synced: totalSynced,
          errors: totalErrors,
          total_pending: pendingReservations.length
        }
      })
      
    } catch (error) {
      console.error('Erro na sincronização Supabase → Firebase:', error)
      throw error
    }
  }

  // Transformar dados Supabase para Firebase
  private transformSupabaseToFirebaseData(supabaseData: any) {
    return {
      stats: this.mapSupabaseStatusToFirebase(supabaseData.status),
      name: supabaseData.client_first_name,
      lastname: supabaseData.client_last_name,
      email: supabaseData.client_email,
      phoneNumber: supabaseData.client_phone,
      licensePlate: supabaseData.license_plate,
      bookingPrice: supabaseData.booking_price?.toString(),
      checkIn: this.formatDateForFirebase(supabaseData.check_in_datetime),
      checkOut: this.formatDateForFirebase(supabaseData.check_out_datetime),
      park: supabaseData.physical_park,
      row: supabaseData.parking_row,
      spot: supabaseData.parking_spot,
      alocation: supabaseData.allocation_number,
      actionUser: supabaseData.last_action_user || 'Supabase Sync',
      actionDate: this.formatDateForFirebase(supabaseData.last_action_date),
      action: supabaseData.last_action_description || 'Sincronização automática'
    }
  }

  // Mapear status Supabase para Firebase
  private mapSupabaseStatusToFirebase(supabaseStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'reservado': 'reservado',
      'em_recolha': 'em recolha',
      'recolhido': 'recolhido',
      'em_entrega': 'em entrega',
      'em_movimento': 'em movimento',
      'entregue': 'entregue',
      'cancelado': 'cancelado'
    }
    
    return statusMap[supabaseStatus] || supabaseStatus
  }

  // Formatar data para Firebase
  private formatDateForFirebase(dateString?: string | null): string | undefined {
    if (!dateString) return undefined
    
    try {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      return `${day}/${month}/${year}, ${hours}:${minutes}`
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return undefined
    }
  }

  // Executar sincronização manual (força)
  async forceSyncAll() {
    console.log('Executando sincronização manual completa...')
    await this.performSync()
  }

  // Obter status do scheduler
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.syncIntervalMs,
      nextRunIn: this.intervalId ? this.syncIntervalMs : null
    }
  }

  // Configurar intervalo de sincronização
  setInterval(intervalMs: number) {
    this.syncIntervalMs = intervalMs
    
    if (this.isRunning) {
      // Reiniciar com novo intervalo
      this.stop()
      this.start()
    }
  }
}

// Instância singleton do scheduler
export const syncScheduler = new SyncScheduler()

// Auto-iniciar em produção
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_SYNC === 'true') {
  console.log('Auto-iniciando scheduler de sincronização...')
  syncScheduler.start()
}