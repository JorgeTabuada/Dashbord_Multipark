// zello-download-audio.js
// Script para testar download de áudios da API Zello

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ZELLO_CONFIG = {
  apiKey: 'OHB9BAA637JVW8V4FQNUPZS9ELZFX2SJ',
  network: 'airpark',
  baseUrl: 'https://airpark.zellowork.com',
  username: 'admin',
  password: 'tutensdelembrardaspasses'
};

// Cache de sessão
let cachedSession = null;
let sessionExpiry = null;

// Função para calcular MD5
function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// Função para fazer requisições HTTP
function makeRequest(path, method = 'GET', params = null, returnRaw = false) {
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
      if (returnRaw) {
        // Para downloads de áudio, retornar stream
        resolve({
          success: res.statusCode === 200,
          stream: res,
          statusCode: res.statusCode,
          headers: res.headers
        });
        return;
      }

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
  // Verificar se temos sessão em cache
  if (cachedSession && sessionExpiry && new Date() < sessionExpiry) {
    console.log('  ℹ️  Usando sessão em cache');
    return cachedSession;
  }

  console.log('🔐 Autenticando na API Zello Work...');

  try {
    // Passo 1: Obter sessão
    const sessionResult = await makeRequest('/user/gettoken');

    if (!sessionResult.success) {
      console.log('❌ Erro ao obter sessão:', sessionResult);
      return null;
    }

    const sid = sessionResult.data.sid;
    const token = sessionResult.data.token;

    // Passo 2: Fazer login
    const passwordHash = md5(md5(ZELLO_CONFIG.password) + token + ZELLO_CONFIG.apiKey);

    const loginParams = {
      username: ZELLO_CONFIG.username,
      password: passwordHash
    };

    const loginResult = await makeRequest(`/user/login?sid=${sid}`, 'POST', loginParams);

    if (!loginResult.success || loginResult.data.code !== '200') {
      console.log('❌ Erro no login:', loginResult.data);
      return null;
    }

    console.log('  ✅ Login bem-sucedido!');

    // Guardar sessão em cache
    cachedSession = sid;
    sessionExpiry = new Date(Date.now() + 30 * 60 * 1000);

    return sid;

  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return null;
  }
}

// Função para fazer requisições autenticadas
async function authenticatedRequest(path, method = 'GET', params = null, returnRaw = false) {
  const sid = await authenticate();

  if (!sid) {
    return { success: false, error: 'Authentication failed' };
  }

  // Adicionar sid aos parâmetros
  const fullPath = path.includes('?') ? `${path}&sid=${sid}` : `${path}?sid=${sid}`;

  return makeRequest(fullPath, method, params, returnRaw);
}

// Buscar mensagens de voz com detalhes
async function getVoiceMessagesWithDetails() {
  console.log('\n🎙️ Buscando mensagens de voz com detalhes...');

  const today = new Date().toISOString().split('T')[0];
  const params = {
    from: `${today} 00:00:00`,
    to: `${today} 23:59:59`,
    max: 10  // Buscar apenas 10 para teste
  };

  const result = await authenticatedRequest('/history/messages', 'GET', params);

  if (result.success && result.data.messages) {
    const voiceMessages = result.data.messages.filter(msg => msg.type === 'voice');
    console.log(`✅ Encontradas ${voiceMessages.length} mensagens de voz`);

    return voiceMessages;
  }

  return [];
}

// Testar diferentes endpoints de áudio
async function testAudioEndpoints(messageId) {
  console.log(`\n🔍 Testando endpoints de áudio para mensagem ${messageId}...`);

  const endpoints = [
    `/history/message/${messageId}/audio`,
    `/history/message/${messageId}/download`,
    `/history/messages/${messageId}/audio`,
    `/history/audio/${messageId}`,
    `/message/${messageId}/audio`,
    `/audio/${messageId}`,
    `/history/message?id=${messageId}`,
    `/history/message/download?id=${messageId}`
  ];

  for (const endpoint of endpoints) {
    console.log(`\n  Testando: ${endpoint}`);

    try {
      const result = await authenticatedRequest(endpoint, 'GET', null, true);

      if (result.success) {
        console.log(`    ✅ Endpoint funciona!`);
        console.log(`    Content-Type: ${result.headers['content-type']}`);
        console.log(`    Content-Length: ${result.headers['content-length']}`);

        // Se for áudio, fazer download
        if (result.headers['content-type']?.includes('audio') ||
            result.headers['content-type']?.includes('octet-stream')) {

          const filename = `audio_${messageId}_${Date.now()}.mp3`;
          const filepath = path.join(__dirname, 'downloads', filename);

          // Criar pasta downloads se não existir
          if (!fs.existsSync(path.join(__dirname, 'downloads'))) {
            fs.mkdirSync(path.join(__dirname, 'downloads'));
          }

          // Fazer download
          const file = fs.createWriteStream(filepath);
          result.stream.pipe(file);

          return new Promise((resolve) => {
            file.on('finish', () => {
              console.log(`    📥 Áudio baixado: ${filename}`);
              resolve({ success: true, filepath, endpoint });
            });

            file.on('error', (err) => {
              console.log(`    ❌ Erro ao baixar: ${err.message}`);
              resolve({ success: false, error: err.message });
            });
          });
        }
      } else {
        console.log(`    ❌ Status: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`    ❌ Erro: ${error.message}`);
    }
  }

  return { success: false, error: 'Nenhum endpoint de áudio funcionou' };
}

// Buscar detalhes de uma mensagem específica
async function getMessageDetails(messageId) {
  console.log(`\n📝 Buscando detalhes da mensagem ${messageId}...`);

  // Tentar diferentes endpoints para detalhes
  const endpoints = [
    `/history/message/${messageId}`,
    `/history/messages/${messageId}`,
    `/message/${messageId}`,
    `/history/message?id=${messageId}`
  ];

  for (const endpoint of endpoints) {
    console.log(`  Testando: ${endpoint}`);
    const result = await authenticatedRequest(endpoint, 'GET');

    if (result.success && result.data.code !== '400') {
      console.log(`  ✅ Detalhes encontrados!`);
      return result.data;
    }
  }

  // Tentar buscar via POST com parâmetros
  console.log(`  Testando via POST...`);
  const postResult = await authenticatedRequest('/history/message', 'POST', { id: messageId });

  if (postResult.success) {
    console.log(`  ✅ Detalhes encontrados via POST!`);
    return postResult.data;
  }

  return null;
}

// Programa principal
async function main() {
  console.log('\n🚀 TESTE DE DOWNLOAD DE ÁUDIOS - ZELLO API');
  console.log('============================================\n');

  // 1. Buscar mensagens de voz
  const voiceMessages = await getVoiceMessagesWithDetails();

  if (voiceMessages.length === 0) {
    console.log('❌ Nenhuma mensagem de voz encontrada');
    return;
  }

  // Mostrar primeiras 3 mensagens
  console.log('\n📋 Primeiras 3 mensagens de voz:');
  voiceMessages.slice(0, 3).forEach((msg, idx) => {
    console.log(`\n  ${idx + 1}. ID: ${msg.id}`);
    console.log(`     De: ${msg.sender}`);
    console.log(`     Para: ${msg.recipient}`);
    console.log(`     Duração: ${msg.duration || 0} segundos`);
    console.log(`     Timestamp: ${new Date(msg.ts * 1000).toLocaleString()}`);
  });

  // 2. Tentar baixar o primeiro áudio
  const firstMessage = voiceMessages[0];
  console.log(`\n🎯 Tentando baixar áudio da mensagem ${firstMessage.id}...`);

  // Buscar detalhes da mensagem primeiro
  const messageDetails = await getMessageDetails(firstMessage.id);
  if (messageDetails) {
    console.log('\n📊 Estrutura dos detalhes:');
    console.log(JSON.stringify(messageDetails, null, 2).substring(0, 500));
  }

  // Tentar baixar o áudio
  const downloadResult = await testAudioEndpoints(firstMessage.id);

  if (downloadResult.success) {
    console.log(`\n✅ Áudio baixado com sucesso!`);
    console.log(`📁 Salvo em: ${downloadResult.filepath}`);
    console.log(`🔗 Endpoint que funcionou: ${downloadResult.endpoint}`);
  } else {
    console.log(`\n❌ Não foi possível baixar o áudio`);
    console.log(`   Pode ser necessário uma API diferente ou permissões adicionais`);
  }

  console.log('\n============================================');
  console.log('✅ Teste concluído!\n');
}

// Executar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  authenticate,
  authenticatedRequest,
  getVoiceMessagesWithDetails,
  testAudioEndpoints,
  getMessageDetails
};