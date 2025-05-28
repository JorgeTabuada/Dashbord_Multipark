import AppCard from './AppCard';
import { getAppsForUser } from '../lib/permissions'; // Using the placeholder

export default function DashboardGrid({ userRole, selectedPark }) {
  // Use getAppsForUser from lib/permissions.js
  // The selectedPark prop is available for future filtering if needed at this level
  const visibleApps = getAppsForUser(userRole);

  if (!visibleApps || visibleApps.length === 0) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma aplicação disponível para a sua função ou parque selecionado.</p>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', padding: '1rem', justifyContent: 'center', gap: '1rem' }}>
      {visibleApps.map(app => (
        <AppCard 
          key={app.id || app.name} 
          appName={app.name} 
          appIconUrl={app.icon} // Assuming app.icon might be a URL or null
          appLink={`${app.link}?parque=${selectedPark}`} // Pass selectedPark as a query parameter
        />
      ))}
    </div>
  );
}
