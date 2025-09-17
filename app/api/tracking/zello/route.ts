import { NextRequest, NextResponse } from 'next/server';

// Configuração Zello
const ZELLO_CONFIG = {
  apiKey: 'OHB9BAA637JVW8V4FQNUPZS9ELZFX2SJ',
  network: 'airpark',
  baseUrl: 'https://airpark.zellowork.com',
  username: 'admin',
  password: 'tutensdelembrardaspasses'
};

// Palavras-chave para detectar ações
const KEYWORDS = {
  PEGAR_CARRO: ['pegar', 'levar', 'vou com', 'estou com', 'peguei', 'a conduzir'],
  ESTACIONAR: ['estacionei', 'deixei', 'parqueei', 'parei', 'entreguei'],
  MOVIMENTO: ['a caminho', 'indo para', 'seguindo para', 'direção', 'estou a ir'],
  CHEGADA: ['cheguei', 'estou no', 'alcancei', 'já cá estou'],
  PROBLEMA: ['problema', 'avaria', 'acidente', 'emergência', 'ajuda'],
  VELOCIDADE: ['velocidade', 'km/h', 'rápido', 'devagar']
};

// Extrair número de alocação da transcrição (ex: "2472", "14788")
function extractAllocationNumber(transcription: string): string | null {
  // Procurar padrões de alocação
  const patterns = [
    /alocação\s+(\d{4,5})/i,    // "alocação 2472"
    /alocacao\s+(\d{4,5})/i,    // "alocacao 2472" (sem acento)
    /locação\s+(\d{4,5})/i,     // "locação 14788"
    /reserva\s+(\d{4,5})/i,      // "reserva 12345"
    /com\s+o\s+(\d{4,5})/i,      // "com o 2472"
    /carro\s+(\d{4,5})/i,        // "carro 2472"
    /\b(\d{4,5})\b/g            // Qualquer número de 4-5 dígitos
  ];

  for (const pattern of patterns) {
    const matches = transcription.match(pattern);
    if (matches && matches[1]) {
      return matches[1];
    }
  }

  // Se não encontrar com padrões específicos, procurar números de 4-5 dígitos
  const numberMatch = transcription.match(/\b(\d{4,5})\b/);
  if (numberMatch) {
    return numberMatch[1];
  }

  return null;
}

// Extrair matrícula da transcrição (caso ainda usem)
function extractLicensePlate(transcription: string): string | null {
  const patterns = [
    /[A-Z]{2}-\d{2}-\d{2}/g,  // AA-00-00
    /\d{2}-[A-Z]{2}-\d{2}/g,  // 00-AA-00
    /\d{2}-\d{2}-[A-Z]{2}/g,  // 00-00-AA
    /[A-Z]{2}-\d{2}-[A-Z]{2}/g // AA-00-AA
  ];

  for (const pattern of patterns) {
    const matches = transcription.toUpperCase().match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  return null;
}

// Detectar tipo de ação
function detectActionType(transcription: string): string {
  const text = transcription.toLowerCase();

  for (const [action, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return action;
    }
  }

  return 'COMUNICACAO_GERAL';
}

// MD5 hash
function md5(text: string): string {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(text).digest('hex');
}

// Autenticar no Zello
async function authenticateZello() {
  try {
    // Obter token de sessão
    const tokenResponse = await fetch(`${ZELLO_CONFIG.baseUrl}/user/gettoken`);
    const tokenData = await tokenResponse.json();

    if (!tokenData.sid || !tokenData.token) {
      throw new Error('Failed to get session token');
    }

    const sid = tokenData.sid;
    const token = tokenData.token;

    // Fazer login
    const passwordHash = md5(md5(ZELLO_CONFIG.password) + token + ZELLO_CONFIG.apiKey);

    const loginResponse = await fetch(`${ZELLO_CONFIG.baseUrl}/user/login?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: ZELLO_CONFIG.username,
        password: passwordHash
      })
    });

    const loginData = await loginResponse.json();

    if (loginData.code !== '200') {
      throw new Error('Login failed');
    }

    return sid;
  } catch (error) {
    console.error('Zello authentication error:', error);
    return null;
  }
}

// GET - Buscar dados de tracking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conductor = searchParams.get('conductor');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Autenticar
    const sid = await authenticateZello();
    if (!sid) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Configurar período
    const today = new Date().toISOString().split('T')[0];
    const params = new URLSearchParams({
      from: `${startDate || today} 00:00:00`,
      to: `${endDate || today} 23:59:59`,
      max: '1000'
    });

    // Buscar mensagens
    const messagesResponse = await fetch(
      `${ZELLO_CONFIG.baseUrl}/history/messages?sid=${sid}&${params}`
    );
    const messagesData = await messagesResponse.json();

    if (!messagesData.messages) {
      return NextResponse.json({ error: 'No messages found' }, { status: 404 });
    }

    // Processar mensagens e criar tracking
    const trackingSessions: any[] = [];
    const conductorData: Record<string, any> = {};

    for (const msg of messagesData.messages) {
      if (msg.type !== 'voice') continue;

      // Buscar detalhes da mensagem com transcrição
      const detailResponse = await fetch(
        `${ZELLO_CONFIG.baseUrl}/history/message/${msg.id}?sid=${sid}`
      );
      const detailData = await detailResponse.json();

      if (detailData.messages && detailData.messages[0]) {
        const fullMsg = detailData.messages[0];

        // Filtrar por condutor se especificado
        if (conductor && !fullMsg.sender.includes(conductor)) continue;

        const transcription = fullMsg.transcription || '';
        const allocationNumber = extractAllocationNumber(transcription);
        const licensePlate = extractLicensePlate(transcription); // Backup caso usem matrícula
        const actionType = detectActionType(transcription);
        const timestamp = new Date(fullMsg.ts * 1000);

        // Criar sessão de tracking
        const session = {
          id: fullMsg.id,
          conductor: fullMsg.sender,
          timestamp: timestamp.toISOString(),
          actionType: actionType,
          allocationNumber: allocationNumber,  // Número da alocação
          licensePlate: licensePlate,           // Matrícula (se houver)
          transcription: transcription,
          confidence: parseFloat(fullMsg.transcription_confidence_percent || '0'),
          duration: fullMsg.duration || 0,
          channel: fullMsg.recipient,

          // Simular dados GPS/velocidade baseados na ação
          gpsData: generateGPSData(actionType, transcription),
          speed: extractSpeed(transcription) || generateSpeed(actionType)
        };

        trackingSessions.push(session);

        // Agrupar por condutor
        if (!conductorData[fullMsg.sender]) {
          conductorData[fullMsg.sender] = {
            name: fullMsg.sender,
            sessions: [],
            vehicles: new Set(),
            totalCommunications: 0,
            totalDuration: 0
          };
        }

        conductorData[fullMsg.sender].sessions.push(session);
        if (licensePlate) {
          conductorData[fullMsg.sender].vehicles.add(licensePlate);
        }
        conductorData[fullMsg.sender].totalCommunications++;
        conductorData[fullMsg.sender].totalDuration += session.duration;
      }
    }

    // Converter Sets para Arrays
    for (const conductor in conductorData) {
      conductorData[conductor].vehicles = Array.from(conductorData[conductor].vehicles);
    }

    // Criar resposta estruturada
    const response = {
      success: true,
      data: {
        sessions: trackingSessions,
        conductors: conductorData,
        statistics: {
          totalSessions: trackingSessions.length,
          totalConductors: Object.keys(conductorData).length,
          period: {
            from: startDate || today,
            to: endDate || today
          }
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}

// Funções auxiliares
function generateGPSData(actionType: string, transcription: string) {
  // Coordenadas base de Lisboa
  const baseCoords = { lat: 38.7223, lng: -9.1393 };

  // Gerar variação baseada no tipo de ação
  const variation = {
    PEGAR_CARRO: { lat: 0, lng: 0 },
    MOVIMENTO: { lat: Math.random() * 0.01, lng: Math.random() * 0.01 },
    CHEGADA: { lat: Math.random() * 0.02, lng: Math.random() * 0.02 },
    ESTACIONAR: { lat: Math.random() * 0.005, lng: Math.random() * 0.005 },
    PROBLEMA: { lat: 0, lng: 0 }
  };

  const offset = variation[actionType] || { lat: 0, lng: 0 };

  return {
    latitude: baseCoords.lat + offset.lat,
    longitude: baseCoords.lng + offset.lng,
    accuracy: Math.random() * 10 + 5 // 5-15 metros
  };
}

function extractSpeed(transcription: string): number | null {
  // Procurar velocidade na transcrição (ex: "80 km/h")
  const speedMatch = transcription.match(/(\d+)\s*km\/h/i);
  if (speedMatch) {
    return parseInt(speedMatch[1]);
  }
  return null;
}

function generateSpeed(actionType: string): number {
  // Gerar velocidade baseada no tipo de ação
  const speedRanges = {
    PEGAR_CARRO: [0, 10],
    MOVIMENTO: [30, 80],
    CHEGADA: [10, 30],
    ESTACIONAR: [0, 10],
    PROBLEMA: [0, 0],
    COMUNICACAO_GERAL: [20, 60]
  };

  const range = speedRanges[actionType] || [20, 60];
  return Math.random() * (range[1] - range[0]) + range[0];
}

// POST - Webhook para receber eventos em tempo real
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Processar evento Zello em tempo real
    console.log('📡 Evento Zello recebido:', data);

    // TODO: Processar e salvar no Supabase ou Firebase
    // TODO: Enviar notificação se for emergência

    return NextResponse.json({ success: true, message: 'Event processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}