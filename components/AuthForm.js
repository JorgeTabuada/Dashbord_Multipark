import { useState } from 'react';

export default function AuthForm({ onSubmit, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
      <img src="/img/logo.png" alt="Logo" style={{ height: '50px', alignSelf: 'center', marginBottom: '1rem' }} />
      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '0.5rem', width: '100%', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Palavra-passe</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Palavra-passe" required style={{ padding: '0.5rem', width: '100%', boxSizing: 'border-box' }} />
      </div>
      <button type="submit" style={{ padding: '0.75rem', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Entrar</button>
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
    </form>
  );
}
