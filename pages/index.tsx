// pages/index.tsx
import { useState, useEffect } from 'react';
import { supabaseDashboard, supabaseFerramentas } from '../lib/supabase/clients';

interface DatabaseStatus {
  name: string;
  status: 'online' | 'offline' | 'checking';
  url: string;
  tables?: number;
  lastCheck?: Date;
}

export default function HomePage() {
  const [dashboardStatus, setDashboardStatus] = useState<DatabaseStatus>({
    name: 'Dashboard Multipark',
    status: 'checking',
    url: 'ioftqsvjqwjeprsckeym.supabase.co'
  });

  const [ferramentasStatus, setFerramentasStatus] = useState<DatabaseStatus>({
    name: 'Ferramentas Multipark', 
    status: 'checking',
    url: 'dzdeewebxsfxeabdxtiq.supabase.co'
  });

  const [reservasCount, setReservasCount] = useState<number>(0);
  const [colaboradoresCount, setColaboradoresCount] = useState<number>(0);

  useEffect(() => {
    checkDatabaseStatus();
    loadQuickStats();
  }, []);

  async function checkDatabaseStatus() {
    // Verificar Dashboard
    try {
      const { data, error } = await supabaseDashboard.from('parques').select('count', { count: 'exact' });
      if (error) throw error;
      
      setDashboardStatus(prev => ({
        ...prev,
        status: 'online',
        tables: data?.length || 0,
        lastCheck: new Date()
      }));
    } catch (error) {
      setDashboardStatus(prev => ({ ...prev, status: 'offline', lastCheck: new Date() }));
    }

    // Verificar Ferramentas
    try {
      const { data, error } = await supabaseFerramentas.from('parques').select('count', { count: 'exact' });
      if (error) throw error;
      
      setFerramentasStatus(prev => ({
        ...prev,
        status: 'online',
        tables: data?.length || 0,
        lastCheck: new Date()
      }));
    } catch (error) {
      setFerramentasStatus(prev => ({ ...prev, status: 'offline', lastCheck: new Date() }));
    }
  }

  async function loadQuickStats() {
    try {
      // Reservas de hoje (Dashboard)
      const today = new Date().toISOString().split('T')[0];
      const { count: reservasToday } = await supabaseDashboard
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .gte('check_in_previsto', today)
        .lte('check_in_previsto', today + 'T23:59:59');
      
      setReservasCount(reservasToday || 0);

      // Colaboradores ativos (Ferramentas)
      const { count: colaboradores } = await supabaseFerramentas
        .from('rh_colaboradores')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      
      setColaboradoresCount(colaboradores || 0);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Multipark
          </h1>
          <p className="mt-2 text-gray-600">
            Sistema multi-database integrado - Dashboard + Ferramentas
          </p>
        </div>

        {/* Status das Bases de Dados */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <DatabaseStatusCard database={dashboardStatus} />
          <DatabaseStatusCard database={ferramentasStatus} />
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Reservas Hoje"
            value={reservasCount}
            subtitle="Da base Dashboard"
            color="blue"
          />
          <StatCard
            title="Colaboradores Ativos"
            value={colaboradoresCount}
            subtitle="Da base Ferramentas"
            color="green"
          />
          <StatCard
            title="Parques Ativos"
            value="9"
            subtitle="Sincronizados"
            color="purple"
          />
          <StatCard
            title="Status Sistema"
            value="Online"
            subtitle="Multi-database"
            color="emerald"
          />
        </div>

        {/* Links para sistemas */}
        <div className="grid md:grid-cols-2 gap-6">
          <LinkCard
            title="Sistema HTML Atual"
            description="Aceder ao dashboard HTML existente"
            href="/index.html"
            buttonText="Abrir Dashboard HTML"
            color="gray"
          />
          <LinkCard
            title="Nova Versão React"
            description="Explorar a nova versão com integração multi-database"
            href="/dashboard"
            buttonText="Explorar React App"
            color="blue"
          />
        </div>

      </div>
    </div>
  );
}

// Componentes auxiliares
function DatabaseStatusCard({ database }: { database: DatabaseStatus }) {
  const statusColors = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800',
    checking: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{database.name}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[database.status]}`}>
          {database.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{database.url}</p>
      {database.lastCheck && (
        <p className="text-xs text-gray-400 mt-2">
          Último check: {database.lastCheck.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    emerald: 'text-emerald-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className={`text-2xl font-bold ${colorClasses[color]} mt-1`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function LinkCard({ title, description, href, buttonText, color }: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  color: string;
}) {
  const colorClasses = {
    gray: 'bg-gray-600 hover:bg-gray-700',
    blue: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-2 mb-4">{description}</p>
      <a
        href={href}
        className={`inline-block px-4 py-2 text-white rounded-md transition-colors ${colorClasses[color]}`}
      >
        {buttonText}
      </a>
    </div>
  );
}