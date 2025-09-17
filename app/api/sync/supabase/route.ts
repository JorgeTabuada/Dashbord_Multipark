// API Route para consultas do Supabase (só leitura)
import { NextRequest, NextResponse } from 'next/server'
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

// Interface para dados que vão para o Firebase
interface FirebaseUpdateData {
  idClient: string
  city: string
  parkBrand: string
  [key: string]: any
}

// POST - Desativado (sistema agora é só Firebase → Supabase)
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Sistema configurado para sincronização unidirecional Firebase → Supabase apenas',
    message: 'Para fazer alterações, use o sistema Firebase (Backoffice)'
  }, { status: 405 })
}

// Função para lidar com atualização de reserva
async function handleReservationUpdate(data: any) {
  if (!data.firebase_id) {
    return NextResponse.json(
      { error: 'firebase_id é obrigatório' },
      { status: 400 }
    )
  }

  const supabaseClient = getSupabaseClient()

  try {
    // Buscar dados completos da reserva no Supabase
    const { data: reservation, error: fetchError } = await supabaseClient
      .from('reservas')
      .select('*')
      .eq('booking_id', data.firebase_id) // Mudado de firebase_id para booking_id
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json(
        { error: 'Reserva não encontrada no Supabase' },
        { status: 404 }
      )
    }
    
    // Preparar dados para enviar ao Firebase
    const firebaseData = transformSupabaseToFirebaseFormat(reservation)
    
    // Aqui você faria a chamada HTTP para o sistema Firebase
    // Por agora, vamos simular o sucesso
    const firebaseResult = await sendToFirebase(firebaseData)

    // Atualizar status de sync no Supabase
    await supabaseClient
      .from('reservas')
      .update({
        sync_status: 'synced',
        updated_at_db: new Date().toISOString()
      })
      .eq('booking_id', data.firebase_id) // Mudado de firebase_id para booking_id

    // Log da operação
    await supabaseClient.from('sync_logs').insert({
      sync_type: 'supabase_to_firebase',
      table_name: 'reservations',
      record_id: data.firebase_id,
      operation: 'update',
      success: true,
      sync_data: { supabase_data: reservation, firebase_data: firebaseData }
    })

    return NextResponse.json({
      success: true,
      message: 'Reserva sincronizada com Firebase com sucesso',
      data: firebaseResult
    })
  } catch (error) {
    // Log do erro
    await supabaseClient.from('sync_logs').insert({
      sync_type: 'supabase_to_firebase',
      table_name: 'reservations',
      record_id: data.firebase_id,
      operation: 'update',
      success: false,
      error_message: error instanceof Error ? error.message : String(error)
    })
    
    throw error
  }
}

// Função para lidar com atualizações em lote
async function handleBatchUpdates(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return NextResponse.json(
      { error: 'Lista de atualizações é obrigatória' },
      { status: 400 }
    )
  }
  
  const results = {
    success: 0,
    errors: 0,
    details: [] as any[]
  }
  
  for (const update of data) {
    try {
      await handleReservationUpdate(update)
      results.success++
      results.details.push({ 
        firebase_id: update.firebase_id, 
        status: 'success' 
      })
    } catch (error) {
      results.errors++
      results.details.push({
        firebase_id: update.firebase_id,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  return NextResponse.json({
    success: true,
    message: `Sincronização em lote concluída: ${results.success} sucessos, ${results.errors} erros`,
    data: results
  })
}

// Função para lidar com mudanças de status
async function handleStatusChange(data: any) {
  const { firebase_id, new_status, user_id, notes } = data

  if (!firebase_id || !new_status) {
    return NextResponse.json(
      { error: 'firebase_id e new_status são obrigatórios' },
      { status: 400 }
    )
  }

  const supabaseClient = getSupabaseClient()

  try {
    // Atualizar status no Supabase
    const { data: updatedReservation, error: updateError } = await supabaseClient
      .from('reservations')
      .update({
        status: new_status,
        last_action_user: user_id,
        last_action_date: new Date().toISOString(),
        last_action_description: notes || `Status alterado para ${new_status}`,
        sync_status: 'pending' // Marcar para sincronizar com Firebase
      })
      .eq('firebase_id', firebase_id)
      .select()
      .single()
    
    if (updateError) {
      throw updateError
    }

    // Criar entrada no histórico
    await supabaseClient.from('reservation_history').insert({
      reservation_firebase_id: firebase_id,
      action_timestamp: new Date().toISOString(),
      action_user: user_id,
      action_description: `Status alterado para ${new_status}`,
      reservation_data: updatedReservation
    })
    
    // Sincronizar com Firebase imediatamente
    const firebaseData = transformSupabaseToFirebaseFormat(updatedReservation)
    await sendToFirebase(firebaseData)

    // Marcar como sincronizado
    await supabaseClient
      .from('reservations')
      .update({ sync_status: 'synced' })
      .eq('firebase_id', firebase_id)

    return NextResponse.json({
      success: true,
      message: 'Status atualizado e sincronizado com sucesso',
      data: updatedReservation
    })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)

    // Marcar como erro de sincronização
    await supabaseClient
      .from('reservations')
      .update({ sync_status: 'error' })
      .eq('firebase_id', firebase_id)

    throw error
  }
}

// Função para transformar dados Supabase para formato Firebase
function transformSupabaseToFirebaseFormat(supabaseData: any): FirebaseUpdateData {
  return {
    idClient: supabaseData.firebase_id,
    city: supabaseData.city,
    parkBrand: supabaseData.park_brand,
    stats: mapSupabaseStatusToFirebase(supabaseData.status),
    name: supabaseData.client_first_name,
    lastname: supabaseData.client_last_name,
    email: supabaseData.client_email,
    phoneNumber: supabaseData.client_phone,
    licensePlate: supabaseData.license_plate,
    bookingPrice: supabaseData.booking_price?.toString(),
    checkIn: formatDateForFirebase(supabaseData.check_in_datetime),
    checkOut: formatDateForFirebase(supabaseData.check_out_datetime),
    park: supabaseData.physical_park,
    row: supabaseData.parking_row,
    spot: supabaseData.parking_spot,
    alocation: supabaseData.allocation_number,
    actionUser: supabaseData.last_action_user,
    actionDate: formatDateForFirebase(supabaseData.last_action_date),
    action: supabaseData.last_action_description
  }
}

// Função para mapear status Supabase para Firebase
function mapSupabaseStatusToFirebase(supabaseStatus: string): string {
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

// Função para formatar data para Firebase
function formatDateForFirebase(dateString?: string | null): string | undefined {
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

// Função simulada para enviar dados ao Firebase
// Na implementação real, esta função faria uma chamada HTTP para a API do sistema Firebase
async function sendToFirebase(data: FirebaseUpdateData): Promise<any> {
  // URL do webhook ou API do sistema Firebase
  const firebaseWebhookUrl = process.env.FIREBASE_WEBHOOK_URL
  
  if (!firebaseWebhookUrl) {
    console.warn('FIREBASE_WEBHOOK_URL não configurado, simulando sucesso')
    return { success: true, simulated: true }
  }
  
  try {
    const response = await fetch(firebaseWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FIREBASE_WEBHOOK_TOKEN || ''}`
      },
      body: JSON.stringify({
        type: 'reservation_update',
        data: data
      })
    })
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao enviar dados para Firebase:', error)
    throw error
  }
}

// GET - Obter estatísticas das reservas no Supabase
export async function GET(request: NextRequest) {
  // Verificar se as credenciais Supabase estão configuradas
  if (!supabase) {
    const missingCredentials = []

    if (!supabaseUrl) {
      missingCredentials.push('NEXT_PUBLIC_SUPABASE_URL')
    }

    if (!supabaseServiceKey) {
      missingCredentials.push('SUPABASE_SERVICE_ROLE_KEY')
    }

    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: 'Credenciais Supabase em falta. No painel do Supabase vá a Project Settings → API e copie a URL do projeto e a Service Role key para o ficheiro .env.local (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).',
      missingCredentials
    })
  }

  const supabaseClient = getSupabaseClient()

  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 50000)

    // Buscar total count primeiro
    const { count: totalCount } = await supabaseClient
      .from('reservas')
      .select('*', { count: 'exact', head: true })

    // Só mostrar reservas mais recentes (só leitura)
    const { data: recentReservations, error } = await supabaseClient
      .from('reservas')
      .select('*')
      .order('updated_at_db', { ascending: false })
      .limit(limit)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      data: recentReservations,
      count: recentReservations.length,
      totalCount: totalCount || 0,
      message: 'Sistema de leitura Firebase → Supabase'
    })
  } catch (error) {
    console.error('Erro ao obter reservas:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}