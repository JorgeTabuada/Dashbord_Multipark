// zello-test-transcription.js
// Script para testar transcrição e detalhes de áudio da API Zello

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
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      const chunks = [];

      res.on('data', (chunk) => {
        data += chunk;
        chunks.push(chunk);
      });

      res.on('end', () => {
        // Verificar se é binário (áudio)
        const contentType = res.headers['content-type'] || '';

        if (contentType.includes('audio') || contentType.includes('octet-stream')) {
          // É áudio binário
          const buffer = Buffer.concat(chunks);
          resolve({
            success: res.statusCode === 200,
            isAudio: true,
            buffer: buffer,
            contentType: contentType,
            statusCode: res.statusCode
          });
        } else {
          // É JSON ou texto
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
              error: `Parse error: ${error.message}`,
              raw: data,
              statusCode: res.statusCode
            });
          }
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
    return cachedSession;
  }

  console.log('🔐 Autenticando...');

  try {
    const sessionResult = await makeRequest('/user/gettoken');
    if (!sessionResult.success) return null;

    const sid = sessionResult.data.sid;
    const token = sessionResult.data.token;

    const passwordHash = md5(md5(ZELLO_CONFIG.password) + token + ZELLO_CONFIG.apiKey);
    const loginParams = {
      username: ZELLO_CONFIG.username,
      password: passwordHash
    };

    const loginResult = await makeRequest(`/user/login?sid=${sid}`, 'POST', loginParams);
    if (!loginResult.success || loginResult.data.code !== '200') return null;

    cachedSession = sid;
    sessionExpiry = new Date(Date.now() + 30 * 60 * 1000);

    return sid;

  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return null;
  }
}

// Função para fazer requisições autenticadas
async function authenticatedRequest(path, method = 'GET', params = null) {
  const sid = await authenticate();
  if (!sid) {
    return { success: false, error: 'Authentication failed' };
  }

  const fullPath = path.includes('?') ? `${path}&sid=${sid}` : `${path}?sid=${sid}`;
  return makeRequest(fullPath, method, params);
}

// Buscar detalhes completos de uma mensagem
async function getFullMessageDetails(messageId) {
  console.log(`\n📝 Buscando detalhes completos da mensagem ${messageId}...`);

  // Testar endpoint específico de detalhes
  const result = await authenticatedRequest(`/history/message/${messageId}`, 'GET');

  if (result.success && result.data.messages) {
    const message = result.data.messages[0];
    console.log('\n📊 Detalhes da mensagem:');
    console.log(`  ID: ${message.id}`);
    console.log(`  Tipo: ${message.type}`);
    console.log(`  De: ${message.sender} (${message.author_full_name})`);
    console.log(`  Para: ${message.recipient}`);
    console.log(`  Duração: ${message.duration || 0} segundos`);

    // Verificar campos adicionais
    const fields = Object.keys(message);
    console.log(`\n  Campos disponíveis: ${fields.join(', ')}`);

    // Procurar por campos relacionados a transcrição ou áudio
    const transcriptionFields = fields.filter(f =>
      f.toLowerCase().includes('transcript') ||
      f.toLowerCase().includes('text') ||
      f.toLowerCase().includes('speech') ||
      f.toLowerCase().includes('audio_url') ||
      f.toLowerCase().includes('download')
    );

    if (transcriptionFields.length > 0) {
      console.log(`\n  🎯 Campos de transcrição encontrados: ${transcriptionFields.join(', ')}`);
      transcriptionFields.forEach(field => {
        console.log(`    ${field}: ${message[field]}`);
      });
    }

    return message;
  }

  return null;
}

// Testar endpoints de transcrição
async function testTranscriptionEndpoints(messageId) {
  console.log(`\n🔍 Testando endpoints de transcrição para mensagem ${messageId}...`);

  const endpoints = [
    { path: `/history/message/${messageId}/transcript`, method: 'GET' },
    { path: `/history/message/${messageId}/transcription`, method: 'GET' },
    { path: `/history/message/${messageId}/text`, method: 'GET' },
    { path: `/transcript/${messageId}`, method: 'GET' },
    { path: `/transcription/${messageId}`, method: 'GET' },
    { path: `/speech-to-text/${messageId}`, method: 'GET' },
    { path: `/history/transcript`, method: 'POST', params: { message_id: messageId } },
    { path: `/history/transcription`, method: 'POST', params: { message_id: messageId } }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n  Testando: ${endpoint.path} (${endpoint.method})`);

    try {
      const result = await authenticatedRequest(endpoint.path, endpoint.method, endpoint.params);

      if (result.success && result.data.code !== '400' && result.data.code !== '404') {
        console.log(`    ✅ Endpoint funciona!`);
        console.log(`    Resposta:`, JSON.stringify(result.data).substring(0, 200));

        // Verificar se há transcrição
        if (result.data.transcript || result.data.text || result.data.transcription) {
          console.log(`\n    🎯 TRANSCRIÇÃO ENCONTRADA!`);
          const text = result.data.transcript || result.data.text || result.data.transcription;
          console.log(`    Texto: "${text}"`);
          return { success: true, text, endpoint: endpoint.path };
        }
      } else {
        const code = result.data?.code || result.statusCode;
        console.log(`    ❌ Código: ${code}`);
      }
    } catch (error) {
      console.log(`    ❌ Erro: ${error.message}`);
    }
  }

  return { success: false, error: 'Nenhum endpoint de transcrição encontrado' };
}

// Testar download direto de áudio
async function testDirectAudioDownload(messageId) {
  console.log(`\n💾 Testando download direto de áudio...`);

  // Tentar com diferentes headers
  const configs = [
    { Accept: 'audio/mpeg' },
    { Accept: 'audio/*' },
    { Accept: 'application/octet-stream' },
    { Accept: '*/*' }
  ];

  for (const config of configs) {
    console.log(`  Tentando com Accept: ${config.Accept}`);

    const sid = await authenticate();
    const url = new URL(`${ZELLO_CONFIG.baseUrl}/history/message/${messageId}/audio?sid=${sid}`);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Accept': config.Accept,
        'Authorization': `Bearer ${ZELLO_CONFIG.apiKey}`
      }
    };

    const result = await new Promise((resolve) => {
      https.get(options, (res) => {
        const contentType = res.headers['content-type'];
        console.log(`    Content-Type recebido: ${contentType}`);

        if (contentType && contentType.includes('audio')) {
          console.log(`    ✅ Áudio detectado!`);

          // Fazer download
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const filename = `audio_${messageId}.mp3`;
            const filepath = path.join(__dirname, filename);

            fs.writeFileSync(filepath, buffer);
            console.log(`    📥 Áudio salvo: ${filename} (${buffer.length} bytes)`);
            resolve({ success: true, filepath });
          });
        } else {
          res.on('data', () => {});
          res.on('end', () => resolve({ success: false }));
        }
      }).on('error', (err) => {
        console.log(`    ❌ Erro: ${err.message}`);
        resolve({ success: false });
      });
    });

    if (result.success) {
      return result;
    }
  }

  return { success: false };
}

// Programa principal
async function main() {
  console.log('\n🚀 TESTE DE TRANSCRIÇÃO E ÁUDIO - ZELLO API');
  console.log('=============================================\n');

  // Buscar mensagens recentes
  console.log('📋 Buscando mensagens de voz recentes...');
  const params = {
    from: `${new Date().toISOString().split('T')[0]} 00:00:00`,
    to: `${new Date().toISOString().split('T')[0]} 23:59:59`,
    max: 5
  };

  const result = await authenticatedRequest('/history/messages', 'GET', params);

  if (!result.success || !result.data.messages) {
    console.log('❌ Erro ao buscar mensagens');
    return;
  }

  const voiceMessages = result.data.messages.filter(m => m.type === 'voice');
  console.log(`✅ Encontradas ${voiceMessages.length} mensagens de voz\n`);

  if (voiceMessages.length === 0) {
    console.log('❌ Nenhuma mensagem de voz encontrada');
    return;
  }

  // Testar com a primeira mensagem
  const testMessage = voiceMessages[0];
  console.log(`🎯 Testando com mensagem ${testMessage.id}`);
  console.log(`   De: ${testMessage.sender}`);
  console.log(`   Duração: ${testMessage.duration || 0} segundos`);

  // 1. Buscar detalhes completos
  const details = await getFullMessageDetails(testMessage.id);

  // 2. Testar endpoints de transcrição
  const transcriptionResult = await testTranscriptionEndpoints(testMessage.id);

  if (transcriptionResult.success) {
    console.log('\n✅ TRANSCRIÇÃO DISPONÍVEL!');
    console.log(`📝 Texto: "${transcriptionResult.text}"`);
    console.log(`🔗 Endpoint: ${transcriptionResult.endpoint}`);
  } else {
    console.log('\n⚠️  Transcrição não disponível via API');
    console.log('   A API Zello pode não fornecer transcrições automáticas');
  }

  // 3. Testar download de áudio
  const audioResult = await testDirectAudioDownload(testMessage.id);

  if (audioResult.success) {
    console.log('\n✅ ÁUDIO BAIXADO COM SUCESSO!');
    console.log(`📁 Arquivo: ${audioResult.filepath}`);
  } else {
    console.log('\n⚠️  Download de áudio não disponível');
    console.log('   Pode ser necessário usar a aplicação Zello ou outra API');
  }

  console.log('\n=============================================');
  console.log('✅ Teste concluído!\n');
  console.log('📌 Observações:');
  console.log('   - A API pode ter restrições de segurança para áudios');
  console.log('   - Transcrições podem não estar disponíveis automaticamente');
  console.log('   - Considere usar serviços de Speech-to-Text externos se necessário');
}

// Executar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  authenticate,
  authenticatedRequest,
  getFullMessageDetails,
  testTranscriptionEndpoints,
  testDirectAudioDownload
};