// components/shared/FileChooser.js
import React, { useState, useRef } from 'react';

export default function FileChooser({ 
  onFileSelect, 
  accept, 
  label = "Selecionar ficheiro", 
  buttonLabel = "Procurar...",
  id = "file-upload" // Allow custom ID for multiple instances
}) {
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      if (onFileSelect) { // Check if onFileSelect is provided
        onFileSelect(file);
      }
    } else {
      setFileName('');
      if (onFileSelect) { // Check if onFileSelect is provided
        onFileSelect(null);
      }
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click(); // Programmatically click the hidden file input
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '10px 0' }}>
      {label && (
        <label 
          htmlFor={id + "-button"} // Point label to the button for better UX
          style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '1rem', 
            color: '#333', 
            fontWeight: 'bold' 
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        ref={inputRef}
        style={{ display: 'none' }} // Hide the default input
      />
      <button
        id={id + "-button"}
        type="button" // Important to prevent form submission if inside a form
        onClick={handleButtonClick}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          marginRight: '10px',
          transition: 'background-color 0.2s ease',
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
      >
        {buttonLabel}
      </button>
      {fileName && (
        <span style={{ fontSize: '0.9rem', color: '#555', display: 'inline-block', verticalAlign: 'middle' }}>
          Selecionado: {fileName}
        </span>
      )}
    </div>
  );
}
