// lib/supabase/clients.ts
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig, validateSupabaseConfig } from './config';

// Validar configuração ao importar
validateSupabaseConfig();

// Cliente para Base Dashboard (Operacional)
export const supabaseDashboard = createClient(
  supabaseConfig.dashboard.url,
  supabaseConfig.dashboard.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    }
  }
);

// Cliente para Base Ferramentas (RH e Analytics)
export const supabaseFerramentas = createClient(
  supabaseConfig.ferramentas.url,
  supabaseConfig.ferramentas.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    }
  }
);

// Cliente Admin Dashboard (para operações privilegiadas)
export const supabaseDashboardAdmin = createClient(
  supabaseConfig.dashboard.url,
  supabaseConfig.dashboard.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente Admin Ferramentas (para operações privilegiadas)
export const supabaseFerramentasAdmin = createClient(
  supabaseConfig.ferramentas.url,
  supabaseConfig.ferramentas.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função helper para escolher o cliente correto baseado na operação
export function getSupabaseClient(database: 'dashboard' | 'ferramentas', admin = false) {
  if (database === 'dashboard') {
    return admin ? supabaseDashboardAdmin : supabaseDashboard;
  } else {
    return admin ? supabaseFerramentasAdmin : supabaseFerramentas;
  }
}

// Hook para autenticação sincronizada entre bases
export async function syncAuthBetweenDatabases(user: any) {
  try {
    // Sincronizar sessão entre as duas bases
    if (user) {
      await Promise.all([
        supabaseDashboard.auth.setSession(user.session),
        supabaseFerramentas.auth.setSession(user.session)
      ]);
    }
  } catch (error) {
    console.error('Erro ao sincronizar autenticação:', error);
  }
}