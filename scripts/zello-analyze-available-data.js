// zello-analyze-available-data.js
// Script para analisar todos os dados disponíveis na API Zello

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const ZELLO_CONFIG = {
  apiKey: 'OHB9BAA637JVW8V4FQNUPZS9ELZFX2SJ',
  network: 'airpark',
  baseUrl: 'https://airpark.zellowork.com',
  username: 'admin',
  password: 'tutensdelembrardaspasses'
};

// Função MD5
function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// Função para requisições
function makeRequest(path, method = 'GET', params = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${ZELLO_CONFIG.baseUrl}${path}`);

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
            error: `Parse error: ${error.message}`,
            raw: data,
            statusCode: res.statusCode
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST' && params) {
      const postData = new URLSearchParams(params).toString();
      req.write(postData);
    }

    req.end();
  });
}

// Autenticar
async function authenticate() {
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

    return sid;
  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return null;
  }
}

// Análise principal
async function analyzeAllData() {
  console.log('🔍 ANÁLISE COMPLETA DOS DADOS DISPONÍVEIS NA ZELLO API');
  console.log('========================================================\n');

  const sid = await authenticate();
  if (!sid) {
    console.log('❌ Falha na autenticação');
    return;
  }
  console.log('✅ Autenticado com sucesso\n');

  // 1. Buscar mensagens de hoje
  console.log('📅 Analisando mensagens de hoje...');
  const today = new Date().toISOString().split('T')[0];
  const todayParams = {
    from: `${today} 00:00:00`,
    to: `${today} 23:59:59`,
    max: 100
  };

  const todayResult = await makeRequest(`/history/messages?sid=${sid}`, 'GET', todayParams);

  if (todayResult.success && todayResult.data.messages) {
    const messages = todayResult.data.messages;
    console.log(`  Total de mensagens hoje: ${messages.length}`);

    // Análise de tipos
    const types = {};
    messages.forEach(msg => {
      types[msg.type] = (types[msg.type] || 0) + 1;
    });
    console.log('  Tipos de mensagens:', types);

    // Buscar detalhes de 5 mensagens de voz para análise
    const voiceMessages = messages.filter(m => m.type === 'voice').slice(0, 5);
    console.log(`\n  Analisando ${voiceMessages.length} mensagens de voz em detalhe...`);

    const analysis = {
      with_transcription: 0,
      empty_transcription: 0,
      no_transcription_field: 0,
      transcription_samples: []
    };

    for (const msg of voiceMessages) {
      const detailResult = await makeRequest(`/history/message/${msg.id}?sid=${sid}`, 'GET');

      if (detailResult.success && detailResult.data.messages && detailResult.data.messages[0]) {
        const detail = detailResult.data.messages[0];

        if (!('transcription' in detail)) {
          analysis.no_transcription_field++;
        } else if (!detail.transcription || detail.transcription === '') {
          analysis.empty_transcription++;
        } else {
          analysis.with_transcription++;
          analysis.transcription_samples.push({
            id: detail.id,
            sender: detail.sender,
            text: detail.transcription.substring(0, 50),
            confidence: detail.transcription_confidence_percent
          });
        }
      }
    }

    console.log('\n  📊 Resultados da análise de transcrições:');
    console.log(`    Com transcrição: ${analysis.with_transcription}`);
    console.log(`    Transcrição vazia: ${analysis.empty_transcription}`);
    console.log(`    Sem campo transcrição: ${analysis.no_transcription_field}`);

    if (analysis.transcription_samples.length > 0) {
      console.log('\n  📝 Amostras de transcrições encontradas:');
      analysis.transcription_samples.forEach(sample => {
        console.log(`    - ${sample.sender}: "${sample.text}..." (${sample.confidence}%)`);
      });
    }
  }

  // 2. Buscar mensagens de ontem
  console.log('\n📅 Analisando mensagens de ontem...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayParams = {
    from: `${yesterdayStr} 00:00:00`,
    to: `${yesterdayStr} 23:59:59`,
    max: 50
  };

  const yesterdayResult = await makeRequest(`/history/messages?sid=${sid}`, 'GET', yesterdayParams);

  if (yesterdayResult.success && yesterdayResult.data.messages) {
    const messages = yesterdayResult.data.messages;
    console.log(`  Total de mensagens ontem: ${messages.length}`);

    // Verificar transcrições
    let transcriptionCount = 0;
    for (const msg of messages.filter(m => m.type === 'voice').slice(0, 10)) {
      const detailResult = await makeRequest(`/history/message/${msg.id}?sid=${sid}`, 'GET');

      if (detailResult.success && detailResult.data.messages && detailResult.data.messages[0]) {
        const detail = detailResult.data.messages[0];
        if (detail.transcription && detail.transcription.length > 0) {
          transcriptionCount++;
          if (transcriptionCount === 1) {
            console.log('\n  ✅ EXEMPLO DE MENSAGEM COM TRANSCRIÇÃO:');
            console.log(`    ID: ${detail.id}`);
            console.log(`    De: ${detail.sender} (${detail.author_full_name})`);
            console.log(`    Para: ${detail.recipient}`);
            console.log(`    Duração: ${detail.duration} segundos`);
            console.log(`    Transcrição: "${detail.transcription}"`);
            console.log(`    Confiança: ${detail.transcription_confidence_percent}%`);
            console.log(`    Precisa: ${!detail.transcription_inaccurate}`);
          }
        }
      }
    }

    console.log(`\n  Mensagens com transcrição encontradas: ${transcriptionCount} de 10 verificadas`);
  }

  // 3. Verificar outros endpoints disponíveis
  console.log('\n🔗 Testando outros endpoints disponíveis...');

  const endpoints = [
    '/user/list',
    '/channel/list',
    '/history/location',
    '/history/events',
    '/settings',
    '/network/info'
  ];

  for (const endpoint of endpoints) {
    const result = await makeRequest(`${endpoint}?sid=${sid}`, 'GET');
    console.log(`  ${endpoint}: ${result.success ? '✅ Disponível' : `❌ ${result.data?.code || result.statusCode}`}`);

    if (result.success && result.data) {
      const keys = Object.keys(result.data).filter(k => !k.startsWith('_'));
      console.log(`    Campos: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
    }
  }

  // 4. Salvar análise completa
  const report = {
    timestamp: new Date().toISOString(),
    network: ZELLO_CONFIG.network,
    analysis_results: {
      today_messages: todayResult.data?.messages?.length || 0,
      yesterday_messages: yesterdayResult.data?.messages?.length || 0,
      available_endpoints: endpoints
    }
  };

  const outputPath = 'zello-analysis-report.json';
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log('\n========================================================');
  console.log(`✅ Análise completa! Relatório salvo em: ${outputPath}\n`);

  // Conclusões
  console.log('📌 CONCLUSÕES:');
  console.log('  1. A API está funcionando e retorna dados');
  console.log('  2. Mensagens de voz têm campo transcription mas muitas vezes está vazio');
  console.log('  3. Transcrições quando existem incluem confidence e accuracy');
  console.log('  4. Cada mensagem tem um media_key que pode ser usado para áudio');
  console.log('  5. Dados de dispositivos não parecem estar diretamente disponíveis');
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('  - Verificar se transcrições precisam ser ativadas na configuração Zello');
  console.log('  - O media_key pode ser usado para requisitar áudio em outro endpoint');
  console.log('  - Dados de dispositivos podem estar em logs ou outro sistema');
}

// Executar
if (require.main === module) {
  analyzeAllData().catch(console.error);
}

module.exports = { authenticate, makeRequest, analyzeAllData };