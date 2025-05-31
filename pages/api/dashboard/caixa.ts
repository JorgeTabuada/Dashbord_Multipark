// pages/api/dashboard/caixa.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../lib/services/database.service';
import { supabaseDashboard } from '../../../lib/supabase/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token de autorização obrigatório' });
    }

    const { data: { user } } = await supabaseDashboard.auth.getUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    switch (req.method) {
      case 'GET':
        const { parqueId, data, dataInicio, dataFim, tipo } = req.query;
        
        if (tipo === 'sessao' && parqueId && data) {
          // Buscar sessão específica de caixa
          const result = await DatabaseService.getCaixaDiario(
            parqueId as string, 
            data as string
          );
          
          if (result.error) {
            return res.status(400).json({ error: result.error.message });
          }
          
          return res.status(200).json({
            success: true,
            data: result.data
          });
        } else {
          // Buscar transações de caixa
          const result = await DatabaseService.getCaixaTransacoes(
            parqueId as string,
            dataInicio as string,
            dataFim as string
          );
          
          if (result.error) {
            return res.status(400).json({ error: result.error.message });
          }
          
          return res.status(200).json({
            success: true,
            data: result.data,
            count: result.data?.length || 0
          });
        }

      case 'POST':
        // Criar nova transação na caixa
        const createResult = await DatabaseService.createCaixaTransacao(req.body);
        
        if (createResult.error) {
          return res.status(400).json({ error: createResult.error.message });
        }
        
        return res.status(201).json({
          success: true,
          data: createResult.data
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API caixa:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}