// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseDashboard } from '../lib/supabase/clients';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const { data: { user } } = await supabaseDashboard.auth.getUser();
      
      if (user) {
        // Se autenticado, vai para o dashboard
        router.push('/dashboard');
      } else {
        // Se não autenticado, vai para o login
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      // Em caso de erro, vai para o login
      router.push('/login');
    }
  };

  // Mostra loading enquanto verifica
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <span className="bg-blue-900 text-white px-3 py-1 rounded text-xl font-black mr-2">
            P
          </span>
          <span className="text-2xl font-bold text-blue-900">MULTIPARK</span>
        </div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">A carregar...</p>
      </div>
    </div>
  );
}
