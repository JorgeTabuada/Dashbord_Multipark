import { 
  LayoutDashboard, 
  DollarSign, 
  Car, 
  Users, 
  TrendingUp, 
  Headphones, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ParkingCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: DollarSign, label: 'Financeiro', path: '/despesas' },
  { icon: Car, label: 'Operações', path: '/multipark' },
  { icon: Users, label: 'Pessoas', path: '/recursos-humanos' },
  { icon: TrendingUp, label: 'Marketing', path: '/marketing' },
  { icon: Headphones, label: 'Suporte', path: '/reclamacoes' },
  { icon: Settings, label: 'Sistema', path: '/utilizadores' },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div style={{
      width: isCollapsed ? '80px' : '260px',
      backgroundColor: 'white',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{
        padding: isCollapsed ? '20px 16px' : '20px 24px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '76px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#6366F1',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ParkingCircle size={24} color="white" />
        </div>
        {!isCollapsed && (
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1F2937',
          }}>
            Multipark
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: isCollapsed ? '16px 8px' : '16px',
        overflowY: 'auto',
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isCollapsed ? '12px 16px' : '12px 16px',
                marginBottom: '4px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                color: isActive ? '#6366F1' : '#6B7280',
                fontWeight: isActive ? '600' : '500',
                fontSize: '15px',
                transition: 'all 0.2s',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: '-12px',
          top: '88px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}
