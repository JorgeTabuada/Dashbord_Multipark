import React from 'react';

export default function ParkSelector({ currentUserRole, currentUserPark, onParkChange, selectedPark }) {
  const parkOptions = [
    { value: 'lisboa', label: 'Lisboa' },
    { value: 'porto', label: 'Porto' },
    { value: 'faro', label: 'Faro' },
  ];

  // Ensure selectedPark has a valid default if currentUserPark is not set
  const currentSelection = selectedPark || currentUserPark || 'lisboa';

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="park-selector" style={{fontWeight: 'bold'}}>Parque Selecionado:</label>
      <select 
        id="park-selector"
        value={currentSelection} 
        onChange={(e) => onParkChange(e.target.value)} 
        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        {currentUserRole === 'super_admin' && (
          <option value="todos">Todos os Parques</option>
        )}
        {parkOptions.map(park => (
          <option key={park.value} value={park.value}>
            {park.label}
          </option>
        ))}
      </select>
    </div>
  );
}
