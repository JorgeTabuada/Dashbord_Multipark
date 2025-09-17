import { NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Inicializar Firebase Admin
let adminApp: any = null
let adminDb: any = null

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    
    if (!getApps().find(app => app.name === 'admin-app')) {
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
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error)
}

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({
        status: 'error',
        error: 'Firebase Admin não inicializado',
        message: 'Verifique FIREBASE_SERVICE_ACCOUNT_KEY no .env.local'
      }, { status: 500 })
    }

    console.log('🔑 Testando Firebase Admin SDK...')
    
    // Testar acesso a diferentes localizações
    const testLocations = [
      { city: 'porto', brand: 'airpark' },
      { city: 'porto', brand: 'redpark' },
      { city: 'faro', brand: 'airpark' },
      { city: 'faro', brand: 'redpark' },
      { city: 'lisbon', brand: 'top-parking' }
    ]
    
    const results: any = {
      firebase_admin_status: 'connected',
      timestamp: new Date().toISOString(),
      location_tests: {},
      total_found: 0
    }
    
    for (const location of testLocations) {
      try {
        console.log(`🔍 Testando ${location.city}/${location.brand}...`)
        
        // Acessar coleção com privilégios administrativos
        const collectionRef = adminDb
          .collection(location.city)
          .doc(location.brand)
          .collection('clients')
        
        // Contar documentos (amostra limitada para teste)
        const snapshot = await collectionRef.limit(1000).get()
        const count = snapshot.size
        
        // Obter algumas amostras
        const samples: any[] = []
        let sampleCount = 0
        snapshot.forEach((doc: any) => {
          if (sampleCount < 3) {
            samples.push({
              id: doc.id,
              data: doc.data()
            })
            sampleCount++
          }
        })
        
        results.location_tests[`${location.city}/${location.brand}`] = {
          accessible: true,
          count: count,
          hit_limit: count === 1000,
          samples: samples
        }
        
        results.total_found += count
        console.log(`✅ ${location.city}/${location.brand}: ${count} reservas`)
        
      } catch (error) {
        console.error(`❌ Erro em ${location.city}/${location.brand}:`, error)
        results.location_tests[`${location.city}/${location.brand}`] = {
          accessible: false,
          error: String(error)
        }
      }
    }
    
    // Resumo final
    results.summary = {
      locations_accessible: Object.values(results.location_tests).filter((r: any) => r.accessible).length,
      locations_with_data: Object.values(results.location_tests).filter((r: any) => r.accessible && r.count > 0).length,
      total_reservations_found: results.total_found,
      estimated_more: Object.values(results.location_tests).some((r: any) => r.hit_limit)
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('❌ Erro no teste Firebase Admin:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: 'Erro ao testar Firebase Admin'
    }, { status: 500 })
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

    const { action, city, brand, limit = 5000 } = await req.json()
    
    if (action === 'get_reservations') {
      // Obter reservas específicas com Firebase Admin
      if (!city || !brand) {
        return NextResponse.json({ 
          error: 'Cidade e marca obrigatórias' 
        }, { status: 400 })
      }
      
      console.log(`🔑 Obtendo reservas Admin: ${city}/${brand} (limite: ${limit})`)
      
      const collectionRef = adminDb
        .collection(city)
        .doc(brand)
        .collection('clients')
      
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
      
      return NextResponse.json({
        status: 'success',
        city,
        brand,
        count: reservations.length,
        hit_limit: reservations.length === limit,
        reservations: reservations
      })
    }
    
    if (action === 'count_all') {
      // Contar todas as reservas em todas as localizações
      console.log('📊 Contando todas as reservas com Firebase Admin...')
      
      const cities = ['porto', 'faro', 'lisbon']
      const brands = ['airpark', 'redpark', 'skypark', 'top-parking', 'lispark']
      
      let totalCount = 0
      const locationCounts: any = {}
      
      for (const city of cities) {
        locationCounts[city] = {}
        
        for (const brand of brands) {
          try {
            const collectionRef = adminDb
              .collection(city)
              .doc(brand)
              .collection('clients')
            
            const snapshot = await collectionRef.get()
            const count = snapshot.size
            
            if (count > 0) {
              locationCounts[city][brand] = count
              totalCount += count
              console.log(`📍 ${city}/${brand}: ${count} reservas`)
            }
          } catch (error) {
            // Localização não existe
          }
        }
        
        // Limpar cidades sem dados
        if (Object.keys(locationCounts[city]).length === 0) {
          delete locationCounts[city]
        }
      }
      
      return NextResponse.json({
        status: 'success',
        total_count: totalCount,
        location_breakdown: locationCounts,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro na ação POST:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}