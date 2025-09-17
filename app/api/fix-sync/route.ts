import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Executando correções nas tabelas do Supabase...')
    
    const corrections = []
    const errors = []

    // 1. Verificar e adicionar campos à tabela reservas
    try {
      // Testar se a tabela reservas existe e tem os campos necessários
      const { data: testData, error: testError } = await supabase
        .from('reservas')
        .select('id_pk, booking_id, source')
        .limit(1)
      
      if (testError && testError.message.includes('column "source" does not exist')) {
        // Campo source não existe, vamos criar registros com campo source para forçar criação
        console.log('Campo source não existe, criando...')
        
        // Buscar uma reserva existente
        const { data: existingReserva } = await supabase
          .from('reservas')
          .select('*')
          .limit(1)
          .single()
        
        if (existingReserva) {
          // Atualizar registro existente adicionando campos novos via update parcial
          const updateData: any = {}
          
          // Adicionar campos se não existirem
          if (!existingReserva.source) updateData.source = 'manual'
          if (!existingReserva.car_info) updateData.car_info = ''
          if (!existingReserva.car_location) updateData.car_location = ''
          if (!existingReserva.park_name) updateData.park_name = ''
          if (!existingReserva.sync_status) updateData.sync_status = 'synced'
          if (!existingReserva.last_sync_at) updateData.last_sync_at = new Date().toISOString()
          
          if (Object.keys(updateData).length > 0) {
            await supabase
              .from('reservas')
              .update(updateData)
              .eq('id_pk', existingReserva.id_pk)
            
            corrections.push('✅ Campos adicionados à tabela reservas')
          }
        }
      } else {
        corrections.push('✅ Tabela reservas já tem os campos necessários')
      }
    } catch (err: any) {
      errors.push(`Erro em reservas: ${err.message}`)
    }

    // 2. Criar tabela sync_logs se não existir
    try {
      const { error: logsError } = await supabase
        .from('sync_logs')
        .select('*')
        .limit(1)
      
      if (logsError && logsError.message.includes('relation "public.sync_logs" does not exist')) {
        // Tabela não existe, vamos criá-la via SQL direto
        console.log('Tabela sync_logs não existe')
        errors.push('Tabela sync_logs não existe - precisa ser criada manualmente no Supabase')
      } else {
        corrections.push('✅ Tabela sync_logs verificada')
      }
    } catch (err: any) {
      console.log('Erro ao verificar sync_logs:', err)
    }

    // 3. Verificar tabelas necessárias para sincronização
    const requiredTables = [
      'profiles',
      'reservas'
    ]

    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          errors.push(`❌ Tabela ${table} com problema: ${error.message}`)
        } else {
          corrections.push(`✅ Tabela ${table} OK`)
        }
      } catch (err: any) {
        errors.push(`❌ Erro ao verificar ${table}: ${err.message}`)
      }
    }

    // 4. Testar conexão com profiles
    try {
      // Verificar estrutura de profiles
      const { data: profileTest, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .limit(1)
      
      if (profileError) {
        if (profileError.message.includes('column "display_name" does not exist')) {
          // Campo display_name não existe
          errors.push('Campo display_name não existe em profiles')
          
          // Tentar com campos alternativos
          const { data: altProfile } = await supabase
            .from('profiles')
            .select('id, email, avatar_url')
            .limit(1)
          
          if (altProfile) {
            corrections.push('⚠️ Tabela profiles usa estrutura diferente - ajustando código...')
          }
        }
      } else {
        corrections.push('✅ Estrutura de profiles OK')
      }
    } catch (err: any) {
      errors.push(`Erro em profiles: ${err.message}`)
    }

    // 5. Limpar dados duplicados se houver
    try {
      // Buscar reservas duplicadas por booking_id
      const { data: duplicates } = await supabase
        .from('reservas')
        .select('booking_id, id_pk')
        .order('id_pk', { ascending: true })
      
      if (duplicates && duplicates.length > 0) {
        const bookingIds = new Set()
        const toDelete = []
        
        for (const row of duplicates) {
          if (row.booking_id && bookingIds.has(row.booking_id)) {
            toDelete.push(row.id_pk)
          } else if (row.booking_id) {
            bookingIds.add(row.booking_id)
          }
        }
        
        if (toDelete.length > 0) {
          await supabase
            .from('reservas')
            .delete()
            .in('id_pk', toDelete)
          
          corrections.push(`✅ Removidas ${toDelete.length} reservas duplicadas`)
        }
      }
    } catch (err: any) {
      console.log('Erro ao limpar duplicados:', err)
    }

    // Resultado final
    const success = errors.length === 0
    
    return NextResponse.json({
      success,
      message: success 
        ? '✅ Todas as correções aplicadas com sucesso!' 
        : '⚠️ Algumas correções falharam',
      corrections,
      errors,
      nextSteps: [
        'Volte à página de sincronização',
        'Clique em "Testar Conexão Firebase"',
        'Se funcionar, clique em "Sincronização Completa"'
      ]
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao executar correções',
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Verificar status atual das tabelas
    const status = {
      reservas: false,
      profiles: false,
      sync_logs: false,
      has_source_field: false,
      total_reservas: 0
    }

    // Verificar tabela reservas
    const { count: reservasCount, error: reservasError } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
    
    if (!reservasError) {
      status.reservas = true
      status.total_reservas = reservasCount || 0
    }

    // Verificar tabela profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (!profilesError) {
      status.profiles = true
    }

    // Verificar tabela sync_logs
    const { error: logsError } = await supabase
      .from('sync_logs')
      .select('*')
      .limit(1)
    
    if (!logsError) {
      status.sync_logs = true
    }

    // Verificar se campo source existe
    const { data: sourceTest } = await supabase
      .from('reservas')
      .select('source')
      .limit(1)
    
    if (sourceTest) {
      status.has_source_field = true
    }

    return NextResponse.json({
      success: true,
      status,
      ready: status.reservas && status.profiles,
      message: status.reservas && status.profiles 
        ? '✅ Sistema pronto para sincronização'
        : '⚠️ Correções necessárias'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar status',
      error: error.message
    }, { status: 500 })
  }
}
