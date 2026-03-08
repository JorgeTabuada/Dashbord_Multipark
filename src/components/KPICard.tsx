import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
}

export function KPICard({ icon: Icon, iconColor, iconBg, label, value, delta, deltaLabel }: KPICardProps) {
  const isPositive = delta >= 0;
  
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} color={iconColor} />
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: isPositive ? '#DCFCE7' : '#FEE2E2',
          fontSize: '13px',
          fontWeight: '600',
          color: isPositive ? '#16A34A' : '#DC2626',
        }}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(delta)}%
        </div>
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#9CA3AF',
      }}>
        {deltaLabel}
      </div>
    </div>
  );
}
