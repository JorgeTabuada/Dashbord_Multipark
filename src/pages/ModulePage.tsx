import { useLocation, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export function ModulePage() {
  const location = useLocation();
  const pathName = location.pathname.substring(1);
  const moduleName = pathName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div>
      <Link 
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6B7280',
          textDecoration: 'none',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#6366F1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#6B7280';
        }}
      >
        <ArrowLeft size={16} />
        Voltar ao Dashboard
      </Link>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: '16px',
        }}>
          {moduleName}
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Esta página está em desenvolvimento. O conteúdo específico para {moduleName} será implementado em breve.
        </p>
      </div>
    </div>
  );
}
