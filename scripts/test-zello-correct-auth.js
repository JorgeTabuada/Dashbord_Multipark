// test-zello-correct-auth.js
// Script corrigido para testar a API Zello Work com autenticação correta

const https = require('https');
const crypto = require('crypto');

const ZELLO_CONFIG = {
  apiKey: 'OHB9BAA637JVW8V4FQNUPZS9ELZFX2SJ',
  network: 'airpark',
  baseUrl: 'https://airpark.zellowork.com',
  username: 'admin',  // Ajustar conforme necessário
  password: 'tutensdelembrardaspasses'  // Password configurada
};

// Função para calcular MD5
function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// Função para fazer requisições HTTP
function makeRequest(path, method = 'GET', params = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${ZELLO_CONFIG.baseUrl}${path}`);

    // Se for GET e tiver params, adicionar à URL
    if (method === 'GET' && params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            data: jsonData,
            statusCode: res.statusCode
          });
        } catch (error) {
          resolve({
            success: false,
            error: `JSON parse error: ${error.message}`,
            raw: data,
            statusCode: res.statusCode
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Se for POST e tiver params, enviar no body
    if (method === 'POST' && params) {
      const postData = new URLSearchParams(params).toString();
      req.write(postData);
    }

    req.end();
  });
}

// Função para autenticar na API
async function authenticate() {
  console.log('🔐 Autenticando na API Zello Work...');

  try {
    // Passo 1: Obter sessão
    console.log('  1. Obtendo sessão...');
    const sessionResult = await makeRequest('/user/gettoken');

    if (!sessionResult.success) {
      console.log('❌ Erro ao obter sessão:', sessionResult);
      return null;
    }

    const sid = sessionResult.data.sid;
    const token = sessionResult.data.token;
    console.log('  ✅ Sessão obtida:', { sid: sid.substring(0, 10) + '...' });

    // Passo 2: Fazer login
    console.log('  2. Fazendo login...');

    // Criar hash da password
    const passwordHash = md5(md5(ZELLO_CONFIG.password) + token + ZELLO_CONFIG.apiKey);

    const loginParams = {
      username: ZELLO_CONFIG.username,
      password: passwordHash
    };

    const loginResult = await makeRequest(`/user/login?sid=${sid}`, 'POST', loginParams);

    if (!loginResult.success || loginResult.data.code !== '200') {
      console.log('❌ Erro no login:', loginResult);
      return null;
    }

    console.log('  ✅ Login bem-sucedido!');
    return sid;

  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return null;
  }
}

// Função para fazer requisições autenticadas
async function authenticatedRequest(path, method = 'GET', params = null, sid = null) {
  if (!sid) {
    console.log('❌ Sessão não fornecida');
    return { success: false, error: 'No session' };
  }

  // Adicionar sid aos parâmetros
  const fullPath = path.includes('?') ? `${path}&sid=${sid}` : `${path}?sid=${sid}`;

  return makeRequest(fullPath, method, params);
}

// Testar a API
async function testZelloAPI() {
  console.log('\n🚀 Iniciando teste da API Zello Work\n');
  console.log('=====================================\n');

  // Autenticar
  const sid = await authenticate();

  if (!sid) {
    console.log('\n❌ Falha na autenticação. Verifique as credenciais.');
    return;
  }

  console.log('\n-------------------------------------\n');

  // Teste 1: Listar usuários
  console.log('👥 Listando usuários...');
  const usersResult = await authenticatedRequest('/user/list', 'GET', null, sid);
  if (usersResult.success) {
    const userCount = usersResult.data.users?.length || usersResult.data.length || 0;
    console.log(`✅ Resposta recebida. Total de usuários: ${userCount}`);

    // Verificar estrutura de dados
    if (usersResult.data) {
      console.log('Estrutura de dados:', Object.keys(usersResult.data));

      // Se houver array de usuários
      const users = usersResult.data.users || usersResult.data;
      if (Array.isArray(users) && users.length > 0) {
        console.log(`Primeiros 3 usuários:`, users.slice(0, 3));
      }
    }
  } else {
    console.log('❌ Erro ao listar usuários:', usersResult);
  }

  console.log('\n-------------------------------------\n');

  // Teste 2: Listar canais
  console.log('📻 Listando canais...');
  const channelsResult = await authenticatedRequest('/channel/list', 'GET', null, sid);
  if (channelsResult.success) {
    const channelCount = channelsResult.data.channels?.length || channelsResult.data.length || 0;
    console.log(`✅ Resposta recebida. Total de canais: ${channelCount}`);

    // Verificar estrutura de dados
    if (channelsResult.data) {
      console.log('Estrutura de dados:', Object.keys(channelsResult.data));

      // Se houver array de canais
      const channels = channelsResult.data.channels || channelsResult.data;
      if (Array.isArray(channels) && channels.length > 0) {
        console.log(`Primeiros 3 canais:`, channels.slice(0, 3));
      }
    }
  } else {
    console.log('❌ Erro ao listar canais:', channelsResult);
  }

  console.log('\n-------------------------------------\n');

  // Teste 3: Testar diferentes endpoints de histórico
  console.log('📍 Testando endpoints de histórico...');

  // Tentar diferentes endpoints para histórico
  const historyEndpoints = [
    { path: '/history', method: 'GET' },
    { path: '/history/messages', method: 'GET' },
    { path: '/history/location', method: 'GET' },
    { path: '/location/history', method: 'GET' },
    { path: '/gps/history', method: 'GET' }
  ];

  for (const endpoint of historyEndpoints) {
    console.log(`\n  Testando ${endpoint.path}...`);
    const result = await authenticatedRequest(endpoint.path, endpoint.method, null, sid);

    if (result.success && result.data.code !== '400') {
      console.log(`  ✅ Endpoint funciona!`);
      console.log(`  Resposta:`, JSON.stringify(result.data).substring(0, 200));
      break;
    } else {
      console.log(`  ❌ Não disponível ou erro: ${result.data?.code || result.statusCode}`);
    }
  }

  console.log('\n-------------------------------------\n');

  // Teste 4: Buscar informações do network
  console.log('🌐 Buscando informações do network...');
  const networkResult = await authenticatedRequest('/network', 'GET', null, sid);
  if (networkResult.success) {
    console.log('✅ Informações do network:', networkResult.data);
  } else {
    console.log('❌ Erro ao buscar network:', networkResult.data?.code || networkResult.statusCode);
  }

  console.log('\n=====================================');
  console.log('✅ Teste concluído!\n');
}

// Executar teste
if (require.main === module) {
  // Se não houver password configurada, avisar
  if (!ZELLO_CONFIG.password) {
    console.log('⚠️  AVISO: Password não configurada!');
    console.log('   Por favor, edite o ficheiro e adicione a password correta.');
    console.log('   ZELLO_CONFIG.password = "sua_password_aqui"');
    console.log('');
  }

  testZelloAPI().catch(console.error);
}

module.exports = {
  authenticate,
  authenticatedRequest,
  ZELLO_CONFIG
};