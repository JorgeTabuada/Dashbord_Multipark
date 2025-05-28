import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { checkUserSession } from '../lib/auth'; // Using the new session check function

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const user = checkUserSession(); // Synchronous check using localStorage
      if (!user || !user.id) {
        router.replace('/'); // Redirect to login if no session
      } else {
        setUserData(user);
        setLoading(false);
      }
    }, [router]);

    if (loading) {
      // You can render a loading spinner or a blank page while checking session
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>Verificando sessão...</p></div>;
    }

    if (!userData) {
      // This case should ideally be covered by the redirect, but as a fallback
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><p>Redirecionando para login...</p></div>;
    }

    // Pass user data to the wrapped component
    return <WrappedComponent {...props} userData={userData} />;
  };

  // Set a display name for the HOC for better debugging
  AuthenticatedComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;
