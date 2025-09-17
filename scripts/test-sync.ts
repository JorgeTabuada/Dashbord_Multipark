// 🧪 Script de teste para sincronização Firebase → Supabase
// ==========================================================

import { firebaseRTDB } from '../lib/firebase-rtdb'
import { syncService } from '../lib/sync-service-v2'

async function testConnection() {
  console.log('🔍 Testando conexão ao Firebase...')
  
  try {
    // Testar Firebase
    const cities = await firebaseRTDB.getCities()
    console.log('✅ Firebase conectado!')
    console.log(`   Cidades encontradas: ${cities.join(', ')}`)
    
    if (cities.length > 0) {
      const brands = await firebaseRTDB.getBrands(cities[0])
      console.log(`   Marcas em ${cities[0]}: ${brands.join(', ')}`)
      
      if (brands.length > 0) {
        const reservations = await firebaseRTDB.getReservations(cities[0], brands[0])
        console.log(`   Reservas em ${cities[0]}/${brands[0]}: ${reservations.length}`)
        
        if (reservations.length > 0) {
          console.log('\n📋 Exemplo de reserva:')
          const sample = reservations[0]
          console.log(`   ID: ${sample.id}`)
          console.log(`   Cliente: ${sample.name} ${sample.lastname}`)
          console.log(`   Matrícula: ${sample.licensePlate}`)
          console.log(`   Estado: ${sample.stats}`)
        }
      }
    }
    
    // Testar sincronização
    console.log('\n🔄 Testando sincronização...')
    const stats = await syncService.getStats()
    console.log('✅ Serviço de sincronização OK!')
    console.log(`   Firebase total: ${stats.firebase.total}`)
    console.log(`   Supabase sincronizados: ${stats.supabase.synced}`)
    
    return true
  } catch (error) {
    console.error('❌ Erro:', error)
    return false
  }
}

async function runSync() {
  console.log('\n🚀 Iniciando sincronização completa...')
  
  const result = await syncService.syncAll()
  
  if (result) {
    console.log('\n📊 Resultados:')
    console.log(`   Duração: ${result.duration/1000}s`)
    
    for (const [city, brands] of Object.entries(result.results)) {
      for (const [brand, stats] of Object.entries(brands as any)) {
        const { success, errors } = stats as any
        console.log(`   ${city}/${brand}: ${success} OK, ${errors} erros`)
      }
    }
  }
}

// Executar testes se chamado diretamente
if (typeof window !== 'undefined') {
  // Browser
  (window as any).testSync = {
    test: testConnection,
    sync: runSync,
    stats: () => syncService.getStats()
  }
  console.log('🎯 Comandos disponíveis na consola:')
  console.log('   testSync.test() - Testar conexão')
  console.log('   testSync.sync() - Sincronizar tudo')
  console.log('   testSync.stats() - Ver estatísticas')
} else {
  // Node.js
  testConnection().then(success => {
    if (success) {
      console.log('\n✅ Testes passaram! Pode iniciar sincronização.')
    } else {
      console.log('\n❌ Testes falharam. Verifique as configurações.')
    }
  })
}

export { testConnection, runSync }
