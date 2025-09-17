// test-zello-api.js
// Script para testar a integração com Zello Work API
// Corre isto com: node test-zello-api.js

const ZELLO_CONFIG = {
  apiKey: 'OHB9BAA637JVW8V4FQNUPZS9ELZFX2SJ',
  network: 'airpark',
  baseUrl: 'https://airpark.zellowork.com',
  username: 'admin@airpark.com',  // Se precisar de autenticação
  password: ''  // Adicionar password se necessário
};

// Função helper para fazer requests
async function zelloRequest(endpoint, method = 'GET', body = null) {
  const https = require('https');
  const url = new URL(`${ZELLO_CONFIG.baseUrl}/api/v2${endpoint}`);

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method,
    headers: {
      'Authorization': `Bearer ${ZELLO_CONFIG.apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ success: res.statusCode < 400, data: jsonData, statusCode: res.statusCode });
        } catch (error) {
          resolve({ success: false, error: `JSON parse error: ${error.message}`, raw: data });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// TESTES DISPONÍVEIS
// Descomenta o que quiseres testar

// 1. Testar conexão básica
async function testConnection() {
  console.log('🔌 Testando conexão com Zello...');

  // Tentar diferentes endpoints
  const endpoints = [
    '/status',
    '/users',
    '/channels',
    ''
  ];

  for (const endpoint of endpoints) {
    console.log(`\nTestando endpoint: ${endpoint || '/'} ...`);
    const result = await zelloRequest(endpoint);
    console.log('Resultado:', {
      success: result.success,
      statusCode: result.statusCode,
      hasData: !!result.data && Object.keys(result.data).length > 0
    });

    if (result.success) {
      console.log('✅ Endpoint funciona!');
      return result;
    }
  }
}

// 2. Buscar histórico de localização
async function getLocationHistory(username = 'Extra_20435', date = '2025-09-16') {
  console.log(`📍 Buscando localização de ${username} em ${date}...`);

  const result = await zelloRequest('/history/location', 'POST', {
    network: ZELLO_CONFIG.network,
    username: username,
    date: date
  });

  if (result.success && result.data.features) {
    console.log(`✅ Encontrados ${result.data.features.length} pontos GPS`);

    // Mostrar primeiros 3 pontos como exemplo
    result.data.features.slice(0, 3).forEach((point, index) => {
      console.log(`\nPonto ${index + 1}:`);
      console.log(`  Coordenadas: ${point.geometry.coordinates}`);
      console.log(`  Velocidade: ${point.properties.speed} km/h`);
      console.log(`  Precisão: ${point.properties.accuracy}m`);
      console.log(`  Timestamp: ${point.properties.lastReportTime}`);
    });
  } else {
    console.log('❌ Erro:', result.error || 'Sem dados');
    console.log('Detalhes:', {
      statusCode: result.statusCode,
      raw: result.raw,
      data: result.data
    });
  }

  return result;
}

// 3. Buscar eventos de voz
async function getVoiceHistory(date = '2025-09-16') {
  console.log(`🎙️ Buscando comunicações de ${date}...`);
  
  const result = await zelloRequest('/history/messages', 'POST', {
    network: ZELLO_CONFIG.network,
    from: `${date}T00:00:00Z`,
    to: `${date}T23:59:59Z`,
    type: 'audio'
  });
  
  if (result.success) {
    console.log('Eventos de voz:', result.data);
  }
  
  return result;
}

// 4. Listar utilizadores online
async function getOnlineUsers() {
  console.log('👥 Buscando utilizadores online...');
  
  const result = await zelloRequest('/users/online', 'GET');
  
  if (result.success) {
    console.log('Utilizadores online:', result.data);
  }
  
  return result;
}

// 5. Buscar canais disponíveis
async function getChannels() {
  console.log('📻 Buscando canais...');
  
  const result = await zelloRequest('/channels', 'GET');
  
  if (result.success) {
    console.log('Canais:', result.data);
  }
  
  return result;
}

// 6. Configurar webhook (para receber eventos em tempo real)
async function setupWebhook(callbackUrl) {
  console.log('🔔 Configurando webhook...');
  
  const result = await zelloRequest('/webhooks', 'POST', {
    url: callbackUrl,
    events: ['location', 'voice', 'emergency', 'status'],
    network: ZELLO_CONFIG.network
  });
  
  console.log('Resultado:', result);
  return result;
}

// Função para converter dados Zello para formato do sistema
function convertZelloToMultipark(zelloData) {
  if (!zelloData.features) return null;
  
  return {
    tracking_session: {
      driver_zello_id: 'Extra_20435', // Extrair do nome do ficheiro ou API
      started_at: zelloData.features[0]?.properties?.lastReportTime,
      completed_at: zelloData.features[zelloData.features.length - 1]?.properties?.lastReportTime,
      raw_geojson: zelloData,
      total_points: zelloData.features.length,
      max_speed: Math.max(...zelloData.features.map(f => f.properties.speed || 0)),
      avg_speed: zelloData.features.reduce((acc, f) => acc + (f.properties.speed || 0), 0) / zelloData.features.length
    },
    incidents: detectIncidents(zelloData.features)
  };
}

// Detectar incidentes básicos
function detectIncidents(points) {
  const incidents = [];
  const SPEED_LIMIT_CITY = 50;
  const SPEED_LIMIT_HIGHWAY = 120;
  
  points.forEach((point, index) => {
    const speed = point.properties.speed;
    
    // Detectar excesso de velocidade
    if (speed > SPEED_LIMIT_HIGHWAY) {
      incidents.push({
        type: 'speeding_extreme',
        severity: 'high',
        speed: speed,
        speed_limit: SPEED_LIMIT_HIGHWAY,
        location: point.geometry.coordinates,
        timestamp: point.properties.lastReportTime
      });
    } else if (speed > SPEED_LIMIT_CITY && speed <= 90) {
      incidents.push({
        type: 'speeding_moderate',
        severity: 'medium',
        speed: speed,
        speed_limit: SPEED_LIMIT_CITY,
        location: point.geometry.coordinates,
        timestamp: point.properties.lastReportTime
      });
    }
    
    // Detectar paragens longas (velocidade 0 por mais de 5 min)
    if (speed === 0 && index > 0) {
      const prevPoint = points[index - 1];
      const timeDiff = new Date(point.properties.lastReportTime) - new Date(prevPoint.properties.lastReportTime);
      
      if (timeDiff > 5 * 60 * 1000) { // 5 minutos
        incidents.push({
          type: 'long_stop',
          severity: 'low',
          duration: timeDiff / 1000,
          location: point.geometry.coordinates,
          timestamp: point.properties.lastReportTime
        });
      }
    }
  });
  
  return incidents;
}

// EXECUTAR TESTES
async function runTests() {
  console.log('🚀 Iniciando testes da API Zello\n');
  console.log('=====================================\n');
  
  // Teste 1: Conexão
  await testConnection();
  console.log('\n-------------------------------------\n');
  
  // Teste 2: Histórico de localização (o mais importante!)
  const locationData = await getLocationHistory();
  console.log('\n-------------------------------------\n');
  
  // Teste 3: Converter para formato Multipark
  if (locationData.success && locationData.data) {
    console.log('🔄 Convertendo para formato Multipark...');
    const multiparkData = convertZelloToMultipark(locationData.data);
    
    if (multiparkData) {
      console.log('\nDados convertidos:');
      console.log(`  Total de pontos: ${multiparkData.tracking_session.total_points}`);
      console.log(`  Velocidade máxima: ${multiparkData.tracking_session.max_speed.toFixed(2)} km/h`);
      console.log(`  Velocidade média: ${multiparkData.tracking_session.avg_speed.toFixed(2)} km/h`);
      console.log(`  Incidentes detectados: ${multiparkData.incidents.length}`);
      
      if (multiparkData.incidents.length > 0) {
        console.log('\nPrimeiros 3 incidentes:');
        multiparkData.incidents.slice(0, 3).forEach(incident => {
          console.log(`  - ${incident.type} (${incident.severity}): ${incident.speed} km/h`);
        });
      }
    }
  }
  
  console.log('\n=====================================');
  console.log('✅ Testes concluídos!\n');
}

// Função para testar autenticação simples
async function testSimpleAuth() {
  console.log('🔐 Testando autenticação simples...');

  // Teste com curl direto para debug
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  const curlCmd = `curl -X GET "${ZELLO_CONFIG.baseUrl}/api/v2/status" -H "Authorization: Bearer ${ZELLO_CONFIG.apiKey}" -v`;
  console.log('Comando curl:', curlCmd);

  try {
    const { stdout, stderr } = await execPromise(curlCmd);
    console.log('STDOUT:', stdout);
    console.log('STDERR:', stderr);
  } catch (error) {
    console.log('Erro no curl:', error.message);
  }
}

// Correr se executado directamente
if (require.main === module) {
  // Adicionar teste de auth antes
  testSimpleAuth().then(() => {
    runTests().catch(console.error);
  });
}

// Exportar para usar noutros ficheiros
module.exports = {
  zelloRequest,
  getLocationHistory,
  getVoiceHistory,
  getOnlineUsers,
  convertZelloToMultipark,
  detectIncidents
};
