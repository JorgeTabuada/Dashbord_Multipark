import { NextResponse } from 'next/server'
import { unifiedSync } from '@/lib/unified-sync'

export async function GET() {
  try {
    console.log('🧪 Iniciando teste de sincronização unificada...')

    // 1. Obter estatísticas
    const stats = await unifiedSync.getStats()
    
    console.log('📊 Estatísticas obtidas:', {
      firebase: stats.firebase.connected ? '✅ Conectado' : '❌ Erro',
      supabase: stats.supabase.connected ? '✅ Conectado' : '❌ Erro',
      totalReservations: stats.supabase.total
    })

    // 2. Testar se consegue fazer uma sincronização pequena (apenas 1 cidade/marca)
    let syncResult = null
    
    if (stats.firebase.connected && stats.supabase.connected) {
      try {
        console.log('🔄 Testando sincronização de Lisboa/Airpark...')
        syncResult = await unifiedSync.syncCityBrand('lisbon', 'airpark')
      } catch (syncError) {
        console.error('❌ Erro no teste de sincronização:', syncError)
        syncResult = { success: 0, errors: 1, error: String(syncError) }
      }
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      test_results: {
        firebase_connection: stats.firebase.connected,
        supabase_connection: stats.supabase.connected,
        database_stats: stats.supabase,
        sync_test: syncResult,
        auto_sync_running: unifiedSync.isAutoSyncRunning()
      },
      message: stats.firebase.connected && stats.supabase.connected 
        ? '✅ Todos os sistemas funcionais' 
        : '⚠️ Alguns sistemas com problemas'
    })

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: String(error),
      message: '❌ Teste falhou'
    }, { status: 500 })
  }
}

// POST endpoint para forçar sincronização completa
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'sync_all':
        console.log('🌍 Iniciando sincronização completa forçada...')
        const fullSyncResult = await unifiedSync.syncAll()
        
        return NextResponse.json({
          status: 'success',
          action: 'sync_all',
          result: fullSyncResult,
          message: `Sincronização completa: ${fullSyncResult.totalSuccess} sucessos, ${fullSyncResult.totalErrors} erros`
        })

      case 'sync_city':
        const { city, brand } = body
        if (!city || !brand) {
          return NextResponse.json({ error: 'Cidade e marca obrigatórias' }, { status: 400 })
        }
        
        console.log(`🏙️ Sincronizando ${city}/${brand}...`)
        const citySyncResult = await unifiedSync.syncCityBrand(city, brand)
        
        return NextResponse.json({
          status: 'success',
          action: 'sync_city',
          city,
          brand,
          result: citySyncResult,
          message: `${city}/${brand}: ${citySyncResult.success} sucessos, ${citySyncResult.errors} erros`
        })

      case 'start_auto_sync':
        const { intervalMinutes = 5 } = body
        unifiedSync.startAutoSync(intervalMinutes)
        
        return NextResponse.json({
          status: 'success',
          action: 'start_auto_sync',
          intervalMinutes,
          message: `Sincronização automática iniciada (${intervalMinutes} min)`
        })

      case 'stop_auto_sync':
        unifiedSync.stopAutoSync()
        
        return NextResponse.json({
          status: 'success',
          action: 'stop_auto_sync',
          message: 'Sincronização automática parada'
        })

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Erro na ação POST:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: 'Erro ao executar ação'
    }, { status: 500 })
  }
}