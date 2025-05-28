import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import withAuth from '../../components/withAuth';
import FileChooser from '../../components/shared/FileChooser';

const sectionStyle = {
  marginBottom: '35px', // Increased bottom margin
  padding: '20px', // Increased padding
  border: '1px solid #e0e0e0', // Lighter border
  borderRadius: '8px', // More rounded corners
  backgroundColor: '#f9f9f9', // Slightly off-white background for sections
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)' // Subtle shadow
};

const statusStyle = {
  marginTop: '10px',
  padding: '8px',
  borderRadius: '4px',
  fontSize: '0.9rem',
  backgroundColor: '#e9ecef', // Light gray background for status
  border: '1px solid #ced4da' // Border for status
};

const errorStatusStyle = {
  ...statusStyle,
  backgroundColor: '#f8d7da',
  color: '#721c24',
  border: '1px solid #f5c6cb'
};

const successStatusStyle = {
  ...statusStyle,
  backgroundColor: '#d4edda',
  color: '#155724',
  border: '1px solid #c3e6cb'
};

const buttonStyle = {
  marginTop: '10px',
  padding: '10px 15px',
  backgroundColor: '#28a745', // Green for process button
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  transition: 'background-color 0.2s ease',
};

function CaixaImportarPage({ userData }) { // userData comes from withAuth
  const router = useRouter();
  const { parque } = router.query; // Get 'parque' from URL query

  const [odooFile, setOdooFile] = useState(null);
  const [backofficeFile, setBackofficeFile] = useState(null);
  const [caixaFile, setCaixaFile] = useState(null); // For now, a single Caixa file

  const [odooStatus, setOdooStatus] = useState({ message: 'Aguardando ficheiro Odoo...', type: 'info' });
  const [backofficeStatus, setBackofficeStatus] = useState({ message: 'Aguardando ficheiro BackOffice...', type: 'info' });
  const [caixaStatus, setCaixaStatus] = useState({ message: 'Aguardando ficheiro Caixa...', type: 'info' });

  const handleFileSelect = (file, type) => {
    const statusSetter = {
      odoo: setOdooStatus,
      backoffice: setBackofficeStatus,
      caixa: setCaixaStatus,
    }[type];

    const fileSetter = {
      odoo: setOdooFile,
      backoffice: setBackofficeFile,
      caixa: setCaixaFile,
    }[type];

    fileSetter(file);
    statusSetter(file ? { message: `Ficheiro selecionado: ${file.name}`, type: 'info' } : { message: `Aguardando ficheiro ${type}...`, type: 'info' });
  };

  const processFile = async (fileType) => {
    let file, statusSetter, currentStatus;
    
    switch(fileType) {
      case 'odoo':
        file = odooFile;
        statusSetter = setOdooStatus;
        currentStatus = odooStatus;
        break;
      case 'backoffice':
        file = backofficeFile;
        statusSetter = setBackofficeStatus;
        currentStatus = backofficeStatus;
        break;
      case 'caixa':
        file = caixaFile;
        statusSetter = setCaixaStatus;
        currentStatus = caixaStatus;
        break;
      default:
        return;
    }

    if (!file) {
      statusSetter({ message: 'Nenhum ficheiro selecionado.', type: 'error' });
      return;
    }

    statusSetter({ message: `Processando ${file.name}...`, type: 'info' });
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Placeholder for actual processing logic from lib/fileProcessing.js
    // For now, simulate success or error randomly for demonstration
    const isSuccess = Math.random() > 0.3; // 70% chance of success
    if (isSuccess) {
      statusSetter({ message: `Ficheiro ${file.name} processado com sucesso (simulado).`, type: 'success' });
    } else {
      statusSetter({ message: `Erro ao processar ${file.name} (simulado). Verifique o formato.`, type: 'error' });
    }
  };
  
  const getStatusStyle = (statusType) => {
    if (statusType === 'error') return errorStatusStyle;
    if (statusType === 'success') return successStatusStyle;
    return statusStyle; // Default info style
  }

  return (
    <Layout subAppName="Caixa Multipark - Importação" currentPark={parque} userData={userData}>
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}> {/* Centered content with max-width */}
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Importação de Ficheiros para Reconciliação</h2>

        <div style={{ ...sectionStyle, backgroundColor: '#e6f7ff', borderLeft: '5px solid #1890ff' }}> {/* Highlighted instructions */}
          <h3>Instruções e Recomendações</h3>
          <p><strong>Formatos esperados:</strong></p>
          <ul>
            <li>Odoo: <code>.xlsx</code> (Ex: <code>odoo_YYYY-MM-DD.xlsx</code>)</li>
            <li>BackOffice: <code>.xlsx</code> (Ex: <code>backoffice_YYYY-MM-DD.xlsx</code>)</li>
            <li>Caixa: <code>.xlsx</code>, <code>.csv</code> (Ex: <code>caixa_YYYY-MM-DD_HHMMSS.xlsx</code>)</li>
          </ul>
          <p><strong>Fluxo Recomendado:</strong></p>
          <ol>
            <li>Carregue os ficheiros <strong>Odoo</strong> e <strong>BackOffice</strong> referentes ao dia anterior primeiro.</li>
            <li>De seguida, carregue os ficheiros <strong>Caixa</strong> à medida que são gerados ao longo do dia.</li>
          </ol>
          <p style={{marginTop: '10px', fontSize: '0.9em', color: '#555'}}>Certifique-se que os nomes dos ficheiros seguem as convenções indicadas.</p>
        </div>

        {/* Odoo File Upload */}
        <section style={sectionStyle}>
          <h4 style={{marginTop: 0, marginBottom: '15px', borderBottom: '2px solid #1890ff', paddingBottom: '10px', color: '#1890ff'}}>Ficheiro Odoo</h4>
          <FileChooser
            id="odoo-file"
            onFileSelect={(file) => handleFileSelect(file, 'odoo')}
            accept=".xlsx"
            label="Ficheiro Odoo do dia anterior (.xlsx)"
            buttonLabel="Selecionar Odoo..."
          />
          <div style={getStatusStyle(odooStatus.type)}>{odooStatus.message}</div>
          {odooFile && <button onClick={() => processFile('odoo')} style={{...buttonStyle, backgroundColor: '#1890ff'}} onMouseOver={e => e.currentTarget.style.backgroundColor = '#40a9ff'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#1890ff'}>Processar Odoo</button>}
        </section>

        {/* BackOffice File Upload */}
        <section style={sectionStyle}>
          <h4 style={{marginTop: 0, marginBottom: '15px', borderBottom: '2px solid #1890ff', paddingBottom: '10px', color: '#1890ff'}}>Ficheiro BackOffice</h4>
          <FileChooser
            id="backoffice-file"
            onFileSelect={(file) => handleFileSelect(file, 'backoffice')}
            accept=".xlsx"
            label="Ficheiro BackOffice do dia anterior (.xlsx)"
            buttonLabel="Selecionar BackOffice..."
          />
          <div style={getStatusStyle(backofficeStatus.type)}>{backofficeStatus.message}</div>
          {backofficeFile && <button onClick={() => processFile('backoffice')} style={{...buttonStyle, backgroundColor: '#1890ff'}} onMouseOver={e => e.currentTarget.style.backgroundColor = '#40a9ff'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#1890ff'}}>Processar BackOffice</button>}
        </section>

        {/* Caixa File Upload */}
        <section style={sectionStyle}>
          <h4 style={{marginTop: 0, marginBottom: '15px', borderBottom: '2px solid #1890ff', paddingBottom: '10px', color: '#1890ff'}}>Ficheiro Caixa</h4>
          <FileChooser
            id="caixa-file"
            onFileSelect={(file) => handleFileSelect(file, 'caixa')}
            accept=".xlsx, .csv"
            label="Ficheiro de Caixa (atual) (.xlsx, .csv)"
            buttonLabel="Selecionar Caixa..."
          />
          <div style={getStatusStyle(caixaStatus.type)}>{caixaStatus.message}</div>
          {caixaFile && <button onClick={() => processFile('caixa')} style={{...buttonStyle, backgroundColor: '#1890ff'}} onMouseOver={e => e.currentTarget.style.backgroundColor = '#40a9ff'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#1890ff'}}>Processar Caixa</button>}
          {/* TODO: Add mechanism for multiple Caixa files later */}
        </section>
      </div>
    </Layout>
  );
}

export default withAuth(CaixaImportarPage);
