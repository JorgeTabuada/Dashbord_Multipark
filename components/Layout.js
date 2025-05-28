import { useRouter } from 'next/router';
import Head from 'next/head';
import { logoutUser } from '../lib/auth'; // Using the updated logoutUser

export default function Layout({ subAppName, children, currentPark }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser(router); // Use the actual logoutUser function
  };

  const displayParkName = (parkId) => {
    if (!parkId) return 'Nenhum Parque Selecionado';
    if (parkId === 'todos') return 'Todos os Parques';
    // Capitalize first letter, assuming parkId is a string like 'lisboa'
    return parkId.charAt(0).toUpperCase() + parkId.slice(1);
  };

  return (
    <>
      <Head>
        <title>{subAppName ? `${subAppName} - ` : ''}Ferramentas Multipark</title>
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem', // Increased padding
          backgroundColor: '#004080', // Darker blue for sub-app header
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Added subtle shadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/img/logo.png" alt="Logo Multipark" style={{ height: '40px', marginRight: '1rem' }} />
            <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '500' }}>{subAppName || 'Ferramentas Multipark'}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentPark && (
              <span style={{ marginRight: '1.5rem', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                Parque: {displayParkName(currentPark)}
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                padding: '0.6rem 1.2rem', // Adjusted padding
                backgroundColor: '#e9ecef', // Lighter background for button
                color: '#004080', // Dark blue text
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#ced4da'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
            >
              Sair
            </button>
          </div>
        </header>
        <main style={{ flexGrow: 1, padding: '1.5rem' }}> {/* Increased padding for main content */}
          {children}
        </main>
        <footer style={{ 
            padding: '1rem', 
            textAlign: 'center', 
            backgroundColor: '#d1d9e0', // Slightly different footer color
            borderTop: '1px solid #adb5bd', // Border for footer
            color: '#343a40' // Darker text for footer
        }}>
          Multipark &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}
