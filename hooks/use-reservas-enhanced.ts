"use client"
import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'

// Tipos e interfaces
export interface ReservaEnhanced {
  id_pk: string
  booking_id?: string
  license_plate: string
  alocation?: string
  
  // Dados do cliente
  name_cliente?: string
  lastname_cliente?: string
  email_cliente?: string
  phone_number_cliente?: string
  nif_cliente?: string
  
  // Datas e estados
  booking_date?: string
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  estado_reserva_atual: string
  
  // Preços
  booking_price?: number
  parking_price?: number
  delivery_price?: number
  extras_price?: number
  total_price?: number
  corrected_price?: number
  
  // Parque e localização
  parque_id?: string
  park_name?: string
  localizacao_veiculo_fila?: string
  localizacao_veiculo_lugar?: string
  parking_type?: string
  
  // Info do veículo
  marca_veiculo?: string
  modelo_veiculo?: string
  cor_veiculo?: string
  car_info?: string
  car_location?: string
  
  // Check-in/out detalhes
  kms_entrada?: number
  kms_saida?: number
  danos_checkin?: string
  danos_checkout?: string
  fotos_checkin_urls?: any[]
  fotos_checkout_urls?: any[]
  observacoes_recolha?: string
  observacoes_entrega?: string
  
  // Condutores
  condutor_recolha_id?: string
  condutor_entrega_id?: string
  profile_id_checkin?: string
  profile_id_checkout?: string
  
  // Sincronização
  sync_status?: string
  sync_errors?: any
  last_sync_at?: string
  
  // Timestamps
  created_at_db?: string
  updated_at_db?: string
  
  // Dados calculados
  dias_estacionamento?: number
  valor_por_dia?: number
  kms_percorridos?: number
  tem_danos?: boolean
  tem_fotos?: boolean
}

export interface MovimentacaoVeiculo {
  id_pk?: string
  reserva_id: string
  matricula_veiculo: string
  alocation_veiculo?: string
  tipo_movimento: 'RECOLHA' | 'ENTREGA' | 'TRANSFERENCIA' | 'CHECK_IN' | 'CHECK_OUT'
  profile_id_condutor?: string
  data_hora_movimento: string
  parque_id?: string
  localizacao_origem?: string
  localizacao_destino?: string
  observacoes?: string
  dados_ficheiro_original?: any
}

export interface MetricasReservas {
  total_reservas: number
  reservas_hoje: number
  reservas_ativas: number
  
  // Por estado
  pendentes: number
  confirmadas: number
  check_in: number
  check_out: number
  canceladas: number
  no_show: number
  
  // Financeiro
  receita_total: number
  receita_mes: number
  receita_hoje: number
  ticket_medio: number
  
  // Operacional
  taxa_ocupacao: number
  taxa_conclusao: number
  taxa_cancelamento: number
  taxa_no_show: number
  tempo_medio_estadia: number
  
  // Por parque
  reservas_por_parque: Record<string, number>
  receita_por_parque: Record<string, number>
}

interface UseReservasEnhancedOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  parqueId?: string
  limit?: number
}

export function useReservasEnhanced(options: UseReservasEnhancedOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000, parqueId, limit = 100 } = options
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  
  // Estados principais
  const [reservas, setReservas] = useState<ReservaEnhanced[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metricas, setMetricas] = useState<MetricasReservas | null>(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })

  // Função para buscar reservas
  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Query simplificada primeiro para testar
      let query = supabase
        .from('reservas')
        .select('*')
        .order('created_at_db', { ascending: false })
        .limit(limit)

      // Aplicar filtros
      if (parqueId) {
        query = query.eq('parque_id', parqueId)
      }

      if (estadoFilter !== 'all') {
        query = query.eq('estado_reserva_atual', estadoFilter)
      }

      if (dateRange.start) {
        query = query.gte('check_in_previsto', dateRange.start.toISOString())
      }

      if (dateRange.end) {
        query = query.lte('check_out_previsto', dateRange.end.toISOString())
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro Supabase:', error)
        throw new Error(error.message || 'Erro ao buscar reservas')
      }

      // Processar e enriquecer dados
      const processedData = (data || []).map(reserva => ({
        ...reserva,
        dias_estacionamento: calcularDiasEstacionamento(reserva),
        valor_por_dia: calcularValorPorDia(reserva),
        kms_percorridos: calcularKmsPercorridos(reserva),
        tem_danos: !!(reserva.danos_checkin || reserva.danos_checkout),
        tem_fotos: !!(reserva.fotos_checkin_urls?.length || reserva.fotos_checkout_urls?.length)
      }))

      console.log(`Encontradas ${processedData.length} reservas`)
      setReservas(processedData)
      setError(null)
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido ao buscar reservas'
      console.error('Erro ao buscar reservas:', errorMessage, err)
      setError(errorMessage)
      toast({
        title: "Erro ao carregar reservas",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, parqueId, estadoFilter, dateRange, limit, toast])

  // Função para fazer check-in
  const checkInVeiculo = async (
    reservaId: string,
    dados: {
      kms_entrada: number
      danos?: string
      fotos?: File[]
      observacoes?: string
      localizacao_fila?: string
      localizacao_lugar?: string
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilizador não autenticado')

      // Upload de fotos se houver
      let fotosUrls: string[] = []
      if (dados.fotos && dados.fotos.length > 0) {
        fotosUrls = await uploadFotos(reservaId, dados.fotos, 'checkin')
      }

      // Atualizar reserva
      const { error: updateError } = await supabase
        .from('reservas')
        .update({
          check_in_real: new Date().toISOString(),
          kms_entrada: dados.kms_entrada,
          danos_checkin: dados.danos || null,
          fotos_checkin_urls: fotosUrls,
          observacoes_recolha: dados.observacoes || null,
          localizacao_veiculo_fila: dados.localizacao_fila || null,
          localizacao_veiculo_lugar: dados.localizacao_lugar || null,
          estado_reserva_atual: 'CHECK_IN',
          profile_id_checkin: user.id,
          updated_at_db: new Date().toISOString()
        })
        .eq('id_pk', reservaId)

      if (updateError) throw updateError

      // Registar movimentação
      const { data: reserva } = await supabase
        .from('reservas')
        .select('license_plate, alocation, parque_id')
        .eq('id_pk', reservaId)
        .single()

      if (reserva) {
        await registrarMovimentacao({
          reserva_id: reservaId,
          matricula_veiculo: reserva.license_plate,
          alocation_veiculo: reserva.alocation,
          tipo_movimento: 'CHECK_IN',
          profile_id_condutor: user.id,
          data_hora_movimento: new Date().toISOString(),
          parque_id: reserva.parque_id,
          localizacao_destino: `Fila ${dados.localizacao_fila} - Lugar ${dados.localizacao_lugar}`,
          observacoes: dados.observacoes
        })
      }

      toast({
        title: "Check-in realizado",
        description: "Veículo registado com sucesso no parque"
      })

      // Atualizar lista
      await fetchReservas()
      
      return true
    } catch (err: any) {
      console.error('Erro no check-in:', err)
      toast({
        title: "Erro no check-in",
        description: err.message,
        variant: "destructive"
      })
      return false
    }
  }

  // Função para fazer check-out
  const checkOutVeiculo = async (
    reservaId: string,
    dados: {
      kms_saida: number
      danos?: string
      fotos?: File[]
      observacoes?: string
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilizador não autenticado')

      // Upload de fotos se houver
      let fotosUrls: string[] = []
      if (dados.fotos && dados.fotos.length > 0) {
        fotosUrls = await uploadFotos(reservaId, dados.fotos, 'checkout')
      }

      // Buscar dados da reserva para calcular extras
      const { data: reserva } = await supabase
        .from('reservas')
        .select('*')
        .eq('id_pk', reservaId)
        .single()

      if (!reserva) throw new Error('Reserva não encontrada')

      // Calcular quilómetros extras
      const kmsExtras = (dados.kms_saida || 0) - (reserva.kms_entrada || 0)
      let valorExtrasKms = 0
      
      if (kmsExtras > 200) { // Assumindo 200km incluídos
        valorExtrasKms = (kmsExtras - 200) * 0.15 // €0.15 por km extra
      }

      // Atualizar reserva
      const { error: updateError } = await supabase
        .from('reservas')
        .update({
          check_out_real: new Date().toISOString(),
          kms_saida: dados.kms_saida,
          danos_checkout: dados.danos || null,
          fotos_checkout_urls: fotosUrls,
          observacoes_entrega: dados.observacoes || null,
          estado_reserva_atual: 'CHECK_OUT',
          profile_id_checkout: user.id,
          extras_price: (reserva.extras_price || 0) + valorExtrasKms,
          corrected_price: (reserva.total_price || 0) + valorExtrasKms,
          updated_at_db: new Date().toISOString()
        })
        .eq('id_pk', reservaId)

      if (updateError) throw updateError

      // Registar movimentação
      await registrarMovimentacao({
        reserva_id: reservaId,
        matricula_veiculo: reserva.license_plate,
        alocation_veiculo: reserva.alocation,
        tipo_movimento: 'CHECK_OUT',
        profile_id_condutor: user.id,
        data_hora_movimento: new Date().toISOString(),
        parque_id: reserva.parque_id,
        localizacao_origem: `Fila ${reserva.localizacao_veiculo_fila} - Lugar ${reserva.localizacao_veiculo_lugar}`,
        observacoes: dados.observacoes
      })

      toast({
        title: "Check-out realizado",
        description: kmsExtras > 200 
          ? `Veículo entregue. Cobrado €${valorExtrasKms.toFixed(2)} por kms extras`
          : "Veículo entregue com sucesso"
      })

      // Atualizar lista
      await fetchReservas()
      
      return true
    } catch (err: any) {
      console.error('Erro no check-out:', err)
      toast({
        title: "Erro no check-out",
        description: err.message,
        variant: "destructive"
      })
      return false
    }
  }

  // Upload de fotos
  const uploadFotos = async (reservaId: string, fotos: File[], tipo: 'checkin' | 'checkout') => {
    const urls: string[] = []
    
    for (const foto of fotos) {
      const fileName = `${reservaId}/${tipo}/${Date.now()}_${foto.name}`
      
      const { data, error } = await supabase.storage
        .from('reservas-fotos')
        .upload(fileName, foto)
      
      if (error) {
        console.error('Erro no upload:', error)
        continue
      }
      
      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('reservas-fotos')
          .getPublicUrl(fileName)
        
        urls.push(publicUrl)
      }
    }
    
    return urls
  }

  // Registar movimentação
  const registrarMovimentacao = async (movimentacao: MovimentacaoVeiculo) => {
    const { error } = await supabase
      .from('movimentacoes_veiculos')
      .insert([movimentacao])
    
    if (error) {
      console.error('Erro ao registar movimentação:', error)
    }
  }

  // Cancelar reserva
  const cancelarReserva = async (reservaId: string, motivo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilizador não autenticado')

      const { error } = await supabase
        .from('reservas')
        .update({
          estado_reserva_atual: 'CANCELADA',
          data_cancelamento_registo: new Date().toISOString(),
          motivo_cancelamento_texto: motivo,
          user_id_cancelamento: user.id,
          updated_at_db: new Date().toISOString()
        })
        .eq('id_pk', reservaId)

      if (error) throw error

      toast({
        title: "Reserva cancelada",
        description: "A reserva foi cancelada com sucesso"
      })

      await fetchReservas()
      return true
    } catch (err: any) {
      console.error('Erro ao cancelar:', err)
      toast({
        title: "Erro ao cancelar",
        description: err.message,
        variant: "destructive"
      })
      return false
    }
  }

  // Atualizar estado da reserva
  const atualizarEstado = async (reservaId: string, novoEstado: string) => {
    try {
      const { error } = await supabase
        .from('reservas')
        .update({
          estado_reserva_atual: novoEstado,
          updated_at_db: new Date().toISOString()
        })
        .eq('id_pk', reservaId)

      if (error) throw error

      toast({
        title: "Estado atualizado",
        description: `Estado alterado para ${novoEstado}`
      })

      await fetchReservas()
      return true
    } catch (err: any) {
      console.error('Erro ao atualizar estado:', err)
      toast({
        title: "Erro ao atualizar",
        description: err.message,
        variant: "destructive"
      })
      return false
    }
  }

  // Buscar métricas
  const fetchMetricas = useCallback(async () => {
    try {
      // Total de reservas
      const { count: totalReservas } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })

      // Reservas hoje
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      const { count: reservasHoje } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .gte('check_in_previsto', hoje.toISOString())
        .lt('check_in_previsto', new Date(hoje.getTime() + 24 * 60 * 60 * 1000).toISOString())

      // Por estado
      const { data: porEstado } = await supabase
        .from('reservas')
        .select('estado_reserva_atual')

      const estados = porEstado?.reduce((acc: any, curr) => {
        const estado = curr.estado_reserva_atual || 'SEM_ESTADO'
        acc[estado] = (acc[estado] || 0) + 1
        return acc
      }, {})

      // Receitas
      const { data: receitas } = await supabase
        .from('reservas')
        .select('total_price, corrected_price, created_at_db')
        .not('estado_reserva_atual', 'eq', 'CANCELADA')

      const receitaTotal = receitas?.reduce((sum, r) => sum + (r.corrected_price || r.total_price || 0), 0) || 0
      
      // Receita do mês
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)
      
      const receitaMes = receitas
        ?.filter(r => new Date(r.created_at_db) >= inicioMes)
        ?.reduce((sum, r) => sum + (r.corrected_price || r.total_price || 0), 0) || 0

      // Receita hoje
      const receitaHoje = receitas
        ?.filter(r => new Date(r.created_at_db) >= hoje)
        ?.reduce((sum, r) => sum + (r.corrected_price || r.total_price || 0), 0) || 0

      const metricas: MetricasReservas = {
        total_reservas: totalReservas || 0,
        reservas_hoje: reservasHoje || 0,
        reservas_ativas: estados?.CHECK_IN || 0,
        
        pendentes: estados?.PENDENTE || 0,
        confirmadas: estados?.CONFIRMADA || 0,
        check_in: estados?.CHECK_IN || 0,
        check_out: estados?.CHECK_OUT || 0,
        canceladas: estados?.CANCELADA || 0,
        no_show: estados?.NO_SHOW || 0,
        
        receita_total: receitaTotal,
        receita_mes: receitaMes,
        receita_hoje: receitaHoje,
        ticket_medio: totalReservas ? receitaTotal / totalReservas : 0,
        
        taxa_ocupacao: 0, // Calcular com base nos parques
        taxa_conclusao: totalReservas ? ((estados?.CHECK_OUT || 0) / totalReservas) * 100 : 0,
        taxa_cancelamento: totalReservas ? ((estados?.CANCELADA || 0) / totalReservas) * 100 : 0,
        taxa_no_show: totalReservas ? ((estados?.NO_SHOW || 0) / totalReservas) * 100 : 0,
        tempo_medio_estadia: 0, // Calcular com base nas datas
        
        reservas_por_parque: {},
        receita_por_parque: {}
      }

      setMetricas(metricas)
    } catch (err: any) {
      console.error('Erro ao buscar métricas:', err)
    }
  }, [supabase])

  // Funções auxiliares
  const calcularDiasEstacionamento = (reserva: any) => {
    if (!reserva.check_in_previsto || !reserva.check_out_previsto) return 0
    
    const checkIn = new Date(reserva.check_in_real || reserva.check_in_previsto)
    const checkOut = new Date(reserva.check_out_real || reserva.check_out_previsto)
    
    const diffMs = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  const calcularValorPorDia = (reserva: any) => {
    const dias = calcularDiasEstacionamento(reserva)
    if (dias === 0) return 0
    
    return (reserva.total_price || 0) / dias
  }

  const calcularKmsPercorridos = (reserva: any) => {
    if (!reserva.kms_entrada || !reserva.kms_saida) return 0
    return reserva.kms_saida - reserva.kms_entrada
  }

  // Auto-refresh
  useEffect(() => {
    fetchReservas()
    fetchMetricas()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchReservas()
        fetchMetricas()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [fetchReservas, fetchMetricas, autoRefresh, refreshInterval])

  // Filtrar reservas localmente
  const reservasFiltradas = reservas.filter(reserva => {
    if (!searchTerm) return true
    
    const search = searchTerm.toLowerCase()
    return (
      reserva.license_plate?.toLowerCase().includes(search) ||
      reserva.name_cliente?.toLowerCase().includes(search) ||
      reserva.email_cliente?.toLowerCase().includes(search) ||
      reserva.phone_number_cliente?.includes(search) ||
      reserva.booking_id?.toLowerCase().includes(search)
    )
  })

  return {
    // Dados
    reservas: reservasFiltradas,
    metricas,
    loading,
    error,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    estadoFilter,
    setEstadoFilter,
    dateRange,
    setDateRange,
    
    // Ações
    fetchReservas,
    fetchMetricas,
    checkInVeiculo,
    checkOutVeiculo,
    cancelarReserva,
    atualizarEstado,
    uploadFotos,
    
    // Utils
    calcularDiasEstacionamento,
    calcularValorPorDia,
    calcularKmsPercorridos
  }
}
