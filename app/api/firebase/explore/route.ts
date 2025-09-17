import { NextResponse } from 'next/server'
import { firebaseClient } from '@/lib/firebase-client'

export async function GET() {
  try {
    console.log('🔍 Explorando estrutura Firebase completa...')
    
    // 1. Obter configuração de cidades do Firebase
    const citiesAndBrands = await firebaseClient.getAllCitiesAndBrands()
    console.log('📋 Cidades e Marcas configuradas:', citiesAndBrands)
    
    // 2. Para cada cidade/marca, contar reservas
    const detailedStats: any = {}
    let totalReservations = 0
    
    for (const [city, brands] of Object.entries(citiesAndBrands)) {
      detailedStats[city] = {}
      
      for (const brand of brands) {
        try {
          console.log(`🔎 Verificando ${city}/${brand}...`)
          
          // Fazer múltiplas consultas com diferentes limites para descobrir o real
          const reservations1k = await firebaseClient.getAllReservations(city, brand, 1000)
          const reservations5k = await firebaseClient.getAllReservations(city, brand, 5000)
          const reservations10k = await firebaseClient.getAllReservations(city, brand, 10000)
          
          const counts = {
            '1k_limit': reservations1k.length,
            '5k_limit': reservations5k.length,
            '10k_limit': reservations10k.length,
            'likely_more': reservations10k.length === 10000 // Se chegou ao limite, há provavelmente mais
          }
          
          detailedStats[city][brand] = counts
          totalReservations += reservations10k.length
          
          console.log(`📊 ${city}/${brand}: ${reservations10k.length} reservas`)
          
          // Pausa pequena para não sobrecarregar Firebase
          await new Promise(resolve => setTimeout(resolve, 200))
          
        } catch (error) {
          console.error(`❌ Erro em ${city}/${brand}:`, error)
          detailedStats[city][brand] = { error: String(error) }
        }
      }
    }
    
    // 3. Tentar descobrir se há outras coleções não configuradas
    // Isso é mais complexo, mas podemos tentar alguns nomes comuns
    const commonCityNames = ['lisboa', 'porto', 'madrid', 'barcelona', 'paris', 'london']
    const commonBrandNames = ['airpark', 'redpark', 'skypark', 'top-parking', 'multipark']
    
    console.log('🕵️ Procurando por coleções não configuradas...')
    const unconfiguredCollections: any = {}
    
    for (const testCity of commonCityNames) {
      if (!citiesAndBrands[testCity]) {
        unconfiguredCollections[testCity] = {}
        
        for (const testBrand of commonBrandNames) {
          try {
            const testReservations = await firebaseClient.getAllReservations(testCity, testBrand, 100)
            if (testReservations.length > 0) {
              unconfiguredCollections[testCity][testBrand] = {
                found: testReservations.length,
                sample: testReservations[0]
              }
              console.log(`🎯 ENCONTRADA coleção não configurada: ${testCity}/${testBrand} (${testReservations.length} reservas)`)
            }
          } catch (error) {
            // Silencioso para não poluir logs
          }
        }
        
        // Limpar entradas vazias
        if (Object.keys(unconfiguredCollections[testCity]).length === 0) {
          delete unconfiguredCollections[testCity]
        }
      }
    }
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      firebase_exploration: {
        configured_cities_brands: citiesAndBrands,
        detailed_statistics: detailedStats,
        total_reservations_found: totalReservations,
        unconfigured_collections: unconfiguredCollections,
        recommendations: {
          need_pagination: Object.values(detailedStats).some((city: any) => 
            Object.values(city).some((brand: any) => brand.likely_more)
          ),
          missing_config: Object.keys(unconfiguredCollections).length > 0
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Erro na exploração Firebase:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: 'Erro ao explorar Firebase'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action, city, brand } = await req.json()
    
    if (action === 'deep_count') {
      // Contagem mais profunda para uma cidade/marca específica
      if (!city || !brand) {
        return NextResponse.json({ error: 'Cidade e marca obrigatórias' }, { status: 400 })
      }
      
      console.log(`🔬 Contagem profunda para ${city}/${brand}...`)
      
      // Tentar diferentes estratégias de paginação
      const strategies = [
        { name: 'orderBy_createdAt', limit: 10000 },
        { name: 'orderBy_checkinDate', limit: 10000 },
        { name: 'no_order', limit: 10000 }
      ]
      
      const results: any = {}
      
      for (const strategy of strategies) {
        try {
          const reservations = await firebaseClient.getAllReservations(city, brand, strategy.limit)
          results[strategy.name] = {
            count: reservations.length,
            hit_limit: reservations.length === strategy.limit,
            sample_ids: reservations.slice(0, 5).map(r => r.idClient)
          }
        } catch (error) {
          results[strategy.name] = { error: String(error) }
        }
      }
      
      return NextResponse.json({
        status: 'success',
        deep_count_results: results,
        city,
        brand
      })
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro na ação POST:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}