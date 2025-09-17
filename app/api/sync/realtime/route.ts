// API para ativar/desativar sincronização em tempo real
import { NextRequest, NextResponse } from 'next/server'
import { syncService } from '@/lib/sync-service'

interface StartRealtimeRequest {
  action: 'start' | 'stop' | 'status'
  locations?: Array<{ city: string, brand: string }>
}

export async function POST(request: NextRequest) {
  try {
    const { action, locations }: StartRealtimeRequest = await request.json()

    switch (action) {
      case 'start':
        return await startRealtimeSync(locations)
      
      case 'stop':
        return await stopRealtimeSync(locations)
      
      case 'status':
        return await getRealtimeStatus()
      
      default:
        return NextResponse.json(
          { error: 'Ação inválida. Use: start, stop ou status' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro na API realtime sync:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

async function startRealtimeSync(locations?: Array<{ city: string, brand: string }>) {
  try {
    // Localizações padrão se não especificadas
    const defaultLocations = [
      { city: 'lisbon', brand: 'airpark' },    // Maior volume
      { city: 'lisbon', brand: 'redpark' },    // Maior volume  
      { city: 'porto', brand: 'airpark' },     // Médio volume
      { city: 'porto', brand: 'redpark' },     // Médio volume
      { city: 'faro', brand: 'airpark' },      // Médio volume
      { city: 'lisbon', brand: 'skypark' },    // Menor volume
      { city: 'lisbon', brand: 'top-parking' } // Menor volume
    ]
    
    const targetLocations = locations || defaultLocations
    
    console.log('🚀 Iniciando sincronização em tempo real...')
    
    for (const location of targetLocations) {
      try {
        syncService.startRealtimeSync(location.city, location.brand)
        console.log(`✅ Realtime sync ativo: ${location.city}/${location.brand}`)
      } catch (error) {
        console.error(`❌ Erro em ${location.city}/${location.brand}:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Sincronização em tempo real iniciada para ${targetLocations.length} localizações`,
      locations: targetLocations,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    throw new Error(`Erro ao iniciar realtime sync: ${error}`)
  }
}

async function stopRealtimeSync(locations?: Array<{ city: string, brand: string }>) {
  try {
    if (locations && locations.length > 0) {
      // Parar localizações específicas
      for (const location of locations) {
        syncService.stopRealtimeSync(location.city, location.brand)
        console.log(`🛑 Realtime sync parado: ${location.city}/${location.brand}`)
      }
      
      return NextResponse.json({
        success: true,
        message: `Realtime sync parado para ${locations.length} localizações específicas`,
        locations
      })
    } else {
      // Parar todos
      syncService.stopRealtimeSync()
      console.log('🛑 Todos os realtime sync foram parados')
      
      return NextResponse.json({
        success: true,
        message: 'Todos os realtime sync foram parados'
      })
    }
  } catch (error) {
    throw new Error(`Erro ao parar realtime sync: ${error}`)
  }
}

async function getRealtimeStatus() {
  try {
    const stats = await syncService.getStats()
    
    return NextResponse.json({
      success: true,
      message: 'Status da sincronização em tempo real',
      stats: {
        total_synced_reservations: stats.total,
        successful_syncs: stats.synced,
        pending_syncs: stats.pending,
        last_sync_time: stats.lastSync
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    throw new Error(`Erro ao obter status: ${error}`)
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API de Sincronização em Tempo Real',
    endpoints: {
      'POST /api/sync/realtime': {
        'start': 'Iniciar sincronização em tempo real',
        'stop': 'Parar sincronização em tempo real', 
        'status': 'Ver status da sincronização'
      }
    },
    example: {
      start_all: {
        action: 'start'
      },
      start_specific: {
        action: 'start',
        locations: [
          { city: 'lisbon', brand: 'airpark' },
          { city: 'porto', brand: 'redpark' }
        ]
      },
      stop_all: {
        action: 'stop'
      },
      get_status: {
        action: 'status'
      }
    }
  })
}