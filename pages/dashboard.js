import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router'; // No longer needed here for auth check
import Header from '../components/Header';
import ParkSelector from '../components/ParkSelector';
import DashboardGrid from '../components/DashboardGrid';
import withAuth from '../components/withAuth'; // Import the HOC

// userData prop is passed by withAuth HOC
function DashboardPage({ userData }) { 
  // const router = useRouter(); // No longer needed here for auth check
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPark, setSelectedPark] = useState('');
  // setLoading is handled by withAuth, but you might have other loading states
  // const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (userData) {
      setCurrentUser({
        fullName: userData.fullName,
        role: userData.role,
        parkId: userData.parkId, // This should match the key from checkUserSession
        id: userData.id,
      });
      // Set initial selected park based on user data
      if (userData.role === 'super_admin') {
        setSelectedPark(userData.parkId || 'todos'); 
      } else {
        setSelectedPark(userData.parkId || 'lisboa'); // Default to 'lisboa' if not set
      }
      // setLoading(false); // setLoading is now primarily for withAuth's session check
    }
    // No need to redirect here, withAuth handles it.
  }, [userData]);

  const handleParkChange = (newPark) => {
    setSelectedPark(newPark);
  };

  // withAuth handles the loading state for session check and redirection if no user.
  // So, we can assume currentUser will be set if this component renders.
  if (!currentUser) {
    // This can be a simpler loading state or null if withAuth's loading is sufficient
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>A carregar dados do utilizador...</p></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header userName={currentUser.fullName} />
      <ParkSelector
        currentUserRole={currentUser.role}
        currentUserPark={currentUser.parkId}
        onParkChange={handleParkChange}
        selectedPark={selectedPark}
      />
      <main style={{ flexGrow: 1, padding: '1rem', backgroundColor: '#ffffff' }}>
        <DashboardGrid userRole={currentUser.role} selectedPark={selectedPark} />
      </main>
      <footer style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f2f5', borderTop: '1px solid #ccc' }}>
        <p>&copy; {new Date().getFullYear()} Multipark. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default withAuth(DashboardPage); // Wrap the component with the HOC
