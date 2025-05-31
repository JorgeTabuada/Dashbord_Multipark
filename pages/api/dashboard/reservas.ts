// pages/api/dashboard/reservas.ts
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
        const { parqueId, dataInicio, dataFim, estado } = req.query;
        const result = await DatabaseService.getReservas({
          parqueId: parqueId as string,
          dataInicio: dataInicio as string,
          dataFim: dataFim as string,
          estado: estado as string
        });
        
        if (result.error) {
          return res.status(400).json({ error: result.error.message });
        }
        
        return res.status(200).json({
          success: true,
          data: result.data,
          count: result.data?.length || 0
        });

      case 'POST':
        // Criar nova reserva
        const createResult = await DatabaseService.createReserva(req.body);
        
        if (createResult.error) {
          return res.status(400).json({ error: createResult.error.message });
        }
        
        return res.status(201).json({
          success: true,
          data: createResult.data
        });

      case 'PUT':
        // Atualizar reserva
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'ID da reserva é obrigatório' });
        }
        
        const updateResult = await DatabaseService.updateReserva(id as string, req.body);
        
        if (updateResult.error) {
          return res.status(400).json({ error: updateResult.error.message });
        }
        
        return res.status(200).json({
          success: true,
          data: updateResult.data
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API reservas:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}