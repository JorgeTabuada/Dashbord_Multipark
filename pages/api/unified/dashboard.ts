// pages/api/unified/dashboard.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../lib/services/database.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { parqueId } = req.query;
    
    console.log(`Carregando dashboard unificado para parque: ${parqueId || 'todos'}`);
    
    const dashboardData = await DatabaseService.getDashboardData(parqueId as string);
    
    return res.status(200).json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
      parque: parqueId || 'todos'
    });
  } catch (error) {
    console.error('Erro no dashboard unificado:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}