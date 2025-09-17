// API para sincronização agendada (manual ou cron)
import { NextResponse } from 'next/server'
import { MassSyncService } from '../admin-mass/route'

// Cron job settings (pode ser configurado externamente)
const SYNC_INTERVALS = {
  hourly: 60 * 60 * 1000,       // 1 hora
  daily: 24 * 60 * 60 * 1000,   // 24 horas  
  weekly: 7 * 24 * 60 * 60 * 1000 // 1 semana
}

class ScheduledSyncService {
  private syncInProgress = false
  private lastSyncTime: Date | null = null

  async executeSyncIfNeeded(interval: keyof typeof SYNC_INTERVALS): Promise<any> {
    if (this.syncInProgress) {
      return { 
        status: 'skipped', 
        message: 'Sincronização já em progresso' 
      }
    }

    const now = new Date()
    const intervalMs = SYNC_INTERVALS[interval]
    
    // Verificar se já passou tempo suficiente
    if (this.lastSyncTime && (now.getTime() - this.lastSyncTime.getTime()) < intervalMs) {
      return {
        status: 'skipped',
        message: `Próxima sincronização em ${Math.ceil((intervalMs - (now.getTime() - this.lastSyncTime.getTime())) / 1000 / 60)} minutos`,
        lastSync: this.lastSyncTime,
        nextSync: new Date(this.lastSyncTime.getTime() + intervalMs)
      }
    }

    // Executar sincronização
    this.syncInProgress = true
    console.log(`🕐 Iniciando sincronização agendada (${interval})`)
    
    try {
      const syncService = new MassSyncService()
      const result = await syncService.syncAll()
      
      this.lastSyncTime = now
      this.syncInProgress = false
      
      return {
        status: 'completed',
        interval,
        result,
        completedAt: now,
        nextScheduled: new Date(now.getTime() + intervalMs)
      }
    } catch (error) {
      this.syncInProgress = false
      throw error
    }
  }

  getStatus() {
    return {
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      availableIntervals: Object.keys(SYNC_INTERVALS)
    }
  }
}

const scheduledSync = new ScheduledSyncService()

export async function POST(req: Request) {
  try {
    const { action, interval = 'hourly' } = await req.json()

    switch (action) {
      case 'sync_now':
        // Forçar sincronização agora
        const syncService = new MassSyncService()
        const result = await syncService.syncAll()
        
        return NextResponse.json({
          status: 'success',
          action: 'manual_sync',
          result,
          timestamp: new Date().toISOString()
        })

      case 'sync_scheduled':
        // Sincronização se necessário baseado no intervalo
        const scheduledResult = await scheduledSync.executeSyncIfNeeded(interval)
        
        return NextResponse.json({
          status: 'success',
          action: 'scheduled_sync',
          ...scheduledResult,
          timestamp: new Date().toISOString()
        })

      case 'status':
        return NextResponse.json({
          status: 'success',
          ...scheduledSync.getStatus(),
          intervals: SYNC_INTERVALS
        })

      default:
        return NextResponse.json({
          error: 'Ação inválida. Use: sync_now, sync_scheduled, status'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro na sincronização agendada:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Sincronização Agendada',
    actions: {
      'sync_now': 'Sincronizar imediatamente (manual)',
      'sync_scheduled': 'Sincronizar se necessário baseado no intervalo',
      'status': 'Ver status da sincronização agendada'
    },
    intervals: {
      'hourly': '1 hora',
      'daily': '24 horas', 
      'weekly': '1 semana'
    },
    examples: {
      manual_sync: { action: 'sync_now' },
      hourly_sync: { action: 'sync_scheduled', interval: 'hourly' },
      daily_sync: { action: 'sync_scheduled', interval: 'daily' },
      check_status: { action: 'status' }
    }
  })
}