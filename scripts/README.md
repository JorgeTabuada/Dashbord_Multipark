# Dashboard Multipark - Sistema de Integração

## 📋 Visão Geral

Sistema completo de integração do Dashboard Multipark com Supabase, incluindo gestão de reservas, tracking GPS, monitorização de velocidade e integração com sistemas externos.

## 🗄️ Estrutura das Tabelas Principais

### **52 Tabelas Disponíveis no Supabase:**

#### Tabelas Centrais:
- **parques** (9 registos) - Informação dos parques de estacionamento
- **profiles** (3 registos) - Perfis de utilizadores/condutores  
- **reservas** (37,578 registos) - Sistema central de reservas
- **movimentacoes_veiculos** - Tracking de movimentos de carros
- **dados_gps_condutor** - Dados GPS e velocidade em tempo real
- **ocorrencias_sistema** - Alertas e ocorrências

#### Tabelas de Gestão:
- **caixa_sessoes_diarias** - Controlo de caixa
- **caixa_transacoes_validadas** - Validação de pagamentos
- **ocupacao_diaria_parques** - Ocupação em tempo real
- **produtividade_condutores_diaria** - Métricas de produtividade

#### Tabelas de Suporte:
- **projetos** - Gestão de projetos
- **tarefas** - Sistema de tarefas
- **despesas** - Controlo de despesas
- **campanhas_marketing** - Campanhas de marketing
- **system_logs** (411,656 registos) - Logs do sistema

## 🚀 Instalação

```bash
# Clonar o projeto
git clone https://github.com/seu-repo/v0-new-project-4b-main.git

# Instalar dependências
npm install @supabase/supabase-js

# Configurar variáveis de ambiente
export SUPABASE_URL="https://ioftqsvjqwjeprsckeym.supabase.co"
export SUPABASE_ANON_KEY="sua-chave-aqui"
```

## 📦 Ficheiros do Sistema

1. **supabase-config.js** - Configuração base do Supabase
2. **api-parques.js** - API para gestão de parques
3. **api-reservas.js** - API para reservas e movimentações
4. **api-tracking-gps.js** - Sistema de tracking GPS e velocidade
5. **dashboard-multipark-main.js** - Sistema principal integrado

## 💻 Como Usar

### Inicializar o Sistema

```javascript
import DashboardMultipark from './dashboard-multipark-main.js';

const dashboard = new DashboardMultipark();
await dashboard.inicializar();
```

### Criar uma Reserva

```javascript
const reserva = await dashboard.reservas.createReserva({
  matricula: '00-AA-00',
  booking_id: 'BOOK-123456',
  data_reserva: new Date().toISOString(),
  check_in_previsto: '2025-09-17T10:00:00Z',
  check_out_previsto: '2025-09-20T10:00:00Z',
  nome_cliente: 'João',
  apelido_cliente: 'Silva',
  email_cliente: 'joao@exemplo.com',
  telefone_cliente: '912345678',
  tipo_parque: 'Coberto',
  preco_total: 45.00,
  parque_id: 'uuid-do-parque'
});
```

### Tracking GPS e Velocidade

```javascript
// Registar posição GPS
await dashboard.tracking.registarPosicaoGPS({
  condutor_id: 'uuid-do-condutor',
  latitude: 38.736946,
  longitude: -9.142685,
  velocidade: 25, // km/h
  precisao: 5, // metros
  bateria: 85, // %
  carregando: false
});

// Obter condutores ativos
const condutoresAtivos = await dashboard.tracking.getCondutoresAtivos();
```

### Check-in/Check-out de Veículos

```javascript
// Check-in
await dashboard.reservas.checkInVeiculo('reserva-id', {
  kms_entrada: 50000,
  danos: 'Sem danos visíveis',
  fotos_urls: ['foto1.jpg', 'foto2.jpg'],
  observacoes: 'Tudo ok',
  condutor_id: 'uuid-condutor',
  lugar: 'A15',
  fila: 'Fila-2'
});

// Check-out  
await dashboard.reservas.checkOutVeiculo('reserva-id', {
  kms_saida: 50150,
  danos: 'Sem novos danos',
  fotos_urls: ['foto3.jpg'],
  observacoes: 'Entrega sem problemas',
  condutor_id: 'uuid-condutor',
  local_entrega: 'Terminal 2'
});
```

### Dashboard de Métricas

```javascript
// Obter métricas em tempo real
const metricas = await dashboard.getDashboardMetrics();
console.log(metricas);

// Output:
{
  timestamp: '2025-09-16T15:30:00Z',
  parques: [{
    nome: 'Aeroporto Lisboa T1',
    capacidade_total: 500,
    ocupacao_atual: 342,
    percentual_ocupacao: '68.40',
    reservas_hoje: 45,
    movimentacoes_hoje: 123,
    condutores_ativos: 8
  }],
  reservas_hoje: 45,
  movimentacoes_hoje: 123,
  condutores_ativos: 8,
  alertas_velocidade: 2
}
```

## 🔄 Integração com Sistemas Externos

### Integração com ELU

O sistema está preparado para integrar com o ELU ou outros sistemas externos:

```javascript
// Configurar webhook para sincronização
await dashboard.reservas.syncComSistemaExterno(reserva_id, {
  sistema: 'ELU',
  endpoint: 'https://api-elu.exemplo.com/sync',
  dados_adicionais: {
    // dados específicos do ELU
  }
});
```

## 📊 Monitorização em Tempo Real

O sistema inclui monitorização em tempo real através de WebSockets:

```javascript
// Subscrever a tracking de condutor
const subscription = dashboard.tracking.subscribeToTracking(
  'condutor-id',
  (novaPosicao) => {
    console.log('Nova posição:', novaPosicao);
    
    // Verificar velocidade
    if (novaPosicao.velocidade_kmh > 40) {
      console.log('⚠️ Alerta de velocidade!');
    }
  }
);
```

## 🚨 Sistema de Alertas

### Limites de Velocidade Configurados:
- **Parque Interior**: 10 km/h
- **Parque Exterior**: 20 km/h
- **Via de Acesso**: 30 km/h
- **Alerta Crítico**: 40 km/h

### Verificar Alertas Ativos:

```javascript
const alertas = await dashboard.verificarAlertas();

alertas.forEach(alerta => {
  switch(alerta.tipo) {
    case 'VELOCIDADE':
      console.log(`🚨 ${alerta.quantidade} alertas de velocidade`);
      break;
    case 'CHECK_IN_ATRASADO':
      console.log(`⏰ ${alerta.quantidade} check-ins atrasados`);
      break;
  }
});
```

## 🔐 Segurança

- RLS (Row Level Security) ativo em todas as tabelas
- Autenticação via Supabase Auth
- Logs de todas as operações na tabela `system_logs`

## 📈 Relatórios

### Relatório de Condução

```javascript
const relatorio = await dashboard.tracking.getRelatorioConducta(
  'condutor-id',
  7 // últimos 7 dias
);

console.log(relatorio);
// Velocidade média, máxima, alertas por dia, etc.
```

### Métricas de Reservas

```javascript
const metricas = await dashboard.reservas.getMetricas(
  'parque-id',
  30 // últimos 30 dias
);

console.log(metricas);
// Taxa de conclusão, cancelamento, receita, etc.
```

## 🛠️ Variáveis de Ambiente Necessárias

```env
SUPABASE_URL=https://ioftqsvjqwjeprsckeym.supabase.co
SUPABASE_ANON_KEY=sua-chave-aqui
ELU_API_ENABLED=true
ELU_API_URL=https://api-elu.exemplo.com
ELU_API_KEY=chave-api-elu
```

## 📝 Notas Importantes

1. **Tracking GPS**: Os dados são registados a cada 5 segundos quando o condutor está ativo
2. **Alertas**: São criados automaticamente quando a velocidade excede 40 km/h
3. **Ocupação**: É atualizada em tempo real com cada check-in/check-out
4. **Sincronização**: O sistema tenta sincronizar com sistemas externos a cada operação

## 🤝 Suporte

Para questões ou problemas:
- Email: jorgetabuada@airpark.pt
- Dashboard: https://ioftqsvjqwjeprsckeym.supabase.co

## 📜 Licença

© 2025 Multipark - Dashboard de Gestão de Parques

---

**Desenvolvido por Jorge Tabuada para Multipark**
