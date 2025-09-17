import { NextRequest, NextResponse } from 'next/server'
import { syncService } from '@/lib/sync-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, city, brand, locations } = body

    switch (action) {
      case 'sync_single':
        if (!city || !brand) {
          return NextResponse.json(
            { error: 'Cidade e marca são obrigatórios' },
            { status: 400 }
          )
        }
        await syncService.syncAllReservations(city, brand)
        break

      case 'sync_multiple':
        if (!locations || !Array.isArray(locations)) {
          return NextResponse.json(
            { error: 'Localizações inválidas' },
            { status: 400 }
          )
        }
        await syncService.syncMultipleLocations(locations)
        break

      case 'start_realtime':
        if (!city || !brand) {
          return NextResponse.json(
            { error: 'Cidade e marca são obrigatórios' },
            { status: 400 }
          )
        }
        syncService.startRealtimeSync(city, brand)
        break

      case 'stop_realtime':
        syncService.stopRealtimeSync(city, brand)
        break

      case 'get_stats':
        const stats = await syncService.getStats()
        return NextResponse.json(stats)

      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de sincronização:', error)
    return NextResponse.json(
      { error: 'Erro ao processar sincronização' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await syncService.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas' },
      { status: 500 }
    )
  }
}
