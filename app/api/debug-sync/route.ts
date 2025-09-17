import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, getDocs, query, limit, where, orderBy } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'
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
const auth = getAuth(app)

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

    if (action === 'test') {
      // Tentar autenticar removido temporariamente - verificar permissões primeiro

      // Testar todas as coleções possíveis
      const results: any = {
        collections: {},
        errors: [],
        totalFound: 0
      }

      // Lista de coleções para testar
      const collectionsToTest = [
        'reservas',
        'reservations',
        'bookings',
        'Lisboa',
        'Porto',
        'Faro',
        'users',
        'parks',
        'clientes'
      ]

      for (const collName of collectionsToTest) {
        try {
          const q = query(collection(db, collName), limit(10))
          const snapshot = await getDocs(q)
          
          if (!snapshot.empty) {
            results.collections[collName] = {
              count: snapshot.size,
              sample: snapshot.docs[0].data(),
              id: snapshot.docs[0].id
            }
            results.totalFound += snapshot.size
          }
        } catch (error: any) {
          // Silencioso para coleções que não existem
        }
      }

      // Se encontrou a coleção reservas, tentar sincronizar
      if (results.collections['reservas']) {
        console.log('📦 Tentando sincronizar reservas...')
        
        try {
          const q = query(collection(db, 'reservas'), limit(100))
          const snapshot = await getDocs(q)
          
          let synced = 0
          let errors = 0
          
          for (const doc of snapshot.docs) {
            try {
              const data = doc.data()
              
              // Mapear dados
              const mapped = {
                booking_id: doc.id,
                license_plate: data.licensePlate || data.matricula || '',
                name_cliente: data.name || data.nome || data.clientName,
                email_cliente: data.email || data.clientEmail,
                phone_number_cliente: data.phoneNumber || data.telefone,
                booking_date: data.bookingDate?.toDate?.() || data.bookingDate,
                booking_price: parseFloat(data.bookingPrice || data.price || 0),
                estado_reserva_atual: data.status || data.estado || 'reservado',
                park_name: data.parkBrand || data.park || data.parque,
                source: 'firebase_sync',
                sync_status: 'synced',
                last_sync_at: new Date().toISOString()
              }
              
              // Verificar se já existe antes de inserir
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
                
                if (error) {
                  console.error('Erro ao atualizar:', error)
                  errors++
                } else {
                  synced++
                }
              } else {
                // Inserir novo
                const { error } = await supabase
                  .from('reservas')
                  .insert([mapped])
                
                if (error) {
                  console.error('Erro ao inserir:', error)
                  errors++
                } else {
                  synced++
                  console.log(`✅ Sincronizado: ${doc.id}`)
                }
              }
            } catch (syncError) {
              console.error('Erro ao processar documento:', syncError)
              errors++
            }
          }
          
          results.syncResult = {
            total: snapshot.size,
            synced,
            errors
          }
        } catch (syncError: any) {
          results.syncError = syncError.message
        }
      }

      return NextResponse.json(results)
    }

    if (action === 'sync_force') {
      // Forçar sincronização mesmo sem saber estrutura
      console.log('🔄 Sincronização forçada iniciada...')
      
      const q = query(collection(db, 'reservas'))
      const snapshot = await getDocs(q)
      
      console.log(`📊 Total de documentos encontrados: ${snapshot.size}`)
      
      let synced = 0
      let errors = 0
      const errorDetails: any[] = []
      
      for (const doc of snapshot.docs) {
        try {
          const data = doc.data()
          
          // Mapear com todos os campos possíveis
          const mapped: any = {
            booking_id: doc.id,
            source: 'firebase_sync',
            sync_status: 'synced',
            last_sync_at: new Date().toISOString()
          }
          
          // Mapear campos dinamicamente
          const fieldMap: Record<string, string> = {
            'licensePlate': 'license_plate',
            'matricula': 'license_plate',
            'name': 'name_cliente',
            'nome': 'name_cliente',
            'clientName': 'name_cliente',
            'email': 'email_cliente',
            'clientEmail': 'email_cliente',
            'phoneNumber': 'phone_number_cliente',
            'telefone': 'phone_number_cliente',
            'bookingDate': 'booking_date',
            'dataReserva': 'booking_date',
            'price': 'booking_price',
            'bookingPrice': 'booking_price',
            'preco': 'booking_price',
            'status': 'estado_reserva_atual',
            'estado': 'estado_reserva_atual',
            'park': 'park_name',
            'parkBrand': 'park_name',
            'parque': 'park_name'
          }
          
          for (const [firebaseField, supabaseField] of Object.entries(fieldMap)) {
            if (data[firebaseField] !== undefined) {
              let value = data[firebaseField]
              
              // Converter datas
              if (value?.toDate) {
                value = value.toDate()
              }
              
              // Converter preços
              if (supabaseField.includes('price')) {
                value = parseFloat(value) || 0
              }
              
              mapped[supabaseField] = value
            }
          }
          
          // Garantir que tem matrícula (campo obrigatório)
          if (!mapped.license_plate) {
            mapped.license_plate = `SYNC-${doc.id}`
          }
          
          const { error } = await supabase
            .from('reservas')
            .upsert([mapped], { onConflict: 'booking_id' })
          
          if (error) {
            errorDetails.push({ id: doc.id, error: error.message })
            errors++
          } else {
            synced++
            console.log(`✅ Sincronizado: ${doc.id}`)
          }
          
        } catch (error: any) {
          errorDetails.push({ id: doc.id, error: error.message })
          errors++
        }
      }
      
      return NextResponse.json({
        success: true,
        total: snapshot.size,
        synced,
        errors,
        errorDetails: errorDetails.slice(0, 10) // Primeiros 10 erros
      })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
