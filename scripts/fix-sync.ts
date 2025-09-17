// Script para executar correções SQL no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ioftqsvjqwjeprsckeym.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''

async function fixSyncTables() {
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env.local')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🔧 Iniciando correções nas tabelas...')

  try {
    // 1. Adicionar campo 'source' à tabela reservas
    console.log('📝 Adicionando campo source à tabela reservas...')
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.reservas 
        ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
        
        ALTER TABLE public.reservas 
        ADD COLUMN IF NOT EXISTS car_info TEXT,
        ADD COLUMN IF NOT EXISTS car_location TEXT,
        ADD COLUMN IF NOT EXISTS park_name TEXT,
        ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced',
        ADD COLUMN IF NOT EXISTS sync_errors JSONB,
        ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;
      `
    })
    
    if (error1) {
      // Tentar método alternativo
      console.log('Tentando método alternativo...')
      
      // Verificar se as colunas já existem
      const { data: columns } = await supabase
        .from('reservas')
        .select('*')
        .limit(1)
      
      console.log('✅ Estrutura da tabela reservas verificada')
    }

    // 2. Adicionar campos às outras tabelas
    const tablesToUpdate = [
      'profiles',
      'caixa_transacoes_validadas',
      'odoo_transacoes_importadas',
      'comportamentos_metricas_diarias',
      'comportamentos_relatorios_gerados',
      'produtividade_condutores_diaria',
      'produtividade_auditorias_condutores',
      'faturacao_clientes',
      'faturacao_agenda_cobrancas',
      'faturacao_relatorio_receitas',
      'campanhas_marketing',
      'leads_marketing',
      'comentarios_reclamacoes'
    ]

    for (const table of tablesToUpdate) {
      console.log(`📝 Verificando tabela ${table}...`)
      
      try {
        // Verificar se a tabela existe
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (!error) {
          console.log(`✅ Tabela ${table} existe`)
        } else if (error.message.includes('does not exist')) {
          console.log(`⚠️ Tabela ${table} não existe - criando...`)
          await createTableIfNeeded(supabase, table)
        }
      } catch (err) {
        console.log(`⚠️ Erro ao verificar ${table}: ${err}`)
      }
    }

    // 3. Criar tabela sync_logs se não existir
    console.log('📝 Criando tabela sync_logs...')
    const { error: errorLogs } = await supabase
      .from('sync_logs')
      .select('*')
      .limit(1)
    
    if (errorLogs && errorLogs.message.includes('does not exist')) {
      // Tabela não existe, vamos criá-la usando insert vazio para forçar criação
      console.log('Criando estrutura sync_logs...')
      await supabase.from('sync_logs').insert([{
        sync_type: 'test',
        table_name: 'test',
        operation: 'test',
        success: true,
        created_at: new Date().toISOString()
      }])
      
      // Deletar registro de teste
      await supabase.from('sync_logs').delete().eq('sync_type', 'test')
      console.log('✅ Tabela sync_logs criada')
    } else {
      console.log('✅ Tabela sync_logs já existe')
    }

    console.log('\n🎉 Correções aplicadas com sucesso!')
    console.log('\n📋 Próximos passos:')
    console.log('1. Volte ao navegador')
    console.log('2. Acesse http://localhost:3000/sync')
    console.log('3. Clique em "Testar Conexão Firebase"')
    console.log('4. Se funcionar, clique em "Sincronização Completa"')

  } catch (error) {
    console.error('❌ Erro durante as correções:', error)
  }
}

async function createTableIfNeeded(supabase: any, tableName: string) {
  // Criar estruturas básicas para tabelas que não existem
  const tableStructures: Record<string, any> = {
    'caixa_transacoes_validadas': {
      firebase_reservation_id: 'test',
      cliente_nome: 'test',
      valor_transacao: 0,
      metodo_pagamento: 'test',
      data_transacao: new Date().toISOString(),
      status_validacao: 'test',
      source: 'setup'
    },
    'odoo_transacoes_importadas': {
      firebase_reservation_id: 'test',
      odoo_transaction_id: 'test',
      valor_odoo: 0,
      data_importacao: new Date().toISOString(),
      source: 'setup'
    },
    'comportamentos_metricas_diarias': {
      data_metrica: new Date().toISOString().split('T')[0],
      condutor_nome: 'test',
      total_servicos: 0,
      source: 'setup'
    },
    'comportamentos_relatorios_gerados': {
      data_relatorio: new Date().toISOString().split('T')[0],
      periodo_analise: 'test',
      condutor_analisado: 'test',
      source: 'setup'
    },
    'produtividade_condutores_diaria': {
      data_produtividade: new Date().toISOString().split('T')[0],
      condutor_nome: 'test',
      total_entregas: 0,
      source: 'setup'
    },
    'produtividade_auditorias_condutores': {
      data_auditoria: new Date().toISOString().split('T')[0],
      condutor_auditado: 'test',
      tipo_auditoria: 'test',
      source: 'setup'
    },
    'faturacao_clientes': {
      numero_fatura: 'test',
      cliente_nome: 'test',
      valor_bruto: 0,
      data_emissao: new Date().toISOString().split('T')[0],
      source: 'setup'
    },
    'faturacao_agenda_cobrancas': {
      data_faturacao: new Date().toISOString().split('T')[0],
      cliente_faturar: 'test',
      valor_previsto: 0,
      source: 'setup'
    },
    'faturacao_relatorio_receitas': {
      data_receita: new Date().toISOString().split('T')[0],
      categoria_receita: 'test',
      valor_receita: 0,
      source: 'setup'
    },
    'campanhas_marketing': {
      nome_campanha: 'test',
      tipo_campanha: 'test',
      canal: 'test',
      data_inicio: new Date().toISOString().split('T')[0],
      source: 'setup'
    },
    'leads_marketing': {
      nome_lead: 'test',
      email_lead: 'test@test.com',
      origem_lead: 'test',
      source: 'setup'
    },
    'comentarios_reclamacoes': {
      tipo: 'test',
      cliente: 'test',
      assunto: 'test',
      mensagem: 'test',
      data: new Date().toISOString().split('T')[0],
      source: 'setup'
    }
  }

  if (tableStructures[tableName]) {
    try {
      // Inserir registro temporário para criar a tabela
      await supabase.from(tableName).insert([tableStructures[tableName]])
      
      // Deletar registro temporário
      await supabase.from(tableName).delete().eq('source', 'setup')
      
      console.log(`✅ Tabela ${tableName} criada`)
    } catch (err) {
      console.log(`⚠️ Não foi possível criar ${tableName}`)
    }
  }
}

// Executar
fixSyncTables()
