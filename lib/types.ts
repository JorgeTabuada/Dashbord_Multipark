// 📦 Interfaces centralizadas para o sistema Multipark
// ====================================================

// Interface principal de Reservas (sincronizada com Firebase)
export interface Reserva {
  // IDs
  id_pk: string // UUID do Supabase
  booking_id?: string // ID do Firebase
  
  // Dados do cliente
  name_cliente?: string
  lastname_cliente?: string
  email_cliente?: string
  phone_number_cliente?: string
  cidade_cliente?: string
  license_plate: string // Obrigatório
  
  // Dados da reserva
  estado_reserva_atual: 'reservado' | 'em_recolha' | 'recolhido' | 'em_entrega' | 'entregue' | 'cancelado'
  booking_price?: number
  check_in_previsto?: string | Date
  check_out_previsto?: string | Date
  check_in_real?: string | Date
  check_out_real?: string | Date
  
  // Dados do parque
  parque_id?: number
  parking_type?: string
  spot_number?: string
  
  // Dados de pagamento
  payment_method?: 'cartao' | 'mbway' | 'multibanco' | 'dinheiro'
  payment_status?: 'pendente' | 'pago' | 'cancelado'
  
  // Metadata
  created_at_db: string | Date
  updated_at_db: string | Date
  synced_from_firebase?: boolean
  
  // Extras
  observacoes?: string
  metadata?: any
}

// Interface para Funcionários (Recursos Humanos)
export interface Funcionario {
  id: string
  nomeCompleto: string
  morada: string
  dataNascimento: string
  nif: string
  docIdTipo: "CC" | "Passaporte" | "Outro"
  docIdNumero: string
  foto?: string
  funcao: string
  dataEntrada: string
  dataSaida?: string
  parquePrincipal: string
  supervisorDireto: string
  tipoColaborador: "Efetivo" | "Temporario" | "Estagiario" | "Consultor"
  ordenadoBruto: number
  horarioTrabalho: string
  nivelExtra?: string
  valorHoraExtra?: number
  status: "ativo" | "inativo" | "ferias" | "baixa"
  contacto?: string
  email?: string
  observacoes?: string
}

// Interface para Parques
export interface Parque {
  id: number
  nome: string
  cidade: string
  endereco: string
  capacidade_total: number
  lugares_ocupados: number
  lugares_disponiveis: number
  tipo: 'aeroporto' | 'cidade' | 'praia' | 'evento'
  ativo: boolean
  horario_abertura: string
  horario_fecho: string
  coordenadas?: {
    lat: number
    lng: number
  }
  tarifas?: {
    hora: number
    dia: number
    semana: number
    mes: number
  }
}

// Interface para Veículos
export interface Veiculo {
  id: string
  matricula: string
  marca: string
  modelo: string
  cor: string
  tipo: 'ligeiro' | 'suv' | 'moto' | 'van' | 'camiao'
  ano?: number
  cliente_id?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

// Interface para Estatísticas
export interface ReservasStats {
  total: number
  totalValue: number
  byStatus: Record<string, number>
  byCity: Record<string, number>
  byPark?: Record<string, number>
  todayCheckIns?: number
  todayCheckOuts?: number
  averageStayDuration?: number
}

// Interface para Sincronização
export interface SyncLog {
  id: string
  table_name: string
  operation: 'insert' | 'update' | 'delete'
  record_id: string
  firebase_id?: string
  status: 'pending' | 'success' | 'error'
  error_message?: string
  created_at: string
  processed_at?: string
}

// Estados de Reserva - Enum para consistência
export enum EstadoReserva {
  RESERVADO = 'reservado',
  EM_RECOLHA = 'em_recolha',
  RECOLHIDO = 'recolhido',
  EM_ENTREGA = 'em_entrega',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado'
}

// Estados de Pagamento
export enum EstadoPagamento {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  CANCELADO = 'cancelado',
  REEMBOLSADO = 'reembolsado'
}

// Tipos de Colaborador
export enum TipoColaborador {
  EFETIVO = 'Efetivo',
  TEMPORARIO = 'Temporario',
  ESTAGIARIO = 'Estagiario',
  CONSULTOR = 'Consultor'
}

// Helper functions para formatação
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export const getStatusColor = (status: EstadoReserva): string => {
  const colors = {
    [EstadoReserva.RESERVADO]: 'bg-blue-100 text-blue-800',
    [EstadoReserva.EM_RECOLHA]: 'bg-yellow-100 text-yellow-800',
    [EstadoReserva.RECOLHIDO]: 'bg-orange-100 text-orange-800',
    [EstadoReserva.EM_ENTREGA]: 'bg-purple-100 text-purple-800',
    [EstadoReserva.ENTREGUE]: 'bg-green-100 text-green-800',
    [EstadoReserva.CANCELADO]: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Validações
export const validateLicensePlate = (plate: string): boolean => {
  // Formato português: XX-XX-XX ou XX-00-XX ou 00-XX-00
  const regex = /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/
  return regex.test(plate.toUpperCase())
}

export const validateNIF = (nif: string): boolean => {
  return nif.length === 9 && /^\d+$/.test(nif)
}

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  // Portugal: 9 dígitos começando com 9, 2 ou 3
  const regex = /^[923]\d{8}$/
  return regex.test(phone.replace(/\s/g, ''))
}
