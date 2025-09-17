// Sistema de Integração Dashboard Multipark
// Integração completa com Supabase e sistemas externos
// @author: Jorge Tabuada

import { supabase } from './supabase-config.js';
import { ParquesAPI } from './api-parques.js';
import { ReservasAPI } from './api-reservas.js';
import { TrackingAPI } from './api-tracking-gps.js';

// ============================================
// SISTEMA PRINCIPAL DE INTEGRAÇÃO
// ============================================

class DashboardMultipark {
  constructor() {
    this.parques = ParquesAPI;
    this.reservas = ReservasAPI;
    this.tracking = TrackingAPI;
    this.sistemaAtivo = false;
  }

  // Inicializar o sistema
  async inicializar() {
    console.log('🚀 A inicializar Dashboard Multipark...');
    
    try {
      // Verificar conexão
      const { data, error } = await supabase.from('parques').select('count').single();
      if (error) throw error;
      
      this.sistemaAtivo = true;
      console.log('✅ Sistema iniciado com sucesso!');
      
      // Iniciar monitorização em tempo real
      this.iniciarMonitorizacao();
      
      return true;
    } catch (erro) {
      console.error('❌ Erro ao inicializar:', erro);
      return false;
    }
  }

  // Monitorização em tempo real
  iniciarMonitorizacao() {
    // Monitorizar novas reservas
    supabase
      .channel('reservas-novas')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reservas'
      }, (payload) => {
        console.log('📅 Nova reserva:', payload.new);
        this.processarNovaReserva(payload.new);
      })
      .subscribe();

    // Monitorizar movimentações
    supabase
      .channel('movimentacoes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'movimentacoes_veiculos'
      }, (payload) => {
        console.log('🚗 Nova movimentação:', payload.new);
        this.processarMovimentacao(payload.new);
      })
      .subscribe();
  }

  // Processar nova reserva
  async processarNovaReserva(reserva) {
    // Aqui podes integrar com sistemas externos
    console.log(`Processando reserva ${reserva.booking_id}...`);
    
    // Exemplo: Enviar para sistema ELU
    if (process.env.ELU_API_ENABLED === 'true') {
      await this.enviarParaELU(reserva);
    }
  }

  // Processar movimentação
  async processarMovimentacao(movimento) {
    // Atualizar ocupação do parque
    if (movimento.tipo_movimento === 'RECOLHA') {
      await this.atualizarOcupacao(movimento.parque_id, 1);
    } else if (movimento.tipo_movimento === 'ENTREGA') {
      await this.atualizarOcupacao(movimento.parque_id, -1);
    }
  }

  // Atualizar ocupação
  async atualizarOcupacao(parque_id, delta) {
    const ocupacao = await this.parques.getOcupacaoParque(parque_id);
    if (ocupacao) {
      await this.parques.updateOcupacao(parque_id, {
        ocupados_cobertos: ocupacao.ocupados_cobertos + delta
      });
    }
  }

  // Integração com ELU (exemplo)
  async enviarParaELU(dados) {
    const eluPayload = {
      matricula: dados.license_plate,
      entrada: dados.check_in_previsto,
      saida: dados.check_out_previsto,
      cliente: `${dados.name_cliente} ${dados.lastname_cliente}`,
      parque: dados.parque_id,
      timestamp: new Date().toISOString()
    };

    // Aqui farias a chamada real para a API do ELU
    console.log('📤 Enviando para ELU:', eluPayload);
    
    // Simulação de resposta
    return { success: true, elu_id: 'ELU-' + Date.now() };
  }

  // Dashboard de métricas em tempo real
  async getDashboardMetrics(parque_id = null) {
    const metricas = {
      timestamp: new Date().toISOString(),
      parques: [],
      reservas_hoje: 0,
      movimentacoes_hoje: 0,
      condutores_ativos: 0,
      alertas_velocidade: 0
    };

    // Buscar todos os parques ou específico
    const parques = parque_id 
      ? [await this.parques.getParqueById(parque_id)]
      : await this.parques.getAllParques();

    for (const parque of parques) {
      // Stats do parque
      const stats = await this.parques.getParqueStats(parque.id_pk);
      
      // Ocupação atual
      const ocupacao = await this.parques.getOcupacaoParque(parque.id_pk);
      
      // Condutores ativos
      const condutoresAtivos = await this.tracking.getCondutoresAtivos(parque.id_pk);
      
      metricas.parques.push({
        nome: parque.nome_parque,
        capacidade_total: parque.capacidade_total,
        ocupacao_atual: ocupacao ? ocupacao.ocupados_cobertos + ocupacao.ocupados_descobertos : 0,
        percentual_ocupacao: ocupacao ? 
          ((ocupacao.ocupados_cobertos + ocupacao.ocupados_descobertos) / parque.capacidade_total * 100).toFixed(2) : 0,
        reservas_hoje: stats.reservas_hoje,
        movimentacoes_hoje: stats.movimentacoes_hoje,
        condutores_ativos: condutoresAtivos.length
      });

      metricas.reservas_hoje += stats.reservas_hoje;
      metricas.movimentacoes_hoje += stats.movimentacoes_hoje;
      metricas.condutores_ativos += condutoresAtivos.length;
    }

    return metricas;
  }

  // Sistema de alertas
  async verificarAlertas() {
    const alertas = [];

    // Verificar velocidades excessivas
    const { data: alertasVelocidade } = await supabase
      .from('ocorrencias_sistema')
      .select('*')
      .eq('tipo_ocorrencia', 'ALERTA_VELOCIDADE')
      .eq('estado_resolucao', 'Aberta')
      .gte('created_at_db', new Date(Date.now() - 3600000).toISOString());

    if (alertasVelocidade && alertasVelocidade.length > 0) {
      alertas.push({
        tipo: 'VELOCIDADE',
        quantidade: alertasVelocidade.length,
        detalhes: alertasVelocidade
      });
    }

    // Verificar reservas sem check-in
    const agoraComAtraso = new Date();
    agoraComAtraso.setMinutes(agoraComAtraso.getMinutes() - 30);

    const { data: reservasAtrasadas } = await supabase
      .from('reservas')
      .select('*')
      .lte('check_in_previsto', agoraComAtraso.toISOString())
      .is('check_in_real', null)
      .neq('estado_reserva_atual', 'Cancelada');

    if (reservasAtrasadas && reservasAtrasadas.length > 0) {
      alertas.push({
        tipo: 'CHECK_IN_ATRASADO',
        quantidade: reservasAtrasadas.length,
        detalhes: reservasAtrasadas
      });
    }

    return alertas;
  }
}

// ============================================
// EXEMPLOS DE USO
// ============================================

const dashboard = new DashboardMultipark();

// Exemplo 1: Inicializar o sistema
async function exemplo1() {
  await dashboard.inicializar();
  
  // Obter métricas do dashboard
  const metricas = await dashboard.getDashboardMetrics();
  console.log('📊 Métricas:', metricas);
}

// Exemplo 2: Criar e processar uma reserva
async function exemplo2() {
  const novaReserva = await dashboard.reservas.createReserva({
    matricula: '00-AA-00',
    booking_id: 'BOOK-' + Date.now(),
    data_reserva: new Date().toISOString(),
    check_in_previsto: new Date(Date.now() + 3600000).toISOString(),
    check_out_previsto: new Date(Date.now() + 86400000).toISOString(),
    nome_cliente: 'João',
    apelido_cliente: 'Silva',
    email_cliente: 'joao@exemplo.com',
    telefone_cliente: '912345678',
    tipo_parque: 'Coberto',
    preco_total: 25.00,
    parque_id: 'uuid-do-parque',
    marca_carro: 'Toyota',
    modelo_carro: 'Corolla',
    cor_carro: 'Preto'
  });
  
  console.log('✅ Reserva criada:', novaReserva);
}

// Exemplo 3: Tracking GPS e velocidade
async function exemplo3() {
  // Registar posição GPS
  await dashboard.tracking.registarPosicaoGPS({
    condutor_id: 'uuid-do-condutor',
    latitude: 38.736946,
    longitude: -9.142685,
    velocidade: 15, // km/h
    precisao: 5, // metros
    bateria: 85, // percentagem
    carregando: false,
    latencia: 120 // ms
  });
  
  // Obter análise de velocidade
  const analise = await dashboard.tracking.getAnaliseVelocidade('uuid-do-condutor');
  console.log('📈 Análise de velocidade:', analise);
}

// Exemplo 4: Check-in de veículo
async function exemplo4() {
  const checkIn = await dashboard.reservas.checkInVeiculo('uuid-da-reserva', {
    kms_entrada: 50000,
    danos: 'Risco no para-choques traseiro',
    fotos_urls: ['url-foto-1.jpg', 'url-foto-2.jpg'],
    observacoes: 'Cliente chegou 15 minutos atrasado',
    condutor_id: 'uuid-do-condutor',
    lugar: 'A15',
    fila: 'Fila-2',
    local_recolha: 'Terminal 1'
  });
  
  console.log('✅ Check-in realizado:', checkIn);
}

// Exemplo 5: Verificar alertas do sistema
async function exemplo5() {
  const alertas = await dashboard.verificarAlertas();
  
  if (alertas.length > 0) {
    console.log('⚠️ Alertas ativos:', alertas);
    
    // Enviar notificações (exemplo)
    alertas.forEach(alerta => {
      if (alerta.tipo === 'VELOCIDADE') {
        console.log(`🚨 ${alerta.quantidade} alertas de velocidade excessiva!`);
      } else if (alerta.tipo === 'CHECK_IN_ATRASADO') {
        console.log(`⏰ ${alerta.quantidade} reservas com check-in atrasado!`);
      }
    });
  }
}

// Exportar para uso em outros módulos
export default DashboardMultipark;

// Auto-executar se for o ficheiro principal
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎯 Dashboard Multipark - Modo de teste');
  
  // Executar exemplos
  (async () => {
    await exemplo1();
    // await exemplo2();
    // await exemplo3();
    // await exemplo4();
    await exemplo5();
  })();
}
