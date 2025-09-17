// API Module: Parques
// Gestão dos parques de estacionamento no sistema Multipark

import { supabase } from './supabase-config.js';

export const ParquesAPI = {
  // Buscar todos os parques
  async getAllParques() {
    const { data, error } = await supabase
      .from('parques')
      .select('*')
      .eq('ativo', true)
      .order('nome_parque');
    
    if (error) throw error;
    return data;
  },

  // Buscar parque por ID
  async getParqueById(id_pk) {
    const { data, error } = await supabase
      .from('parques')
      .select('*')
      .eq('id_pk', id_pk)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Buscar parque por código
  async getParqueByCodigo(codigo_parque) {
    const { data, error } = await supabase
      .from('parques')
      .select('*')
      .eq('codigo_parque', codigo_parque)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Criar novo parque
  async createParque(parqueData) {
    const { data, error } = await supabase
      .from('parques')
      .insert([{
        nome_parque: parqueData.nome_parque,
        cidade: parqueData.cidade,
        morada: parqueData.morada,
        codigo_postal: parqueData.codigo_postal,
        capacidade_total: parqueData.capacidade_total,
        capacidade_coberto: parqueData.capacidade_coberto || 0,
        capacidade_descoberto: parqueData.capacidade_descoberto || 0,
        capacidade_indoor: parqueData.capacidade_indoor || 0,
        marca_parque: parqueData.marca_parque,
        codigo_parque: parqueData.codigo_parque,
        ativo: true
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Atualizar parque
  async updateParque(id_pk, updates) {
    const { data, error } = await supabase
      .from('parques')
      .update({
        ...updates,
        updated_at_db: new Date().toISOString()
      })
      .eq('id_pk', id_pk)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Obter ocupação do parque
  async getOcupacaoParque(parque_id, data = new Date()) {
    const dataString = data.toISOString().split('T')[0];
    
    const { data: ocupacao, error } = await supabase
      .from('ocupacao_diaria_parques')
      .select('*')
      .eq('parque_id', parque_id)
      .eq('data_ocupacao', dataString)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return ocupacao;
  },

  // Atualizar ocupação
  async updateOcupacao(parque_id, ocupacaoData) {
    const { data, error } = await supabase
      .from('ocupacao_diaria_parques')
      .upsert({
        parque_id: parque_id,
        data_ocupacao: new Date().toISOString().split('T')[0],
        ...ocupacaoData,
        ultima_atualizacao: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Dashboard Stats
  async getParqueStats(parque_id) {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Reservas de hoje
    const { count: reservasHoje } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('parque_id', parque_id)
      .gte('check_in_previsto', `${hoje}T00:00:00`)
      .lte('check_in_previsto', `${hoje}T23:59:59`);

    // Movimentações de hoje
    const { count: movimentacoesHoje } = await supabase
      .from('movimentacoes_veiculos')
      .select('*', { count: 'exact', head: true })
      .eq('parque_id', parque_id)
      .gte('data_hora_movimento', `${hoje}T00:00:00`);

    return {
      reservas_hoje: reservasHoje || 0,
      movimentacoes_hoje: movimentacoesHoje || 0,
      data_consulta: hoje
    };
  }
};
