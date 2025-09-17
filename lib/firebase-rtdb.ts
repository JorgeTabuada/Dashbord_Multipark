// 🔥 Cliente Firebase Realtime Database
// =======================================

import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref, get, onValue, set, push, off } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Inicializar Firebase com validação
let app: any
let database: any

try {
  // Validar configuração específica para RTDB
  if (!firebaseConfig.databaseURL) {
    console.warn('⚠️ NEXT_PUBLIC_FIREBASE_DATABASE_URL não configurado - RTDB não disponível')
    throw new Error('Database URL obrigatória para Realtime Database')
  }
  
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Configuração Firebase incompleta - apiKey e projectId são obrigatórios')
  }
  
  app = !getApps().length ? initializeApp(firebaseConfig, 'rtdb-app') : getApps().find(a => a.name === 'rtdb-app') || initializeApp(firebaseConfig, 'rtdb-app')
  database = getDatabase(app)
  
  console.log('✅ Firebase RTDB inicializado:', firebaseConfig.projectId)
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase RTDB:', error)
  // Definir database como null para evitar crashs
  database = null
}

export interface FirebaseReservation {
  idClient?: string
  city?: string
  parkBrand?: string
  licensePlate: string
  name?: string
  lastname?: string
  email?: string
  phoneNumber?: string
  bookingDate?: string
  checkIn?: string
  checkOut?: string
  bookingPrice?: string | number
  correctedPrice?: string | number
  priceOnDelivery?: string | number
  stats?: string
  paymentMethod?: string
  parkingType?: string
  deliveryLocation?: string
  returnFlight?: string
  carInfo?: string
  park?: string
  row?: string
  spot?: string
  alocation?: string
  condutorRecolha?: string
  condutorEntrega?: string
  actionUser?: string
  actionDate?: string
  action?: string
  createdAt?: string
  canceledDate?: string
  [key: string]: any
}

class FirebaseRealtimeClient {
  private listeners: Map<string, any> = new Map()

  // Obter todas as cidades disponíveis
  async getCities(): Promise<string[]> {
    try {
      if (!database) {
        console.warn('Database RTDB não disponível')
        return []
      }
      
      const citiesRef = ref(database, 'reservations')
      const snapshot = await get(citiesRef)
      
      if (!snapshot.exists()) return []
      
      const data = snapshot.val()
      return Object.keys(data)
    } catch (error) {
      console.error('Erro ao obter cidades:', error)
      return []
    }
  }

  // Obter marcas para uma cidade
  async getBrands(city: string): Promise<string[]> {
    try {
      const brandsRef = ref(database, `reservations/${city}`)
      const snapshot = await get(brandsRef)
      
      if (!snapshot.exists()) return []
      
      const data = snapshot.val()
      return Object.keys(data)
    } catch (error) {
      console.error('Erro ao obter marcas:', error)
      return []
    }
  }

  // Obter todas as reservas de uma cidade/marca
  async getReservations(city: string, brand: string): Promise<FirebaseReservation[]> {
    try {
      const reservationsRef = ref(database, `reservations/${city}/${brand}`)
      const snapshot = await get(reservationsRef)
      
      if (!snapshot.exists()) return []
      
      const data = snapshot.val()
      return Object.entries(data).map(([id, reservation]: [string, any]) => ({
        id,
        ...reservation
      }))
    } catch (error) {
      console.error('Erro ao obter reservas:', error)
      return []
    }
  }

  // Obter uma reserva específica
  async getReservation(city: string, brand: string, id: string): Promise<FirebaseReservation | null> {
    try {
      const reservationRef = ref(database, `reservations/${city}/${brand}/${id}`)
      const snapshot = await get(reservationRef)
      
      if (!snapshot.exists()) return null
      
      return {
        id,
        ...snapshot.val()
      }
    } catch (error) {
      console.error('Erro ao obter reserva:', error)
      return null
    }
  }

  // Ouvir mudanças em tempo real
  listenToReservations(
    city: string, 
    brand: string, 
    callback: (reservations: FirebaseReservation[]) => void
  ): () => void {
    const path = `reservations/${city}/${brand}`
    const reservationsRef = ref(database, path)
    
    const listener = onValue(reservationsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([])
        return
      }
      
      const data = snapshot.val()
      const reservations = Object.entries(data).map(([id, reservation]: [string, any]) => ({
        id,
        ...reservation
      }))
      
      callback(reservations)
    })

    // Guardar referência para poder parar
    this.listeners.set(path, listener)
    
    // Retornar função para parar o listener
    return () => {
      off(reservationsRef, 'value', listener)
      this.listeners.delete(path)
    }
  }

  // Parar todos os listeners
  stopAllListeners(): void {
    this.listeners.forEach((listener, path) => {
      const reservationsRef = ref(database, path)
      off(reservationsRef, 'value', listener)
    })
    this.listeners.clear()
  }

  // Obter estatísticas
  async getStats(): Promise<any> {
    try {
      const cities = await this.getCities()
      let totalReservations = 0
      const stats: any = {}

      for (const city of cities) {
        const brands = await this.getBrands(city)
        stats[city] = {}
        
        for (const brand of brands) {
          const reservations = await this.getReservations(city, brand)
          stats[city][brand] = reservations.length
          totalReservations += reservations.length
        }
      }

      return {
        total: totalReservations,
        byCityBrand: stats,
        cities: cities.length
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return { total: 0, byCityBrand: {}, cities: 0 }
    }
  }
}

export const firebaseRTDB = new FirebaseRealtimeClient()
