// lib/services/database.service.ts
import { supabaseDashboard, supabaseFerramentas } from '../supabase/clients';

export class DatabaseService {
  
  // ===================================
  // OPERAÇÕES DASHBOARD (Operacional)
  // ===================================
  
  // Reservas
  static async getReservas(filters?: {
    parqueId?: string;
    dataInicio?: string;
    dataFim?: string;
    estado?: string;
  }) {
    let query = supabaseDashboard
      .from('reservas')
      .select(`
        *,
        parque:parques(nome_parque, cidade),
        condutor_recolha:profiles!condutor_recolha_id(full_name),
        condutor_entrega:profiles!condutor_entrega_id(full_name)
      `);
    
    if (filters?.parqueId && filters.parqueId !== 'todos') {
      query = query.eq('parque_id', filters.parqueId);
    }
    
    if (filters?.dataInicio) {
      query = query.gte('check_in_previsto', filters.dataInicio);
    }
    
    if (filters?.dataFim) {
      query = query.lte('check_out_previsto', filters.dataFim);
    }
    
    if (filters?.estado) {
      query = query.eq('estado_reserva_atual', filters.estado);
    }
    
    return query.order('created_at_db', { ascending: false });
  }

  // Criar nova reserva
  static async createReserva(reservaData: any) {
    return supabaseDashboard
      .from('reservas')
      .insert(reservaData)
      .select()
      .single();
  }

  // Atualizar reserva
  static async updateReserva(id: string, updates: any) {
    return supabaseDashboard
      .from('reservas')
      .update(updates)
      .eq('id_pk', id)
      .select()
      .single();
  }
  
  // Parques
  static async getParques() {
    return supabaseDashboard
      .from('parques')
      .select('*')
      .eq('ativo', true)
      .order('nome_parque');
  }
  
  // Movimentações de Veículos
  static async getMovimentacoes(parqueId?: string, dataInicio?: string) {
    let query = supabaseDashboard
      .from('movimentacoes_veiculos')
      .select(`
        *,
        parque:parques(nome_parque),
        condutor:profiles(full_name),
        reserva:reservas(license_plate, name_cliente)
      `);
    
    if (parqueId && parqueId !== 'todos') {
      query = query.eq('parque_id', parqueId);
    }
    
    if (dataInicio) {
      query = query.gte('data_hora_movimento', dataInicio);
    }
    
    return query.order('data_hora_movimento', { ascending: false });
  }
  
  // Caixa Diário
  static async getCaixaDiario(parqueId: string, data: string) {
    return supabaseDashboard
      .from('caixa_sessoes_diarias')
      .select(`
        *,
        parque:parques(nome_parque),
        user_abertura:profiles!user_id_abertura(full_name),
        user_fecho:profiles!user_id_fecho(full_name),
        transacoes:caixa_transacoes_validadas(*)
      `)
      .eq('parque_id', parqueId)
      .eq('data_sessao', data)
      .single();
  }

  // Transações da Caixa
  static async getCaixaTransacoes(parqueId?: string, dataInicio?: string, dataFim?: string) {
    let query = supabaseDashboard
      .from('caixa_transacoes_validadas')
      .select(`
        *,
        reserva:reservas(license_plate, name_cliente),
        parque:parques(nome_parque)
      `);
    
    if (parqueId && parqueId !== 'todos') {
      query = query.eq('parque_id', parqueId);
    }
    
    if (dataInicio) {
      query = query.gte('data_transacao', dataInicio);
    }
    
    if (dataFim) {
      query = query.lte('data_transacao', dataFim);
    }
    
    return query.order('data_transacao', { ascending: false });
  }

  // Criar transação na caixa
  static async createCaixaTransacao(transacaoData: any) {
    return supabaseDashboard
      .from('caixa_transacoes_validadas')
      .insert(transacaoData)
      .select()
      .single();
  }
  
  // ===================================
  // OPERAÇÕES FERRAMENTAS (RH e Analytics)
  // ===================================
  
  // Colaboradores RH
  static async getColaboradores() {
    return supabaseFerramentas
      .from('rh_colaboradores')
      .select(`
        *,
        contratos:rh_contratos(*),
        ausencias:rh_ausencias_ferias(*),
        folhas_ponto:rh_folhas_ponto(*)
      `)
      .eq('ativo', true)
      .order('nome_completo');
  }

  // Criar colaborador
  static async createColaborador(colaboradorData: any) {
    return supabaseFerramentas
      .from('rh_colaboradores')
      .insert(colaboradorData)
      .select()
      .single();
  }
  
  // Formação
  static async getConteudosFormacao(categoria?: string) {
    let query = supabaseFerramentas
      .from('formacao_conteudos')
      .select(`
        *,
        categoria:formacao_categorias(nome_categoria, descricao)
      `)
      .eq('ativo', true);
    
    if (categoria) {
      query = query.eq('categoria_id', categoria);
    }
    
    return query.order('created_at', { ascending: false });
  }
  
  // Auditoria
  static async getSessoesAuditoria(estado?: string) {
    let query = supabaseFerramentas
      .from('auditoria_sessoes')
      .select(`
        *,
        auditado:profiles(full_name),
        dados_importados:auditoria_dados_importados(*),
        anexos_audio:auditoria_anexos_audio(*)
      `);
    
    if (estado) {
      query = query.eq('estado_sessao', estado);
    }
    
    return query.order('data_criacao_sessao', { ascending: false });
  }
  
  // Mapas de Ocupação
  static async getOcupacaoAtual(parqueId: string) {
    const [config, vagas, registoDiario] = await Promise.all([
      supabaseFerramentas
        .from('mapa_ocupacao_config_parques')
        .select('*')
        .eq('parque_id', parqueId)
        .single(),
      
      supabaseFerramentas
        .from('mapa_ocupacao_estado_vagas')
        .select('*')
        .eq('parque_id', parqueId),
      
      supabaseFerramentas
        .from('mapa_ocupacao_registos_diarios')
        .select('*')
        .eq('parque_id', parqueId)
        .eq('data_referencia', new Date().toISOString().split('T')[0])
        .single()
    ]);
    
    return { config: config.data, vagas: vagas.data, registoDiario: registoDiario.data };
  }
  
  // Marketing
  static async getCampanhasMarketing() {
    return supabaseFerramentas
      .from('marketing_campanhas')
      .select(`
        *,
        metricas:marketing_metricas_desempenho(*),
        materiais:marketing_materiais_conteudo(*)
      `)
      .eq('ativa', true)
      .order('data_inicio', { ascending: false });
  }
  
  // ===================================
  // OPERAÇÕES CROSS-DATABASE
  // ===================================
  
  // Dashboard Unificado
  static async getDashboardData(parqueId?: string) {
    const hoje = new Date().toISOString().split('T')[0];
    
    const [reservasHoje, ocupacao, colaboradores, campanhas, transacoesCaixa] = await Promise.all([
      // Dashboard: Reservas de hoje
      this.getReservas({
        parqueId,
        dataInicio: hoje,
        dataFim: hoje
      }),
      
      // Ferramentas: Ocupação atual
      parqueId ? this.getOcupacaoAtual(parqueId) : null,
      
      // Ferramentas: Colaboradores ativos
      supabaseFerramentas
        .from('rh_colaboradores')
        .select('id, nome_completo, funcao')
        .eq('ativo', true)
        .limit(10),
      
      // Ferramentas: Campanhas ativas
      supabaseFerramentas
        .from('marketing_campanhas')
        .select('id, nome_campanha, estado_campanha')
        .eq('ativa', true)
        .limit(5),

      // Dashboard: Transações de caixa de hoje
      this.getCaixaTransacoes(parqueId, hoje, hoje)
    ]);
    
    return {
      reservasHoje: reservasHoje.data,
      ocupacao: ocupacao,
      colaboradores: colaboradores.data,
      campanhas: campanhas.data,
      transacoesCaixa: transacoesCaixa.data,
      estatisticas: {
        totalReservas: reservasHoje.data?.length || 0,
        totalTransacoes: transacoesCaixa.data?.length || 0,
        totalColaboradores: colaboradores.data?.length || 0
      }
    };
  }
  
  // Sincronização de Parques entre bases
  static async syncParques() {
    try {
      // Obter parques da base Dashboard
      const { data: parquesDashboard } = await supabaseDashboard
        .from('parques')
        .select('*');
      
      if (!parquesDashboard) return;
      
      // Sincronizar com base Ferramentas
      for (const parque of parquesDashboard) {
        await supabaseFerramentas
          .from('parques')
          .upsert({
            id: parque.id_pk,
            nome_parque: parque.nome_parque,
            cidade: parque.cidade,
            morada: parque.morada,
            capacidade_total: parque.capacidade_total,
            capacidade_coberto: parque.capacidade_coberto,
            capacidade_descoberto: parque.capacidade_descoberto,
            updated_at: new Date().toISOString()
          });
      }
      
      console.log('Sincronização de parques concluída');
    } catch (error) {
      console.error('Erro na sincronização de parques:', error);
      throw error;
    }
  }

  // Upload de ficheiros Excel para as diferentes subaplicações
  static async processExcelUpload(
    file: any, 
    tipo: 'reservas' | 'caixa' | 'recolhas' | 'entregas',
    parqueId: string
  ) {
    // Esta função será implementada depois para processar os Excel
    // Por agora, simula o processo
    return {
      success: true,
      message: `Upload de ${tipo} processado com sucesso`,
      recordsProcessed: 0
    };
  }
}