import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  try {
    const { action } = await req.json()
    
    if (action === 'cleanup_wrong_table') {
      console.log('🧹 Limpando tabela "reservations" (errada)...')
      
      // Primeiro, contar quantos registros existem
      const { count, error: countError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('❌ Erro ao contar reservations:', countError)
        return NextResponse.json({
          status: 'error',
          error: countError.message
        }, { status: 500 })
      }
      
      console.log(`📊 Encontrados ${count} registros na tabela "reservations"`)
      
      // Apagar todos os registros
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .neq('id', 0) // Apagar todos (condição sempre verdadeira)
      
      if (deleteError) {
        console.error('❌ Erro ao apagar reservations:', deleteError)
        return NextResponse.json({
          status: 'error',
          error: deleteError.message
        }, { status: 500 })
      }
      
      console.log('✅ Tabela "reservations" limpa com sucesso!')
      
      return NextResponse.json({
        status: 'success',
        message: `Tabela "reservations" limpa: ${count} registros apagados`,
        deleted_count: count
      })
    }
    
    if (action === 'check_tables') {
      // Verificar quantos registros existem em cada tabela
      const [reservasResult, reservationsResult] = await Promise.all([
        supabase.from('reservas').select('*', { count: 'exact', head: true }),
        supabase.from('reservations').select('*', { count: 'exact', head: true })
      ])
      
      return NextResponse.json({
        status: 'success',
        tables: {
          'reservas': reservasResult.count || 0,
          'reservations': reservationsResult.count || 0
        },
        message: 'Contagem de tabelas realizada'
      })
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: 'Erro na operação de limpeza'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Limpeza de Tabelas',
    actions: {
      'check_tables': 'Verificar contagem das tabelas reservas vs reservations',
      'cleanup_wrong_table': 'Limpar tabela "reservations" (errada)'
    }
  })
}