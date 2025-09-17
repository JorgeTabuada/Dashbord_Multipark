// Webhook para receber mudanças do Firebase em tempo real
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { syncReservationToSupabase, FirebaseReservation } from '@/lib/firebase-sync'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-key'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Token de segurança para validar webhooks
const WEBHOOK_SECRET = process.env.FIREBASE_WEBHOOK_SECRET || 'your-webhook-secret-here'

export async function POST(request: NextRequest) {
  try {
    // Validar token de segurança
    const headersList = headers()
    const authHeader = headersList.get('authorization')
    const providedToken = authHeader?.replace('Bearer ', '')
    
    if (providedToken !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Token de autorização inválido' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { eventType, eventId, timestamp, data } = body
    
    // Log do webhook recebido
    console.log('Webhook Firebase recebido:', { eventType, eventId, timestamp })
    
    // Processar diferentes tipos de eventos Firebase
    switch (eventType) {
      case 'document.create':
      case 'document.update':
        return await handleDocumentChange(eventType, data, eventId)
      
      case 'document.delete':
        return await handleDocumentDelete(data, eventId)
      
      case 'collection.batch_write':
        return await handleBatchWrite(data, eventId)
      
      default:
        // Log evento não processado
        await supabase.from('sync_logs').insert({
          sync_type: 'firebase_webhook',
          table_name: 'unknown',
          record_id: eventId,
          operation: eventType,
          success: false,
          error_message: `Tipo de evento não suportado: ${eventType}`
        })
        
        return NextResponse.json({
          success: false,
          message: `Tipo de evento não suportado: ${eventType}`
        })
    }
  } catch (error) {
    console.error('Erro no webhook Firebase:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Lidar com criação/atualização de documentos
async function handleDocumentChange(eventType: string, data: any, eventId: string) {
  try {
    const { path, before, after } = data
    
    // Verificar se é um documento de cliente/reserva
    if (!path || !path.includes('/clients/')) {
      return NextResponse.json({
        success: true,
        message: 'Documento não é uma reserva, ignorando'
      })
    }
    
    // Extrair informações do path: /{city}/{brand}/clients/{idClient}
    const pathParts = path.split('/')
    if (pathParts.length < 4) {
      throw new Error('Path do documento inválido')
    }
    
    const city = pathParts[1]
    const brand = pathParts[2]
    const idClient = pathParts[4]
    
    // Usar dados 'after' para create/update, 'before' se 'after' não existir
    const documentData = after || before
    
    if (!documentData) {
      throw new Error('Dados do documento não encontrados')
    }
    
    // Preparar dados da reserva para sincronização
    const firebaseReservation: FirebaseReservation = {
      idClient,
      city,
      parkBrand: brand,
      ...documentData
    }
    
    // Sincronizar com Supabase
    const result = await syncReservationToSupabase(firebaseReservation)
    
    // Log de sucesso
    await supabase.from('sync_logs').insert({
      sync_type: 'firebase_webhook',
      table_name: 'reservations',
      record_id: idClient,
      operation: eventType,
      success: true,
      sync_data: {
        firebase_path: path,
        firebase_data: firebaseReservation,
        supabase_result: result
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `${eventType} processado com sucesso`,
      data: { idClient, city, brand }
    })
  } catch (error) {
    console.error(`Erro ao processar ${eventType}:`, error)
    
    // Log do erro
    await supabase.from('sync_logs').insert({
      sync_type: 'firebase_webhook',
      table_name: 'reservations',
      record_id: eventId,
      operation: eventType,
      success: false,
      error_message: error instanceof Error ? error.message : String(error),
      sync_data: { original_data: data }
    })
    
    throw error
  }
}

// Lidar com exclusão de documentos
async function handleDocumentDelete(data: any, eventId: string) {
  try {
    const { path, before } = data
    
    if (!path || !path.includes('/clients/')) {
      return NextResponse.json({
        success: true,
        message: 'Documento não é uma reserva, ignorando'
      })
    }
    
    const pathParts = path.split('/')
    const idClient = pathParts[4]
    
    if (!idClient) {
      throw new Error('ID do cliente não encontrado no path')
    }
    
    // Marcar reserva como cancelada no Supabase ao invés de excluir
    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelado',
        canceled_at: new Date().toISOString(),
        last_action_description: 'Reserva cancelada no Firebase',
        sync_status: 'synced',
        firebase_last_sync: new Date().toISOString()
      })
      .eq('firebase_id', idClient)
      .select()
    
    if (error) {
      throw error
    }
    
    // Criar entrada no histórico
    if (updatedReservation && updatedReservation[0]) {
      await supabase.from('reservation_history').insert({
        reservation_firebase_id: idClient,
        action_timestamp: new Date().toISOString(),
        action_user: 'Firebase Webhook',
        action_description: 'Reserva cancelada/excluída no Firebase',
        reservation_data: updatedReservation[0]
      })
    }
    
    // Log de sucesso
    await supabase.from('sync_logs').insert({
      sync_type: 'firebase_webhook',
      table_name: 'reservations',
      record_id: idClient,
      operation: 'document.delete',
      success: true,
      sync_data: {
        firebase_path: path,
        before_data: before,
        supabase_result: updatedReservation
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Exclusão processada com sucesso - reserva marcada como cancelada',
      data: { idClient }
    })
  } catch (error) {
    console.error('Erro ao processar exclusão:', error)
    
    // Log do erro
    await supabase.from('sync_logs').insert({
      sync_type: 'firebase_webhook',
      table_name: 'reservations',
      record_id: eventId,
      operation: 'document.delete',
      success: false,
      error_message: error instanceof Error ? error.message : String(error),
      sync_data: { original_data: data }
    })
    
    throw error
  }
}

// Lidar com escritas em lote
async function handleBatchWrite(data: any, eventId: string) {
  try {
    const { writes } = data
    
    if (!Array.isArray(writes)) {
      throw new Error('Dados de batch write inválidos')
    }
    
    const results = {
      success: 0,
      errors: 0,
      details: [] as any[]
    }
    
    for (const write of writes) {
      try {
        const { operation, path, document } = write
        
        if (path && path.includes('/clients/')) {
          const pathParts = path.split('/')
          const city = pathParts[1]
          const brand = pathParts[2]  
          const idClient = pathParts[4]
          
          if (operation === 'update' || operation === 'set') {
            const firebaseReservation: FirebaseReservation = {
              idClient,
              city,
              parkBrand: brand,
              ...document
            }
            
            await syncReservationToSupabase(firebaseReservation)
          }
          
          results.success++
          results.details.push({ idClient, operation, status: 'success' })
        }
      } catch (error) {
        results.errors++
        results.details.push({
          operation: write.operation,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    // Log do resultado do batch
    await supabase.from('sync_logs').insert({
      sync_type: 'firebase_webhook',
      table_name: 'reservations',
      record_id: eventId,
      operation: 'batch_write',
      success: results.errors === 0,
      sync_data: {
        total_writes: writes.length,
        success_count: results.success,
        error_count: results.errors,
        details: results.details
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Batch write processado: ${results.success} sucessos, ${results.errors} erros`,
      data: results
    })
  } catch (error) {
    console.error('Erro ao processar batch write:', error)
    
    // Log do erro
    await supabase.from('sync_logs').insert({
      sync_type: 'firebase_webhook',
      table_name: 'reservations',
      record_id: eventId,
      operation: 'batch_write',
      success: false,
      error_message: error instanceof Error ? error.message : String(error),
      sync_data: { original_data: data }
    })
    
    throw error
  }
}

// GET - Endpoint para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook Firebase está funcionando',
    timestamp: new Date().toISOString()
  })
}