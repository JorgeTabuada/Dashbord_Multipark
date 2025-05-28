// components/shared/Table.js
export default function Table({ columns, data, caption }) {
  if (!columns || !data) return <p>Table data or columns missing.</p>;
  
  // Basic check for columns format
  if (!Array.isArray(columns) || columns.some(col => typeof col.Header === 'undefined' || typeof col.accessor === 'undefined')) {
    console.error("Table component: 'columns' prop is not correctly formatted. Each column must be an object with 'Header' and 'accessor' properties.");
    return <p>Table columns configuration error.</p>;
  }
  // Basic check for data format
  if (!Array.isArray(data)) {
    console.error("Table component: 'data' prop must be an array.");
    return <p>Table data format error.</p>;
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px', margin: '1em 0' }}> {/* For responsiveness and container styling */}
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' /* Ensures table has a minimum width before scrolling */ }}>
        {caption && <caption style={{ padding: '10px', captionSide: 'bottom', textAlign: 'center', fontSize: '0.9em', color: '#555' }}>{caption}</caption>}
        <thead>
          <tr style={{ backgroundColor: '#f7f7f7' /* Lighter header background */ }}>
            {columns.map((col) => (
              <th 
                key={col.accessor} 
                style={{ 
                  borderBottom: '2px solid #ddd', // Stronger border for header bottom
                  padding: '12px 10px', // Increased padding
                  textAlign: col.textAlign || 'left', // Allow column-specific text alignment
                  fontWeight: '600', // Bolder header text
                  color: '#333' // Darker header text
                }}
              >
                {col.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                style={{ 
                  borderBottom: '1px solid #eee', // Lighter border for rows
                  backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#fdfdfd' // Subtle striping
                }}
                // Add hover effect via CSS classes in a real app for better performance/maintainability
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fff' : '#fdfdfd'}
              >
                {columns.map((col) => (
                  <td 
                    key={col.accessor} 
                    style={{ 
                      padding: '10px', 
                      textAlign: col.textAlign || 'left', // Allow column-specific text alignment
                      color: '#444' // Slightly lighter text for data cells
                    }}
                  >
                    {row[col.accessor] !== undefined && row[col.accessor] !== null ? String(row[col.accessor]) : ''}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
