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

export async function GET() {
  try {
    console.log('🔍 Verificando Supabase diretamente...')
    
    // 1. Listar todas as tabelas
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables', {})
      .single()
    
    console.log('📋 Tabelas disponíveis:', tables)
    
    // 2. Verificar se tabela reservations existe
    const { data: reservationsExists, error: existsError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'reservations')
    
    console.log('🔍 Tabela reservations existe?', reservationsExists)
    
    // 3. Contar registos na tabela reservations (se existir)
    let reservationsCount = 0
    let reservationsSample = []
    
    try {
      const { count, error: countError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
      
      reservationsCount = count || 0
      
      if (!countError && reservationsCount > 0) {
        const { data: sample } = await supabase
          .from('reservations')
          .select('firebase_id, city, park_brand, license_plate, status, created_at')
          .limit(5)
        
        reservationsSample = sample || []
      }
    } catch (error) {
      console.log('⚠️ Tabela reservations não acessível:', error)
    }
    
    // 4. Verificar outras tabelas possíveis
    const possibleTables = ['reservas', 'clients', 'bookings']
    const alternativeTables: any = {}
    
    for (const tableName of possibleTables) {
      try {
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (count && count > 0) {
          const { data: sample } = await supabase
            .from(tableName)
            .select('*')
            .limit(3)
          
          alternativeTables[tableName] = {
            count,
            sample: sample || []
          }
        }
      } catch (error) {
        // Tabela não existe, ignorar
      }
    }
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      supabase_check: {
        connection: 'ok',
        reservations_table: {
          exists: !existsError,
          count: reservationsCount,
          sample: reservationsSample
        },
        alternative_tables: alternativeTables,
        raw_error: existsError || null
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar Supabase:', error)
    
    return NextResponse.json({
      status: 'error',
      error: String(error),
      message: 'Erro ao verificar Supabase'
    }, { status: 500 })
  }
}

// Função auxiliar para obter tabelas (se não existir como RPC)
export async function POST(req: Request) {
  try {
    const { action } = await req.json()
    
    if (action === 'list_tables') {
      // Tentar obter lista de tabelas via information_schema
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
      
      return NextResponse.json({
        status: 'success',
        tables: data,
        error: error
      })
    }
    
    if (action === 'create_reservations_table') {
      // Criar tabela reservations se não existir
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS reservations (
          id BIGSERIAL PRIMARY KEY,
          firebase_id VARCHAR(100) UNIQUE NOT NULL,
          city VARCHAR(50) NOT NULL,
          park_brand VARCHAR(50) NOT NULL,
          license_plate VARCHAR(100) NOT NULL,
          client_first_name VARCHAR(100),
          client_last_name VARCHAR(100),
          client_email VARCHAR(200),
          client_phone VARCHAR(50),
          booking_price DECIMAL(10,2),
          status VARCHAR(50) NOT NULL DEFAULT 'reservado',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          sync_status VARCHAR(20) DEFAULT 'synced',
          firebase_last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_reservations_firebase_id ON reservations(firebase_id);
        CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
      `
      
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql: createTableSQL 
      })
      
      return NextResponse.json({
        status: error ? 'error' : 'success',
        message: error ? String(error) : 'Tabela criada com sucesso',
        data
      })
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}