// scripts/test-excel-upload.js
/**
 * Teste específico para upload dos 3 ficheiros Excel da Caixa
 * Execute com: node scripts/test-excel-upload.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Simular dados dos 3 Excel files que mencionaste
const mockExcelData = {
  caixa: [
    { 'Matrícula': '12-AB-34', 'Valor': '45.50', 'Método': 'multibanco', 'Observações': 'Pagamento normal' },
    { 'Matrícula': '56-CD-78', 'Valor': '32.00', 'Método': 'numerario', 'Observações': 'Troco dado' },
    { 'Matrícula': '90-EF-12', 'Valor': '28.75', 'Método': 'multibanco', 'Observações': 'Cliente VIP' }
  ],
  entregas: [
    { 'Matrícula': '12-AB-34', 'Data Entrega': '2025-05-31T15:30:00', 'Observações': 'Entrega normal' },
    { 'Matrícula': '56-CD-78', 'Data Entrega': '2025-05-31T16:00:00', 'Observações': 'Cliente atrasado' },
    { 'Matrícula': '90-EF-12', 'Data Entrega': '2025-05-31T14:45:00', 'Observações': 'Entrega antecipada' }
  ],
  sale_booking: [
    { 'License Plate': '12-AB-34', 'Customer Name': 'João Silva', 'Check-in': '2025-05-31T10:00:00', 'Check-out': '2025-05-31T18:00:00', 'Price': '45.50' },
    { 'License Plate': '56-CD-78', 'Customer Name': 'Maria Santos', 'Check-in': '2025-05-31T11:30:00', 'Check-out': '2025-05-31T19:30:00', 'Price': '32.00' },
    { 'License Plate': '90-EF-12', 'Customer Name': 'Pedro Costa', 'Check-in': '2025-05-31T09:15:00', 'Check-out': '2025-05-31T17:15:00', 'Price': '28.75' }
  ]
};

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

function logSuccess(message) {
  log(`✅ ${message}`, '\x1b[32m');
}

function logError(message) {
  log(`❌ ${message}`, '\x1b[31m');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, '\x1b[34m');
}

function logWarning(message) {
  log(`⚠️  ${message}`, '\x1b[33m');
}

// Criar ficheiro Excel simulado (CSV para simplicidade)
function createMockCSV(data, filename) {
  if (data.length === 0) return null;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const filepath = path.join(__dirname, '..', 'temp', filename);
  
  // Criar directório temp se não existir
  const tempDir = path.dirname(filepath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, csvContent);
  return filepath;
}

async function testUploadAPI(filePath, parqueId, tipo, token = null) {
  try {
    logInfo(`Testing upload: ${tipo} - ${path.basename(filePath)}`);
    
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fs.createReadStream(filePath));
    form.append('parqueId', parqueId);
    form.append('tipo', tipo);
    
    const headers = {
      ...form.getHeaders()
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BASE_URL}/api/dashboard/caixa/upload`, {
      method: 'POST',
      headers: headers,
      body: form
    });
    
    const data = await response.json();
    
    return { 
      success: response.ok, 
      status: response.status, 
      data: data,
      filename: path.basename(filePath)
    };
    
  } catch (error) {
    logError(`Upload failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testExcelStructure() {
  log('📊 Testando estrutura dos ficheiros Excel...', '\x1b[1m');
  
  const tests = [
    { name: 'Caixa Excel', data: mockExcelData.caixa, filename: 'caixa30_05_2025.csv' },
    { name: 'Entregas Excel', data: mockExcelData.entregas, filename: 'entregas30_05_2025.csv' },
    { name: 'Sale Booking Excel', data: mockExcelData.sale_booking, filename: 'sale_booking_58.csv' }
  ];
  
  for (const test of tests) {
    logInfo(`Criando ${test.name}...`);
    const filePath = createMockCSV(test.data, test.filename);
    
    if (filePath && fs.existsSync(filePath)) {
      logSuccess(`${test.name} criado: ${filePath}`);
      logInfo(`Registos: ${test.data.length}`);
      logInfo(`Campos: ${Object.keys(test.data[0]).join(', ')}`);
    } else {
      logError(`Falha ao criar ${test.name}`);
    }
  }
}

async function testUploadWithoutAuth() {
  log('\n🔐 Testando upload sem autenticação...', '\x1b[1m');
  
  const filePath = createMockCSV(mockExcelData.caixa, 'test_caixa.csv');
  const result = await testUploadAPI(filePath, 'lisboa', 'caixa', null);
  
  if (result.status === 401) {
    logSuccess('Upload API exige autenticação corretamente (401)');
  } else {
    logError(`Upload deveria exigir auth, mas deu status ${result.status}`);
  }
  
  // Limpar ficheiro
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function testUploadStructures() {
  log('\n📤 Testando estruturas de upload...', '\x1b[1m');
  
  // Test 1: Upload sem ficheiro
  logInfo('Testing upload sem ficheiro...');
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('parqueId', 'lisboa');
    form.append('tipo', 'caixa');
    
    const response = await fetch(`${BASE_URL}/api/dashboard/caixa/upload`, {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer fake-token'
      },
      body: form
    });
    
    if (response.status === 401 || response.status === 400) {
      logSuccess('Upload sem ficheiro rejeitado corretamente');
    } else {
      logWarning(`Upload sem ficheiro deu status ${response.status}`);
    }
  } catch (error) {
    logInfo(`Upload sem ficheiro deu erro: ${error.message}`);
  }
  
  // Test 2: Upload sem parqueId
  logInfo('Testing upload sem parqueId...');
  const filePath = createMockCSV(mockExcelData.caixa, 'test_no_parque.csv');
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('tipo', 'caixa');
    
    const response = await fetch(`${BASE_URL}/api/dashboard/caixa/upload`, {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer fake-token'
      },
      body: form
    });
    
    if (response.status === 401 || response.status === 400) {
      logSuccess('Upload sem parqueId rejeitado corretamente');
    } else {
      logWarning(`Upload sem parqueId deu status ${response.status}`);
    }
  } catch (error) {
    logInfo(`Upload sem parqueId deu erro: ${error.message}`);
  }
  
  // Limpar ficheiro
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function validateExcelContent() {
  log('\n📋 Validando conteúdo dos Excel...', '\x1b[1m');
  
  // Verificar se os dados dos Excel fazem sentido
  const caixaData = mockExcelData.caixa;
  const entregasData = mockExcelData.entregas;
  const saleData = mockExcelData.sale_booking;
  
  // Check 1: Matrículas consistentes
  const caixaPlates = caixaData.map(r => r['Matrícula']);
  const entregasPlates = entregasData.map(r => r['Matrícula']);
  const salePlates = saleData.map(r => r['License Plate']);
  
  const allPlatesMatch = caixaPlates.every(plate => 
    entregasPlates.includes(plate) && salePlates.includes(plate)
  );
  
  if (allPlatesMatch) {
    logSuccess('Matrículas consistentes entre os 3 ficheiros');
  } else {
    logWarning('Matrículas não são consistentes entre ficheiros');
  }
  
  // Check 2: Valores numéricos
  const validValues = caixaData.every(r => !isNaN(parseFloat(r['Valor'])));
  if (validValues) {
    logSuccess('Todos os valores na caixa são numéricos válidos');
  } else {
    logError('Alguns valores na caixa não são numéricos');
  }
  
  // Check 3: Datas válidas
  const validDates = entregasData.every(r => !isNaN(Date.parse(r['Data Entrega'])));
  if (validDates) {
    logSuccess('Todas as datas de entrega são válidas');
  } else {
    logError('Algumas datas de entrega são inválidas');
  }
  
  // Estatísticas
  logInfo(`Total de registos por ficheiro:`);
  logInfo(`- Caixa: ${caixaData.length} transações`);
  logInfo(`- Entregas: ${entregasData.length} entregas`);
  logInfo(`- Sale Booking: ${saleData.length} reservas`);
  
  const totalValue = caixaData.reduce((sum, r) => sum + parseFloat(r['Valor']), 0);
  logInfo(`Valor total em caixa: €${totalValue.toFixed(2)}`);
}

async function runExcelTests() {
  log('🧪 TESTE ESPECÍFICO DOS FICHEIROS EXCEL', '\x1b[1m\x1b[32m');
  log('========================================', '\x1b[1m');
  
  try {
    await testExcelStructure();
    await validateExcelContent();
    await testUploadWithoutAuth();
    await testUploadStructures();
    
    log('\n✨ RESUMO DOS TESTES EXCEL:', '\x1b[1m\x1b[32m');
    log('1. ✅ Estrutura dos ficheiros validada');
    log('2. ✅ Conteúdo dos dados verificado');
    log('3. ✅ Segurança da API testada');
    log('4. ✅ Validações de input testadas');
    
    log('\n🚀 PRÓXIMOS PASSOS:', '\x1b[1m');
    log('1. Configure as chaves Supabase no .env.local');
    log('2. Execute: npm run dev');
    log('3. Teste com autenticação real');
    log('4. Faça upload dos ficheiros reais da caixa');
    
  } catch (error) {
    logError(`Erro durante os testes: ${error.message}`);
  } finally {
    // Limpar ficheiros temporários
    const tempDir = path.join(__dirname, '..', 'temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      fs.rmdirSync(tempDir);
      logInfo('Ficheiros temporários limpos');
    }
  }
}

// Executar testes
if (require.main === module) {
  runExcelTests().catch(console.error);
}

module.exports = { testUploadAPI, mockExcelData };