import { NextRequest, NextResponse } from 'next/server'
import { firestoreSync } from '@/lib/firestore-sync'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, collection } = body

    switch (action) {
      case 'sync_all':
        const result = await firestoreSync.syncAll()
        return NextResponse.json(result)

      case 'sync_collection':
        if (!collection) {
          return NextResponse.json(
            { error: 'Coleção é obrigatória' },
            { status: 400 }
          )
        }
        const collectionResult = await firestoreSync.syncCollection(collection)
        return NextResponse.json(collectionResult)

      case 'discover':
        const collections = await firestoreSync.discoverCollections()
        return NextResponse.json({ collections })

      case 'start_realtime':
        if (!collection) {
          return NextResponse.json(
            { error: 'Coleção é obrigatória' },
            { status: 400 }
          )
        }
        firestoreSync.startRealtime(collection)
        return NextResponse.json({ success: true, message: `Tempo real iniciado: ${collection}` })

      case 'stop_realtime':
        firestoreSync.stopRealtime(collection)
        return NextResponse.json({ success: true, message: 'Tempo real parado' })

      case 'get_stats':
        const stats = await firestoreSync.getStats()
        return NextResponse.json(stats)

      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro na API de sincronização:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await firestoreSync.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
