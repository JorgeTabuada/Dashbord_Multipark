import { NextResponse } from 'next/server'
import { firebaseClient } from '@/lib/firebase-client'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, collection, getDocs, getDoc, query, limit, orderBy, where } from 'firebase/firestore'

// Configuração Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = !getApps().length ? initializeApp(firebaseConfig, 'deep-explorer') : getApps().find(a => a.name === 'deep-explorer') || initializeApp(firebaseConfig, 'deep-explorer')
const db = getFirestore(app)

export async function GET() {
  try {
    console.log('🔬 Exploração PROFUNDA do Firebase...')
    
    const results: any = {
      firebase_project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      timestamp: new Date().toISOString(),
      exploration_results: {}
    }
    
    // 1. Tentar descobrir todas as coleções de nível superior
    console.log('🔍 Tentando descobrir coleções de nível superior...')
    const rootCollections = [
      // Cidades conhecidas
      'lisbon', 'lisboa', 'porto', 'faro', 'madrid', 'barcelona', 'paris', 'london',
      // Estruturas alternativas
      'reservations', 'reservas', 'bookings', 'clients', 'customers',
      'cities', 'settings', 'config', 'users', 'administrators',
      // Anos (caso seja organizado por ano)
      '2024', '2023', '2025',
      // Outras possibilidades
      'multipark', 'airpark', 'redpark', 'skypark', 'top-parking'
    ]
    
    const foundCollections: any = {}
    
    for (const collectionName of rootCollections) {
      try {
        console.log(`🔎 Verificando coleção raiz: ${collectionName}`)
        
        // Tentar obter documentos da coleção
        const collectionRef = collection(db, collectionName)
        const querySnapshot = await getDocs(query(collectionRef, limit(5)))
        
        if (!querySnapshot.empty) {
          const docs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data(),
            hasSubcollections: true // Assumir que pode ter subcoleções
          }))
          
          foundCollections[collectionName] = {
            docCount: querySnapshot.size,
            sampleDocs: docs,
            type: 'root_collection'
          }
          
          console.log(`✅ Encontrada coleção: ${collectionName} (${querySnapshot.size} docs)`)
        }
      } catch (error) {
        // Silencioso - coleção não existe ou sem permissão
        console.log(`❌ Não foi possível acessar: ${collectionName}`)
      }
    }
    
    results.exploration_results.root_collections = foundCollections
    
    // 2. Para cada coleção encontrada, explorar subcoleções
    console.log('🔍 Explorando subcoleções...')
    const subcollectionExploration: any = {}
    
    for (const [rootCollection, info] of Object.entries(foundCollections)) {
      subcollectionExploration[rootCollection] = {}
      
      // Para cada documento na coleção raiz, tentar encontrar subcoleções
      for (const sampleDoc of (info as any).sampleDocs) {
        try {
          // Testar subcoleções conhecidas
          const knownSubcollections = [
            'clients', 'reservations', 'bookings', 'customers',
            'airpark', 'redpark', 'skypark', 'top-parking', 'lispark'
          ]
          
          for (const subCollName of knownSubcollections) {
            try {
              const subCollRef = collection(doc(db, rootCollection, sampleDoc.id), subCollName)
              const subQuerySnapshot = await getDocs(query(subCollRef, limit(10)))
              
              if (!subQuerySnapshot.empty) {
                const key = `${sampleDoc.id}/${subCollName}`
                subcollectionExploration[rootCollection][key] = {
                  docCount: subQuerySnapshot.size,
                  sampleData: subQuerySnapshot.docs.slice(0, 3).map(d => ({
                    id: d.id,
                    data: d.data()
                  }))
                }
                
                console.log(`🎯 ENCONTRADA subcoleção: ${rootCollection}/${sampleDoc.id}/${subCollName} (${subQuerySnapshot.size} docs)`)
              }
            } catch (error) {
              // Subcoleção não existe
            }
          }
        } catch (error) {
          console.error(`Erro ao explorar subcoleções de ${rootCollection}/${sampleDoc.id}:`, error)
        }
      }
    }
    
    results.exploration_results.subcollections = subcollectionExploration
    
    // 3. Tentar consultas com diferentes ordenações e filtros
    console.log('🔍 Testando diferentes estratégias de consulta...')
    const queryStrategies: any = {}
    
    // Para Lisboa/Top-Parking especificamente (sabemos que tem dados)
    try {
      const testCollection = 'lisbon/top-parking/clients'
      const collectionRef = collection(db, 'lisbon', 'top-parking', 'clients')
      
      // Estratégia 1: Sem ordenação, limite alto
      try {
        const q1 = query(collectionRef, limit(50000))
        const snapshot1 = await getDocs(q1)
        queryStrategies.no_order_50k = {
          count: snapshot1.size,
          hitLimit: snapshot1.size === 50000
        }
      } catch (error) {
        queryStrategies.no_order_50k = { error: String(error) }
      }
      
      // Estratégia 2: Diferentes campos de ordenação
      const orderFields = ['createdAt', 'checkinDate', 'actionDate', 'bookingDate']
      
      for (const field of orderFields) {
        try {
          const q = query(collectionRef, orderBy(field, 'desc'), limit(10000))
          const snapshot = await getDocs(q)
          queryStrategies[`order_by_${field}`] = {
            count: snapshot.size,
            hitLimit: snapshot.size === 10000,
            sampleIds: snapshot.docs.slice(0, 5).map(d => d.id)
          }
        } catch (error) {
          queryStrategies[`order_by_${field}`] = { error: String(error) }
        }
      }
      
      // Estratégia 3: Filtrar por status
      const statuses = ['reservado', 'recolhido', 'entregue', 'cancelado']
      
      for (const status of statuses) {
        try {
          const q = query(collectionRef, where('stats', '==', status), limit(5000))
          const snapshot = await getDocs(q)
          if (snapshot.size > 0) {
            queryStrategies[`filter_status_${status}`] = {
              count: snapshot.size,
              hitLimit: snapshot.size === 5000
            }
          }
        } catch (error) {
          queryStrategies[`filter_status_${status}`] = { error: String(error) }
        }
      }
      
    } catch (error) {
      queryStrategies.error = String(error)
    }
    
    results.exploration_results.query_strategies = queryStrategies
    
    // 4. Calcular total estimado
    let estimatedTotal = 0
    for (const strategy of Object.values(queryStrategies)) {
      if ((strategy as any).count && (strategy as any).count > estimatedTotal) {
        estimatedTotal = (strategy as any).count
      }
    }
    
    // Se alguma strategy atingiu o limite, significa que há mais dados
    const hasMoreData = Object.values(queryStrategies).some(s => (s as any).hitLimit)
    
    results.summary = {
      total_collections_found: Object.keys(foundCollections).length,
      total_subcollections_found: Object.values(subcollectionExploration).reduce((acc, curr) => acc + Object.keys(curr).length, 0),
      estimated_total_reservations: estimatedTotal,
      likely_has_more_data: hasMoreData,
      recommendations: []
    }
    
    if (hasMoreData) {
      results.summary.recommendations.push('Implementar paginação para obter todos os registos')
    }
    
    if (Object.keys(foundCollections).length === 0) {
      results.summary.recommendations.push('Verificar permissões de acesso ao Firebase')
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('❌ Erro na exploração profunda:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: 'Erro na exploração profunda do Firebase'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action, collection_path } = await req.json()
    
    if (action === 'paginated_count') {
      // Contar registos usando paginação
      if (!collection_path) {
        return NextResponse.json({ error: 'collection_path obrigatório' }, { status: 400 })
      }
      
      console.log(`📊 Contagem paginada para: ${collection_path}`)
      
      const pathParts = collection_path.split('/')
      let collectionRef
      
      if (pathParts.length === 3) {
        // city/brand/clients
        collectionRef = collection(db, pathParts[0], pathParts[1], pathParts[2])
      } else if (pathParts.length === 1) {
        // collection_name
        collectionRef = collection(db, pathParts[0])
      } else {
        return NextResponse.json({ error: 'Formato de path inválido' }, { status: 400 })
      }
      
      let totalCount = 0
      let lastDoc = null
      const batchSize = 1000
      let iterations = 0
      const maxIterations = 100 // Limite de segurança
      
      while (iterations < maxIterations) {
        try {
          let q = query(collectionRef, limit(batchSize))
          
          if (lastDoc) {
            // Continue from last document (requires ordering)
            q = query(collectionRef, orderBy('createdAt', 'desc'), limit(batchSize))
          }
          
          const snapshot = await getDocs(q)
          
          if (snapshot.empty) break
          
          totalCount += snapshot.size
          lastDoc = snapshot.docs[snapshot.docs.length - 1]
          iterations++
          
          console.log(`📈 Batch ${iterations}: +${snapshot.size} docs (total: ${totalCount})`)
          
          if (snapshot.size < batchSize) {
            // Reached end
            break
          }
          
        } catch (error) {
          console.error('Erro na paginação:', error)
          break
        }
      }
      
      return NextResponse.json({
        status: 'success',
        collection_path,
        total_count: totalCount,
        iterations_completed: iterations,
        reached_end: iterations < maxIterations
      })
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro na ação POST:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}