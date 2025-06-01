// pages/dashboard/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseDashboard } from '../../lib/supabase/clients';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  parque_id_principal: string;
  ativo: boolean;
}

interface SubApp {
  id: string;
  name: string;
  category: string;
  href: string;
  icon?: string;
}

const subApps: SubApp[] = [
  // Operacional
  { id: 'reservas', name: 'Reservas', category: 'Operacional', href: '/dashboard/reservas' },
  { id: 'recolhas', name: 'Recolhas', category: 'Operacional', href: '/dashboard/recolhas' },
  { id: 'entregas', name: 'Entregas', category: 'Operacional', href: '/dashboard/entregas' },
  { id: 'caixa_multipark', name: 'Caixa Multipark', category: 'Operacional', href: '/dashboard/caixa' },
  { id: 'cancelamentos', name: 'Cancelamentos', category: 'Operacional', href: '/dashboard/cancelamentos' },
  { id: 'confirmacao_caixa', name: 'Confirmação de Caixa', category: 'Operacional', href: '/dashboard/confirmacao-caixa' },
  
  // Gestão
  { id: 'despesas', name: 'Despesas', category: 'Gestão', href: '/dashboard/despesas' },
  { id: 'faturacao', name: 'Faturação', category: 'Gestão', href: '/dashboard/faturacao' },
  { id: 'horarios_ordenados', name: 'Horários & Ordenados', category: 'Gestão', href: '/dashboard/horarios' },
  { id: 'projetos', name: 'Projetos', category: 'Gestão', href: '/dashboard/projetos' },
  { id: 'tarefas', name: 'Tarefas', category: 'Gestão', href: '/dashboard/tarefas' },
  
  // Análises
  { id: 'marketing', name: 'Marketing', category: 'Análises', href: '/dashboard/marketing' },
  { id: 'relatorios', name: 'Relatórios', category: 'Análises', href: '/dashboard/relatorios' },
  { id: 'produtividade_condutores', name: 'Produtividade Condutores', category: 'Análises', href: '/dashboard/produtividade' },
  { id: 'comportamentos', name: 'Comportamentos', category: 'Análises', href: '/dashboard/comportamentos' },
  { id: 'mapa_ocupacao', name: 'Mapa de Ocupação', category: 'Análises', href: '/dashboard/mapa-ocupacao' },
  { id: 'bi_interno', name: 'BI Interno', category: 'Análises', href: '/dashboard/bi' },
  
  // Administração e Suporte
  { id: 'formacao_apoio', name: 'Formação & Apoio', category: 'Administração e Suporte', href: '/dashboard/formacao' },
  { id: 'perdidos_achados', name: 'Perdidos & Achados', category: 'Administração e Suporte', href: '/dashboard/perdidos-achados' },
  { id: 'comentarios_reclamacoes', name: 'Comentários & Reclamações', category: 'Administração e Suporte', href: '/dashboard/reclamacoes' },
  { id: 'auditorias_internas', name: 'Auditorias Internas', category: 'Administração e Suporte', href: '/dashboard/auditorias' },
  { id: 'acessos_alteracoes', name: 'Acessos e Alterações', category: 'Administração e Suporte', href: '/dashboard/acessos' }
];

const categories = ['Operacional', 'Gestão', 'Análises', 'Administração e Suporte'];

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPark, setSelectedPark] = useState('lisboa');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabaseDashboard.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Carregar perfil do localStorage primeiro (para ser mais rápido)
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
        setSelectedPark(localStorage.getItem('multiparkSelectedPark') || parsedProfile.parque_id_principal || 'lisboa');
      }

      // Depois buscar do Supabase para garantir que está atualizado
      const { data: profileData, error } = await supabaseDashboard
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profileData) {
        console.error('Erro ao carregar perfil:', error);
        router.push('/login');
        return;
      }

      setProfile(profileData);
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      
    } catch (error) {
      console.error('Erro na autenticação:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseDashboard.auth.signOut();
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleParkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPark = e.target.value;
    setSelectedPark(newPark);
    localStorage.setItem('multiparkSelectedPark', newPark);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="bg-blue-900 text-white px-3 py-1 rounded text-xl font-black mr-2">
                P
              </span>
              <span className="text-2xl font-bold text-blue-900">MULTIPARK</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sair
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              BEM-VINDO DE VOLTA, {profile.full_name?.toUpperCase() || profile.email.split('@')[0].toUpperCase()}!
            </h1>
          </div>

          <div className="flex justify-center">
            <select
              value={selectedPark}
              onChange={handleParkChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lisboa">LISBOA</option>
              <option value="porto">PORTO</option>
              <option value="faro">FARO</option>
              {profile.role === 'admin' && (
                <option value="todos">TODOS OS PARQUES</option>
              )}
            </select>
          </div>
        </div>

        {/* Categorias e Apps */}
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map(category => {
            const categoryApps = subApps.filter(app => app.category === category);
            
            return (
              <div key={category} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4 pb-2 border-b-2 border-blue-600">
                  {category}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {categoryApps.map(app => (
                    <Link
                      key={app.id}
                      href={app.href}
                      className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium text-sm"
                    >
                      {app.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
