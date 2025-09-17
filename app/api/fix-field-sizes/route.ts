import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔧 Corrigindo tamanhos de campos na tabela reservas...')
    
    const corrections = []
    const errors = []

    // Lista de campos que precisam ser TEXT em vez de VARCHAR limitado
    const fieldsToFix = [
      'booking_id',
      'license_plate', 
      'estado_reserva_atual',
      'parque_id',
      'cidade_cliente',
      'payment_method',
      'payment_intent_id',
      'nif_cliente',
      'parking_type',
      'car_info',
      'car_location',
      'park_name',
      'name_cliente',
      'lastname_cliente',
      'email_cliente',
      'phone_number_cliente',
      'nome_fiscal_cliente'
    ]

    // Verificar estrutura atual da tabela
    const { data: currentStructure, error: structureError } = await supabase
      .from('reservas')
      .select('*')
      .limit(1)

    if (structureError) {
      errors.push(`Erro ao verificar estrutura: ${structureError.message}`)
      
      return NextResponse.json({
        success: false,
        message: 'Não foi possível verificar a estrutura da tabela',
        errors,
        sqlToRun: generateSQL(fieldsToFix)
      })
    }

    // Tentar uma inserção de teste com valores grandes
    try {
      const testData = {
        booking_id: 'TEST_' + 'X'.repeat(30), // String longa para testar
        license_plate: 'TEST-PLATE',
        estado_reserva_atual: 'teste_muito_longo_para_verificar_tamanho',
        created_at_db: new Date().toISOString(),
        updated_at_db: new Date().toISOString()
      }

      // Tentar inserir
      const { error: insertError } = await supabase
        .from('reservas')
        .insert([testData])

      if (insertError) {
        if (insertError.message.includes('value too long')) {
          errors.push('Campos com tamanho limitado detectados')
          
          // Deletar registro de teste se foi criado
          await supabase
            .from('reservas')
            .delete()
            .like('booking_id', 'TEST_%')

          return NextResponse.json({
            success: false,
            message: '⚠️ Campos precisam ser alterados para TEXT',
            errors,
            sqlToRun: generateSQL(fieldsToFix),
            instruction: 'Execute o SQL abaixo no Supabase SQL Editor'
          })
        }
      } else {
        // Limpar teste
        await supabase
          .from('reservas')
          .delete()
          .like('booking_id', 'TEST_%')
        
        corrections.push('✅ Campos já suportam valores longos')
      }
    } catch (err: any) {
      console.log('Erro no teste:', err)
    }

    // Verificar se há registros com IDs muito longos
    const { data: longIds, error: queryError } = await supabase
      .from('reservas')
      .select('id_pk, booking_id')
      .or('booking_id.ilike.175%,booking_id.ilike.176%,booking_id.ilike.177%')
      .limit(5)

    if (longIds && longIds.length > 0) {
      corrections.push(`📊 Encontrados ${longIds.length} registros com IDs longos`)
      
      // Verificar tamanho máximo
      const maxLength = Math.max(...longIds.map(r => r.booking_id?.length || 0))
      corrections.push(`📏 Tamanho máximo de booking_id: ${maxLength} caracteres`)
      
      if (maxLength > 20) {
        errors.push(`booking_id precisa suportar pelo menos ${maxLength} caracteres`)
      }
    }

    const success = errors.length === 0

    return NextResponse.json({
      success,
      message: success 
        ? '✅ Verificação concluída!' 
        : '⚠️ Ajustes necessários na estrutura da tabela',
      corrections,
      errors,
      sqlToRun: errors.length > 0 ? generateSQL(fieldsToFix) : null,
      nextSteps: success ? [
        'Tabela pronta para sincronização',
        'Volte à página de sync',
        'Execute a sincronização'
      ] : [
        'Execute o SQL fornecido no Supabase',
        'Depois clique novamente em Corrigir Tabelas',
        'Por fim, execute a sincronização'
      ]
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar campos',
      error: error.message,
      sqlToRun: generateSQL([])
    }, { status: 500 })
  }
}

function generateSQL(fields: string[]): string {
  const alterStatements = fields.map(field => 
    `ALTER COLUMN ${field} TYPE TEXT`
  ).join(',\n')

  return `-- Execute este SQL no Supabase SQL Editor
-- Acesse: https://supabase.com/dashboard/project/ioftqsvjqwjeprsckeym/sql

ALTER TABLE public.reservas 
${alterStatements};

-- Verificar resultado
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'reservas'
  AND column_name IN (${fields.map(f => `'${f}'`).join(', ')})
ORDER BY ordinal_position;`
}

export async function GET() {
  try {
    // Verificar problemas conhecidos
    const issues = []
    
    // 1. Verificar campo booking_id
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('booking_id')
        .limit(1)
      
      if (!error) {
        // Tentar inserir um ID longo
        const longId = '1757087919722955_test_' + Date.now()
        const { error: insertError } = await supabase
          .from('reservas')
          .insert([{
            booking_id: longId,
            license_plate: 'TEST-00-00',
            estado_reserva_atual: 'teste',
            created_at_db: new Date().toISOString(),
            updated_at_db: new Date().toISOString()
          }])
        
        if (insertError && insertError.message.includes('value too long')) {
          issues.push({
            field: 'booking_id',
            issue: 'Campo limitado a poucos caracteres',
            solution: 'Precisa ser alterado para TEXT'
          })
        } else {
          // Limpar teste
          await supabase
            .from('reservas')
            .delete()
            .eq('booking_id', longId)
        }
      }
    } catch (err) {
      console.log('Erro ao testar booking_id:', err)
    }

    return NextResponse.json({
      success: issues.length === 0,
      issues,
      message: issues.length === 0 
        ? '✅ Estrutura da tabela OK'
        : `⚠️ ${issues.length} problemas encontrados`,
      sqlSuggestion: issues.length > 0 ? generateSQL(['booking_id', 'license_plate', 'estado_reserva_atual']) : null
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar estrutura',
      error: error.message
    }, { status: 500 })
  }
}
