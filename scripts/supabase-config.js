// Configuração do Supabase - Dashboard Multipark
// @author: Jorge Tabuada
// @date: 2025

const SUPABASE_CONFIG = {
  projectId: 'ioftqsvjqwjeprsckeym',
  url: 'https://ioftqsvjqwjeprsckeym.supabase.co',
  region: 'eu-west-2',
  database: {
    host: 'db.ioftqsvjqwjeprsckeym.supabase.co',
    version: '15.8.1.085',
    postgresEngine: '15'
  },
  organizationId: 'xsetyyuylqmwrpcanokb',
  projectName: 'Dashboard Multipark'
};

const SUPABASE_KEY = 'SUPABASE_CLIENT_ANON_KEY';

// Obter as keys do ambiente
const SUPABASE_URL = (process.env.SUPABASE_URL || SUPABASE_CONFIG.url).trim();
const supabaseAnonKey = process.env[SUPABASE_KEY]?.trim();

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_CLIENT_ANON_KEY não configurada no ambiente');
}

// Inicializar o cliente Supabase
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, supabaseAnonKey);

// Export da config
export default SUPABASE_CONFIG;
