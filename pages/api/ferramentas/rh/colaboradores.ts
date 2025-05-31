// pages/api/ferramentas/rh/colaboradores.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../../lib/services/database.service';
import { supabaseFerramentas } from '../../../../lib/supabase/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticação
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token de autorização obrigatório' });
    }

    const { data: { user } } = await supabaseFerramentas.auth.getUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar permissões RH
    const { data: profile } = await supabaseFerramentas
      .from('profiles')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!profile || !['admin', 'rh_manager', 'rh_user'].includes(profile.role)) {
      return res.status(403).json({ error: 'Acesso negado - Sem permissões RH' });
    }

    switch (req.method) {
      case 'GET':
        const result = await DatabaseService.getColaboradores();
        
        if (result.error) {
          return res.status(400).json({ error: result.error.message });
        }
        
        return res.status(200).json({
          success: true,
          data: result.data,
          count: result.data?.length || 0
        });

      case 'POST':
        const createResult = await DatabaseService.createColaborador(req.body);
        
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
    console.error('Erro na API colaboradores:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}