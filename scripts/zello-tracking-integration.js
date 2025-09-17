// zello-tracking-integration.js
// Sistema de tracking de condutores usando dados reais do Zello

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

// Palavras-chave para detectar ações nas transcrições
const KEYWORDS = {
  PEGAR_CARRO: ['pegar', 'levar', 'vou com', 'estou com', 'peguei'],
  ESTACIONAR: ['estacionei', 'deixei', 'parqueei', 'parei'],
  MOVIMENTO: ['a caminho', 'indo para', 'seguindo para', 'direção'],
  CHEGADA: ['cheguei', 'estou no', 'alcancei'],
  PROBLEMA: ['problema', 'avaria', 'acidente', 'emergência'],
  VELOCIDADE: ['velocidade', 'km/h', 'rápido', 'devagar']
};

// Extrair matrícula da transcrição
function extractLicensePlate(transcription) {
  // Padrões de matrículas portuguesas
  const patterns = [
    /[A-Z]{2}-\d{2}-\d{2}/g,  // AA-00-00
    /\d{2}-[A-Z]{2}-\d{2}/g,  // 00-AA-00
    /\d{2}-\d{2}-[A-Z]{2}/g,  // 00-00-AA
    /[A-Z]{2}-\d{2}-[A-Z]{2}/g // AA-00-AA
  ];

  for (const pattern of patterns) {
    const matches = transcription.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  return null;
}

// Detectar tipo de ação pela transcrição
function detectActionType(transcription) {
  const text = transcription.toLowerCase();

  for (const [action, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return action;
    }
  }

  return 'COMUNICACAO_GERAL';
}

// Função MD5
function md5(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// Fazer requisição HTTP
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

// Autenticar no Zello
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
    console.error('Erro na autenticação:', error);
    return null;
  }
}

// Buscar dados de tracking em tempo real
async function getRealTimeTracking(startDate = null, endDate = null) {
  const sid = await authenticate();
  if (!sid) {
    console.error('Falha na autenticação');
    return null;
  }

  console.log('🚀 Buscando dados de tracking do Zello...\n');

  // Datas padrão: hoje
  const today = new Date().toISOString().split('T')[0];
  const params = {
    from: `${startDate || today} 00:00:00`,
    to: `${endDate || today} 23:59:59`,
    max: 1000
  };

  // 1. Buscar mensagens com transcrições
  const messagesResult = await makeRequest(`/history/messages?sid=${sid}`, 'GET', params);

  if (!messagesResult.success || !messagesResult.data.messages) {
    console.error('Erro ao buscar mensagens');
    return null;
  }

  const messages = messagesResult.data.messages;
  console.log(`📨 ${messages.length} mensagens encontradas\n`);

  // 2. Buscar dados de localização
  const locationResult = await makeRequest(`/history/location?sid=${sid}`, 'GET', {
    from: params.from,
    to: params.to,
    max: 5000
  });

  let locations = [];
  if (locationResult.success && locationResult.data.messages) {
    locations = locationResult.data.messages;
    console.log(`📍 ${locations.length} pontos de localização encontrados\n`);
  }

  // 3. Processar e correlacionar dados
  const trackingData = await processTrackingData(messages, locations, sid);

  return trackingData;
}

// Processar dados de tracking
async function processTrackingData(messages, locations, sid) {
  const conductorSessions = new Map(); // Sessões por condutor
  const vehicleHistory = new Map(); // Histórico por veículo

  // Processar mensagens de voz com transcrições
  for (const msg of messages) {
    if (msg.type !== 'voice' || !msg.transcription) continue;

    // Buscar detalhes completos da mensagem
    const detailResult = await makeRequest(`/history/message/${msg.id}?sid=${sid}`, 'GET');

    if (detailResult.success && detailResult.data.messages) {
      const fullMsg = detailResult.data.messages[0];

      // Extrair informações
      const conductor = fullMsg.sender || fullMsg.author_full_name;
      const timestamp = new Date(fullMsg.ts * 1000);
      const transcription = fullMsg.transcription;
      const confidence = fullMsg.transcription_confidence_percent;

      // Detectar matrícula e ação
      const licensePlate = extractLicensePlate(transcription);
      const actionType = detectActionType(transcription);

      // Criar sessão de tracking
      const session = {
        conductor: conductor,
        timestamp: timestamp,
        action: actionType,
        licensePlate: licensePlate,
        transcription: transcription,
        confidence: confidence,
        duration: fullMsg.duration || 0,
        channel: fullMsg.recipient
      };

      // Adicionar à lista do condutor
      if (!conductorSessions.has(conductor)) {
        conductorSessions.set(conductor, []);
      }
      conductorSessions.get(conductor).push(session);

      // Adicionar ao histórico do veículo
      if (licensePlate) {
        if (!vehicleHistory.has(licensePlate)) {
          vehicleHistory.set(licensePlate, []);
        }
        vehicleHistory.get(licensePlate).push(session);
      }
    }
  }

  // Correlacionar com dados de localização
  const trackingResults = [];

  for (const [conductor, sessions] of conductorSessions.entries()) {
    // Ordenar sessões por timestamp
    sessions.sort((a, b) => a.timestamp - b.timestamp);

    let currentVehicle = null;
    let currentSession = null;

    for (const session of sessions) {
      if (session.actionType === 'PEGAR_CARRO' && session.licensePlate) {
        // Iniciar nova sessão com veículo
        if (currentSession) {
          trackingResults.push(currentSession);
        }

        currentVehicle = session.licensePlate;
        currentSession = {
          conductor: conductor,
          vehicle: currentVehicle,
          startTime: session.timestamp,
          startTranscription: session.transcription,
          movements: [],
          endTime: null,
          endTranscription: null,
          totalDistance: 0,
          maxSpeed: 0,
          avgSpeed: 0,
          incidents: []
        };
      } else if (session.actionType === 'ESTACIONAR' && currentSession) {
        // Finalizar sessão atual
        currentSession.endTime = session.timestamp;
        currentSession.endTranscription = session.transcription;
        trackingResults.push(currentSession);
        currentSession = null;
        currentVehicle = null;
      } else if (currentSession) {
        // Adicionar movimento à sessão atual
        currentSession.movements.push({
          timestamp: session.timestamp,
          action: session.actionType,
          transcription: session.transcription
        });

        // Detectar incidentes
        if (session.actionType === 'PROBLEMA') {
          currentSession.incidents.push({
            type: 'PROBLEMA_REPORTADO',
            timestamp: session.timestamp,
            description: session.transcription
          });
        }
      }
    }

    // Adicionar última sessão se ainda estiver aberta
    if (currentSession) {
      trackingResults.push(currentSession);
    }
  }

  // Calcular estatísticas
  const statistics = calculateStatistics(trackingResults);

  return {
    sessions: trackingResults,
    conductorSessions: Object.fromEntries(conductorSessions),
    vehicleHistory: Object.fromEntries(vehicleHistory),
    statistics: statistics,
    metadata: {
      totalMessages: messages.length,
      totalLocations: locations.length,
      period: {
        from: messages[0]?.ts ? new Date(messages[0].ts * 1000) : null,
        to: messages[messages.length - 1]?.ts ? new Date(messages[messages.length - 1].ts * 1000) : null
      }
    }
  };
}

// Calcular estatísticas
function calculateStatistics(trackingSessions) {
  const stats = {
    totalSessions: trackingSessions.length,
    conductorStats: {},
    vehicleStats: {},
    incidentCount: 0,
    averageSessionDuration: 0
  };

  let totalDuration = 0;

  for (const session of trackingSessions) {
    // Estatísticas por condutor
    if (!stats.conductorStats[session.conductor]) {
      stats.conductorStats[session.conductor] = {
        sessions: 0,
        vehicles: new Set(),
        totalTime: 0,
        incidents: 0
      };
    }

    const conductorStat = stats.conductorStats[session.conductor];
    conductorStat.sessions++;
    if (session.vehicle) {
      conductorStat.vehicles.add(session.vehicle);
    }

    // Calcular duração da sessão
    if (session.startTime && session.endTime) {
      const duration = (session.endTime - session.startTime) / 1000 / 60; // minutos
      conductorStat.totalTime += duration;
      totalDuration += duration;
    }

    conductorStat.incidents += session.incidents.length;
    stats.incidentCount += session.incidents.length;

    // Estatísticas por veículo
    if (session.vehicle) {
      if (!stats.vehicleStats[session.vehicle]) {
        stats.vehicleStats[session.vehicle] = {
          sessions: 0,
          conductors: new Set(),
          totalTime: 0
        };
      }

      const vehicleStat = stats.vehicleStats[session.vehicle];
      vehicleStat.sessions++;
      vehicleStat.conductors.add(session.conductor);

      if (session.startTime && session.endTime) {
        const duration = (session.endTime - session.startTime) / 1000 / 60;
        vehicleStat.totalTime += duration;
      }
    }
  }

  // Converter Sets para Arrays
  for (const conductor in stats.conductorStats) {
    stats.conductorStats[conductor].vehicles = Array.from(stats.conductorStats[conductor].vehicles);
  }

  for (const vehicle in stats.vehicleStats) {
    stats.vehicleStats[vehicle].conductors = Array.from(stats.vehicleStats[vehicle].conductors);
  }

  stats.averageSessionDuration = trackingSessions.length > 0
    ? Math.round(totalDuration / trackingSessions.length)
    : 0;

  return stats;
}

// Exportar para usar no dashboard
async function exportTrackingData() {
  const trackingData = await getRealTimeTracking();

  if (!trackingData) {
    console.error('Erro ao obter dados de tracking');
    return;
  }

  // Salvar em arquivo JSON
  const filename = `zello-tracking-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(trackingData, null, 2));

  console.log('\n📊 RESUMO DO TRACKING');
  console.log('====================\n');
  console.log(`✅ Sessões de tracking: ${trackingData.sessions.length}`);
  console.log(`👥 Condutores ativos: ${Object.keys(trackingData.statistics.conductorStats).length}`);
  console.log(`🚗 Veículos usados: ${Object.keys(trackingData.statistics.vehicleStats).length}`);
  console.log(`⚠️  Incidentes reportados: ${trackingData.statistics.incidentCount}`);
  console.log(`⏱️  Duração média sessão: ${trackingData.statistics.averageSessionDuration} min`);

  console.log('\n📁 Dados exportados para:', filename);

  return trackingData;
}

// Monitorar em tempo real (webhook)
async function startRealTimeMonitoring(webhookUrl) {
  const sid = await authenticate();
  if (!sid) {
    console.error('Falha na autenticação');
    return;
  }

  console.log('🔔 Configurando monitoramento em tempo real...\n');

  // Configurar webhook para receber eventos
  const webhookResult = await makeRequest(`/webhooks?sid=${sid}`, 'POST', {
    url: webhookUrl,
    events: ['message', 'location', 'emergency', 'status_change'],
    network: ZELLO_CONFIG.network
  });

  if (webhookResult.success) {
    console.log('✅ Webhook configurado com sucesso!');
    console.log('📡 A receber eventos em:', webhookUrl);
  } else {
    console.error('❌ Erro ao configurar webhook:', webhookResult);
  }

  return webhookResult;
}

// Programa principal
if (require.main === module) {
  exportTrackingData().catch(console.error);
}

module.exports = {
  authenticate,
  getRealTimeTracking,
  processTrackingData,
  exportTrackingData,
  startRealTimeMonitoring,
  extractLicensePlate,
  detectActionType
};