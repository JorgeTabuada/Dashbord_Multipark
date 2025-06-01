// pages/login.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabaseDashboard } from '../lib/supabase/clients';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Verificar se já está autenticado
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabaseDashboard.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro ao verificar utilizador:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email e palavra-passe são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      // Fazer login no Supabase
      const { data, error: signInError } = await supabaseDashboard.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        // Verificar se o utilizador está ativo
        const { data: profile, error: profileError } = await supabaseDashboard
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          throw new Error('Erro ao carregar perfil do utilizador');
        }

        if (!profile) {
          throw new Error('Perfil de utilizador não encontrado');
        }

        if (!profile.ativo) {
          throw new Error('Conta ainda não aprovada pelos administradores. Contacte o suporte.');
        }

        // Guardar dados no localStorage para compatibilidade com sistema existente
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('multiparkSelectedPark', profile.parque_id_principal || 'lisboa');

        // Redirecionar para dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <span className="bg-blue-900 text-white px-3 py-1 rounded text-xl font-black mr-2">
              P
            </span>
            <span className="text-2xl font-bold text-blue-900">MULTIPARK</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Ferramentas Multipark
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Entre na sua conta para aceder ao sistema
          </p>
        </div>

        {/* Formulário de Login */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="o.seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Palavra-passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          {/* Botão de Login */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  A entrar...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          {/* Link para Registo */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem conta?{' '}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Registar-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
