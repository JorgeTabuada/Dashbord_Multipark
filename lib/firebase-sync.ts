// Funções de sincronização com Firebase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

// Cliente Supabase com privilégios de service role
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

export interface FirebaseReservation {
  idClient: string
  city: string
  parkBrand: string
  campaignId?: string
  campaign?: string
  campaignPay?: boolean
  bookingDate?: string
  parkingType?: string
  parking?: {
    pt?: string
    en?: string
    price?: string
  }
  parkingPrice?: string
  deliveryName?: string
  deliveryPrice?: string
  deliveryLocation?: string
  extraServices?: Array<{
    pt?: string
    price?: string
    checked?: boolean
    type?: number
  }>
  bookingPrice?: string
  correctedPrice?: string
  priceOnDelivery?: string
  licensePlate: string
  carInfo?: string
  name?: string
  lastname?: string
  email?: string
  phoneNumber?: string
  returnFlight?: string
  paymentMethod?: string
  taxName?: string
  taxNumber?: string
  checkIn?: string
  checkOut?: string
  checkinDate?: any // Firebase Timestamp
  stats: string
  park?: string
  row?: string
  spot?: string
  alocation?: string
  carLocation?: string
  checkInVideo?: string
  condutorRecolha?: string
  condutorEntrega?: string
  actionUser?: string
  actionDate?: string
  action?: string
  createdAt?: string
  canceledDate?: string
}

export interface SupabaseReservation {
  firebase_id: string
  city: string
  park_brand: string
  campaign_id?: string
  campaign_name?: string
  campaign_requires_payment?: boolean
  booking_date?: string
  parking_type?: string
  parking_details?: any
  parking_price?: number
  delivery_location?: string
  delivery_price?: number
  delivery_location_url?: string
  extra_services?: any
  booking_price?: number
  corrected_price?: number
  price_on_delivery?: number
  license_plate: string
  car_info?: string
  client_first_name?: string
  client_last_name?: string
  client_email?: string
  client_phone?: string
  return_flight?: string
  payment_method?: string
  invoice_name?: string
  tax_number?: string
  check_in_datetime?: string
  check_out_datetime?: string
  firebase_checkin_timestamp?: string
  status: string
  physical_park?: string
  parking_row?: string
  parking_spot?: string
  allocation_number?: string
  car_location_url?: string
  checkin_video_url?: string
  pickup_driver?: string
  delivery_driver?: string
  last_action_user?: string
  last_action_date?: string
  last_action_description?: string
  canceled_at?: string
  firebase_last_sync?: string
}

// Função para converter datas Firebase (DD/MM/YYYY, HH:MM) para PostgreSQL timestamp
export function parseFirebaseDateTime(dateString?: string): string | null {
  if (!dateString) return null
  
  try {
    // Formato: "DD/MM/YYYY, HH:MM"
    const [datePart, timePart] = dateString.split(', ')
    if (!datePart || !timePart) return null
    
    const [day, month, year] = datePart.split('/')
    const [hours, minutes] = timePart.split(':')
    
    if (!day || !month || !year || !hours || !minutes) return null
    
    // Criar objeto Date e converter para ISO string
    const date = new Date(
      parseInt(year), 
      parseInt(month) - 1, // JavaScript months são 0-indexed
      parseInt(day), 
      parseInt(hours), 
      parseInt(minutes)
    )
    
    return date.toISOString()
  } catch (error) {
    console.error('Erro ao converter data Firebase:', error)
    return null
  }
}

// Função para converter preço de string para número
export function parsePrice(priceString?: string | number): number {
  if (!priceString && priceString !== 0) return 0
  
  // Se já é um número, retornar diretamente
  if (typeof priceString === 'number') return priceString
  
  // Converter para string se não for
  const priceStr = String(priceString)
  
  // Remover caracteres não numéricos exceto ponto e vírgula
  const cleanPrice = priceStr.replace(/[^\d.,]/g, '')
  
  // Substituir vírgula por ponto se for separador decimal
  const normalizedPrice = cleanPrice.replace(',', '.')
  
  const parsed = parseFloat(normalizedPrice)
  return isNaN(parsed) ? 0 : parsed
}

// Função para mapear status Firebase para Supabase
export function mapFirebaseStatus(firebaseStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'reservado': 'reservado',
    'em recolha': 'em_recolha',
    'recolhido': 'recolhido',
    'em entrega': 'em_entrega',
    'em movimento': 'em_movimento',
    'entregue': 'entregue',
    'cancelado': 'cancelado'
  }
  
  return statusMap[firebaseStatus] || firebaseStatus
}

// Função para converter reserva Firebase para formato Supabase
export function transformFirebaseToSupabase(firebaseData: FirebaseReservation): SupabaseReservation {
  return {
    firebase_id: firebaseData.idClient,
    city: firebaseData.city?.toLowerCase() || '',
    park_brand: firebaseData.parkBrand?.toLowerCase() || '',
    campaign_id: firebaseData.campaignId,
    campaign_name: firebaseData.campaign,
    campaign_requires_payment: firebaseData.campaignPay ?? true,
    booking_date: parseFirebaseDateTime(firebaseData.bookingDate),
    parking_type: firebaseData.parkingType,
    parking_details: firebaseData.parking,
    parking_price: parsePrice(firebaseData.parkingPrice),
    delivery_location: firebaseData.deliveryName,
    delivery_price: parsePrice(firebaseData.deliveryPrice),
    delivery_location_url: firebaseData.deliveryLocation,
    extra_services: firebaseData.extraServices,
    booking_price: parsePrice(firebaseData.bookingPrice),
    corrected_price: parsePrice(firebaseData.correctedPrice),
    price_on_delivery: parsePrice(firebaseData.priceOnDelivery),
    license_plate: firebaseData.licensePlate?.toUpperCase() || '',
    car_info: firebaseData.carInfo,
    client_first_name: firebaseData.name,
    client_last_name: firebaseData.lastname,
    client_email: firebaseData.email,
    client_phone: firebaseData.phoneNumber,
    return_flight: firebaseData.returnFlight,
    payment_method: firebaseData.paymentMethod,
    invoice_name: firebaseData.taxName,
    tax_number: firebaseData.taxNumber,
    check_in_datetime: parseFirebaseDateTime(firebaseData.checkIn),
    check_out_datetime: parseFirebaseDateTime(firebaseData.checkOut),
    firebase_checkin_timestamp: firebaseData.checkinDate ? new Date(firebaseData.checkinDate.seconds * 1000).toISOString() : null,
    status: mapFirebaseStatus(firebaseData.stats),
    physical_park: firebaseData.park,
    parking_row: firebaseData.row,
    parking_spot: firebaseData.spot,
    allocation_number: firebaseData.alocation,
    car_location_url: firebaseData.carLocation,
    checkin_video_url: firebaseData.checkInVideo,
    pickup_driver: firebaseData.condutorRecolha,
    delivery_driver: firebaseData.condutorEntrega,
    last_action_user: firebaseData.actionUser,
    last_action_date: parseFirebaseDateTime(firebaseData.actionDate),
    last_action_description: firebaseData.action,
    canceled_at: parseFirebaseDateTime(firebaseData.canceledDate),
    firebase_last_sync: new Date().toISOString()
  }
}

// Função para sincronizar uma reserva do Firebase para Supabase
export async function syncReservationToSupabase(firebaseData: FirebaseReservation) {
  const supabaseClient = getSupabaseClient()

  try {
    const supabaseData = transformFirebaseToSupabase(firebaseData)

    // Verificar se a reserva já existe
    const { data: existing, error: checkError } = await supabaseClient
      .from('reservations')
      .select('id, firebase_last_sync')
      .eq('firebase_id', firebaseData.idClient)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }
    
    let result
    if (existing) {
      // Atualizar reserva existente
      result = await supabaseClient
        .from('reservations')
        .update(supabaseData)
        .eq('firebase_id', firebaseData.idClient)
        .select()
    } else {
      // Criar nova reserva
      result = await supabaseClient
        .from('reservations')
        .insert(supabaseData)
        .select()
    }
    
    if (result.error) {
      throw result.error
    }
    
    // Log da sincronização
    await supabaseClient.from('sync_logs').insert({
      sync_type: 'firebase_to_supabase',
      table_name: 'reservations',
      record_id: firebaseData.idClient,
      operation: existing ? 'update' : 'create',
      success: true,
      sync_data: { firebase_data: firebaseData, supabase_data: supabaseData }
    })

    return result.data?.[0]
  } catch (error) {
    console.error('Erro ao sincronizar reserva para Supabase:', error)

    // Log do erro
    await supabaseClient.from('sync_logs').insert({
      sync_type: 'firebase_to_supabase',
      table_name: 'reservations',
      record_id: firebaseData.idClient,
      operation: 'error',
      success: false,
      error_message: error instanceof Error ? error.message : String(error)
    })
    
    throw error
  }
}

// Função para sincronizar múltiplas reservas em batch
export async function syncBatchReservationsToSupabase(firebaseReservations: FirebaseReservation[]) {
  const results = {
    success: 0,
    errors: 0,
    details: [] as any[]
  }
  
  for (const reservation of firebaseReservations) {
    try {
      await syncReservationToSupabase(reservation)
      results.success++
      results.details.push({ id: reservation.idClient, status: 'success' })
    } catch (error) {
      results.errors++
      results.details.push({ 
        id: reservation.idClient, 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      })
    }
  }
  
  return results
}

// Função para converter reserva Supabase para formato Firebase
export function transformSupabaseToFirebase(supabaseData: SupabaseReservation): Partial<FirebaseReservation> {
  return {
    idClient: supabaseData.firebase_id,
    city: supabaseData.city,
    parkBrand: supabaseData.park_brand,
    campaignId: supabaseData.campaign_id,
    campaign: supabaseData.campaign_name,
    campaignPay: supabaseData.campaign_requires_payment,
    bookingDate: formatDateForFirebase(supabaseData.booking_date),
    parkingType: supabaseData.parking_type,
    parking: supabaseData.parking_details,
    parkingPrice: supabaseData.parking_price?.toString(),
    deliveryName: supabaseData.delivery_location,
    deliveryPrice: supabaseData.delivery_price?.toString(),
    deliveryLocation: supabaseData.delivery_location_url,
    extraServices: supabaseData.extra_services,
    bookingPrice: supabaseData.booking_price?.toString(),
    correctedPrice: supabaseData.corrected_price?.toString(),
    priceOnDelivery: supabaseData.price_on_delivery?.toString(),
    licensePlate: supabaseData.license_plate,
    carInfo: supabaseData.car_info,
    name: supabaseData.client_first_name,
    lastname: supabaseData.client_last_name,
    email: supabaseData.client_email,
    phoneNumber: supabaseData.client_phone,
    returnFlight: supabaseData.return_flight,
    paymentMethod: supabaseData.payment_method,
    taxName: supabaseData.invoice_name,
    taxNumber: supabaseData.tax_number,
    checkIn: formatDateForFirebase(supabaseData.check_in_datetime),
    checkOut: formatDateForFirebase(supabaseData.check_out_datetime),
    stats: mapSupabaseStatusToFirebase(supabaseData.status),
    park: supabaseData.physical_park,
    row: supabaseData.parking_row,
    spot: supabaseData.parking_spot,
    alocation: supabaseData.allocation_number,
    carLocation: supabaseData.car_location_url,
    checkInVideo: supabaseData.checkin_video_url,
    condutorRecolha: supabaseData.pickup_driver,
    condutorEntrega: supabaseData.delivery_driver,
    actionUser: supabaseData.last_action_user,
    actionDate: formatDateForFirebase(supabaseData.last_action_date),
    action: supabaseData.last_action_description,
    canceledDate: formatDateForFirebase(supabaseData.canceled_at)
  }
}

// Função para formatar data PostgreSQL para formato Firebase
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
    console.error('Erro ao formatar data para Firebase:', error)
    return undefined
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

// Função para obter reservas que precisam ser sincronizadas
export async function getReservationsToSync() {
  const supabaseClient = getSupabaseClient()

  const { data, error } = await supabaseClient
    .from('reservations')
    .select('*')
    .in('sync_status', ['pending', 'error'])
    .order('updated_at', { ascending: true })
  
  if (error) {
    throw error
  }
  
  return data
}

// Função para marcar reserva como sincronizada
export async function markReservationAsSynced(firebaseId: string) {
  const supabaseClient = getSupabaseClient()

  const { error } = await supabaseClient
    .from('reservations')
    .update({
      sync_status: 'synced',
      firebase_last_sync: new Date().toISOString()
    })
    .eq('firebase_id', firebaseId)
  
  if (error) {
    throw error
  }
}

// Função para obter estatísticas de sincronização
export async function getSyncStats() {
  const supabaseClient = getSupabaseClient()

  const { data: totalReservations } = await supabaseClient
    .from('reservations')
    .select('count(*)', { count: 'exact' })

  const { data: syncedReservations } = await supabaseClient
    .from('reservations')
    .select('count(*)', { count: 'exact' })
    .eq('sync_status', 'synced')

  const { data: pendingReservations } = await supabaseClient
    .from('reservations')
    .select('count(*)', { count: 'exact' })
    .eq('sync_status', 'pending')

  const { data: errorReservations } = await supabaseClient
    .from('reservations')
    .select('count(*)', { count: 'exact' })
    .eq('sync_status', 'error')

  const { data: recentSyncLogs } = await supabaseClient
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  
  return {
    total: totalReservations?.[0]?.count || 0,
    synced: syncedReservations?.[0]?.count || 0,
    pending: pendingReservations?.[0]?.count || 0,
    errors: errorReservations?.[0]?.count || 0,
    recentLogs: recentSyncLogs || []
  }
}