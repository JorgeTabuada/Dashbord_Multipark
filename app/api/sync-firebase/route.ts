import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, query, limit, collectionGroup } from 'firebase/firestore'
import { createClient } from '@supabase/supabase-js'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

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

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json()

    if (action === 'sync_all') {
      console.log('🚀 Iniciando sincronização completa...')
      
      const results = {
        total: 0,
        synced: 0,
        errors: 0,
        details: {} as any,
        errorMessages: [] as string[]
      }

      // 1. Sincronizar coleção principal 'reservas'
      try {
        console.log('📂 Sincronizando coleção: reservas')
        const reservasSnapshot = await getDocs(collection(db, 'reservas'))
        console.log(`   Encontrados: ${reservasSnapshot.size} documentos`)
        
        let localSynced = 0
        let localErrors = 0
        
        for (const docSnapshot of reservasSnapshot.docs) {
          try {
            const data = docSnapshot.data()
            const mapped = mapReservation(data, docSnapshot.id)
            
            const { data: existing } = await supabase
              .from('reservas')
              .select('id_pk')
              .eq('booking_id', mapped.booking_id)
              .single()
            
            if (existing) {
              const { error } = await supabase
                .from('reservas')
                .update(mapped)
                .eq('booking_id', mapped.booking_id)
              
              if (error) throw error
            } else {
              const { error } = await supabase
                .from('reservas')
                .insert([mapped])
              
              if (error) throw error
            }
            
            localSynced++
            results.synced++
          } catch (error: any) {
            localErrors++
            results.errors++
            console.error(`   Erro em ${docSnapshot.id}:`, error.message)
          }
        }
        
        results.details['reservas'] = {
          total: reservasSnapshot.size,
          synced: localSynced,
          errors: localErrors
        }
        results.total += reservasSnapshot.size
        
      } catch (error: any) {
        console.error('Erro ao acessar reservas:', error.message)
        results.errorMessages.push(`reservas: ${error.message}`)
      }

      // 2. Tentar buscar usando collectionGroup para pegar todos os 'clients'
      try {
        console.log('📂 Buscando todos os clients (collectionGroup)...')
        const clientsQuery = collectionGroup(db, 'clients')
        const clientsSnapshot = await getDocs(clientsQuery)
        console.log(`   Encontrados: ${clientsSnapshot.size} clientes totais`)
        
        let localSynced = 0
        let localErrors = 0
        
        for (const docSnapshot of clientsSnapshot.docs) {
          try {
            const data = docSnapshot.data()
            // Extrair cidade do path do documento
            const pathParts = docSnapshot.ref.path.split('/')
            const city = pathParts[0] // Primeiro segmento deve ser a cidade
            
            const mapped = mapReservation(data, docSnapshot.id, city)
            
            const { data: existing } = await supabase
              .from('reservas')
              .select('id_pk')
              .eq('booking_id', mapped.booking_id)
              .single()
            
            if (existing) {
              const { error } = await supabase
                .from('reservas')
                .update(mapped)
                .eq('booking_id', mapped.booking_id)
              
              if (error) throw error
            } else {
              const { error } = await supabase
                .from('reservas')
                .insert([mapped])
              
              if (error) throw error
            }
            
            localSynced++
            results.synced++
          } catch (error: any) {
            localErrors++
            results.errors++
          }
        }
        
        results.details['clients (todas cidades)'] = {
          total: clientsSnapshot.size,
          synced: localSynced,
          errors: localErrors
        }
        results.total += clientsSnapshot.size
        
      } catch (error: any) {
        console.error('Erro ao buscar clients:', error.message)
        
        // Se collectionGroup falhar, tentar manualmente cada cidade
        console.log('📂 Tentando método alternativo por cidade...')
        const cities = [
          { name: 'lisbon', docs: ['settings', 'config', 'data'] },
          { name: 'porto', docs: ['settings', 'config', 'data'] },
          { name: 'faro', docs: ['settings', 'config', 'data'] }
        ]
        
        for (const city of cities) {
          for (const docName of city.docs) {
            try {
              const path = `${city.name}/${docName}/clients`
              console.log(`   Tentando: ${path}`)
              const snapshot = await getDocs(collection(db, path))
              
              if (snapshot.size > 0) {
                console.log(`   ✅ Encontrados ${snapshot.size} em ${path}`)
                // Processar...
              }
            } catch (e) {
              // Silencioso - muitas combinações não existirão
            }
          }
        }
      }

      // 3. Tentar users e users-faro
      const userCollections = ['users', 'users-faro']
      for (const collName of userCollections) {
        try {
          console.log(`📂 Verificando: ${collName}`)
          const snapshot = await getDocs(collection(db, collName))
          console.log(`   Encontrados: ${snapshot.size} documentos`)
          
          results.details[collName] = {
            total: snapshot.size,
            info: 'Coleção de usuários (não sincronizada para reservas)'
          }
        } catch (error: any) {
          console.log(`   Erro em ${collName}: ${error.message}`)
        }
      }

      console.log('✅ Sincronização completa!')
      return NextResponse.json(results)
    }

    if (action === 'discover') {
      console.log('🔍 Descobrindo estrutura do Firebase...')
      const structure: any = {}
      
      // Testar coleções raiz conhecidas
      const rootCollections = [
        'reservas', 'users', 'users-faro', 
        'lisbon', 'porto', 'faro',
        'website', 'skypark', 'redpark',
        'settings'
      ]
      
      for (const collName of rootCollections) {
        try {
          const snapshot = await getDocs(query(collection(db, collName), limit(2)))
          if (snapshot.size > 0) {
            structure[collName] = {
              type: 'collection',
              count: snapshot.size,
              hasData: true,
              sample: snapshot.docs[0].data()
            }
            
            // Se é uma cidade, verificar se tem subcoleções
            if (['lisbon', 'porto', 'faro'].includes(collName)) {
              // Tentar pegar um documento para ver subcoleções
              const firstDoc = snapshot.docs[0]
              if (firstDoc) {
                console.log(`   Verificando subcoleções de ${collName}/${firstDoc.id}`)
                
                // Tentar clients como subcoleção
                try {
                  const clientsRef = collection(doc(db, collName, firstDoc.id), 'clients')
                  const clientsSnap = await getDocs(query(clientsRef, limit(1)))
                  if (clientsSnap.size > 0) {
                    structure[collName].subcollections = {
                      clients: {
                        count: clientsSnap.size,
                        sample: clientsSnap.docs[0].data()
                      }
                    }
                  }
                } catch (e) {
                  // Sem clients neste documento
                }
              }
            }
          }
        } catch (error) {
          // Coleção não existe ou sem permissão
        }
      }
      
      // Tentar collectionGroup
      try {
        const clientsGroup = await getDocs(query(collectionGroup(db, 'clients'), limit(5)))
        if (clientsGroup.size > 0) {
          structure['_collectionGroups'] = {
            clients: {
              totalFound: clientsGroup.size,
              paths: clientsGroup.docs.map(d => d.ref.path)
            }
          }
        }
      } catch (e) {
        console.log('CollectionGroup não funcionou')
      }
      
      return NextResponse.json({ structure })
    }

    return NextResponse.json({ error: 'Ação inválida' })
    
  } catch (error: any) {
    console.error('Erro geral:', error)
    return NextResponse.json({ 
      error: error.message,
      code: error.code 
    }, { status: 500 })
  }
}

// Função auxiliar para mapear dados
function mapReservation(data: any, id: string, city?: string): any {
  // Garantir que temos um ID único
  const bookingId = id || data.id || data.idClient || `FB-${Date.now()}`
  
  return {
    booking_id: bookingId,
    
    // Dados básicos
    license_plate: data.licensePlate || data.matricula || data.plate || '',
    name_cliente: data.name || data.clientName || data.firstName,
    lastname_cliente: data.lastname || data.lastName || data.surname,
    email_cliente: data.email || data.clientEmail,
    phone_number_cliente: data.phoneNumber || data.phone || data.telefone,
    
    // Localização
    cidade_cliente: city || data.city || data.cidade,
    park_name: data.parkBrand || data.park || data.parque,
    parking_type: data.parkingType || data.tipoPark,
    
    // Datas - converter Firestore Timestamps
    booking_date: data.bookingDate?.toDate?.() || data.bookingDate || data.createdAt?.toDate?.() || data.createdAt,
    check_in_previsto: data.checkIn?.toDate?.() || data.checkIn || data.checkInDate?.toDate?.() || data.checkInDate,
    check_out_previsto: data.checkOut?.toDate?.() || data.checkOut || data.checkOutDate?.toDate?.() || data.checkOutDate,
    
    // Valores
    booking_price: parseFloat(data.bookingPrice || data.price || data.totalPrice || 0),
    parking_price: parseFloat(data.parkingPrice || 0),
    
    // Estado
    estado_reserva_atual: data.status || data.estado || data.stats || 'reservado',
    
    // Extras
    return_flight: data.returnFlight || data.vooRetorno,
    payment_method: data.paymentMethod || data.metodoPagamento,
    
    // Metadata
    source: 'firebase_sync',
    sync_status: 'synced',
    last_sync_at: new Date().toISOString()
  }
}
