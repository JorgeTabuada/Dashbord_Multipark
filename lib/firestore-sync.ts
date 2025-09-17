// 🔥 Serviço de Sincronização Firebase Firestore → Supabase
// ===========================================================

import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  limit,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import { createClient } from '@supabase/supabase-js'

// Configuração Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

export class FirestoreSyncService {
  private listeners: Map<string, any> = new Map()
  private isRunning = false

  // Mapear estado
  private mapStatus(status?: string): string {
    const statusMap: Record<string, string> = {
      'booked': 'reservado',
      'reserved': 'reservado',
      'picking': 'em_recolha',
      'picked': 'recolhido',
      'delivering': 'em_entrega',
      'delivered': 'entregue',
      'completed': 'entregue',
      'cancelled': 'cancelado',
      'canceled': 'cancelado'
    }
    return statusMap[status?.toLowerCase() || ''] || 'reservado'
  }

  // Converter preço
  private parsePrice(price: any): number {
    if (typeof price === 'number') return price
    if (typeof price === 'string') {
      const cleaned = price.replace(/[€$,]/g, '').trim()
      return parseFloat(cleaned) || 0
    }
    return 0
  }

  // Mapear dados
  private mapReservation(data: DocumentData, id: string): any {
    return {
      booking_id: id || data.idClient || data.id,
      
      // Cliente
      name_cliente: data.name,
      lastname_cliente: data.lastname,
      email_cliente: data.email,
      phone_number_cliente: data.phoneNumber,
      cidade_cliente: data.city,
      nif_cliente: data.taxNumber,
      
      // Veículo
      license_plate: data.licensePlate || '',
      car_info: data.carInfo,
      
      // Datas
      booking_date: data.bookingDate?.toDate ? data.bookingDate.toDate() : data.bookingDate,
      check_in_previsto: data.checkIn?.toDate ? data.checkIn.toDate() : data.checkIn,
      check_out_previsto: data.checkOut?.toDate ? data.checkOut.toDate() : data.checkOut,
      
      // Valores
      booking_price: this.parsePrice(data.bookingPrice),
      parking_price: this.parsePrice(data.parkingPrice),
      corrected_price: this.parsePrice(data.correctedPrice),
      
      // Estado
      estado_reserva_atual: this.mapStatus(data.stats || data.status),
      park_name: data.parkBrand || data.park,
      parking_type: data.parkingType,
      
      // Metadata
      source: 'firebase_sync',
      sync_status: 'synced',
      last_sync_at: new Date().toISOString()
    }
  }

  // Sincronizar uma coleção
  async syncCollection(collectionName: string): Promise<{success: number, errors: number}> {
    console.log(`🔄 Sincronizando coleção: ${collectionName}`)
    
    let success = 0
    let errors = 0

    try {
      const q = query(collection(db, collectionName), orderBy('bookingDate', 'desc'), limit(1000))
      const snapshot = await getDocs(q)
      
      console.log(`📊 Encontradas ${snapshot.size} reservas em ${collectionName}`)

      for (const doc of snapshot.docs) {
        try {
          const mapped = this.mapReservation(doc.data(), doc.id)
          
          // Verificar se existe
          const { data: existing } = await supabase
            .from('reservas')
            .select('id_pk')
            .eq('booking_id', mapped.booking_id)
            .single()

          if (existing) {
            // Atualizar
            const { error } = await supabase
              .from('reservas')
              .update(mapped)
              .eq('booking_id', mapped.booking_id)
            
            if (error) throw error
          } else {
            // Inserir
            const { error } = await supabase
              .from('reservas')
              .insert([mapped])
            
            if (error) throw error
            console.log(`✅ Nova: ${mapped.booking_id}`)
          }
          
          success++
        } catch (error) {
          console.error(`❌ Erro em ${doc.id}:`, error)
          errors++
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao acessar coleção ${collectionName}:`, error)
    }

    console.log(`✅ ${collectionName}: ${success} sincronizadas, ${errors} erros`)
    return { success, errors }
  }

  // Tentar descobrir coleções
  async discoverCollections(): Promise<string[]> {
    const possibleCollections = [
      'reservations',
      'bookings',
      'reservas',
      'Lisboa',
      'Porto',
      'Faro',
      'AirPark',
      'RedPark',
      'SkyPark',
      'TopParking',
      'LisPark'
    ]

    const found: string[] = []

    for (const name of possibleCollections) {
      try {
        const q = query(collection(db, name), limit(1))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          found.push(name)
          console.log(`✅ Coleção encontrada: ${name} (${snapshot.size} docs)`)
        }
      } catch (error) {
        // Coleção não existe
      }
    }

    return found
  }

  // Sincronizar tudo
  async syncAll(): Promise<any> {
    if (this.isRunning) {
      console.log('⏳ Sincronização já em execução')
      return null
    }

    this.isRunning = true
    const startTime = Date.now()
    const results: any = {}

    try {
      // Descobrir coleções
      const collections = await this.discoverCollections()
      
      if (collections.length === 0) {
        console.log('❌ Nenhuma coleção encontrada no Firestore')
        return { error: 'Nenhuma coleção encontrada' }
      }

      console.log(`📋 Coleções encontradas: ${collections.join(', ')}`)

      // Sincronizar cada coleção
      for (const collectionName of collections) {
        results[collectionName] = await this.syncCollection(collectionName)
        
        // Pausa entre coleções
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      const duration = Date.now() - startTime
      console.log(`✅ Sincronização completa em ${duration/1000}s`)
      
      return {
        duration,
        collections,
        results,
        timestamp: new Date()
      }
    } finally {
      this.isRunning = false
    }
  }

  // Ouvir mudanças em tempo real
  startRealtime(collectionName: string): void {
    if (this.listeners.has(collectionName)) {
      this.stopRealtime(collectionName)
    }

    console.log(`⚡ Tempo real ativo: ${collectionName}`)
    
    const q = query(collection(db, collectionName), orderBy('bookingDate', 'desc'), limit(10))
    
    const unsubscribe = onSnapshot(q, async (snapshot: QuerySnapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added' || change.type === 'modified') {
          const mapped = this.mapReservation(change.doc.data(), change.doc.id)
          
          try {
            const { error } = await supabase
              .from('reservas')
              .upsert([mapped], { onConflict: 'booking_id' })
            
            if (error) throw error
            console.log(`🔄 Sincronizado: ${mapped.booking_id}`)
          } catch (error) {
            console.error(`❌ Erro ao sincronizar ${change.doc.id}:`, error)
          }
        }
      }
    })

    this.listeners.set(collectionName, unsubscribe)
  }

  // Parar tempo real
  stopRealtime(collectionName?: string): void {
    if (collectionName) {
      const unsubscribe = this.listeners.get(collectionName)
      if (unsubscribe) {
        unsubscribe()
        this.listeners.delete(collectionName)
        console.log(`🛑 Tempo real parado: ${collectionName}`)
      }
    } else {
      this.listeners.forEach((unsubscribe, name) => {
        unsubscribe()
        console.log(`🛑 Tempo real parado: ${name}`)
      })
      this.listeners.clear()
    }
  }

  // Obter estatísticas
  async getStats(): Promise<any> {
    const collections = await this.discoverCollections()
    
    const { data: supabaseData } = await supabase
      .from('reservas')
      .select('source, sync_status')
      .eq('source', 'firebase_sync')
    
    return {
      firestore: {
        collections,
        total: collections.length
      },
      supabase: {
        total: supabaseData?.length || 0,
        synced: supabaseData?.filter(r => r.sync_status === 'synced').length || 0
      },
      isRunning: this.isRunning,
      activeRealtime: Array.from(this.listeners.keys())
    }
  }
}

export const firestoreSync = new FirestoreSyncService()
