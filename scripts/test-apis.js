// scripts/test-apis.js
/**
 * Script para testar todas as APIs do sistema Multipark
 * Execute com: node scripts/test-apis.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Cores para output no terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testAPI(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    logInfo(`Testing: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    if (response.ok) {
      logSuccess(`${endpoint} - Status: ${response.status}`);
      return { success: true, data, status: response.status };
    } else {
      logError(`${endpoint} - Status: ${response.status} - ${data.error || 'Unknown error'}`);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    logError(`${endpoint} - Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('🚀 Iniciando testes das APIs Multipark...', colors.bold);
  log('==========================================', colors.bold);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1: Health Check
  log('\n📊 1. Testando Health Check', colors.yellow);
  const healthResult = await testAPI('/api/health');
  results.total++;
  if (healthResult.success) {
    results.passed++;
    logInfo(`Bases conectadas: Dashboard=${healthResult.data.checks?.dashboard}, Ferramentas=${healthResult.data.checks?.ferramentas}`);
  } else {
    results.failed++;
  }

  // Test 2: APIs sem autenticação (devem dar 401)
  log('\n🔐 2. Testando Segurança (deve dar 401)', colors.yellow);
  
  const securityTests = [
    '/api/dashboard/reservas',
    '/api/dashboard/caixa',
    '/api/ferramentas/rh/colaboradores',
    '/api/auth/profile',
    '/api/unified/dashboard'
  ];

  for (const endpoint of securityTests) {
    const result = await testAPI(endpoint);
    results.total++;
    if (result.status === 401) {
      results.passed++;
      logSuccess(`${endpoint} - Segurança OK (401 sem token)`);
    } else {
      results.failed++;
      logError(`${endpoint} - Falha de segurança! Status: ${result.status}`);
    }
  }

  // Test 3: Métodos não permitidos (deve dar 405)
  log('\n🚫 3. Testando Métodos Não Permitidos (deve dar 405)', colors.yellow);
  
  const methodTests = [
    { endpoint: '/api/health', method: 'POST' },
    { endpoint: '/api/unified/dashboard', method: 'POST' },
    { endpoint: '/api/sync/parques', method: 'GET' }
  ];

  for (const test of methodTests) {
    const result = await testAPI(test.endpoint, { method: test.method });
    results.total++;
    if (result.status === 405) {
      results.passed++;
      logSuccess(`${test.method} ${test.endpoint} - Método rejeitado corretamente (405)`);
    } else {
      results.failed++;
      logError(`${test.method} ${test.endpoint} - Deveria dar 405, mas deu ${result.status}`);
    }
  }

  // Test 4: Estrutura de resposta do Health Check
  log('\n🏥 4. Verificando Estrutura do Health Check', colors.yellow);
  if (healthResult.success && healthResult.data) {
    const expectedFields = ['status', 'checks', 'version', 'environment'];
    const hasAllFields = expectedFields.every(field => 
      healthResult.data.hasOwnProperty(field)
    );
    
    results.total++;
    if (hasAllFields) {
      results.passed++;
      logSuccess('Health Check tem todos os campos esperados');
      logInfo(`Versão: ${healthResult.data.version}`);
      logInfo(`Environment: ${healthResult.data.environment}`);
    } else {
      results.failed++;
      logError('Health Check não tem todos os campos esperados');
    }
  }

  // Test 5: Sync API (deve dar 403 sem role de admin)
  log('\n👑 5. Testando Permissões de Admin', colors.yellow);
  const syncResult = await testAPI('/api/sync/parques', { 
    method: 'POST',
    headers: { 'x-user-role': 'user' }
  });
  results.total++;
  if (syncResult.status === 403) {
    results.passed++;
    logSuccess('Sync API rejeitou utilizador não-admin corretamente (403)');
  } else {
    results.failed++;
    logError(`Sync API deveria dar 403, mas deu ${syncResult.status}`);
  }

  // Test 6: Upload API structure
  log('\n📤 6. Testando Estrutura da API de Upload', colors.yellow);
  const uploadResult = await testAPI('/api/dashboard/caixa/upload', { method: 'POST' });
  results.total++;
  if (uploadResult.status === 401) {
    results.passed++;
    logSuccess('Upload API exige autenticação corretamente');
  } else {
    results.failed++;
    logError(`Upload API deveria exigir auth (401), mas deu ${uploadResult.status}`);
  }

  // Resumo final
  log('\n📋 RESUMO DOS TESTES', colors.bold);
  log('==================', colors.bold);
  log(`Total de testes: ${results.total}`);
  logSuccess(`Testes passaram: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Testes falharam: ${results.failed}`);
  }
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  if (successRate >= 90) {
    logSuccess(`Taxa de sucesso: ${successRate}% 🎉`);
    log('\n✨ Sistema parece estar funcionando bem!', colors.green);
  } else if (successRate >= 70) {
    logWarning(`Taxa de sucesso: ${successRate}% ⚠️`);
    log('\n🔧 Sistema funcional mas precisa de ajustes', colors.yellow);
  } else {
    logError(`Taxa de sucesso: ${successRate}% ❌`);
    log('\n🚨 Sistema precisa de correções importantes!', colors.red);
  }

  // Próximos passos
  log('\n🚀 PRÓXIMOS PASSOS SUGERIDOS:', colors.bold);
  log('1. Configure as variáveis de ambiente (.env.local)');
  log('2. Inicie o servidor: npm run dev');
  log('3. Execute testes com autenticação real');
  log('4. Teste upload de ficheiros Excel');
  log('5. Verifique logs do servidor para erros detalhados');
}

// Executar testes
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };