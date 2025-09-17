// Firebase Admin SDK para acesso sem autenticação de utilizador
// Este método permite acessar todas as reservas sem credenciais de utilizador

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Inicializar Firebase Admin (se tivermos a service account key)
let adminApp: any = null
let adminDb: any = null

// Tentar inicializar Firebase Admin com configurações do ambiente
try {
  // Opção 1: Se temos service account key em JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'admin-multipark'
      }, 'admin-app')
    } else {
      adminApp = getApps().find(app => app.name === 'admin-app')
    }
    
    adminDb = getFirestore(adminApp)
    console.log('✅ Firebase Admin inicializado com Service Account')
  }
  
  // Opção 2: Configuração simplificada (se estivermos em ambiente confiável)
  else if (process.env.NODE_ENV === 'development') {
    // Em desenvolvimento, podemos tentar usar configuração sem credenciais
    // (apenas para teste local)
    console.log('⚠️ Tentando Firebase Admin em modo desenvolvimento')
  }
  
} catch (error) {
  console.log('⚠️ Firebase Admin não inicializado:', error)
  adminDb = null
}

// Classe para acessar Firebase com privilégios administrativos
export class FirebaseAdminClient {
  private db: any

  constructor() {
    this.db = adminDb
  }

  // Verificar se admin está disponível
  isAvailable(): boolean {
    return this.db !== null
  }

  // Obter reservas com acesso administrativo (sem precisar de auth de utilizador)
  async getReservationsAdmin(city: string, brand: string, limit: number = 5000): Promise<any[]> {
    if (!this.db) {
      throw new Error('Firebase Admin não disponível')
    }

    try {
      console.log(`🔑 Acesso Admin: ${city}/${brand} (limite: ${limit})`)
      
      const collectionRef = this.db.collection(city).doc(brand).collection('clients')
      const snapshot = await collectionRef.limit(limit).get()
      
      const reservations: any[] = []
      snapshot.forEach((doc: any) => {
        reservations.push({
          idClient: doc.id,
          city,
          parkBrand: brand,
          ...doc.data()
        })
      })
      
      console.log(`✅ Admin obteve ${reservations.length} reservas de ${city}/${brand}`)
      return reservations
      
    } catch (error) {
      console.error(`❌ Erro admin ${city}/${brand}:`, error)
      throw error
    }
  }

  // Contar reservas administrativamente
  async countReservationsAdmin(city: string, brand: string): Promise<number> {
    if (!this.db) {
      throw new Error('Firebase Admin não disponível')
    }

    try {
      const collectionRef = this.db.collection(city).doc(brand).collection('clients')
      const snapshot = await collectionRef.get()
      return snapshot.size
    } catch (error) {
      console.error(`❌ Erro ao contar ${city}/${brand}:`, error)
      return 0
    }
  }

  // Listar todas as localizações disponíveis
  async getAllLocationsAdmin(): Promise<{[city: string]: string[]}> {
    if (!this.db) {
      throw new Error('Firebase Admin não disponível')
    }

    try {
      const cities = ['lisbon', 'porto', 'faro']
      const brands = ['airpark', 'redpark', 'skypark', 'top-parking', 'lispark']
      const locations: {[city: string]: string[]} = {}
      
      for (const city of cities) {
        locations[city] = []
        
        for (const brand of brands) {
          try {
            const count = await this.countReservationsAdmin(city, brand)
            if (count > 0) {
              locations[city].push(brand)
              console.log(`📍 ${city}/${brand}: ${count} reservas`)
            }
          } catch (error) {
            // Marca não existe para esta cidade
          }
        }
        
        // Remover cidades vazias
        if (locations[city].length === 0) {
          delete locations[city]
        }
      }
      
      return locations
      
    } catch (error) {
      console.error('❌ Erro ao listar localizações:', error)
      return {}
    }
  }
}

// Instância singleton
export const firebaseAdmin = new FirebaseAdminClient()

// Função auxiliar para determinar se devemos usar admin ou client
export function shouldUseAdmin(): boolean {
  return firebaseAdmin.isAvailable()
}