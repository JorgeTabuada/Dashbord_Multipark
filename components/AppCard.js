import Link from 'next/link';

export default function AppCard({ appName, appIconUrl, appLink }) {
  return (
    <Link href={appLink}>
      <a style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '150px',
        height: '150px',
        margin: '10px',
        backgroundColor: '#007bff', // Blue background
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
      }}
      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {appIconUrl ? (
          <img src={appIconUrl} alt={`${appName} icon`} style={{ width: '50px', height: '50px', marginBottom: '10px' }} />
        ) : (
          <div style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>
            {appName.substring(0, 1)} 
          </div>
        )}
        <span>{appName}</span>
      </a>
    </Link>
  );
}
