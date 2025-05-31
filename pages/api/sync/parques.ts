// pages/api/sync/parques.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../lib/services/database.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Verificar se é admin (simplificado - pode ser melhorado)
    const userRole = req.headers['x-user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Apenas administradores podem sincronizar dados' 
      });
    }

    console.log('Iniciando sincronização de parques...');
    await DatabaseService.syncParques();
    
    return res.status(200).json({ 
      success: true,
      message: 'Sincronização de parques concluída com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return res.status(500).json({ 
      error: 'Erro na sincronização',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}