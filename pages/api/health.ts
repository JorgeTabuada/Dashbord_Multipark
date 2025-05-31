// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseDashboard, supabaseFerramentas } from '../../lib/supabase/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const checks = {
      dashboard: false,
      ferramentas: false,
      timestamp: new Date().toISOString()
    };

    // Testar conexão Dashboard
    try {
      const { data: dashboardTest } = await supabaseDashboard
        .from('parques')
        .select('id_pk')
        .limit(1);
      checks.dashboard = true;
    } catch (error) {
      console.error('Erro na conexão Dashboard:', error);
    }

    // Testar conexão Ferramentas
    try {
      const { data: ferramentasTest } = await supabaseFerramentas
        .from('parques')
        .select('id')
        .limit(1);
      checks.ferramentas = true;
    } catch (error) {
      console.error('Erro na conexão Ferramentas:', error);
    }

    const allHealthy = checks.dashboard && checks.ferramentas;

    return res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Erro no health check:', error);
    return res.status(500).json({ 
      status: 'error',
      error: 'Erro interno do servidor'
    });
  }
}