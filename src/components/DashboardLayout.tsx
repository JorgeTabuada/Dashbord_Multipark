import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Lisboa');
  const [selectedPark, setSelectedPark] = useState('AirPark');

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#F0F4FF',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar 
          selectedCity={selectedCity}
          selectedPark={selectedPark}
          onCityChange={setSelectedCity}
          onParkChange={setSelectedPark}
        />
        <main style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '24px',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
