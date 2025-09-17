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

// Obter as keys do ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Inicializar o cliente Supabase
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export da config
export default SUPABASE_CONFIG;
