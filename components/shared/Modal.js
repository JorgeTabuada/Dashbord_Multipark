// components/shared/Modal.js
import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  // Handle Escape key press for closing the modal
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.6)', // Slightly darker overlay
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000, // Ensure it's on top
        padding: '1rem' // Ensure some padding for very small screens
      }}
      onClick={onClose} // Close modal when clicking on the overlay
    >
      <div 
        style={{ 
          backgroundColor: 'white', 
          padding: '25px', // Increased padding
          borderRadius: '8px', 
          minWidth: '320px', // Slightly increased minWidth
          width: 'auto', // Allow width to grow based on content
          maxWidth: '90%', // Max width relative to viewport
          maxHeight: '90vh', // Max height relative to viewport
          overflowY: 'auto', // Add scroll for content exceeding max height
          boxShadow: '0 5px 20px rgba(0,0,0,0.25)', // Enhanced shadow
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          {title && <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', color: '#333' }}>{title}</h2>}
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.8rem', // Larger close icon
              cursor: 'pointer', 
              color: '#777', // Softer color for close icon
              lineHeight: '1' // Ensure proper alignment
            }}
            aria-label="Close modal" // Accessibility
          >
            &times;
          </button>
        </div>
        <div style={{ flexGrow: 1 }}> {/* Allows content to expand */}
          {children}
        </div>
      </div>
    </div>
  );
}
