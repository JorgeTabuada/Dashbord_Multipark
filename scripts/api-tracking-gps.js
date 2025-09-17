// API Module: GPS & Tracking de Veículos
// Sistema de monitorização de posição e velocidade em tempo real

import { supabase } from './supabase-config.js';

export const TrackingAPI = {
  // Limites de velocidade por zona
  LIMITES_VELOCIDADE: {
    PARQUE_INTERIOR: 10, // km/h
    PARQUE_EXTERIOR: 20, // km/h
    VIA_ACESSO: 30, // km/h
    ALERTA: 40 // km/h - velocidade máxima antes de alerta crítico
  },

  // Registar posição GPS
  async registarPosicaoGPS(dadosGPS) {
    const { data, error } = await supabase
      .from('dados_gps_condutor')
      .insert([{
        profile_id_condutor: dadosGPS.condutor_id,
        timestamp_registo: new Date().toISOString(),
        latitude: dadosGPS.latitude,
        longitude: dadosGPS.longitude,
        velocidade_kmh: dadosGPS.velocidade,
        precisao_gps_metros: dadosGPS.precisao,
        nivel_bateria_percentagem: dadosGPS.bateria,
        a_carregar_bateria: dadosGPS.carregando || false,
        rtt_ms: dadosGPS.latencia,
        dados_json_original: dadosGPS
      }])
      .select();
    
    if (error) throw error;

    // Verificar velocidade e criar alerta se necessário
    if (dadosGPS.velocidade > this.LIMITES_VELOCIDADE.ALERTA) {
      await this.criarAlertaVelocidade(dadosGPS.condutor_id, dadosGPS.velocidade, dadosGPS);
    }

    return data[0];
  },

  // Criar alerta de velocidade
  async criarAlertaVelocidade(condutor_id, velocidade, localizacao) {
    const { data: condutor } = await supabase
      .from('profiles')
      .select('full_name, parque_id_principal')
      .eq('id', condutor_id)
      .single();

    const { data, error } = await supabase
      .from('ocorrencias_sistema')
      .insert([{
        profile_id_envolvido: condutor_id,
        parque_id: condutor?.parque_id_principal,
        tipo_ocorrencia: 'ALERTA_VELOCIDADE',
        descricao: `Velocidade excessiva detetada: ${velocidade} km/h. Condutor: ${condutor?.full_name}`,
        estado_resolucao: 'Aberta',
        anexos_url: {
          velocidade: velocidade,
          latitude: localizacao.latitude,
          longitude: localizacao.longitude,
          timestamp: new Date().toISOString()
        }
      }])
      .select();
    
    if (error) console.error('Erro ao criar alerta:', error);
    return data?.[0];
  },

  // Obter última posição do condutor
  async getUltimaPosicao(condutor_id) {
    const { data, error } = await supabase
      .from('dados_gps_condutor')
      .select('*')
      .eq('profile_id_condutor', condutor_id)
      .order('timestamp_registo', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Obter histórico de posições
  async getHistoricoPosicoes(condutor_id, minutos = 60) {
    const tempoInicio = new Date();
    tempoInicio.setMinutes(tempoInicio.getMinutes() - minutos);

    const { data, error } = await supabase
      .from('dados_gps_condutor')
      .select('*')
      .eq('profile_id_condutor', condutor_id)
      .gte('timestamp_registo', tempoInicio.toISOString())
      .order('timestamp_registo', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Obter condutores ativos
  async getCondutoresAtivos(parque_id = null) {
    const cincoMinutosAtras = new Date();
    cincoMinutosAtras.setMinutes(cincoMinutosAtras.getMinutes() - 5);

    let query = supabase
      .from('dados_gps_condutor')
      .select(`
        profile_id_condutor,
        latitude,
        longitude,
        velocidade_kmh,
        timestamp_registo,
        nivel_bateria_percentagem,
        profiles!inner(
          full_name,
          parque_id_principal
        )
      `)
      .gte('timestamp_registo', cincoMinutosAtras.toISOString());

    if (parque_id) {
      query = query.eq('profiles.parque_id_principal', parque_id);
    }

    // Usar distinct para pegar apenas a última posição de cada condutor
    const { data, error } = await query
      .order('timestamp_registo', { ascending: false });
    
    if (error) throw error;

    // Filtrar para manter apenas a última posição de cada condutor
    const condutoresUnicos = {};
    data.forEach(registro => {
      if (!condutoresUnicos[registro.profile_id_condutor]) {
        condutoresUnicos[registro.profile_id_condutor] = registro;
      }
    });

    return Object.values(condutoresUnicos);
  },

  // Análise de velocidade média
  async getAnaliseVelocidade(condutor_id, data = new Date()) {
    const dataString = data.toISOString().split('T')[0];
    
    const { data: registos, error } = await supabase
      .from('dados_gps_condutor')
      .select('velocidade_kmh, timestamp_registo')
      .eq('profile_id_condutor', condutor_id)
      .gte('timestamp_registo', `${dataString}T00:00:00`)
      .lte('timestamp_registo', `${dataString}T23:59:59`)
      .order('timestamp_registo');
    
    if (error) throw error;

    if (!registos || registos.length === 0) {
      return {
        velocidade_media: 0,
        velocidade_maxima: 0,
        num_alertas: 0,
        tempo_movimento: 0
      };
    }

    const velocidades = registos.map(r => r.velocidade_kmh);
    const velocidadeMedia = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
    const velocidadeMaxima = Math.max(...velocidades);
    const numAlertas = velocidades.filter(v => v > this.LIMITES_VELOCIDADE.ALERTA).length;

    // Calcular tempo em movimento (velocidade > 0)
    const emMovimento = registos.filter(r => r.velocidade_kmh > 0).length;
    const tempoMovimento = (emMovimento * 5) / 60; // Assumindo registos a cada 5 segundos

    return {
      velocidade_media: velocidadeMedia.toFixed(2),
      velocidade_maxima: velocidadeMaxima.toFixed(2),
      num_alertas: numAlertas,
      tempo_movimento: tempoMovimento.toFixed(2),
      total_registos: registos.length
    };
  },

  // Calcular distância percorrida
  calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Rota percorrida
  async getRotaPercorrida(condutor_id, inicio, fim) {
    const { data, error } = await supabase
      .from('dados_gps_condutor')
      .select('latitude, longitude, velocidade_kmh, timestamp_registo')
      .eq('profile_id_condutor', condutor_id)
      .gte('timestamp_registo', inicio)
      .lte('timestamp_registo', fim)
      .order('timestamp_registo');
    
    if (error) throw error;

    let distanciaTotal = 0;
    const pontos = [];

    for (let i = 0; i < data.length; i++) {
      pontos.push({
        lat: data[i].latitude,
        lng: data[i].longitude,
        velocidade: data[i].velocidade_kmh,
        timestamp: data[i].timestamp_registo
      });

      if (i > 0) {
        distanciaTotal += this.calcularDistancia(
          data[i-1].latitude, 
          data[i-1].longitude,
          data[i].latitude, 
          data[i].longitude
        );
      }
    }

    return {
      pontos: pontos,
      distancia_total_km: distanciaTotal.toFixed(2),
      num_pontos: pontos.length
    };
  },

  // Monitorização em tempo real
  subscribeToTracking(condutor_id, callback) {
    const subscription = supabase
      .channel(`tracking:${condutor_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dados_gps_condutor',
          filter: `profile_id_condutor=eq.${condutor_id}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  // Relatório de condução
  async getRelatorioConducta(condutor_id, periodo_dias = 7) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodo_dias);

    const { data, error } = await supabase
      .from('dados_gps_condutor')
      .select('*')
      .eq('profile_id_condutor', condutor_id)
      .gte('timestamp_registo', dataInicio.toISOString())
      .order('timestamp_registo');
    
    if (error) throw error;

    // Processar dados por dia
    const diasAnalise = {};
    
    data.forEach(registro => {
      const dia = registro.timestamp_registo.split('T')[0];
      if (!diasAnalise[dia]) {
        diasAnalise[dia] = {
          velocidades: [],
          alertas: 0,
          tempo_ativo: 0
        };
      }
      
      diasAnalise[dia].velocidades.push(registro.velocidade_kmh);
      if (registro.velocidade_kmh > this.LIMITES_VELOCIDADE.ALERTA) {
        diasAnalise[dia].alertas++;
      }
    });

    // Calcular métricas por dia
    const relatorio = Object.entries(diasAnalise).map(([dia, dados]) => ({
      data: dia,
      velocidade_media: (dados.velocidades.reduce((a, b) => a + b, 0) / dados.velocidades.length).toFixed(2),
      velocidade_maxima: Math.max(...dados.velocidades).toFixed(2),
      num_alertas: dados.alertas,
      num_registos: dados.velocidades.length
    }));

    return {
      periodo_dias: periodo_dias,
      dias_analisados: relatorio.length,
      relatorio_diario: relatorio,
      total_alertas: relatorio.reduce((sum, dia) => sum + dia.num_alertas, 0)
    };
  }
};
