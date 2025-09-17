// zello-api-final.js
// Script final para integração com Zello Work API

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
  // Verificar se temos sessão em cache
  if (cachedSession && sessionExpiry && new Date() < sessionExpiry) {
    console.log('  ℹ️  Usando sessão em cache');
    return cachedSession;
  }

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
    console.log('  ✅ Sessão obtida');

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
      console.log('❌ Erro no login:', loginResult.data);
      return null;
    }

    console.log('  ✅ Login bem-sucedido!');

    // Guardar sessão em cache (válida por 30 minutos)
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

  // Adicionar sid aos parâmetros
  const fullPath = path.includes('?') ? `${path}&sid=${sid}` : `${path}?sid=${sid}`;

  return makeRequest(fullPath, method, params);
}

// ===========================
// FUNÇÕES PRINCIPAIS DA API
// ===========================

// Buscar mensagens de voz
async function getVoiceMessages(fromDate = null, toDate = null) {
  console.log('\n🎙️ Buscando mensagens de voz...');

  // Usar hoje se não fornecidas datas
  const today = new Date().toISOString().split('T')[0];
  const from = fromDate || today;
  const to = toDate || today;

  const params = {
    from: `${from} 00:00:00`,
    to: `${to} 23:59:59`,
    max: 1000  // Máximo de mensagens
  };

  const result = await authenticatedRequest('/history/messages', 'GET', params);

  if (result.success && result.data.messages) {
    const messages = result.data.messages;
    console.log(`✅ Encontradas ${messages.length} mensagens`);

    // Processar mensagens
    const processedMessages = messages.map(msg => ({
      id: msg.id,
      type: msg.type,
      timestamp: new Date(msg.ts * 1000),  // Converter Unix timestamp
      sender: msg.sender,
      recipient: msg.recipient,
      author_full_name: msg.author_full_name,
      duration: msg.duration || 0,
      channel: msg.recipient || 'Direct'
    }));

    // Estatísticas
    const stats = {
      total: messages.length,
      byType: {},
      bySender: {},
      byChannel: {},
      totalDuration: 0
    };

    processedMessages.forEach(msg => {
      // Por tipo
      stats.byType[msg.type] = (stats.byType[msg.type] || 0) + 1;

      // Por remetente
      stats.bySender[msg.sender] = (stats.bySender[msg.sender] || 0) + 1;

      // Por canal
      stats.byChannel[msg.channel] = (stats.byChannel[msg.channel] || 0) + 1;

      // Duração total
      stats.totalDuration += msg.duration;
    });

    return {
      success: true,
      messages: processedMessages,
      stats: stats
    };
  }

  return { success: false, error: 'No messages found' };
}

// Buscar usuários ativos
async function getActiveUsers() {
  console.log('\n👥 Buscando usuários ativos...');

  // Buscar mensagens recentes para identificar usuários ativos
  const result = await getVoiceMessages();

  if (result.success) {
    const activeUsers = new Set();

    result.messages.forEach(msg => {
      activeUsers.add(msg.sender);
    });

    console.log(`✅ ${activeUsers.size} usuários ativos hoje`);
    return {
      success: true,
      users: Array.from(activeUsers),
      count: activeUsers.size
    };
  }

  return { success: false, error: 'Could not fetch active users' };
}

// Detectar incidentes baseados em comunicações
async function detectCommunicationIncidents(date = null) {
  console.log('\n🚨 Analisando comunicações para detectar incidentes...');

  const result = await getVoiceMessages(date, date);

  if (!result.success) {
    return { success: false, error: 'Could not fetch messages' };
  }

  const incidents = [];

  // Analisar padrões suspeitos
  result.messages.forEach(msg => {
    // Comunicações fora de horário (antes das 6h ou depois das 22h)
    const hour = msg.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      incidents.push({
        type: 'out_of_hours_communication',
        severity: 'medium',
        timestamp: msg.timestamp,
        driver: msg.sender,
        details: `Comunicação fora de horário às ${msg.timestamp.toLocaleTimeString()}`
      });
    }

    // Comunicações muito longas (mais de 2 minutos)
    if (msg.duration > 120) {
      incidents.push({
        type: 'long_communication',
        severity: 'low',
        timestamp: msg.timestamp,
        driver: msg.sender,
        duration: msg.duration,
        details: `Comunicação longa de ${msg.duration} segundos`
      });
    }
  });

  // Detectar usuários com muitas comunicações (possível problema)
  Object.entries(result.stats.bySender).forEach(([sender, count]) => {
    if (count > 20) {  // Mais de 20 comunicações num dia
      incidents.push({
        type: 'excessive_communications',
        severity: 'high',
        driver: sender,
        count: count,
        details: `${count} comunicações num único dia`
      });
    }
  });

  return {
    success: true,
    incidents: incidents,
    total: incidents.length,
    bySeverity: {
      high: incidents.filter(i => i.severity === 'high').length,
      medium: incidents.filter(i => i.severity === 'medium').length,
      low: incidents.filter(i => i.severity === 'low').length
    }
  };
}

// Exportar dados para JSON
async function exportToJSON(filename = null) {
  console.log('\n💾 Exportando dados para JSON...');

  const data = {
    timestamp: new Date().toISOString(),
    network: ZELLO_CONFIG.network,
    messages: await getVoiceMessages(),
    activeUsers: await getActiveUsers(),
    incidents: await detectCommunicationIncidents()
  };

  const outputFile = filename || `zello-export-${Date.now()}.json`;
  const outputPath = path.join(__dirname, outputFile);

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✅ Dados exportados para: ${outputPath}`);

  return outputPath;
}

// ===========================
// PROGRAMA PRINCIPAL
// ===========================

async function main() {
  console.log('\n🚀 ZELLO WORK API - SISTEMA COMPLETO');
  console.log('=====================================\n');

  // 1. Buscar mensagens
  const messages = await getVoiceMessages();
  if (messages.success) {
    console.log('\n📊 Estatísticas de mensagens:');
    console.log(`  Total: ${messages.stats.total}`);
    console.log(`  Duração total: ${Math.round(messages.stats.totalDuration / 60)} minutos`);
    console.log('\n  Top 5 utilizadores:');
    const topUsers = Object.entries(messages.stats.bySender)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    topUsers.forEach(([user, count]) => {
      console.log(`    - ${user}: ${count} mensagens`);
    });
  }

  // 2. Detectar incidentes
  const incidents = await detectCommunicationIncidents();
  if (incidents.success) {
    console.log('\n🚨 Incidentes detectados:');
    console.log(`  Total: ${incidents.total}`);
    console.log(`  Alta severidade: ${incidents.bySeverity.high}`);
    console.log(`  Média severidade: ${incidents.bySeverity.medium}`);
    console.log(`  Baixa severidade: ${incidents.bySeverity.low}`);

    if (incidents.incidents.length > 0) {
      console.log('\n  Primeiros 3 incidentes:');
      incidents.incidents.slice(0, 3).forEach(inc => {
        console.log(`    - [${inc.severity.toUpperCase()}] ${inc.type}: ${inc.details}`);
      });
    }
  }

  // 3. Exportar dados
  const exportPath = await exportToJSON('zello-data-export.json');

  console.log('\n=====================================');
  console.log('✅ Processamento concluído!');
  console.log(`📁 Dados exportados para: ${exportPath}\n`);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

// Exportar funções para uso em outros módulos
module.exports = {
  authenticate,
  authenticatedRequest,
  getVoiceMessages,
  getActiveUsers,
  detectCommunicationIncidents,
  exportToJSON,
  ZELLO_CONFIG
};