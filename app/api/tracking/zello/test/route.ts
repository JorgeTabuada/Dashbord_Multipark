import { NextRequest, NextResponse } from 'next/server';

// Dados de teste com base no que encontrámos nos scripts
const TEST_DATA = {
  success: true,
  data: {
    sessions: [
      {
        id: "2284988",
        conductor: "Extra 424",
        timestamp: "2025-09-16T21:25:26.000Z",
        actionType: "PEGAR_CARRO",
        allocationNumber: "22431",
        licensePlate: null,
        transcription: "A locação 22431 a entrar no terminal.",
        confidence: 74.48,
        duration: 4560,
        channel: "Multipark Comunicação",
        gpsData: {
          latitude: 38.7223,
          longitude: -9.1393,
          accuracy: 8.5
        },
        speed: 45
      },
      {
        id: "2284989",
        conductor: "Extra 424",
        timestamp: "2025-09-16T22:15:12.000Z",
        actionType: "MOVIMENTO",
        allocationNumber: "22431",
        licensePlate: null,
        transcription: "A locação 22431 a caminho do terminal 2.",
        confidence: 73.2,
        duration: 2880,
        channel: "Multipark Comunicação",
        gpsData: {
          latitude: 38.7235,
          longitude: -9.1405,
          accuracy: 6.2
        },
        speed: 65
      },
      {
        id: "2284990",
        conductor: "Extra 424",
        timestamp: "2025-09-16T22:45:30.000Z",
        actionType: "ESTACIONAR",
        allocationNumber: "22431",
        licensePlate: null,
        transcription: "A locação 22431 estacionei no terminal 2.",
        confidence: 78.9,
        duration: 3200,
        channel: "Multipark Comunicação",
        gpsData: {
          latitude: 38.7241,
          longitude: -9.1412,
          accuracy: 5.1
        },
        speed: 0
      },
      {
        id: "2284991",
        conductor: "Extra 507",
        timestamp: "2025-09-16T23:10:15.000Z",
        actionType: "PEGAR_CARRO",
        allocationNumber: "14788",
        licensePlate: null,
        transcription: "A alocação 14788 vou com este carro.",
        confidence: 71.3,
        duration: 2100,
        channel: "Multipark Comunicação",
        gpsData: {
          latitude: 38.7228,
          longitude: -9.1398,
          accuracy: 7.8
        },
        speed: 15
      },
      {
        id: "2284992",
        conductor: "Cristian Ramires",
        timestamp: "2025-09-16T23:30:45.000Z",
        actionType: "PROBLEMA",
        allocationNumber: "2472",
        licensePlate: null,
        transcription: "Problema com a alocação 2472, preciso de ajuda.",
        confidence: 82.1,
        duration: 4200,
        channel: "Multipark Comunicação",
        gpsData: {
          latitude: 38.7215,
          longitude: -9.1385,
          accuracy: 9.2
        },
        speed: 0
      }
    ],
    conductors: {
      "Extra 424": {
        name: "Extra 424",
        sessions: [],
        vehicles: ["22431"],
        totalCommunications: 3,
        totalDuration: 10640
      },
      "Extra 507": {
        name: "Extra 507",
        sessions: [],
        vehicles: ["14788"],
        totalCommunications: 1,
        totalDuration: 2100
      },
      "Cristian Ramires": {
        name: "Cristian Ramires",
        sessions: [],
        vehicles: ["2472"],
        totalCommunications: 1,
        totalDuration: 4200
      }
    },
    statistics: {
      totalSessions: 5,
      totalConductors: 3,
      period: {
        from: "2025-09-16",
        to: "2025-09-16"
      }
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API Zello Test - Retornando dados de teste...');

    // Simular um pequeno delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(TEST_DATA);

  } catch (error) {
    console.error('Erro na API de teste:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test data' },
      { status: 500 }
    );
  }
}