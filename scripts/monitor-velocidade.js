#!/usr/bin/env node

// Monitor de Velocidade e GPS em Tempo Real
// Sistema de monitorização contínua para Dashboard Multipark

import { supabase } from '../supabase-config.js';
import { TrackingAPI } from '../api-tracking-gps.js';

class MonitorVelocidade {
  constructor() {
    this.condutoresMonitorizados = new Map();
    this.alertasAtivos = new Map();
    this.estatisticas = {
      total_registos: 0,
      alertas_emitidos: 0,
      velocidade_maxima_registada: 0,
      inicio_monitorizacao: new Date()
    };
  }

  // Iniciar monitorização
  async iniciar() {
    console.log('🚦 Monitor de Velocidade - Dashboard Multipark');
    console.log('================================================');
    console.log(`📅 Início: ${new Date().toLocaleString('pt-PT')}`);
    console.log('');

    // Obter condutores ativos
    await this.atualizarCondutoresAtivos();

    // Iniciar monitorização em tempo real
    this.iniciarMonitorizacaoRealTime();

    // Atualizar dashboard a cada 5 segundos
    setInterval(() => this.mostrarDashboard(), 5000);

    // Verificar novos condutores a cada minuto
    setInterval(() => this.atualizarCondutoresAtivos(), 60000);
  }

  // Atualizar lista de condutores ativos
  async atualizarCondutoresAtivos() {
    try {
      const condutores = await TrackingAPI.getCondutoresAtivos();
      
      condutores.forEach(condutor => {
        if (!this.condutoresMonitorizados.has(condutor.profile_id_condutor)) {
          this.condutoresMonitorizados.set(condutor.profile_id_condutor, {
            nome: condutor.profiles.full_name,
            ultima_posicao: {
              lat: condutor.latitude,
              lng: condutor.longitude,
              velocidade: condutor.velocidade_kmh,
              timestamp: condutor.timestamp_registo
            },
            velocidade_maxima: condutor.velocidade_kmh,
            alertas: 0
          });

          console.log(`✅ Novo condutor monitorizado: ${condutor.profiles.full_name}`);
        }
      });
    } catch (erro) {
      console.error('❌ Erro ao atualizar condutores:', erro);
    }
  }

  // Iniciar monitorização em tempo real
  iniciarMonitorizacaoRealTime() {
    const canal = supabase
      .channel('tracking-gps-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dados_gps_condutor'
        },
        (payload) => this.processarNovoRegisto(payload.new)
      )
      .subscribe();

    console.log('📡 Monitorização em tempo real ativa\n');
  }

  // Processar novo registo GPS
  async processarNovoRegisto(registo) {
    this.estatisticas.total_registos++;

    // Buscar informação do condutor se não existir
    if (!this.condutoresMonitorizados.has(registo.profile_id_condutor)) {
      await this.atualizarCondutoresAtivos();
    }

    const condutor = this.condutoresMonitorizados.get(registo.profile_id_condutor);
    if (!condutor) return;

    // Calcular distância percorrida
    let distancia = 0;
    if (condutor.ultima_posicao) {
      distancia = this.calcularDistancia(
        condutor.ultima_posicao.lat,
        condutor.ultima_posicao.lng,
        registo.latitude,
        registo.longitude
      );
    }

    // Atualizar dados do condutor
    condutor.ultima_posicao = {
      lat: registo.latitude,
      lng: registo.longitude,
      velocidade: registo.velocidade_kmh,
      timestamp: registo.timestamp_registo,
      bateria: registo.nivel_bateria_percentagem
    };

    // Verificar velocidade máxima
    if (registo.velocidade_kmh > condutor.velocidade_maxima) {
      condutor.velocidade_maxima = registo.velocidade_kmh;
    }

    if (registo.velocidade_kmh > this.estatisticas.velocidade_maxima_registada) {
      this.estatisticas.velocidade_maxima_registada = registo.velocidade_kmh;
    }

    // Verificar limites de velocidade
    this.verificarLimitesVelocidade(registo, condutor);

    // Log de movimento significativo
    if (registo.velocidade_kmh > 0 || distancia > 0.01) {
      const emoji = this.getEmojiVelocidade(registo.velocidade_kmh);
      console.log(
        `${emoji} ${condutor.nome}: ${registo.velocidade_kmh.toFixed(1)} km/h | ` +
        `📍 ${registo.latitude.toFixed(6)}, ${registo.longitude.toFixed(6)} | ` +
        `📏 ${(distancia * 1000).toFixed(0)}m | ` +
        `🔋 ${registo.nivel_bateria_percentagem}%`
      );
    }
  }

  // Verificar limites de velocidade
  verificarLimitesVelocidade(registo, condutor) {
    const limites = {
      CRITICO: 40,
      ALTO: 30,
      MEDIO: 20,
      BAIXO: 10
    };

    let nivelAlerta = null;
    let mensagem = '';

    if (registo.velocidade_kmh > limites.CRITICO) {
      nivelAlerta = 'CRITICO';
      mensagem = `🚨🚨🚨 ALERTA CRÍTICO: ${condutor.nome} a ${registo.velocidade_kmh.toFixed(1)} km/h!`;
    } else if (registo.velocidade_kmh > limites.ALTO) {
      nivelAlerta = 'ALTO';
      mensagem = `⚠️ Velocidade alta: ${condutor.nome} a ${registo.velocidade_kmh.toFixed(1)} km/h`;
    } else if (registo.velocidade_kmh > limites.MEDIO) {
      nivelAlerta = 'MEDIO';
      mensagem = `📢 Atenção: ${condutor.nome} a ${registo.velocidade_kmh.toFixed(1)} km/h`;
    }

    if (nivelAlerta) {
      this.emitirAlerta(registo.profile_id_condutor, nivelAlerta, mensagem, registo);
      condutor.alertas++;
      this.estatisticas.alertas_emitidos++;
    }
  }

  // Emitir alerta
  emitirAlerta(condutor_id, nivel, mensagem, dados) {
    console.log(`\n${mensagem}`);
    
    // Evitar spam de alertas
    const ultimoAlerta = this.alertasAtivos.get(condutor_id);
    const agora = new Date();
    
    if (!ultimoAlerta || (agora - ultimoAlerta.timestamp) > 60000) {
      this.alertasAtivos.set(condutor_id, {
        nivel: nivel,
        timestamp: agora,
        dados: dados
      });

      // Aqui poderias enviar notificações (email, SMS, webhook, etc.)
      if (nivel === 'CRITICO') {
        this.enviarNotificacaoCritica(mensagem, dados);
      }
    }
  }

  // Enviar notificação crítica
  async enviarNotificacaoCritica(mensagem, dados) {
    console.log('📧 Enviando notificação crítica...');
    
    // Registar na base de dados
    await supabase.from('ocorrencias_sistema').insert([{
      tipo_ocorrencia: 'ALERTA_VELOCIDADE_CRITICO',
      descricao: mensagem,
      profile_id_envolvido: dados.profile_id_condutor,
      anexos_url: {
        velocidade: dados.velocidade_kmh,
        coordenadas: [dados.latitude, dados.longitude],
        timestamp: dados.timestamp_registo
      }
    }]);

    // Aqui integrarias com sistema de notificações real
    // await enviarEmail(...)
    // await enviarSMS(...)
    // await webhookSlack(...)
  }

  // Mostrar dashboard
  mostrarDashboard() {
    console.clear();
    console.log('🚦 MONITOR DE VELOCIDADE - DASHBOARD MULTIPARK');
    console.log('═══════════════════════════════════════════════');
    console.log(`⏰ ${new Date().toLocaleString('pt-PT')}`);
    console.log('');
    
    console.log('📊 ESTATÍSTICAS GERAIS:');
    console.log(`   Total de Registos: ${this.estatisticas.total_registos}`);
    console.log(`   Alertas Emitidos: ${this.estatisticas.alertas_emitidos}`);
    console.log(`   Velocidade Máxima: ${this.estatisticas.velocidade_maxima_registada.toFixed(1)} km/h`);
    
    const tempo = Math.floor((new Date() - this.estatisticas.inicio_monitorizacao) / 60000);
    console.log(`   Tempo de Monitorização: ${tempo} minutos`);
    console.log('');
    
    console.log('👥 CONDUTORES ATIVOS:');
    console.log('───────────────────────────────────────────────');
    
    this.condutoresMonitorizados.forEach((condutor, id) => {
      if (condutor.ultima_posicao) {
        const emoji = this.getEmojiVelocidade(condutor.ultima_posicao.velocidade);
        const status = condutor.ultima_posicao.velocidade > 0 ? '🟢' : '🔴';
        
        console.log(
          `${status} ${condutor.nome.padEnd(20)} | ` +
          `${emoji} ${condutor.ultima_posicao.velocidade.toFixed(1).padStart(5)} km/h | ` +
          `📍 ${condutor.ultima_posicao.lat.toFixed(4)}, ${condutor.ultima_posicao.lng.toFixed(4)} | ` +
          `🔋 ${condutor.ultima_posicao.bateria}% | ` +
          `⚠️ ${condutor.alertas} alertas`
        );
      }
    });
    
    console.log('───────────────────────────────────────────────');
    
    if (this.alertasAtivos.size > 0) {
      console.log('\n⚠️ ALERTAS ATIVOS:');
      this.alertasAtivos.forEach((alerta, condutor_id) => {
        const condutor = this.condutoresMonitorizados.get(condutor_id);
        const tempoAlerta = Math.floor((new Date() - alerta.timestamp) / 1000);
        console.log(`   🚨 ${condutor.nome}: Nível ${alerta.nivel} (há ${tempoAlerta}s)`);
      });
    }
    
    console.log('\n📡 Monitorização em tempo real ativa...');
    console.log('Pressiona Ctrl+C para parar');
  }

  // Calcular distância entre dois pontos
  calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Obter emoji baseado na velocidade
  getEmojiVelocidade(velocidade) {
    if (velocidade === 0) return '🛑';
    if (velocidade < 10) return '🐢';
    if (velocidade < 20) return '🚶';
    if (velocidade < 30) return '🚗';
    if (velocidade < 40) return '🏎️';
    return '🚀';
  }
}

// Iniciar monitor
const monitor = new MonitorVelocidade();

// Tratar sinais de saída
process.on('SIGINT', () => {
  console.log('\n\n👋 A encerrar monitor...');
  console.log('📊 Estatísticas finais:');
  console.log(`   Total de registos processados: ${monitor.estatisticas.total_registos}`);
  console.log(`   Total de alertas emitidos: ${monitor.estatisticas.alertas_emitidos}`);
  console.log(`   Velocidade máxima registada: ${monitor.estatisticas.velocidade_maxima_registada.toFixed(1)} km/h`);
  process.exit(0);
});

// Arrancar
monitor.iniciar().catch(console.error);
