// API Module: Reservas e Movimentações
// Sistema central de reservas com integração para sistemas externos

import { supabase } from './supabase-config.js';

export const ReservasAPI = {
  // Estados possíveis das reservas
  ESTADOS: {
    PENDENTE: 'Pendente',
    CONFIRMADA: 'Confirmada',
    CHECK_IN: 'Check-In',
    CHECK_OUT: 'Check-Out',
    CANCELADA: 'Cancelada',
    NO_SHOW: 'No-Show'
  },

  // Criar nova reserva
  async createReserva(reservaData) {
    const { data, error } = await supabase
      .from('reservas')
      .insert([{
        license_plate: reservaData.matricula,
        booking_id: reservaData.booking_id,
        booking_date: reservaData.data_reserva,
        check_in_previsto: reservaData.check_in_previsto,
        check_out_previsto: reservaData.check_out_previsto,
        name_cliente: reservaData.nome_cliente,
        lastname_cliente: reservaData.apelido_cliente,
        email_cliente: reservaData.email_cliente,
        phone_number_cliente: reservaData.telefone_cliente,
        parking_type: reservaData.tipo_parque,
        total_price: reservaData.preco_total,
        parque_id: reservaData.parque_id,
        estado_reserva_atual: this.ESTADOS.PENDENTE,
        source: reservaData.source || 'api',
        car_info_brand: reservaData.marca_carro,
        car_info_model: reservaData.modelo_carro,
        car_info_color: reservaData.cor_carro
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Buscar reserva por matricula
  async getReservaByMatricula(matricula) {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('license_plate', matricula)
      .order('booking_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Check-in da viatura
  async checkInVeiculo(reserva_id, checkInData) {
    const { data, error } = await supabase
      .from('reservas')
      .update({
        check_in_real: new Date().toISOString(),
        estado_reserva_atual: this.ESTADOS.CHECK_IN,
        kms_entrada: checkInData.kms_entrada,
        danos_checkin: checkInData.danos,
        fotos_checkin_urls: checkInData.fotos_urls,
        observacoes_recolha: checkInData.observacoes,
        condutor_recolha_id: checkInData.condutor_id,
        spot_code: checkInData.lugar,
        row_code: checkInData.fila
      })
      .eq('id_pk', reserva_id)
      .select();
    
    if (error) throw error;

    // Registar movimentação
    await this.registarMovimentacao({
      reserva_id: reserva_id,
      matricula_veiculo: data[0].license_plate,
      tipo_movimento: 'RECOLHA',
      profile_id_condutor: checkInData.condutor_id,
      parque_id: data[0].parque_id,
      localizacao_origem: checkInData.local_recolha,
      localizacao_destino: `${checkInData.fila}-${checkInData.lugar}`,
      observacoes: checkInData.observacoes
    });

    return data[0];
  },

  // Check-out da viatura
  async checkOutVeiculo(reserva_id, checkOutData) {
    const { data, error } = await supabase
      .from('reservas')
      .update({
        check_out_real: new Date().toISOString(),
        estado_reserva_atual: this.ESTADOS.CHECK_OUT,
        kms_saida: checkOutData.kms_saida,
        danos_checkout: checkOutData.danos,
        fotos_checkout_urls: checkOutData.fotos_urls,
        observacoes_entrega: checkOutData.observacoes,
        condutor_entrega_id: checkOutData.condutor_id
      })
      .eq('id_pk', reserva_id)
      .select();
    
    if (error) throw error;

    // Registar movimentação
    await this.registarMovimentacao({
      reserva_id: reserva_id,
      matricula_veiculo: data[0].license_plate,
      tipo_movimento: 'ENTREGA',
      profile_id_condutor: checkOutData.condutor_id,
      parque_id: data[0].parque_id,
      localizacao_origem: data[0].spot_code ? `${data[0].row_code}-${data[0].spot_code}` : 'Parque',
      localizacao_destino: checkOutData.local_entrega,
      observacoes: checkOutData.observacoes
    });

    return data[0];
  },

  // Registar movimentação
  async registarMovimentacao(movData) {
    const { data, error } = await supabase
      .from('movimentacoes_veiculos')
      .insert([{
        reserva_id: movData.reserva_id,
        matricula_veiculo: movData.matricula_veiculo,
        alocation_veiculo: movData.alocation_veiculo,
        tipo_movimento: movData.tipo_movimento,
        profile_id_condutor: movData.profile_id_condutor,
        parque_id: movData.parque_id,
        localizacao_origem: movData.localizacao_origem,
        localizacao_destino: movData.localizacao_destino,
        observacoes: movData.observacoes,
        data_hora_movimento: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Pesquisar reservas com filtros
  async searchReservas(filtros = {}) {
    let query = supabase.from('reservas').select('*');

    if (filtros.parque_id) {
      query = query.eq('parque_id', filtros.parque_id);
    }

    if (filtros.data_inicio) {
      query = query.gte('booking_date', filtros.data_inicio);
    }

    if (filtros.data_fim) {
      query = query.lte('booking_date', filtros.data_fim);
    }

    if (filtros.estado) {
      query = query.eq('estado_reserva_atual', filtros.estado);
    }

    if (filtros.matricula) {
      query = query.ilike('license_plate', `%${filtros.matricula}%`);
    }

    if (filtros.cliente) {
      query = query.or(`name_cliente.ilike.%${filtros.cliente}%,lastname_cliente.ilike.%${filtros.cliente}%`);
    }

    query = query.order('booking_date', { ascending: false });

    if (filtros.limit) {
      query = query.limit(filtros.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // Sincronizar com sistema externo
  async syncComSistemaExterno(reserva_id, sistemaData) {
    const { data, error } = await supabase
      .from('reservas')
      .update({
        sync_status: 'syncing',
        last_sync_at: new Date().toISOString()
      })
      .eq('id_pk', reserva_id)
      .select();
    
    if (error) throw error;

    try {
      // Aqui integrarias com o sistema externo
      // Por exemplo, enviar para o ELU ou outro sistema
      
      // Simular chamada API externa
      // const response = await fetch('https://api-externa.com/sync', {
      //   method: 'POST',
      //   body: JSON.stringify({...sistemaData, reserva: data[0]})
      // });

      // Atualizar status de sync
      await supabase
        .from('reservas')
        .update({
          sync_status: 'synced',
          sync_errors: null
        })
        .eq('id_pk', reserva_id);

      return { success: true };
    } catch (syncError) {
      // Em caso de erro, guardar o erro
      await supabase
        .from('reservas')
        .update({
          sync_status: 'error',
          sync_errors: { error: syncError.message, timestamp: new Date().toISOString() }
        })
        .eq('id_pk', reserva_id);

      throw syncError;
    }
  },

  // Dashboard de reservas do dia
  async getReservasHoje(parque_id = null) {
    const hoje = new Date().toISOString().split('T')[0];
    let query = supabase
      .from('reservas')
      .select('*')
      .gte('check_in_previsto', `${hoje}T00:00:00`)
      .lte('check_in_previsto', `${hoje}T23:59:59`);

    if (parque_id) {
      query = query.eq('parque_id', parque_id);
    }

    const { data, error } = await query.order('check_in_previsto');
    
    if (error) throw error;
    return data;
  },

  // Métricas de reservas
  async getMetricas(parque_id, periodo = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodo);

    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('parque_id', parque_id)
      .gte('booking_date', dataInicio.toISOString())
      .order('booking_date');

    if (error) throw error;

    // Calcular métricas
    const total = data.length;
    const confirmadas = data.filter(r => r.estado_reserva_atual === this.ESTADOS.CONFIRMADA).length;
    const canceladas = data.filter(r => r.estado_reserva_atual === this.ESTADOS.CANCELADA).length;
    const checkIns = data.filter(r => r.check_in_real).length;
    const checkOuts = data.filter(r => r.check_out_real).length;

    const receitaTotal = data.reduce((sum, r) => sum + (parseFloat(r.total_price) || 0), 0);
    const receitaMedia = total > 0 ? receitaTotal / total : 0;

    return {
      periodo_dias: periodo,
      total_reservas: total,
      confirmadas: confirmadas,
      canceladas: canceladas,
      check_ins: checkIns,
      check_outs: checkOuts,
      taxa_conclusao: total > 0 ? (checkOuts / total * 100).toFixed(2) : 0,
      taxa_cancelamento: total > 0 ? (canceladas / total * 100).toFixed(2) : 0,
      receita_total: receitaTotal.toFixed(2),
      receita_media: receitaMedia.toFixed(2)
    };
  }
};
