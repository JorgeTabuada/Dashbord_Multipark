// pages/api/auth/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseDashboard, supabaseFerramentas } from '../../../lib/supabase/clients';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token de autorização obrigatório' });
    }

    // Verificar utilizador em ambas as bases
    const [dashboardAuth, ferramentasAuth] = await Promise.all([
      supabaseDashboard.auth.getUser(token),
      supabaseFerramentas.auth.getUser(token)
    ]);

    if (!dashboardAuth.data.user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar perfis em ambas as bases
    const [dashboardProfile, ferramentasProfile] = await Promise.all([
      supabaseDashboard
        .from('profiles')
        .select('*')
        .eq('id', dashboardAuth.data.user.id)
        .single(),
      
      supabaseFerramentas
        .from('profiles')
        .select('*')
        .eq('auth_user_id', dashboardAuth.data.user.id)
        .single()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user: dashboardAuth.data.user,
        dashboardProfile: dashboardProfile.data,
        ferramentasProfile: ferramentasProfile.data,
        hasRHAccess: !!ferramentasProfile.data,
        permissions: {
          dashboard: !!dashboardProfile.data,
          ferramentas: !!ferramentasProfile.data,
          admin: dashboardProfile.data?.role === 'admin',
          rh: ['admin', 'rh_manager', 'rh_user'].includes(ferramentasProfile.data?.role)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}