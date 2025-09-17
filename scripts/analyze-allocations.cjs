// analyze-allocations.js
// Analisa números de alocação nos dados do Zello

const fs = require('fs');

// Carregar dados exportados - usar full report que tem transcrições
const data = JSON.parse(fs.readFileSync('scripts/zello-full-report.json', 'utf8'));

// Padrões para detectar alocações
const ALLOCATION_PATTERNS = [
  /alocação\s+(\d{4,5})/gi,
  /alocacao\s+(\d{4,5})/gi,
  /locação\s+(\d{4,5})/gi,
  /reserva\s+(\d{4,5})/gi,
  /com\s+o\s+(\d{4,5})/gi,
  /carro\s+(\d{4,5})/gi
];

// Palavras-chave de ação
const ACTION_KEYWORDS = {
  PEGAR: ['pegar', 'levar', 'vou com', 'estou com', 'peguei', 'a conduzir'],
  ESTACIONAR: ['estacionei', 'deixei', 'parqueei', 'parei', 'entreguei'],
  MOVIMENTO: ['a caminho', 'indo para', 'seguindo para', 'direção', 'estou a ir'],
  CHEGADA: ['cheguei', 'estou no', 'alcancei', 'já cá estou']
};

console.log('🔍 ANÁLISE DE ALOCAÇÕES NOS DADOS DO ZELLO');
console.log('==========================================\n');

// Estatísticas
const stats = {
  totalMessages: 0,
  messagesWithTranscription: 0,
  messagesWithAllocation: 0,
  allocations: new Map(),
  conductorAllocations: new Map(),
  actionsByAllocation: new Map()
};

// Analisar mensagens
const messages = data.messages || [];
if (messages && Array.isArray(messages)) {
  stats.totalMessages = messages.length;

  messages.forEach(msg => {
    if (msg.transcription && msg.transcription.length > 0) {
      stats.messagesWithTranscription++;

      // Procurar números de alocação
      let allocationFound = null;
      for (const pattern of ALLOCATION_PATTERNS) {
        const matches = msg.transcription.match(pattern);
        if (matches) {
          allocationFound = matches[0].match(/\d{4,5}/)[0];
          break;
        }
      }

      // Se não encontrar com padrões, procurar qualquer número de 4-5 dígitos
      if (!allocationFound) {
        const numberMatch = msg.transcription.match(/\b(\d{4,5})\b/);
        if (numberMatch) {
          allocationFound = numberMatch[1];
        }
      }

      if (allocationFound) {
        stats.messagesWithAllocation++;

        // Registrar alocação
        if (!stats.allocations.has(allocationFound)) {
          stats.allocations.set(allocationFound, {
            count: 0,
            conductors: new Set(),
            actions: [],
            samples: []
          });
        }

        const allocation = stats.allocations.get(allocationFound);
        allocation.count++;
        allocation.conductors.add(msg.sender || msg.author_full_name);

        // Detectar tipo de ação
        const text = msg.transcription.toLowerCase();
        let actionType = 'OUTRO';
        for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
          if (keywords.some(kw => text.includes(kw))) {
            actionType = action;
            break;
          }
        }
        allocation.actions.push(actionType);

        // Guardar amostra (máx 3 por alocação)
        if (allocation.samples.length < 3) {
          allocation.samples.push({
            conductor: msg.sender || msg.author_full_name,
            transcription: msg.transcription.substring(0, 100),
            timestamp: new Date(msg.ts * 1000).toLocaleString('pt-PT'),
            action: actionType
          });
        }

        // Registrar por condutor
        const conductor = msg.sender || msg.author_full_name || 'Desconhecido';
        if (!stats.conductorAllocations.has(conductor)) {
          stats.conductorAllocations.set(conductor, new Set());
        }
        stats.conductorAllocations.get(conductor).add(allocationFound);
      }
    }
  });
}

// Mostrar resultados
console.log('📊 ESTATÍSTICAS GERAIS');
console.log(`  Total de mensagens: ${stats.totalMessages}`);
console.log(`  Com transcrição: ${stats.messagesWithTranscription}`);
console.log(`  Com número de alocação: ${stats.messagesWithAllocation}`);
console.log(`  Taxa de detecção: ${((stats.messagesWithAllocation / stats.messagesWithTranscription) * 100).toFixed(1)}%`);

console.log('\n🚗 TOP 10 ALOCAÇÕES MAIS MENCIONADAS');
const sortedAllocations = Array.from(stats.allocations.entries())
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 10);

sortedAllocations.forEach(([number, data]) => {
  console.log(`\n  Alocação ${number}:`);
  console.log(`    Menções: ${data.count}`);
  console.log(`    Condutores: ${Array.from(data.conductors).join(', ')}`);

  // Contar ações
  const actionCounts = {};
  data.actions.forEach(action => {
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  });
  console.log(`    Ações: ${Object.entries(actionCounts).map(([a, c]) => `${a}(${c})`).join(', ')}`);

  // Mostrar amostras
  console.log('    Exemplos:');
  data.samples.forEach(sample => {
    console.log(`      - ${sample.conductor} [${sample.action}]: "${sample.transcription}..."`);
  });
});

console.log('\n👥 CONDUTORES E SUAS ALOCAÇÕES');
const sortedConductors = Array.from(stats.conductorAllocations.entries())
  .sort((a, b) => b[1].size - a[1].size)
  .slice(0, 10);

sortedConductors.forEach(([conductor, allocations]) => {
  const allocationList = Array.from(allocations).sort().join(', ');
  console.log(`  ${conductor}: ${allocations.size} alocações diferentes`);
  console.log(`    → ${allocationList}`);
});

// Procurar padrões específicos
console.log('\n🔍 PADRÕES ENCONTRADOS NAS TRANSCRIÇÕES');
const patterns = {
  'Terminal 1': 0,
  'Terminal 2': 0,
  'Terminal 3': 0,
  'Parque': 0,
  'Entrega': 0,
  'Recolha': 0
};

if (messages) {
  messages.forEach(msg => {
    if (msg.transcription) {
      const text = msg.transcription.toLowerCase();
      Object.keys(patterns).forEach(pattern => {
        if (text.includes(pattern.toLowerCase())) {
          patterns[pattern]++;
        }
      });
    }
  });
}

console.log('  Locais e ações mencionados:');
Object.entries(patterns).forEach(([pattern, count]) => {
  if (count > 0) {
    console.log(`    ${pattern}: ${count} menções`);
  }
});

// Salvar relatório
const report = {
  timestamp: new Date().toISOString(),
  statistics: {
    totalMessages: stats.totalMessages,
    withTranscription: stats.messagesWithTranscription,
    withAllocation: stats.messagesWithAllocation,
    detectionRate: ((stats.messagesWithAllocation / stats.messagesWithTranscription) * 100).toFixed(1) + '%'
  },
  topAllocations: sortedAllocations.map(([number, data]) => ({
    number,
    count: data.count,
    conductors: Array.from(data.conductors)
  })),
  conductorSummary: sortedConductors.map(([conductor, allocations]) => ({
    conductor,
    totalAllocations: allocations.size,
    allocations: Array.from(allocations)
  }))
};

fs.writeFileSync('allocation-analysis-report.json', JSON.stringify(report, null, 2));

console.log('\n✅ Análise completa! Relatório salvo em allocation-analysis-report.json');