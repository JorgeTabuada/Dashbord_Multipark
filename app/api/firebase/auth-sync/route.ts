import { NextResponse } from 'next/server'
import { firebaseClient } from '@/lib/firebase-client'
import { unifiedSync } from '@/lib/unified-sync'

export async function POST(req: Request) {
  try {
    const { action, email, password, city, brand } = await req.json()
    
    if (action === 'auth_and_sync') {
      // 1. Autenticar no Firebase
      if (!email || !password) {
        return NextResponse.json({ 
          error: 'Email e password obrigatórios para autenticação' 
        }, { status: 400 })
      }
      
      console.log('🔐 Autenticando no Firebase...')
      
      try {
        const user = await firebaseClient.signIn(email, password)
        console.log('✅ Autenticado como:', user.email)
        
        // 2. Agora com autenticação, tentar sincronizar
        if (city && brand) {
          console.log(`🔄 Sincronizando ${city}/${brand} com autenticação...`)
          const result = await unifiedSync.syncCityBrand(city, brand)
          
          return NextResponse.json({
            status: 'success',
            message: 'Sincronização com autenticação bem-sucedida',
            authenticated_user: user.email,
            sync_result: result
          })
        }
        
        // 3. Ou sincronizar tudo
        console.log('🌍 Sincronizando todas as localizações com autenticação...')
        const fullResult = await unifiedSync.syncAll()
        
        return NextResponse.json({
          status: 'success',
          message: 'Sincronização completa com autenticação bem-sucedida',
          authenticated_user: user.email,
          sync_result: fullResult
        })
        
      } catch (authError) {
        console.error('❌ Erro de autenticação:', authError)
        return NextResponse.json({
          status: 'error',
          error: 'Erro de autenticação Firebase',
          details: String(authError)
        }, { status: 401 })
      }
    }
    
    if (action === 'test_authenticated_access') {
      // Testar acesso a uma localização específica após autenticação
      if (!email || !password) {
        return NextResponse.json({ 
          error: 'Email e password obrigatórios' 
        }, { status: 400 })
      }
      
      console.log('🔐 Testando acesso autenticado...')
      
      try {
        // Autenticar
        const user = await firebaseClient.signIn(email, password)
        console.log('✅ Autenticado como:', user.email)
        
        // Testar acesso às reservas
        const testResults: any = {}
        const locationsToTest = [
          { city: 'porto', brand: 'airpark' },
          { city: 'faro', brand: 'airpark' },
          { city: 'porto', brand: 'redpark' },
          { city: 'lisbon', brand: 'top-parking' }
        ]
        
        for (const location of locationsToTest) {
          try {
            const reservations = await firebaseClient.getAllReservations(
              location.city, 
              location.brand, 
              10 // Apenas 10 para teste
            )
            
            testResults[`${location.city}/${location.brand}`] = {
              accessible: true,
              count: reservations.length,
              sample_ids: reservations.slice(0, 3).map(r => r.idClient)
            }
            
          } catch (error) {
            testResults[`${location.city}/${location.brand}`] = {
              accessible: false,
              error: String(error)
            }
          }
        }
        
        return NextResponse.json({
          status: 'success',
          authenticated_user: user.email,
          access_test_results: testResults
        })
        
      } catch (authError) {
        return NextResponse.json({
          status: 'error',
          error: 'Erro de autenticação',
          details: String(authError)
        }, { status: 401 })
      }
    }
    
    if (action === 'logout') {
      try {
        await firebaseClient.signOut()
        return NextResponse.json({
          status: 'success',
          message: 'Logout realizado com sucesso'
        })
      } catch (error) {
        return NextResponse.json({
          status: 'error',
          error: String(error)
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro na API de autenticação:', error)
    return NextResponse.json({
      status: 'error',
      error: String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Autenticação Firebase',
    available_actions: [
      'auth_and_sync - Autenticar e sincronizar todas as reservas',
      'test_authenticated_access - Testar acesso autenticado',
      'logout - Fazer logout'
    ],
    required_fields: {
      email: 'Email de utilizador Firebase',
      password: 'Password do utilizador',
      city: 'Cidade (opcional, para sync específico)',
      brand: 'Marca (opcional, para sync específico)'
    }
  })
}