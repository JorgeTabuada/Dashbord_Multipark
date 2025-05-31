// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Criar clientes middleware para ambas as bases
  const supabaseDashboard = createMiddlewareClient({ 
    req, 
    res,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_DASHBOARD_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY!
  });
  
  const supabaseFerramentas = createMiddlewareClient({
    req,
    res,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_FERRAMENTAS_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_FERRAMENTAS_ANON_KEY!
  });

  // Verificar autenticação na base principal (Dashboard)
  const {
    data: { user: dashboardUser },
  } = await supabaseDashboard.auth.getUser();

  // Rotas protegidas
  const protectedRoutes = [
    '/dashboard',
    '/reservas',
    '/parques',
    '/caixa',
    '/rh',
    '/formacao',
    '/auditoria',
    '/analytics',
    '/admin'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // Se rota protegida e não autenticado, redirecionar para login
  if (isProtectedRoute && !dashboardUser) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Se autenticado, verificar perfil e permissões
  if (dashboardUser && isProtectedRoute) {
    try {
      // Buscar perfil do utilizador na base Dashboard
      const { data: profile } = await supabaseDashboard
        .from('profiles')
        .select('role, ativo, parques_associados_ids, parque_id_principal')
        .eq('id', dashboardUser.id)
        .single();

      if (!profile || !profile.ativo) {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }

      // Verificar permissões baseadas na rota
      const route = req.nextUrl.pathname;
      
      // Rotas que requerem acesso admin
      if (route.startsWith('/admin') && profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }

      // Rotas RH que requerem acesso à base Ferramentas
      if (route.startsWith('/rh') || route.startsWith('/formacao') || route.startsWith('/auditoria')) {
        // Verificar se tem acesso à base Ferramentas
        const { data: rhProfile } = await supabaseFerramentas
          .from('profiles')
          .select('id, role')
          .eq('auth_user_id', dashboardUser.id)
          .single();

        if (!rhProfile && !['admin', 'rh_manager'].includes(profile.role)) {
          return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
        }
      }

      // Adicionar headers com informações do utilizador
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', dashboardUser.id);
      requestHeaders.set('x-user-role', profile.role);
      requestHeaders.set('x-user-parque-principal', profile.parque_id_principal || '');
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      console.error('Erro no middleware de auth:', error);
      return NextResponse.redirect(new URL('/auth/error', req.url));
    }
  }

  // Refrescar sessão em ambas as bases
  if (dashboardUser) {
    await Promise.all([
      supabaseDashboard.auth.getSession(),
      supabaseFerramentas.auth.getSession()
    ]);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/webhooks).*)',
  ],
};