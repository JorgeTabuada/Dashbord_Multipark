import { 
  Calendar,
  Euro,
  Users as UsersIcon,
  Star,
  Receipt,
  FileText,
  BarChart3,
  Car,
  Settings as SettingsIcon,
  Wrench,
  Users,
  Award,
  GraduationCap,
  Megaphone,
  MessageSquare,
  Handshake,
  AlertTriangle,
  Package,
  ShieldAlert,
  UserCog,
  FolderKanban,
  CheckSquare
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { ModuleCard } from '../components/ModuleCard';

export function Dashboard() {
  return (
    <div>
      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <KPICard
          icon={Calendar}
          iconColor="#6366F1"
          iconBg="#EEF2FF"
          label="Reservas Hoje"
          value="147"
          delta={12}
          deltaLabel="vs. ontem"
        />
        <KPICard
          icon={Euro}
          iconColor="#10B981"
          iconBg="#D1FAE5"
          label="Receita Mensal"
          value="€89.4k"
          delta={8}
          deltaLabel="vs. mês anterior"
        />
        <KPICard
          icon={UsersIcon}
          iconColor="#F59E0B"
          iconBg="#FEF3C7"
          label="Condutores Ativos"
          value="2,834"
          delta={-3}
          deltaLabel="vs. semana anterior"
        />
        <KPICard
          icon={Star}
          iconColor="#EC4899"
          iconBg="#FCE7F3"
          label="Reviews Pendentes"
          value="23"
          delta={5}
          deltaLabel="novos hoje"
        />
      </div>

      {/* FINANCEIRO Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#6B7280',
          letterSpacing: '0.8px',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          Financeiro
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <ModuleCard
            icon={Receipt}
            iconColor="#3B82F6"
            iconBg="#DBEAFE"
            label="Despesas"
            path="/despesas"
            alertCount={7}
            accentColor="#3B82F6"
          />
          <ModuleCard
            icon={FileText}
            iconColor="#3B82F6"
            iconBg="#DBEAFE"
            label="Faturas"
            path="/faturas"
            accentColor="#3B82F6"
          />
          <ModuleCard
            icon={BarChart3}
            iconColor="#3B82F6"
            iconBg="#DBEAFE"
            label="Relatório Anual"
            path="/relatorio-anual"
            accentColor="#3B82F6"
          />
        </div>
      </div>

      {/* OPERAÇÕES Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#6B7280',
          letterSpacing: '0.8px',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          Operações
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <ModuleCard
            icon={Car}
            iconColor="#F59E0B"
            iconBg="#FEF3C7"
            label="MultiPark"
            path="/multipark"
            alertCount={3}
            accentColor="#F59E0B"
          />
          <ModuleCard
            icon={SettingsIcon}
            iconColor="#F59E0B"
            iconBg="#FEF3C7"
            label="Operacional"
            path="/operacional"
            accentColor="#F59E0B"
          />
          <ModuleCard
            icon={Wrench}
            iconColor="#F59E0B"
            iconBg="#FEF3C7"
            label="Serviços"
            path="/servicos"
            alertCount={2}
            accentColor="#F59E0B"
          />
        </div>
      </div>

      {/* PESSOAS Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#6B7280',
          letterSpacing: '0.8px',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          Pessoas
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <ModuleCard
            icon={Users}
            iconColor="#8B5CF6"
            iconBg="#EDE9FE"
            label="Recursos Humanos"
            path="/recursos-humanos"
            accentColor="#8B5CF6"
          />
          <ModuleCard
            icon={Award}
            iconColor="#8B5CF6"
            iconBg="#EDE9FE"
            label="Performance"
            path="/performance"
            accentColor="#8B5CF6"
          />
          <ModuleCard
            icon={GraduationCap}
            iconColor="#8B5CF6"
            iconBg="#EDE9FE"
            label="Formação"
            path="/formacao"
            alertCount={1}
            accentColor="#8B5CF6"
          />
        </div>
      </div>

      {/* MARKETING Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#6B7280',
          letterSpacing: '0.8px',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          Marketing
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <ModuleCard
            icon={Megaphone}
            iconColor="#10B981"
            iconBg="#D1FAE5"
            label="Marketing"
            path="/marketing"
            accentColor="#10B981"
          />
          <ModuleCard
            icon={MessageSquare}
            iconColor="#10B981"
            iconBg="#D1FAE5"
            label="Google Reviews"
            path="/google-reviews"
            alertCount={23}
            accentColor="#10B981"
          />
          <ModuleCard
            icon={Handshake}
            iconColor="#10B981"
            iconBg="#D1FAE5"
            label="Parcerias"
            path="/parcerias"
            accentColor="#10B981"
          />
        </div>
      </div>

      {/* SUPORTE Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#6B7280',
          letterSpacing: '0.8px',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          Suporte
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <ModuleCard
            icon={AlertTriangle}
            iconColor="#EF4444"
            iconBg="#FEE2E2"
            label="Reclamações"
            path="/reclamacoes"
            alertCount={8}
            accentColor="#EF4444"
          />
          <ModuleCard
            icon={Package}
            iconColor="#EF4444"
            iconBg="#FEE2E2"
            label="Perdidos & Achados"
            path="/perdidos-achados"
            alertCount={5}
            accentColor="#EF4444"
          />
          <ModuleCard
            icon={ShieldAlert}
            iconColor="#EF4444"
            iconBg="#FEE2E2"
            label="Ocorrências"
            path="/ocorrencias"
            alertCount={2}
            accentColor="#EF4444"
          />
        </div>
      </div>

      {/* SISTEMA Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#6B7280',
          letterSpacing: '0.8px',
          marginBottom: '16px',
          textTransform: 'uppercase',
        }}>
          Sistema
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          <ModuleCard
            icon={UserCog}
            iconColor="#6B7280"
            iconBg="#F3F4F6"
            label="Utilizadores"
            path="/utilizadores"
            accentColor="#6B7280"
          />
          <ModuleCard
            icon={FolderKanban}
            iconColor="#6B7280"
            iconBg="#F3F4F6"
            label="Projetos"
            path="/projetos"
            accentColor="#6B7280"
          />
          <ModuleCard
            icon={CheckSquare}
            iconColor="#6B7280"
            iconBg="#F3F4F6"
            label="Tarefas"
            path="/tarefas"
            alertCount={12}
            accentColor="#6B7280"
          />
        </div>
      </div>
    </div>
  );
}
