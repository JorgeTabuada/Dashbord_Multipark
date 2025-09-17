// Cliente Firebase para comunicação com o sistema Firebase (Backoffice)
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  Firestore
} from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword, signOut, Auth } from 'firebase/auth'

// Configuração Firebase (deve ser copiada do sistema Backoffice)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
}

// Inicializar Firebase
let app: FirebaseApp
let db: Firestore
let auth: Auth

// Inicialização segura do Firebase
try {
  if (!getApps().length) {
    // Validar configuração obrigatória
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Configuração Firebase incompleta - apiKey e projectId são obrigatórios')
    }
    
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    
    console.log('✅ Firebase inicializado com sucesso:', firebaseConfig.projectId)
  } else {
    app = getApps()[0]
    db = getFirestore(app)
    auth = getAuth(app)
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error)
  throw error
}

export { app, db, auth }

// Interfaces
export interface FirebaseReservationData {
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
  checkinDate?: Timestamp
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

// Classe para gerenciar operações Firebase
export class FirebaseClient {
  private db: Firestore
  private auth: Auth

  constructor() {
    this.db = db
    this.auth = auth
  }

  // Autenticação
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Erro ao fazer login Firebase:', error)
      throw error
    }
  }

  async signOut() {
    try {
      await signOut(this.auth)
    } catch (error) {
      console.error('Erro ao fazer logout Firebase:', error)
      throw error
    }
  }

  // Operações de reservas
  async getReservation(city: string, brand: string, idClient: string): Promise<FirebaseReservationData | null> {
    try {
      const docRef = doc(this.db, city, brand, 'clients', idClient)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { idClient, city, parkBrand: brand, ...docSnap.data() } as FirebaseReservationData
      }
      
      return null
    } catch (error) {
      console.error('Erro ao buscar reserva Firebase:', error)
      throw error
    }
  }

  async getAllReservations(city: string, brand: string, limitCount: number = 5000): Promise<FirebaseReservationData[]> {
    try {
      const collectionRef = collection(this.db, city, brand, 'clients')
      const q = query(collectionRef, orderBy('createdAt', 'desc'), limit(limitCount))
      const querySnapshot = await getDocs(q)
      
      const reservations: FirebaseReservationData[] = []
      querySnapshot.forEach((doc) => {
        reservations.push({
          idClient: doc.id,
          city,
          parkBrand: brand,
          ...doc.data()
        } as FirebaseReservationData)
      })
      
      return reservations
    } catch (error) {
      console.error('Erro ao buscar todas as reservas Firebase:', error)
      throw error
    }
  }

  async getReservationsByStatus(city: string, brand: string, status: string): Promise<FirebaseReservationData[]> {
    try {
      const collectionRef = collection(this.db, city, brand, 'clients')
      const q = query(collectionRef, where('stats', '==', status))
      const querySnapshot = await getDocs(q)
      
      const reservations: FirebaseReservationData[] = []
      querySnapshot.forEach((doc) => {
        reservations.push({
          idClient: doc.id,
          city,
          parkBrand: brand,
          ...doc.data()
        } as FirebaseReservationData)
      })
      
      return reservations
    } catch (error) {
      console.error('Erro ao buscar reservas por status Firebase:', error)
      throw error
    }
  }

  async getRecentReservations(city: string, brand: string, hoursBack: number = 24): Promise<FirebaseReservationData[]> {
    try {
      const cutoffTime = new Date()
      cutoffTime.setHours(cutoffTime.getHours() - hoursBack)
      
      const collectionRef = collection(this.db, city, brand, 'clients')
      const q = query(
        collectionRef, 
        where('checkinDate', '>=', Timestamp.fromDate(cutoffTime)),
        orderBy('checkinDate', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const reservations: FirebaseReservationData[] = []
      querySnapshot.forEach((doc) => {
        reservations.push({
          idClient: doc.id,
          city,
          parkBrand: brand,
          ...doc.data()
        } as FirebaseReservationData)
      })
      
      return reservations
    } catch (error) {
      console.error('Erro ao buscar reservas recentes Firebase:', error)
      throw error
    }
  }

  async updateReservation(city: string, brand: string, idClient: string, data: Partial<FirebaseReservationData>) {
    try {
      const docRef = doc(this.db, city, brand, 'clients', idClient)
      await updateDoc(docRef, {
        ...data,
        actionDate: new Date().toLocaleString('pt-PT'),
        actionUser: 'Supabase Sync'
      })
    } catch (error) {
      console.error('Erro ao atualizar reserva Firebase:', error)
      throw error
    }
  }

  async createReservation(city: string, brand: string, idClient: string, data: FirebaseReservationData) {
    try {
      const docRef = doc(this.db, city, brand, 'clients', idClient)
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        actionDate: new Date().toLocaleString('pt-PT'),
        actionUser: 'Supabase Sync'
      })
    } catch (error) {
      console.error('Erro ao criar reserva Firebase:', error)
      throw error
    }
  }

  async deleteReservation(city: string, brand: string, idClient: string) {
    try {
      const docRef = doc(this.db, city, brand, 'clients', idClient)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erro ao excluir reserva Firebase:', error)
      throw error
    }
  }

  // Listener em tempo real para mudanças
  subscribeToReservationChanges(
    city: string, 
    brand: string, 
    callback: (reservations: FirebaseReservationData[]) => void
  ) {
    const collectionRef = collection(this.db, city, brand, 'clients')
    const q = query(collectionRef, orderBy('checkinDate', 'desc'), limit(100))
    
    return onSnapshot(q, (querySnapshot) => {
      const reservations: FirebaseReservationData[] = []
      querySnapshot.forEach((doc) => {
        reservations.push({
          idClient: doc.id,
          city,
          parkBrand: brand,
          ...doc.data()
        } as FirebaseReservationData)
      })
      
      callback(reservations)
    }, (error) => {
      console.error('Erro no listener Firebase:', error)
    })
  }

  subscribeToSingleReservation(
    city: string,
    brand: string,
    idClient: string,
    callback: (reservation: FirebaseReservationData | null) => void
  ) {
    const docRef = doc(this.db, city, brand, 'clients', idClient)
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({
          idClient: doc.id,
          city,
          parkBrand: brand,
          ...doc.data()
        } as FirebaseReservationData)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Erro no listener da reserva Firebase:', error)
    })
  }

  // Operações de configuração
  async getCities(): Promise<string[]> {
    try {
      const docRef = doc(this.db, 'settings', 'cities')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return Object.keys(data)
      }
      
      return []
    } catch (error) {
      console.error('Erro ao buscar cidades Firebase:', error)
      throw error
    }
  }

  async getBrandsForCity(city: string): Promise<string[]> {
    try {
      const docRef = doc(this.db, 'settings', 'cities')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return data[city] || []
      }
      
      return []
    } catch (error) {
      console.error('Erro ao buscar marcas para cidade Firebase:', error)
      throw error
    }
  }

  async getPaymentTypes(): Promise<string[]> {
    try {
      const docRef = doc(this.db, 'settings', 'tipoDePagamento')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return data.all || []
      }
      
      return []
    } catch (error) {
      console.error('Erro ao buscar tipos de pagamento Firebase:', error)
      throw error
    }
  }

  // Métodos utilitários
  async testConnection(): Promise<boolean> {
    try {
      const docRef = doc(this.db, 'settings', 'cities')
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
    } catch (error) {
      console.error('Erro ao testar conexão Firebase:', error)
      return false
    }
  }

  async getAllCitiesAndBrands(): Promise<{[city: string]: string[]}> {
    try {
      const docRef = doc(this.db, 'settings', 'cities')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as {[city: string]: string[]}
      }
      
      return {}
    } catch (error) {
      console.error('Erro ao buscar cidades e marcas Firebase:', error)
      throw error
    }
  }
}

// Instância singleton
export const firebaseClient = new FirebaseClient()

// Hook para usar em componentes React
export function useFirebaseClient() {
  return firebaseClient
}