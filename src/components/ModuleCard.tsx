import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

interface ModuleCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  path: string;
  alertCount?: number;
  accentColor: string;
}

export function ModuleCard({ icon: Icon, iconColor, iconBg, label, path, alertCount, accentColor }: ModuleCardProps) {
  return (
    <Link
      to={path}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        textDecoration: 'none',
        display: 'block',
        transition: 'all 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 20px ${accentColor}33`;
        e.currentTarget.style.borderColor = accentColor;
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={28} color={iconColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '4px',
          }}>
            {label}
          </div>
        </div>
        {alertCount !== undefined && alertCount > 0 && (
          <div style={{
            minWidth: '24px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: '#EF4444',
            color: 'white',
            fontSize: '12px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
          }}>
            {alertCount}
          </div>
        )}
      </div>
    </Link>
  );
}
