// API para sincronização manual Firebase → Supabase
import { NextRequest, NextResponse } from 'next/server'
import { firebaseClient } from '@/lib/firebase-client'
import { syncReservationToSupabase } from '@/lib/firebase-sync'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
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

// POST - Sincronização manual
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      const missingCredentials = []

      if (!supabaseUrl) {
        missingCredentials.push('NEXT_PUBLIC_SUPABASE_URL')
      }

      if (!supabaseServiceKey) {
        missingCredentials.push('SUPABASE_SERVICE_ROLE_KEY')
      }

      return NextResponse.json({
        success: false,
        error: 'Credenciais Supabase não configuradas',
        message: 'Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local com os valores disponíveis em Project Settings → API do painel do Supabase.',
        missingCredentials
      }, { status: 500 })
    }

    const body = await request.json()
    const { action, city, brand, limit = 10 } = body
    
    if (action === 'import_recent') {
      // Importar reservas recentes de uma cidade/marca específica
      if (!city || !brand) {
        return NextResponse.json({
          error: 'Cidade e marca são obrigatórias'
        }, { status: 400 })
      }

      console.log(`Importando reservas de ${city}/${brand}...`)
      
      try {
        // Buscar reservas no Firebase
        const reservations = await firebaseClient.getAllReservations(city, brand, limit)
        
        console.log(`Encontradas ${reservations.length} reservas no Firebase`)
        
        let syncedCount = 0
        let errorCount = 0
        const details = []

        // Sincronizar cada reserva
        for (const reservation of reservations) {
          try {
            await syncReservationToSupabase(reservation)
            syncedCount++
            details.push({
              id: reservation.idClient,
              status: 'success'
            })
          } catch (error) {
            errorCount++
            details.push({
              id: reservation.idClient,
              status: 'error',
              error: error instanceof Error ? error.message : String(error)
            })
            console.error(`Erro ao sincronizar ${reservation.idClient}:`, error)
          }
        }

        return NextResponse.json({
          success: true,
          message: `Sincronização concluída: ${syncedCount} sucessos, ${errorCount} erros`,
          data: {
            total: reservations.length,
            synced: syncedCount,
            errors: errorCount,
            details
          }
        })

      } catch (firebaseError) {
        console.error('Erro ao conectar ao Firebase:', firebaseError)
        return NextResponse.json({
          success: false,
          error: 'Erro ao conectar ao Firebase',
          message: firebaseError instanceof Error ? firebaseError.message : String(firebaseError)
        }, { status: 500 })
      }
    }

    if (action === 'import_all_cities') {
      // Importar de todas as cidades/marcas
      try {
        const citiesAndBrands = await firebaseClient.getAllCitiesAndBrands()
        
        let totalSynced = 0
        let totalErrors = 0
        const cityResults = []

        for (const city of Object.keys(citiesAndBrands)) {
          const brands = citiesAndBrands[city]
          
          for (const brand of brands) {
            try {
              const reservations = await firebaseClient.getAllReservations(
                city.toLowerCase(), 
                brand.toLowerCase(), 
                limit
              )
              
              let syncedCount = 0
              let errorCount = 0

              for (const reservation of reservations) {
                try {
                  await syncReservationToSupabase(reservation)
                  syncedCount++
                  totalSynced++
                } catch (error) {
                  errorCount++
                  totalErrors++
                  console.error(`Erro ao sincronizar ${reservation.idClient}:`, error)
                }
              }

              cityResults.push({
                city,
                brand,
                total: reservations.length,
                synced: syncedCount,
                errors: errorCount
              })

            } catch (error) {
              console.error(`Erro em ${city}/${brand}:`, error)
              cityResults.push({
                city,
                brand,
                total: 0,
                synced: 0,
                errors: 1,
                error: error instanceof Error ? error.message : String(error)
              })
              totalErrors++
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: `Sincronização geral concluída: ${totalSynced} sucessos, ${totalErrors} erros`,
          data: {
            totalSynced,
            totalErrors,
            cities: cityResults
          }
        })

      } catch (error) {
        console.error('Erro na sincronização geral:', error)
        return NextResponse.json({
          success: false,
          error: 'Erro na sincronização geral',
          message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
      }
    }

    if (action === 'test_connection') {
      // Testar conexão Firebase
      try {
        const isConnected = await firebaseClient.testConnection()
        
        if (isConnected) {
          // Tentar obter lista de cidades
          const citiesAndBrands = await firebaseClient.getAllCitiesAndBrands()
          
          return NextResponse.json({
            success: true,
            message: 'Conexão Firebase estabelecida com sucesso',
            data: {
              connected: true,
              cities: Object.keys(citiesAndBrands),
              brands: citiesAndBrands
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Não foi possível conectar ao Firebase'
          }, { status: 500 })
        }
      } catch (error) {
        console.error('Erro ao testar Firebase:', error)
        return NextResponse.json({
          success: false,
          error: 'Erro ao testar conexão Firebase',
          message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      error: 'Ação não suportada',
      availableActions: ['import_recent', 'import_all_cities', 'test_connection']
    }, { status: 400 })

  } catch (error) {
    console.error('Erro na API de sincronização manual:', error)
    
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// GET - Status da conexão
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais Supabase não configuradas',
        message: 'Configure SUPABASE_SERVICE_ROLE_KEY em .env.local com a Service Role key disponível em Project Settings → API no painel do Supabase.'
      }, { status: 500 })
    }

    // Testar conexões
    const firebaseConnected = await firebaseClient.testConnection()

    // Contar dados no Supabase
    const supabaseClient = getSupabaseClient()

    const { count } = await supabaseClient
      .from('reservations')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      data: {
        firebase: {
          connected: firebaseConnected,
          project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        },
        supabase: {
          connected: true,
          reservations: count || 0,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao verificar status'
    }, { status: 500 })
  }
}