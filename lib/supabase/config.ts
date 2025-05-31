// lib/supabase/config.ts
export const supabaseConfig = {
  // Base de Dados Principal - Dashboard (Operacional)
  dashboard: {
    url: process.env.NEXT_PUBLIC_SUPABASE_DASHBOARD_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_DASHBOARD_SERVICE_ROLE_KEY!,
    projectId: 'ioftqsvjqwjeprsckeym',
    description: 'Base operacional - Reservas, Caixa, Movimentações'
  },
  
  // Base de Dados Secundária - Ferramentas (RH e Analytics)
  ferramentas: {
    url: process.env.NEXT_PUBLIC_SUPABASE_FERRAMENTAS_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_FERRAMENTAS_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_FERRAMENTAS_SERVICE_ROLE_KEY!,
    projectId: 'dzdeewebxsfxeabdxtiq',
    description: 'Base de apoio - RH, Formação, Auditoria, Analytics'
  }
};

// Validação das variáveis de ambiente
export function validateSupabaseConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_DASHBOARD_URL',
    'NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_FERRAMENTAS_URL',
    'NEXT_PUBLIC_SUPABASE_FERRAMENTAS_ANON_KEY',
    'SUPABASE_DASHBOARD_SERVICE_ROLE_KEY',
    'SUPABASE_FERRAMENTAS_SERVICE_ROLE_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente em falta: ${missing.join(', ')}`);
  }
}