import { NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
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

// Inicializar Firebase Admin
let adminApp: any = null
let adminDb: any = null

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    
    if (!getApps().find(app => app.name === 'sync-admin-app')) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'admin-multipark'
      }, 'sync-admin-app')
    } else {
      adminApp = getApps().find(app => app.name === 'sync-admin-app')
    }
    
    adminDb = getFirestore(adminApp)
    console.log('🔑 Firebase Admin para sincronização inicializado')
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error)
}

// Interface para mapeamento Firebase -> Supabase
interface FirebaseReservation {
  idClient: string
  city: string
  parkBrand: string
  licensePlate?: string
  name?: string
  lastname?: string
  email?: string
  phoneNumber?: string
  bookingPrice?: string | number
  stats?: string
  checkIn?: string
  checkOut?: string
  park?: string
  row?: string
  spot?: string
  actionUser?: string
  action?: string
  actionDate?: string
  [key: string]: any
}

class MassSyncService {
  
  // Transformar dados Firebase para Supabase
  transformToSupabase(firebaseData: FirebaseReservation): any {
    return {
      booking_id: firebaseData.idClient,
      cidade_cliente: firebaseData.city?.toLowerCase() || '',
      park_name: firebaseData.parkBrand?.toLowerCase() || '',
      license_plate: (firebaseData.licensePlate && firebaseData.licensePlate.trim()) 
        ? firebaseData.licensePlate.toUpperCase().substring(0, 50)
        : `FB-${firebaseData.idClient}`.substring(0, 50),
      name_cliente: firebaseData.name?.substring(0, 100) || null,
      lastname_cliente: firebaseData.lastname?.substring(0, 100) || null,
      email_cliente: firebaseData.email?.substring(0, 200) || null,
      phone_number_cliente: firebaseData.phoneNumber?.substring(0, 50) || null,
      booking_price: this.parsePrice(firebaseData.bookingPrice),
      estado_reserva_atual: this.mapStatus(firebaseData.stats),
      check_in_previsto: this.parseDate(firebaseData.checkIn),
      check_out_previsto: this.parseDate(firebaseData.checkOut),
      parque_id: firebaseData.park?.substring(0, 100) || null,
      parking_row: firebaseData.row?.substring(0, 20) || null,
      parking_spot: firebaseData.spot?.substring(0, 20) || null,
      action_user: firebaseData.actionUser?.substring(0, 100) || null,
      action_description: firebaseData.action?.substring(0, 200) || null,
      action_date: this.parseDate(firebaseData.actionDate),
      source: 'firebase_sync',
      sync_status: 'synced',
      created_at_db: new Date().toISOString(),
      updated_at_db: new Date().toISOString()
    }
  }

  private parsePrice(price: string | number | undefined): number | null {
    if (!price) return null
    if (typeof price === 'number') return price
    
    const cleanPrice = String(price).replace(/[^\d.,]/g, '').replace(',', '.')
    const parsed = parseFloat(cleanPrice)
    return isNaN(parsed) ? null : parsed
  }

  private parseDate(dateString?: string): string | null {
    if (!dateString) return null
    
    try {
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

  private mapStatus(firebaseStatus: string = ''): string {
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

  // Sincronizar uma localização completa
  async syncLocation(city: string, brand: string): Promise<{success: number, errors: number, total: number}> {
    if (!adminDb) {
      throw new Error('Firebase Admin não disponível')
    }

    console.log(`🏙️ Sincronizando ${city}/${brand}...`)
    
    try {
      // Obter todas as reservas desta localização
      const collectionRef = adminDb
        .collection(city)
        .doc(brand)
        .collection('clients')
      
      const snapshot = await collectionRef.get()
      const totalReservations = snapshot.size
      
      console.log(`📥 ${totalReservations} reservas encontradas em ${city}/${brand}`)
      
      let success = 0
      let errors = 0
      const batchSize = 100 // Processar em lotes para não sobrecarregar
      const reservations: any[] = []
      
      // Converter para array
      snapshot.forEach((doc: any) => {
        reservations.push({
          idClient: doc.id,
          city,
          parkBrand: brand,
          ...doc.data()
        })
      })
      
      // Processar em lotes
      for (let i = 0; i < reservations.length; i += batchSize) {
        const batch = reservations.slice(i, i + batchSize)
        console.log(`📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(reservations.length/batchSize)} (${batch.length} reservas)`)
        
        for (const reservation of batch) {
          try {
            const supabaseData = this.transformToSupabase(reservation)
            
            // Verificar se já existe
            const { data: existing } = await supabase
              .from('reservas')
              .select('id_pk')
              .eq('booking_id', reservation.idClient)
              .single()
            
            let result
            if (existing) {
              // Atualizar
              result = await supabase
                .from('reservas')
                .update(supabaseData)
                .eq('booking_id', reservation.idClient)
            } else {
              // Inserir
              result = await supabase
                .from('reservas')
                .insert(supabaseData)
            }
            
            if (result.error) {
              console.error(`❌ Erro ${reservation.idClient}:`, result.error.message)
              errors++
            } else {
              success++
            }
            
          } catch (error) {
            console.error(`❌ Erro ao processar ${reservation.idClient}:`, error)
            errors++
          }
        }
        
        // Pequena pausa entre lotes
        if (i + batchSize < reservations.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      console.log(`✅ ${city}/${brand}: ${success} sucessos, ${errors} erros de ${totalReservations} total`)
      return { success, errors, total: totalReservations }
      
    } catch (error) {
      console.error(`❌ Erro geral em ${city}/${brand}:`, error)
      return { success: 0, errors: 1, total: 0 }
    }
  }

  // Sincronizar todas as localizações
  async syncAll(): Promise<{totalSuccess: number, totalErrors: number, totalReservations: number, locationResults: any}> {
    const locations = [
      // Começar pelas menores para testar
      { city: 'lisbon', brand: 'lispark' },        // 18
      { city: 'faro', brand: 'redpark' },          // 122  
      { city: 'faro', brand: 'skypark' },          // 166
      { city: 'porto', brand: 'skypark' },         // 202
      { city: 'lisbon', brand: 'top-parking' },    // 263
      { city: 'lisbon', brand: 'skypark' },        // 511
      { city: 'porto', brand: 'airpark' },         // 1.118
      { city: 'porto', brand: 'redpark' },         // 1.548
      { city: 'faro', brand: 'airpark' },          // 3.012
      { city: 'lisbon', brand: 'airpark' },        // 14.919 🔥
      { city: 'lisbon', brand: 'redpark' }         // 15.695 🔥
    ]
    
    let totalSuccess = 0
    let totalErrors = 0
    let totalReservations = 0
    const locationResults: any = {}
    
    console.log(`🌍 Iniciando sincronização de TODAS as 37.574 reservas...`)
    
    for (const location of locations) {
      const result = await this.syncLocation(location.city, location.brand)
      
      locationResults[`${location.city}/${location.brand}`] = result
      totalSuccess += result.success
      totalErrors += result.errors
      totalReservations += result.total
      
      console.log(`📊 Progresso: ${totalSuccess} sincronizadas de ${totalReservations} processadas`)
      
      // Pausa entre localizações
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    return {
      totalSuccess,
      totalErrors,
      totalReservations,
      locationResults
    }
  }
}

export async function POST(req: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({
        status: 'error',
        error: 'Firebase Admin não inicializado'
      }, { status: 500 })
    }

    const { action, city, brand } = await req.json()
    const syncService = new MassSyncService()
    
    if (action === 'sync_all') {
      console.log('🚀 Iniciando sincronização MASSIVA de 37.574 reservas...')
      
      const result = await syncService.syncAll()
      
      return NextResponse.json({
        status: 'success',
        message: `Sincronização completa: ${result.totalSuccess} sucessos, ${result.totalErrors} erros`,
        summary: {
          total_processed: result.totalReservations,
          total_synced: result.totalSuccess,
          total_errors: result.totalErrors,
          success_rate: ((result.totalSuccess / result.totalReservations) * 100).toFixed(2) + '%'
        },
        detailed_results: result.locationResults,
        timestamp: new Date().toISOString()
      })
    }
    
    if (action === 'sync_location') {
      if (!city || !brand) {
        return NextResponse.json({ 
          error: 'Cidade e marca obrigatórias' 
        }, { status: 400 })
      }
      
      console.log(`🎯 Sincronizando localização específica: ${city}/${brand}`)
      
      const result = await syncService.syncLocation(city, brand)
      
      return NextResponse.json({
        status: 'success',
        city,
        brand,
        result,
        message: `${city}/${brand}: ${result.success} sucessos, ${result.errors} erros de ${result.total} total`
      })
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro na sincronização massiva:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: 'Erro na sincronização massiva'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Sincronização Massiva Firebase Admin -> Supabase',
    total_reservations_available: 37574,
    locations: {
      'lisbon/redpark': 15695,
      'lisbon/airpark': 14919,
      'faro/airpark': 3012,
      'porto/redpark': 1548,
      'porto/airpark': 1118,
      'lisbon/skypark': 511,
      'lisbon/top-parking': 263,
      'porto/skypark': 202,
      'faro/skypark': 166,
      'faro/redpark': 122,
      'lisbon/lispark': 18
    },
    actions: {
      'sync_all': 'Sincronizar todas as 37.574 reservas',
      'sync_location': 'Sincronizar localização específica (requer city e brand)'
    }
  })
}