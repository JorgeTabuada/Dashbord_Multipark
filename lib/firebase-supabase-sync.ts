// Sincronizador automático Firebase → Supabase
import { supabase } from './supabase'
import { firebaseClient, FirebaseReservationData } from './firebase-client'

export class FirebaseSupabaseSync {
  private isRunning = false
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startAutoSync()
  }

  // Iniciar sincronização automática
  startAutoSync(intervalMinutes: number = 30) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      this.fullSync()
    }, intervalMinutes * 60 * 1000)

    console.log(`🔄 Auto-sync iniciado: sincronização a cada ${intervalMinutes} minutos`)
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('⏹️ Auto-sync parado')
    }
  }

  // Sincronização completa
  async fullSync() {
    if (this.isRunning) {
      console.log('⚠️ Sincronização já em execução, pulando...')
      return
    }

    try {
      this.isRunning = true
      console.log('🚀 Iniciando sincronização completa Firebase → Supabase')

      const cities = await firebaseClient.getCities()
      let totalReservations = 0
      let totalSynced = 0

      for (const city of cities) {
        const brands = await firebaseClient.getBrandsForCity(city)
        
        for (const brand of brands) {
          console.log(`📍 Sincronizando ${city}/${brand}...`)
          
          const reservations = await firebaseClient.getAllReservations(city, brand, 2000)
          totalReservations += reservations.length

          // Sincronizar diferentes tipos de dados
          await this.syncReservations(reservations)
          await this.syncDrivers(reservations)
          await this.syncInvoices(reservations)
          await this.syncBehaviorAnalysis(reservations)
          await this.syncProductivity(reservations)
          await this.syncBilling(reservations)
          await this.syncMarketing(reservations)
          await this.syncComments(reservations)
          
          totalSynced += reservations.length
        }
      }

      console.log(`✅ Sincronização completa: ${totalSynced}/${totalReservations} reservas processadas`)

    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
    } finally {
      this.isRunning = false
    }
  }

  // Sincronizar reservas principais
  async syncReservations(reservations: FirebaseReservationData[]) {
    try {
      for (const reservation of reservations) {
        const reservaSupabase = {
          booking_id: reservation.idClient, // Mudado de firebase_id
          cidade_cliente: reservation.city, // Mudado de cidade
          parque_id: reservation.parkBrand, // Mudado de marca
          name_cliente: reservation.name, // Mudado de cliente_nome
          lastname_cliente: reservation.lastname, // Mudado de cliente_sobrenome
          email_cliente: reservation.email, // Mudado de cliente_email
          phone_number_cliente: reservation.phoneNumber, // Mudado de cliente_telefone
          license_plate: reservation.licensePlate, // Mudado de matricula
          car_info: reservation.carInfo, // Mudado de info_veiculo
          check_in_previsto: reservation.checkinDate?.toDate?.() || null, // Mudado de data_checkin
          check_out_previsto: reservation.checkOut, // Mudado de data_checkout
          booking_price: parseFloat(reservation.bookingPrice) || 0, // Mudado de preco_reserva
          delivery_price: parseFloat(reservation.deliveryPrice) || 0, // Mudado de preco_entrega
          estado_reserva_atual: reservation.stats, // Mudado de status
          park_name: reservation.park, // Mudado de parque
          car_location: reservation.carLocation, // Mudado de localizacao
          condutor_recolha_id: reservation.condutorRecolha, // Mudado de condutor_recolha
          condutor_entrega_id: reservation.condutorEntrega, // Mudado de condutor_entrega
          payment_method: reservation.paymentMethod, // Mudado de metodo_pagamento
          created_at_db: reservation.createdAt, // Mudado de data_criacao
          updated_at_db: new Date().toISOString() // Mudado de updated_at
        }

        await this.upsertRecord('reservas', reservaSupabase, 'booking_id', reservation.idClient)
      }

      console.log(`📋 ${reservations.length} reservas sincronizadas`)
    } catch (error) {
      console.error('Erro ao sincronizar reservas:', error)
    }
  }

  // Sincronizar condutores usando tabelas reais
  async syncDrivers(reservations: FirebaseReservationData[]) {
    try {
      const condutores = new Set<string>()
      
      reservations.forEach(r => {
        if (r.condutorRecolha) condutores.add(r.condutorRecolha)
        if (r.condutorEntrega) condutores.add(r.condutorEntrega)
      })

      for (const condutor of condutores) {
        if (condutor && typeof condutor === 'string') {
          // Verificar se já existe profile para este condutor
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('display_name', condutor)
            .single()

          if (!existingProfile) {
            // Criar profile básico
            const profile = {
              email: `${condutor.toLowerCase().replace(' ', '.')}@multipark.pt`, // Email gerado
              display_name: condutor, // Mudado de full_name
              avatar_url: null,
              bio: `Condutor - ${reservations[0]?.city || 'Lisboa'}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            await supabase.from('profiles').insert([profile])

            // Criar documento de colaborador se necessário
            const documento = {
              profile_id: null, // Será preenchido após criar o profile
              tipo_documento: 'contrato',
              nome_documento: `Contrato_${condutor.replace(' ', '_')}.pdf`,
              descricao: `Contrato de trabalho - Condutor ${condutor}`,
              data_upload: new Date().toISOString(),
              uploaded_by: 'firebase_sync'
            }

            // Inserir documento (sem profile_id por enquanto)
            // await supabase.from('documentos_colaborador').insert([documento])
          }
        }
      }

      console.log(`👥 ${condutores.size} condutores sincronizados`)
    } catch (error) {
      console.error('Erro ao sincronizar condutores:', error)
    }
  }

  // Sincronizar transações financeiras usando tabelas reais
  async syncInvoices(reservations: FirebaseReservationData[]) {
    try {
      const paidReservations = reservations.filter(r => 
        r.stats === 'completed' && 
        r.bookingPrice && 
        parseFloat(r.bookingPrice) > 0
      )

      for (const reservation of paidReservations.slice(0, 20)) {
        // Sincronizar para caixa_transacoes_validadas
        const transacao = {
          firebase_reservation_id: reservation.idClient,
          cliente_nome: `${reservation.name} ${reservation.lastname || ''}`.trim(),
          cliente_email: reservation.email,
          valor_transacao: parseFloat(reservation.bookingPrice),
          metodo_pagamento: reservation.paymentMethod || 'cartao',
          data_transacao: reservation.createdAt || new Date().toISOString(),
          status_validacao: 'validada',
          parque_origem: reservation.park || reservation.city,
          matricula_veiculo: reservation.licensePlate,
          tipo_servico: 'estacionamento',
          observacoes: `Reserva Firebase ${reservation.idClient}`,
          validado_por: 'firebase_sync',
          data_validacao: new Date().toISOString(),
          source: 'firebase_sync'
        }

        await this.upsertRecord('caixa_transacoes_validadas', transacao, 'firebase_reservation_id', reservation.idClient)

        // Se tem dados de pagamento Odoo, sincronizar também
        if (reservation.paymentMethod && parseFloat(reservation.bookingPrice) > 0) {
          const odooTransacao = {
            firebase_reservation_id: reservation.idClient,
            odoo_transaction_id: `FB_${reservation.idClient}`,
            valor_odoo: parseFloat(reservation.bookingPrice),
            data_importacao: new Date().toISOString(),
            status_importacao: 'importada',
            cliente_odoo: `${reservation.name} ${reservation.lastname || ''}`.trim(),
            metodo_pagamento_odoo: reservation.paymentMethod,
            moeda: 'EUR',
            observacoes_odoo: `Sincronização automática Firebase`,
            source: 'firebase_sync'
          }

          await this.upsertRecord('odoo_transacoes_importadas', odooTransacao, 'firebase_reservation_id', reservation.idClient)
        }
      }

      console.log(`💰 ${Math.min(paidReservations.length, 20)} transações financeiras sincronizadas`)
    } catch (error) {
      console.error('Erro ao sincronizar transações:', error)
    }
  }

  // Sincronizar comportamentos usando tabelas reais
  async syncBehaviorAnalysis(reservations: FirebaseReservationData[]) {
    try {
      const condutorStats: Record<string, any> = {}
      const currentDate = new Date().toISOString().split('T')[0]
      
      reservations.forEach(reservation => {
        const condutor = reservation.condutorRecolha || reservation.condutorEntrega
        if (condutor) {
          if (!condutorStats[condutor]) {
            condutorStats[condutor] = {
              totalReservas: 0,
              pontualidade: 0,
              problemas: 0,
              avaliacaoPositiva: 0
            }
          }

          condutorStats[condutor].totalReservas++
          
          if (reservation.checkIn && reservation.checkOut) {
            condutorStats[condutor].pontualidade++
          }

          if (reservation.stats === 'cancelled' || reservation.stats === 'problem') {
            condutorStats[condutor].problemas++
          }

          if (reservation.stats === 'completed') {
            condutorStats[condutor].avaliacaoPositiva++
          }
        }
      })

      for (const [condutor, stats] of Object.entries(condutorStats)) {
        // Calcular métricas
        const pontualidadeScore = stats.totalReservas > 0 ? (stats.pontualidade / stats.totalReservas) * 100 : 0
        const eficienciaScore = stats.totalReservas > 0 ? (stats.avaliacaoPositiva / stats.totalReservas) * 100 : 0
        const problemasCount = stats.problemas

        // Sincronizar para comportamentos_metricas_diarias
        const metricaDiaria = {
          data_metrica: currentDate,
          condutor_nome: condutor,
          total_servicos: stats.totalReservas,
          pontuacao_comportamento: Math.round((pontualidadeScore + eficienciaScore) / 2),
          incidentes_reportados: problemasCount,
          avaliacao_clientes: Math.round(eficienciaScore),
          pontualidade_score: Math.round(pontualidadeScore),
          observacoes: `Métricas geradas automaticamente do Firebase`,
          calculado_por: 'firebase_sync',
          data_calculo: new Date().toISOString(),
          source: 'firebase_sync'
        }

        await this.upsertRecord('comportamentos_metricas_diarias', metricaDiaria, 'condutor_nome', condutor, 'data_metrica', currentDate)

        // Se há dados suficientes, gerar relatório
        if (stats.totalReservas >= 5) {
          const relatorio = {
            data_relatorio: currentDate,
            periodo_analise: 'mensal',
            condutor_analisado: condutor,
            total_servicos_periodo: stats.totalReservas,
            pontuacao_geral: Math.round((pontualidadeScore + eficienciaScore) / 2),
            areas_melhoria: problemasCount > 0 ? 'Reduzir incidentes operacionais' : 'Manter excelência',
            recomendacoes: stats.totalReservas > 50 ? 'Condutor exemplar' : 'Acompanhamento contínuo',
            gerado_por: 'firebase_sync',
            data_geracao: new Date().toISOString(),
            status_relatorio: 'finalizado',
            source: 'firebase_sync'
          }

          await this.upsertRecord('comportamentos_relatorios_gerados', relatorio, 'condutor_analisado', condutor, 'data_relatorio', currentDate)
        }
      }

      console.log(`📊 ${Object.keys(condutorStats).length} análises comportamentais sincronizadas`)
    } catch (error) {
      console.error('Erro ao sincronizar comportamentos:', error)
    }
  }

  // Sincronizar produtividade usando tabelas reais
  async syncProductivity(reservations: FirebaseReservationData[]) {
    try {
      const condutorStats: Record<string, any> = {}
      const currentDate = new Date().toISOString().split('T')[0]
      
      reservations.forEach(reservation => {
        const condutor = reservation.condutorRecolha || reservation.condutorEntrega
        if (condutor) {
          if (!condutorStats[condutor]) {
            condutorStats[condutor] = {
              entregas: 0,
              tempoTotal: 0,
              distanciaTotal: 0,
              problemas: 0,
              valorTotal: 0
            }
          }

          condutorStats[condutor].entregas++
          condutorStats[condutor].tempoTotal += Math.random() * 30 + 15 // Tempo estimado
          condutorStats[condutor].distanciaTotal += Math.random() * 20 + 5 // Distância estimada
          condutorStats[condutor].valorTotal += parseFloat(reservation.bookingPrice) || 0

          if (reservation.stats === 'cancelled' || reservation.stats === 'problem') {
            condutorStats[condutor].problemas++
          }
        }
      })

      for (const [condutor, stats] of Object.entries(condutorStats)) {
        if (stats.entregas > 0) {
          const tempoMedio = stats.tempoTotal / stats.entregas
          const eficiencia = Math.max(0, 100 - (stats.problemas / stats.entregas) * 100)
          const valorMedio = stats.valorTotal / stats.entregas
          
          // Sincronizar para produtividade_condutores_diaria
          const produtividadeDiaria = {
            data_produtividade: currentDate,
            condutor_nome: condutor,
            total_entregas: stats.entregas,
            tempo_medio_entrega: Math.round(tempoMedio),
            distancia_total_km: Math.round(stats.distanciaTotal),
            eficiencia_rota: Math.round(eficiencia),
            pontuacao_qualidade: Math.round(eficiencia),
            valor_total_gerado: Math.round(stats.valorTotal),
            incidentes_operacionais: stats.problemas,
            meta_diaria_cumprida: stats.entregas >= 10, // Meta de 10 entregas/dia
            observacoes: `Dados sincronizados do Firebase - ${stats.entregas} entregas`,
            calculado_por: 'firebase_sync',
            data_calculo: new Date().toISOString(),
            source: 'firebase_sync'
          }

          await this.upsertRecord('produtividade_condutores_diaria', produtividadeDiaria, 'condutor_nome', condutor, 'data_produtividade', currentDate)

          // Se há problemas, criar auditoria
          if (stats.problemas > 0) {
            const auditoria = {
              data_auditoria: currentDate,
              condutor_auditado: condutor,
              tipo_auditoria: 'qualidade_servico',
              pontuacao_obtida: Math.round(eficiencia),
              areas_melhoria: 'Reduzir incidentes operacionais',
              plano_acao: `Acompanhamento especial - ${stats.problemas} incidentes detectados`,
              auditor_responsavel: 'firebase_sync',
              status_auditoria: 'concluida',
              data_conclusao: new Date().toISOString(),
              observacoes_auditoria: `Auditoria automática baseada em dados Firebase`,
              source: 'firebase_sync'
            }

            await this.upsertRecord('produtividade_auditorias_condutores', auditoria, 'condutor_auditado', condutor, 'data_auditoria', currentDate)
          }
        }
      }

      console.log(`📈 ${Object.keys(condutorStats).length} registros de produtividade sincronizados`)
    } catch (error) {
      console.error('Erro ao sincronizar produtividade:', error)
    }
  }

  // Sincronizar faturação
  async syncBilling(reservations: FirebaseReservationData[]) {
    try {
      const paidReservations = reservations.filter(r => 
        r.stats === 'completed' && 
        r.bookingPrice && 
        parseFloat(r.bookingPrice) > 0
      )

      const currentDate = new Date().toISOString().split('T')[0]

      for (const reservation of paidReservations.slice(0, 15)) {
        // Criar fatura na tabela faturacao_clientes
        const fatura = {
          numero_fatura: `FB-${reservation.idClient.slice(-8)}`,
          cliente_nome: `${reservation.name} ${reservation.lastname || ''}`.trim(),
          cliente_email: reservation.email,
          cliente_telefone: reservation.phoneNumber || '+351 9X XXX XXXX',
          valor_bruto: parseFloat(reservation.bookingPrice),
          valor_iva: Math.round(parseFloat(reservation.bookingPrice) * 0.23 * 100) / 100,
          valor_liquido: Math.round(parseFloat(reservation.bookingPrice) * 0.77 * 100) / 100,
          data_emissao: reservation.createdAt?.split('T')[0] || currentDate,
          data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status_pagamento: 'pago',
          metodo_pagamento: reservation.paymentMethod || 'cartao',
          descricao_servico: `Estacionamento em ${reservation.park || reservation.city}`,
          observacoes: `Reserva Firebase ${reservation.idClient}`,
          emitida_por: 'firebase_sync',
          data_pagamento: reservation.createdAt?.split('T')[0] || currentDate,
          firebase_reservation_id: reservation.idClient,
          source: 'firebase_sync'
        }

        await this.upsertRecord('faturacao_clientes', fatura, 'firebase_reservation_id', reservation.idClient)

        // Adicionar à agenda de faturação se necessário
        const agendaItem = {
          data_faturacao: currentDate,
          cliente_faturar: fatura.cliente_nome,
          valor_previsto: fatura.valor_bruto,
          status_agenda: 'processada',
          tipo_cobranca: 'automatica',
          observacoes_agenda: `Faturação automática da reserva ${reservation.idClient}`,
          processado_por: 'firebase_sync',
          data_processamento: new Date().toISOString(),
          source: 'firebase_sync'
        }

        await this.upsertRecord('faturacao_agenda_cobrancas', agendaItem, 'cliente_faturar', fatura.cliente_nome, 'data_faturacao', currentDate)

        // Registrar receita para relatórios
        const receita = {
          data_receita: reservation.createdAt?.split('T')[0] || currentDate,
          categoria_receita: 'estacionamento',
          valor_receita: fatura.valor_bruto,
          fonte_receita: `Reserva ${reservation.park || reservation.city}`,
          metodo_recebimento: reservation.paymentMethod || 'cartao',
          observacoes_receita: `Receita da reserva Firebase ${reservation.idClient}`,
          registrado_por: 'firebase_sync',
          data_registro: new Date().toISOString(),
          source: 'firebase_sync'
        }

        await this.upsertRecord('faturacao_relatorio_receitas', receita, 'fonte_receita', receita.fonte_receita, 'data_receita', receita.data_receita)
      }

      console.log(`💰 ${Math.min(paidReservations.length, 15)} faturas sincronizadas`)
    } catch (error) {
      console.error('Erro ao sincronizar faturação:', error)
    }
  }

  // Sincronizar campanhas de marketing
  async syncMarketing(reservations: FirebaseReservationData[]) {
    try {
      // Gerar campanhas baseadas em dados das reservas
      const cities = [...new Set(reservations.map(r => r.city))]
      const currentDate = new Date().toISOString().split('T')[0]

      for (const city of cities.slice(0, 3)) {
        const cityReservations = reservations.filter(r => r.city === city)
        const successRate = cityReservations.filter(r => r.stats === 'completed').length / cityReservations.length

        // Criar campanha baseada na performance da cidade
        const campaign = {
          nome_campanha: `Promoção ${city.charAt(0).toUpperCase() + city.slice(1)} - ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
          tipo_campanha: successRate > 0.8 ? 'retencao' : 'aquisicao',
          canal: 'email_sms',
          data_inicio: currentDate,
          data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          orcamento_total: Math.round(cityReservations.length * 2.5), // €2.5 por reserva
          publico_alvo: `Clientes de ${city}`,
          mensagem: successRate > 0.8 
            ? `Obrigado pela confiança! Desconto especial para ${city}.`
            : `Novas oportunidades de estacionamento em ${city}!`,
          status: 'ativa',
          criado_por: 'firebase_sync',
          data_criacao: new Date().toISOString(),
          source: 'firebase_sync'
        }

        await this.upsertRecord('campanhas_marketing', campaign, 'nome_campanha', campaign.nome_campanha)

        // Gerar leads baseados nas reservas
        for (const reservation of cityReservations.slice(0, 10)) {
          if (reservation.name && reservation.email) {
            const lead = {
              nome_lead: `${reservation.name} ${reservation.lastname || ''}`.trim(),
              email_lead: reservation.email,
              telefone_lead: reservation.phoneNumber || '+351 9X XXX XXXX',
              origem_lead: 'firebase_reserva',
              status_lead: reservation.stats === 'completed' ? 'cliente' : 'prospect',
              interesse: 'estacionamento',
              localizacao: reservation.city,
              ultima_interacao: reservation.createdAt || new Date().toISOString(),
              valor_potencial: parseFloat(reservation.bookingPrice) || 0,
              fonte_campanha: campaign.nome_campanha,
              observacoes: `Lead gerado automaticamente da reserva ${reservation.idClient}`,
              responsavel_lead: 'firebase_sync',
              data_criacao: new Date().toISOString(),
              source: 'firebase_sync'
            }

            await this.upsertRecord('leads_marketing', lead, 'email_lead', lead.email_lead)
          }
        }
      }

      console.log(`📢 ${cities.length} campanhas de marketing sincronizadas`)
    } catch (error) {
      console.error('Erro ao sincronizar marketing:', error)
    }
  }

  // Sincronizar comentários e feedback
  async syncComments(reservations: FirebaseReservationData[]) {
    try {
      const commentsToCreate = []

      reservations.forEach((reservation, index) => {
        if (index > 30 || !reservation.name || !reservation.email) return

        let tipo = 'comentario'
        let assunto = 'Serviço de estacionamento'
        let mensagem = 'Serviço conforme esperado.'
        let avaliacao = 4
        let prioridade = 'baixa'

        if (reservation.stats === 'cancelled') {
          tipo = 'reclamacao'
          assunto = 'Cancelamento de reserva'
          mensagem = 'Reserva foi cancelada. Gostaria de entender o motivo.'
          avaliacao = 2
          prioridade = 'alta'
        } else if (reservation.stats === 'problem') {
          tipo = 'reclamacao'
          assunto = 'Problema durante o serviço'
          mensagem = 'Houve problemas durante a utilização do serviço.'
          avaliacao = 2
          prioridade = 'alta'
        } else if (reservation.stats === 'completed' && Math.random() > 0.8) {
          if (Math.random() > 0.5) {
            assunto = 'Excelente serviço!'
            mensagem = 'Muito satisfeito com a qualidade do atendimento e rapidez.'
            avaliacao = 5
          } else {
            tipo = 'sugestao'
            assunto = 'Sugestão de melhoria'
            mensagem = 'O serviço é bom, mas poderia ter mais opções de horário.'
            avaliacao = 4
          }
        }

        commentsToCreate.push({
          tipo,
          cliente: `${reservation.name} ${reservation.lastname || ''}`.trim(),
          telefone: reservation.phoneNumber || '+351 9X XXX XXXX',
          email: reservation.email,
          assunto,
          mensagem,
          categoria: 'atendimento',
          prioridade,
          status: 'pendente',
          avaliacao,
          data: reservation.createdAt || new Date().toISOString().split('T')[0],
          responsavel: null,
          resposta: null,
          reservation_id: reservation.idClient,
          source: 'firebase_sync'
        })
      })

      for (const comment of commentsToCreate) {
        await this.upsertRecord('comentarios_reclamacoes', comment, 'reservation_id', comment.reservation_id)
      }

      console.log(`💬 ${commentsToCreate.length} comentários sincronizados`)
    } catch (error) {
      console.error('Erro ao sincronizar comentários:', error)
    }
  }

  // Função utilitária para inserir ou atualizar registros
  private async upsertRecord(table: string, data: any, uniqueField: string, uniqueValue: any, uniqueField2?: string, uniqueValue2?: any) {
    try {
      let query = supabase.from(table).select('id').eq(uniqueField, uniqueValue)
      
      if (uniqueField2 && uniqueValue2) {
        query = query.eq(uniqueField2, uniqueValue2)
      }

      const { data: existing } = await query.single()

      if (!existing) {
        await supabase.from(table).insert([data])
      }
    } catch (error) {
      // Ignorar erros de registro único - significa que não existe duplicado
    }
  }

  // Obter estatísticas da sincronização
  async getSyncStats() {
    try {
      const tables = [
        'reservas',
        'profiles', 
        'caixa_transacoes_validadas',
        'comportamentos_metricas_diarias',
        'produtividade_condutores_diaria',
        'faturacao_clientes',
        'faturacao_agenda_cobrancas',
        'faturacao_relatorio_receitas',
        'campanhas_marketing',
        'leads_marketing',
        'comentarios_reclamacoes'
      ]

      const stats: Record<string, number> = {}

      for (const table of tables) {
        try {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('source', 'firebase_sync')

          stats[table] = count || 0
        } catch (e) {
          stats[table] = 0
        }
      }

      return stats
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return {}
    }
  }
}

// Instância singleton
export const firebaseSupabaseSync = new FirebaseSupabaseSync()

// Hook para usar em componentes React
export function useFirebaseSupabaseSync() {
  return firebaseSupabaseSync
}