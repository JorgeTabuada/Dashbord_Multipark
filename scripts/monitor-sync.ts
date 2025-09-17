// 🔍 Monitor de Sincronização
// ============================

export async function checkSyncProgress() {
  try {
    // Verificar quantas reservas já foram sincronizadas
    const response = await fetch('/api/sync', {
      method: 'GET'
    })
    
    if (!response.ok) throw new Error('Erro ao obter estatísticas')
    
    const stats = await response.json()
    
    console.log('📊 PROGRESSO DA SINCRONIZAÇÃO')
    console.log('================================')
    console.log(`Firebase Total: ${stats.firebase?.total || 0}`)
    console.log(`Supabase Sincronizadas: ${stats.supabase?.synced || 0}`)
    console.log(`Em execução: ${stats.isRunning ? 'SIM' : 'NÃO'}`)
    
    if (stats.firebase?.byCityBrand) {
      console.log('\n📍 Por Localização:')
      for (const [city, brands] of Object.entries(stats.firebase.byCityBrand)) {
        console.log(`\n${city}:`)
        for (const [brand, count] of Object.entries(brands as any)) {
          console.log(`  - ${brand}: ${count} reservas`)
        }
      }
    }
    
    if (stats.lastSyncTimes?.length > 0) {
      console.log('\n⏰ Últimas sincronizações:')
      stats.lastSyncTimes.forEach((sync: any) => {
        const time = new Date(sync.time).toLocaleTimeString('pt-PT')
        console.log(`  ${sync.location}: ${time}`)
      })
    }
    
    return stats
  } catch (error) {
    console.error('❌ Erro:', error)
    return null
  }
}

// Verificar dados no Supabase
export async function validateSupabaseData() {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Buscar algumas reservas para validar
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .eq('source', 'firebase_sync')
    .order('last_sync_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('❌ Erro ao buscar dados:', error)
    return
  }
  
  console.log('\n🔍 VALIDAÇÃO DE DADOS (últimas 10)')
  console.log('====================================')
  
  data?.forEach((reserva, index) => {
    console.log(`\n${index + 1}. Reserva ${reserva.booking_id}:`)
    console.log(`   Cliente: ${reserva.name_cliente} ${reserva.lastname_cliente}`)
    console.log(`   Matrícula: ${reserva.license_plate}`)
    console.log(`   Estado: ${reserva.estado_reserva_atual}`)
    console.log(`   Parque: ${reserva.park_name}`)
    console.log(`   Cidade: ${reserva.cidade_cliente}`)
    console.log(`   Valor: €${reserva.booking_price}`)
    console.log(`   Check-in: ${reserva.check_in_previsto}`)
  })
  
  // Estatísticas gerais
  const { count } = await supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'firebase_sync')
  
  console.log(`\n📈 TOTAL no Supabase: ${count} reservas`)
  
  // Verificar campos vazios importantes
  const { data: incomplete } = await supabase
    .from('reservas')
    .select('booking_id')
    .eq('source', 'firebase_sync')
    .is('license_plate', null)
    .limit(5)
  
  if (incomplete && incomplete.length > 0) {
    console.log(`\n⚠️ ${incomplete.length} reservas sem matrícula!`)
  }
  
  return { total: count, sample: data }
}

// Auto-executar se no browser
if (typeof window !== 'undefined') {
  (window as any).syncMonitor = {
    check: checkSyncProgress,
    validate: validateSupabaseData,
    auto: () => {
      // Verificar a cada 30 segundos
      checkSyncProgress()
      const interval = setInterval(checkSyncProgress, 30000)
      console.log('🔄 Monitor automático iniciado (30s)')
      return () => clearInterval(interval)
    }
  }
  
  console.log('📊 Monitor de Sincronização')
  console.log('Comandos disponíveis:')
  console.log('  syncMonitor.check() - Ver progresso')
  console.log('  syncMonitor.validate() - Validar dados')
  console.log('  syncMonitor.auto() - Monitor automático')
}

export default { checkSyncProgress, validateSupabaseData }
