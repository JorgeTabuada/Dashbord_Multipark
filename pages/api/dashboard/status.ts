// pages/api/dashboard/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseDashboard, supabaseFerramentas } from '../../../lib/supabase/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Verificar status das duas bases
    const [dashboardResult, ferramentasResult] = await Promise.allSettled([
      // Dashboard: Verificar conexão e contar parques
      supabaseDashboard.from('parques').select('count', { count: 'exact', head: true }),
      
      // Ferramentas: Verificar conexão e contar colaboradores
      supabaseFerramentas.from('rh_colaboradores').select('count', { count: 'exact', head: true })
    ]);

    const dashboardStatus = dashboardResult.status === 'fulfilled' && !dashboardResult.value.error;
    const ferramentasStatus = ferramentasResult.status === 'fulfilled' && !ferramentasResult.value.error;

    // Estatísticas rápidas se as bases estão online
    let quickStats = {};
    
    if (dashboardStatus) {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const [parques, reservasHoje, movimentacoes] = await Promise.all([
          supabaseDashboard.from('parques').select('count', { count: 'exact', head: true }),
          supabaseDashboard
            .from('reservas')
            .select('count', { count: 'exact', head: true })
            .gte('check_in_previsto', today)
            .lte('check_in_previsto', today + 'T23:59:59'),
          supabaseDashboard
            .from('movimentacoes_veiculos')
            .select('count', { count: 'exact', head: true })
            .gte('data_hora_movimento', today)
        ]);

        quickStats = {
          ...quickStats,
          parques: parques.count || 0,
          reservasHoje: reservasHoje.count || 0,
          movimentacoesHoje: movimentacoes.count || 0
        };
      } catch (error) {
        console.error('Erro ao buscar stats do Dashboard:', error);
      }
    }

    if (ferramentasStatus) {
      try {
        const [colaboradores, sessoesAuditoria, conteudosFormacao] = await Promise.all([
          supabaseFerramentas
            .from('rh_colaboradores')
            .select('count', { count: 'exact', head: true })
            .eq('ativo', true),
          supabaseFerramentas
            .from('auditoria_sessoes')
            .select('count', { count: 'exact', head: true })
            .eq('estado_sessao', 'em_progresso'),
          supabaseFerramentas
            .from('formacao_conteudos')
            .select('count', { count: 'exact', head: true })
            .eq('ativo', true)
        ]);

        quickStats = {
          ...quickStats,
          colaboradoresAtivos: colaboradores.count || 0,
          auditoriasPendentes: sessoesAuditoria.count || 0,
          conteudosFormacao: conteudosFormacao.count || 0
        };
      } catch (error) {
        console.error('Erro ao buscar stats das Ferramentas:', error);
      }
    }

    const response = {
      timestamp: new Date().toISOString(),
      databases: {
        dashboard: {
          name: 'Dashboard Multipark',
          projectId: 'ioftqsvjqwjeprsckeym',
          status: dashboardStatus ? 'online' : 'offline',
          url: 'https://ioftqsvjqwjeprsckeym.supabase.co'
        },
        ferramentas: {
          name: 'Ferramentas Multipark',
          projectId: 'dzdeewebxsfxeabdxtiq', 
          status: ferramentasStatus ? 'online' : 'offline',
          url: 'https://dzdeewebxsfxeabdxtiq.supabase.co'
        }
      },
      quickStats,
      systemStatus: dashboardStatus && ferramentasStatus ? 'healthy' : 'degraded'
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Erro no endpoint de status:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      systemStatus: 'error'
    });
  }
}