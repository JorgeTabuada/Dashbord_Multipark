import AuthForm from '../components/AuthForm';
import { useRouter } from 'next/router';
import { useState } from 'react';
// import { loginUser } from '../lib/auth'; // This will be used later

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    setError(''); // Clear previous errors
    // const { data, error: authError } = await loginUser(email, password); // Future implementation
    
    // Simulate API call
    if (email === 'test@example.com' && password === 'password') {
      // Simulate successful login
      localStorage.setItem('user_full_name', 'Test User');
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_parque_id_principal', 'lisboa');
      localStorage.setItem('user_id', 'test-user-id');
      router.push('/dashboard');
    } else {
      setError('Login falhou. Verifique suas credenciais.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <AuthForm onSubmit={handleLogin} error={error} />
    </div>
  );
}
