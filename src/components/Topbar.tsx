import { ChevronDown, SlidersHorizontal, Bell } from 'lucide-react';
import { useLocation } from 'react-router';

interface TopbarProps {
  selectedCity: string;
  selectedPark: string;
  onCityChange: (city: string) => void;
  onParkChange: (park: string) => void;
}

const cities = ['Lisboa', 'Porto', 'Faro'];
const parks = ['AirPark', 'RedPark', 'SkyPark'];

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/despesas': 'Despesas',
  '/faturas': 'Faturas',
  '/relatorio-anual': 'Relatório Anual',
  '/multipark': 'MultiPark',
  '/operacional': 'Operacional',
  '/servicos': 'Serviços',
  '/recursos-humanos': 'Recursos Humanos',
  '/performance': 'Performance',
  '/formacao': 'Formação',
  '/marketing': 'Marketing',
  '/google-reviews': 'Google Reviews',
  '/parcerias': 'Parcerias',
  '/reclamacoes': 'Reclamações',
  '/perdidos-achados': 'Perdidos & Achados',
  '/ocorrencias': 'Ocorrências',
  '/utilizadores': 'Utilizadores',
  '/projetos': 'Projetos',
  '/tarefas': 'Tarefas',
};

export function Topbar({ selectedCity, selectedPark, onCityChange, onParkChange }: TopbarProps) {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div style={{
      height: '76px',
      backgroundColor: 'white',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '24px',
    }}>
      {/* Page Title */}
      <h1 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#1F2937',
        margin: 0,
      }}>
        {pageTitle}
      </h1>

      <div style={{ flex: 1 }} />

      {/* City Dropdown */}
      <div style={{ position: 'relative' }}>
        <select
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          style={{
            padding: '8px 36px 8px 12px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            backgroundColor: 'white',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer',
            appearance: 'none',
            minWidth: '120px',
          }}
        >
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6B7280',
          }}
        />
      </div>

      {/* Park Dropdown */}
      <div style={{ position: 'relative' }}>
        <select
          value={selectedPark}
          onChange={(e) => onParkChange(e.target.value)}
          style={{
            padding: '8px 36px 8px 12px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            backgroundColor: 'white',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer',
            appearance: 'none',
            minWidth: '130px',
          }}
        >
          {parks.map((park) => (
            <option key={park} value={park}>{park}</option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6B7280',
          }}
        />
      </div>

      {/* Filters Button */}
      <button style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        backgroundColor: 'white',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F9FAFB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
      }}
      >
        <SlidersHorizontal size={16} />
        Filtros
      </button>

      {/* Notifications */}
      <button style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F9FAFB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
      }}
      >
        <Bell size={18} color="#6B7280" />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#EF4444',
        }} />
      </button>

      {/* User Avatar */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#6366F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
      }}>
        JM
      </div>
    </div>
  );
}
