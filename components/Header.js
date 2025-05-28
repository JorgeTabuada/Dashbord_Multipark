export default function Header({ userName }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f0f2f5', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/img/logo.png" alt="Logo Multipark" style={{ height: '40px', marginRight: '1rem' }} />
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Ferramentas Multipark</h1>
      </div>
      {userName && <span style={{ fontSize: '1rem' }}>Bem-vindo, {userName}</span>}
    </header>
  );
}
