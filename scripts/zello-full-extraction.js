// zello-full-extraction.js
// Script completo para extrair TUDO da API Zello: transcrições, dados de dispositivos, comunicações

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

// Função para autenticar na API
async function authenticate() {
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
    console.log('  ✅ Autenticação bem-sucedida!\n');

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

// ========================================
// FUNÇÕES DE EXTRAÇÃO DE DADOS
// ========================================

// Buscar mensagens com transcrições
async function getMessagesWithTranscriptions(fromDate = null, toDate = null, limit = 50) {
  console.log('📝 Extraindo mensagens com transcrições (limite: 50 para teste)...');

  const today = new Date().toISOString().split('T')[0];
  const params = {
    from: `${fromDate || today} 00:00:00`,
    to: `${toDate || today} 23:59:59`,
    max: limit
  };

  const result = await authenticatedRequest('/history/messages', 'GET', params);

  if (!result.success || !result.data.messages) {
    return [];
  }

  const messages = result.data.messages;
  const transcribedMessages = [];

  // Processar cada mensagem para buscar detalhes completos
  for (const msg of messages) {
    if (msg.type === 'voice') {
      // Buscar detalhes completos incluindo transcrição
      const detailResult = await authenticatedRequest(`/history/message/${msg.id}`, 'GET');

      if (detailResult.success && detailResult.data.messages) {
        const fullMessage = detailResult.data.messages[0];

        const processedMessage = {
          id: fullMessage.id,
          timestamp: new Date(fullMessage.ts * 1000),
          sender: fullMessage.sender,
          sender_full_name: fullMessage.author_full_name,
          recipient: fullMessage.recipient,
          channel: fullMessage.recipient_type === 'channel' ? fullMessage.recipient : null,
          duration_seconds: fullMessage.duration || 0,

          // Dados de transcrição
          transcription: fullMessage.transcription || null,
          transcription_confidence: fullMessage.transcription_confidence_percent || 0,
          transcription_accurate: !fullMessage.transcription_inaccurate,

          // Metadados
          channel_users: fullMessage.channel_users || [],
          media_key: fullMessage.media_key || null
        };

        transcribedMessages.push(processedMessage);

        // Mostrar progresso
        if (transcribedMessages.length % 10 === 0) {
          console.log(`  Processadas ${transcribedMessages.length} mensagens...`);
        }
      }
    }
  }

  console.log(`✅ Total de mensagens com voz: ${transcribedMessages.length}`);
  const withTranscription = transcribedMessages.filter(m => m.transcription);
  console.log(`📝 Com transcrição: ${withTranscription.length}\n`);

  return transcribedMessages;
}

// Extrair dados de usuários e dispositivos
async function getUsersAndDevices() {
  console.log('👥 Extraindo informações de usuários...');

  // Buscar lista de usuários (se disponível)
  const usersResult = await authenticatedRequest('/user/list', 'GET');

  // Buscar informações das mensagens para identificar usuários ativos
  const messagesResult = await authenticatedRequest('/history/messages', 'GET', {
    from: `${new Date().toISOString().split('T')[0]} 00:00:00`,
    to: `${new Date().toISOString().split('T')[0]} 23:59:59`,
    max: 1000
  });

  const users = new Map();

  if (messagesResult.success && messagesResult.data.messages) {
    messagesResult.data.messages.forEach(msg => {
      if (!users.has(msg.sender)) {
        users.set(msg.sender, {
          username: msg.sender,
          full_name: msg.author_full_name || msg.sender,
          first_seen: new Date(msg.ts * 1000),
          last_seen: new Date(msg.ts * 1000),
          message_count: 0,
          total_duration: 0,
          channels_used: new Set()
        });
      }

      const user = users.get(msg.sender);
      user.message_count++;
      user.last_seen = new Date(msg.ts * 1000);
      if (msg.duration) user.total_duration += msg.duration;
      if (msg.recipient) user.channels_used.add(msg.recipient);
    });
  }

  // Converter Map para Array
  const userList = Array.from(users.values()).map(user => ({
    ...user,
    channels_used: Array.from(user.channels_used),
    avg_message_duration: user.message_count > 0 ?
      Math.round(user.total_duration / user.message_count) : 0
  }));

  console.log(`✅ Total de usuários identificados: ${userList.length}\n`);
  return userList;
}

// Analisar padrões de comunicação
async function analyzeCommunicationPatterns(messages) {
  console.log('📊 Analisando padrões de comunicação...');

  const patterns = {
    hourly_distribution: {},
    daily_distribution: {},
    user_interactions: {},
    channel_activity: {},
    transcription_keywords: {},
    emergency_patterns: []
  };

  messages.forEach(msg => {
    // Distribuição por hora
    const hour = msg.timestamp.getHours();
    patterns.hourly_distribution[hour] = (patterns.hourly_distribution[hour] || 0) + 1;

    // Distribuição por dia da semana
    const day = msg.timestamp.toLocaleDateString('pt-PT', { weekday: 'long' });
    patterns.daily_distribution[day] = (patterns.daily_distribution[day] || 0) + 1;

    // Interações entre usuários
    const interaction = `${msg.sender} -> ${msg.recipient}`;
    patterns.user_interactions[interaction] = (patterns.user_interactions[interaction] || 0) + 1;

    // Atividade por canal
    if (msg.channel) {
      patterns.channel_activity[msg.channel] = (patterns.channel_activity[msg.channel] || 0) + 1;
    }

    // Análise de transcrições
    if (msg.transcription) {
      const words = msg.transcription.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          patterns.transcription_keywords[word] = (patterns.transcription_keywords[word] || 0) + 1;
        }
      });

      // Detectar padrões de emergência
      const emergencyWords = ['urgente', 'emergência', 'acidente', 'problema', 'ajuda', 'socorro'];
      if (emergencyWords.some(word => msg.transcription.toLowerCase().includes(word))) {
        patterns.emergency_patterns.push({
          message_id: msg.id,
          sender: msg.sender,
          timestamp: msg.timestamp,
          transcription: msg.transcription
        });
      }
    }
  });

  // Ordenar keywords por frequência
  patterns.top_keywords = Object.entries(patterns.transcription_keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  console.log(`✅ Padrões analisados\n`);
  return patterns;
}

// Detectar incidentes e anomalias
async function detectIncidents(messages) {
  console.log('🚨 Detectando incidentes e anomalias...');

  const incidents = [];

  messages.forEach(msg => {
    // Comunicações muito longas (> 5 minutos)
    if (msg.duration_seconds > 300) {
      incidents.push({
        type: 'long_communication',
        severity: 'medium',
        message_id: msg.id,
        sender: msg.sender,
        timestamp: msg.timestamp,
        duration: msg.duration_seconds,
        details: `Comunicação excepcionalmente longa: ${Math.round(msg.duration_seconds / 60)} minutos`
      });
    }

    // Comunicações fora de horário (22h-6h)
    const hour = msg.timestamp.getHours();
    if (hour >= 22 || hour < 6) {
      incidents.push({
        type: 'after_hours_communication',
        severity: 'low',
        message_id: msg.id,
        sender: msg.sender,
        timestamp: msg.timestamp,
        details: `Comunicação fora de horário às ${msg.timestamp.toLocaleTimeString()}`
      });
    }

    // Transcrições com baixa confiança mas marcadas como precisas
    if (msg.transcription && msg.transcription_confidence < 50 && msg.transcription_accurate) {
      incidents.push({
        type: 'low_confidence_transcription',
        severity: 'info',
        message_id: msg.id,
        sender: msg.sender,
        timestamp: msg.timestamp,
        confidence: msg.transcription_confidence,
        transcription: msg.transcription,
        details: `Transcrição com baixa confiança: ${msg.transcription_confidence}%`
      });
    }

    // Mensagens sem transcrição (possível problema técnico)
    if (!msg.transcription && msg.duration_seconds > 0) {
      incidents.push({
        type: 'missing_transcription',
        severity: 'info',
        message_id: msg.id,
        sender: msg.sender,
        timestamp: msg.timestamp,
        duration: msg.duration_seconds,
        details: 'Mensagem de voz sem transcrição disponível'
      });
    }
  });

  console.log(`✅ Total de incidentes detectados: ${incidents.length}\n`);
  return incidents;
}

// Gerar relatório completo
async function generateFullReport(outputFile = 'zello-full-report.json') {
  console.log('\n🚀 EXTRAÇÃO COMPLETA DE DADOS ZELLO');
  console.log('=====================================\n');

  // 1. Buscar mensagens com transcrições
  const messages = await getMessagesWithTranscriptions();

  // 2. Extrair dados de usuários
  const users = await getUsersAndDevices();

  // 3. Analisar padrões
  const patterns = await analyzeCommunicationPatterns(messages);

  // 4. Detectar incidentes
  const incidents = await detectIncidents(messages);

  // 5. Compilar relatório
  const report = {
    metadata: {
      generated_at: new Date().toISOString(),
      network: ZELLO_CONFIG.network,
      period: {
        from: messages[0]?.timestamp || null,
        to: messages[messages.length - 1]?.timestamp || null
      }
    },

    statistics: {
      total_messages: messages.length,
      messages_with_transcription: messages.filter(m => m.transcription).length,
      total_users: users.length,
      total_duration_minutes: Math.round(messages.reduce((sum, m) => sum + m.duration_seconds, 0) / 60),
      avg_confidence: messages
        .filter(m => m.transcription)
        .reduce((sum, m, _, arr) => sum + m.transcription_confidence / arr.length, 0)
    },

    messages: messages,
    users: users,
    patterns: patterns,
    incidents: incidents,

    top_insights: {
      most_active_users: users
        .sort((a, b) => b.message_count - a.message_count)
        .slice(0, 5)
        .map(u => ({ name: u.full_name, messages: u.message_count })),

      peak_hours: Object.entries(patterns.hourly_distribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => ({ hour: `${hour}:00`, messages: count })),

      emergency_messages: patterns.emergency_patterns.length,

      transcription_quality: {
        high_confidence: messages.filter(m => m.transcription_confidence >= 80).length,
        medium_confidence: messages.filter(m => m.transcription_confidence >= 50 && m.transcription_confidence < 80).length,
        low_confidence: messages.filter(m => m.transcription_confidence < 50 && m.transcription_confidence > 0).length,
        no_transcription: messages.filter(m => !m.transcription).length
      }
    }
  };

  // 6. Salvar relatório
  const outputPath = path.join(__dirname, outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log('📊 RESUMO DO RELATÓRIO');
  console.log('======================\n');
  console.log(`📨 Total de mensagens: ${report.statistics.total_messages}`);
  console.log(`📝 Com transcrição: ${report.statistics.messages_with_transcription}`);
  console.log(`👥 Usuários ativos: ${report.statistics.total_users}`);
  console.log(`⏱️  Duração total: ${report.statistics.total_duration_minutes} minutos`);
  console.log(`🎯 Confiança média: ${report.statistics.avg_confidence.toFixed(1)}%`);
  console.log(`🚨 Incidentes detectados: ${incidents.length}`);
  console.log(`🔑 Palavras-chave mais frequentes:`);
  patterns.top_keywords.slice(0, 5).forEach(kw => {
    console.log(`   - "${kw.word}": ${kw.count} vezes`);
  });

  console.log(`\n✅ Relatório salvo em: ${outputPath}`);
  console.log(`📁 Tamanho: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);

  return report;
}

// Executar
if (require.main === module) {
  generateFullReport().catch(console.error);
}

module.exports = {
  authenticate,
  authenticatedRequest,
  getMessagesWithTranscriptions,
  getUsersAndDevices,
  analyzeCommunicationPatterns,
  detectIncidents,
  generateFullReport
};