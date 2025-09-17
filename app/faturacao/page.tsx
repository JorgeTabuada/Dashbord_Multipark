"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, RefreshCw, Download, Send, Check, Clock, AlertCircle } from "lucide-react"

interface Reservation {
  id_pk: string
  booking_id?: string
  cidade_cliente?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  email_cliente?: string
  phone_number_cliente?: string
  nif_cliente?: string
  nome_fiscal_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  parking_price?: number
  delivery_price?: number
  extras_price?: number
  total_price?: number
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  parque_id?: string
  payment_method?: string
  has_online_payment?: boolean
  created_at_db: string
  updated_at_db: string
  fatura_emitida?: boolean
  fatura_numero?: string
  fatura_data?: string
}

interface FaturaStats {
  totalFaturado: number
  faturasPendentes: number
  faturasEmitidas: number
  faturasEnviadas: number
  valorPendente: number
}

export default function Faturacao() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<FaturaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("month")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    loadFaturas()
  }, [periodFilter])

  const loadFaturas = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar por período e reservas concluídas
        const filteredReservations = filterByPeriod(allReservations.filter((r: Reservation) => 
          ['entregue', 'cancelado'].includes(r.estado_reserva_atual) && 
          (r.total_price || r.booking_price || 0) > 0
        ))
        
        // Simular dados de faturação (em produção viria da BD)
        const reservationsWithInvoice = filteredReservations.map((r: Reservation) => ({
          ...r,
          fatura_emitida: Math.random() > 0.3,
          fatura_numero: Math.random() > 0.3 ? `FT${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}` : undefined,
          fatura_data: Math.random() > 0.3 ? new Date().toISOString() : undefined
        }))
        
        setReservations(reservationsWithInvoice)
        
        // Calcular estatísticas
        const stats = calculateFaturaStats(reservationsWithInvoice)
        setStats(stats)
      }
    } catch (error) {
      console.error('Erro ao carregar faturas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterByPeriod = (reservations: Reservation[]) => {
    const now = new Date()
    let startDate: Date
    
    switch (periodFilter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return reservations
    }
    
    return reservations.filter((r: Reservation) => 
      new Date(r.updated_at_db) >= startDate
    )
  }

  const calculateFaturaStats = (reservations: Reservation[]): FaturaStats => {
    const totalFaturado = reservations
      .filter(r => r.fatura_emitida)
      .reduce((sum, r) => sum + (r.total_price || r.booking_price || 0), 0)
    
    const faturasPendentes = reservations.filter(r => !r.fatura_emitida).length
    const faturasEmitidas = reservations.filter(r => r.fatura_emitida).length
    const faturasEnviadas = reservations.filter(r => r.fatura_emitida && r.email_cliente).length
    
    const valorPendente = reservations
      .filter(r => !r.fatura_emitida)
      .reduce((sum, r) => sum + (r.total_price || r.booking_price || 0), 0)
    
    return {
      totalFaturado,
      faturasPendentes,
      faturasEmitidas,
      faturasEnviadas,
      valorPendente
    }
  }

  const emitirFatura = async (reservation: Reservation) => {
    // Lógica para emitir fatura
    console.log('Emitir fatura:', reservation.id_pk)
    
    // Gerar número de fatura
    const faturaNumero = `FT${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`
    
    // Atualizar reserva com dados da fatura
    reservation.fatura_emitida = true
    reservation.fatura_numero = faturaNumero
    reservation.fatura_data = new Date().toISOString()
    
    // Recarregar dados
    await loadFaturas()
  }

  const enviarFatura = async (reservation: Reservation) => {
    // Lógica para enviar fatura por email
    console.log('Enviar fatura:', reservation.fatura_numero, 'para', reservation.email_cliente)
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-PT')
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '0,00 €'
    return new Intl.NumberFormat('pt-PT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value)
  }

  const getFaturaStatus = (reservation: Reservation) => {
    if (!reservation.fatura_emitida) {
      return <Badge variant="destructive">Pendente</Badge>
    }
    if (reservation.fatura_emitida && !reservation.email_cliente) {
      return <Badge variant="secondary">Emitida</Badge>
    }
    return <Badge className="bg-green-500">Enviada</Badge>
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === "" || 
      reservation.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.name_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.lastname_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.fatura_numero || "").includes(searchTerm) ||
      (reservation.nif_cliente || "").includes(searchTerm)
    
    let matchesStatus = true
    if (statusFilter === "pending") {
      matchesStatus = !reservation.fatura_emitida
    } else if (statusFilter === "emitted") {
      matchesStatus = reservation.fatura_emitida === true
    }
    
    return matchesSearch && matchesStatus
  })

  return (
    <Layout title="Faturação">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {loading ? '-' : formatCurrency(stats?.totalFaturado)}
                  </div>
                  <p className="text-sm text-gray-600">Total Faturado</p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? '-' : stats?.faturasEmitidas || 0}
                  </div>
                  <p className="text-sm text-gray-600">Faturas Emitidas</p>
                </div>
                <Check className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {loading ? '-' : stats?.faturasPendentes || 0}
                  </div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {loading ? '-' : stats?.faturasEnviadas || 0}
                  </div>
                  <p className="text-sm text-gray-600">Enviadas</p>
                </div>
                <Send className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-red-600">
                    {loading ? '-' : formatCurrency(stats?.valorPendente)}
                  </div>
                  <p className="text-sm text-gray-600">Valor Pendente</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Gestão de Faturas
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={loadFaturas} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por matrícula, cliente, NIF, nº fatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="emitted">Emitidas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Faturas ({filteredReservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">A carregar faturas...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Fatura</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>NIF</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id_pk}>
                      <TableCell className="font-mono">
                        {reservation.fatura_numero || '-'}
                      </TableCell>
                      <TableCell>
                        {reservation.fatura_data ? 
                          new Date(reservation.fatura_data).toLocaleDateString('pt-PT') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {reservation.nome_fiscal_cliente || 
                             `${reservation.name_cliente} ${reservation.lastname_cliente}`}
                          </span>
                          {reservation.email_cliente && (
                            <span className="text-xs text-gray-500">
                              {reservation.email_cliente}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation.nif_cliente || '-'}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {reservation.license_plate}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {formatCurrency(reservation.total_price || reservation.booking_price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getFaturaStatus(reservation)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReservation(reservation)}
                            >
                              Ações
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Faturação - {reservation.license_plate}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedReservation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Cliente:</label>
                                    <p>{selectedReservation.nome_fiscal_cliente || 
                                        `${selectedReservation.name_cliente} ${selectedReservation.lastname_cliente}`}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">NIF:</label>
                                    <p>{selectedReservation.nif_cliente || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Email:</label>
                                    <p>{selectedReservation.email_cliente || 'Não informado'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Cidade:</label>
                                    <p>{selectedReservation.cidade_cliente || 'Desconhecida'}</p>
                                  </div>
                                </div>
                                
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-2">Detalhes do Serviço</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Serviço Base:</span>
                                      <span>{formatCurrency(selectedReservation.booking_price)}</span>
                                    </div>
                                    {selectedReservation.parking_price && (
                                      <div className="flex justify-between">
                                        <span>Estacionamento:</span>
                                        <span>{formatCurrency(selectedReservation.parking_price)}</span>
                                      </div>
                                    )}
                                    {selectedReservation.delivery_price && selectedReservation.delivery_price > 0 && (
                                      <div className="flex justify-between">
                                        <span>Taxa Entrega:</span>
                                        <span>{formatCurrency(selectedReservation.delivery_price)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold pt-2 border-t">
                                      <span>Total:</span>
                                      <span>{formatCurrency(selectedReservation.total_price || selectedReservation.booking_price)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {selectedReservation.fatura_emitida && (
                                  <div className="bg-green-50 p-3 rounded">
                                    <p className="text-sm text-green-700">
                                      Fatura {selectedReservation.fatura_numero} emitida em {
                                        selectedReservation.fatura_data && 
                                        new Date(selectedReservation.fatura_data).toLocaleDateString('pt-PT')
                                      }
                                    </p>
                                  </div>
                                )}
                                
                                <div className="flex gap-2">
                                  {!selectedReservation.fatura_emitida && (
                                    <Button 
                                      className="flex-1"
                                      onClick={() => emitirFatura(selectedReservation)}
                                    >
                                      Emitir Fatura
                                    </Button>
                                  )}
                                  
                                  {selectedReservation.fatura_emitida && (
                                    <>
                                      <Button variant="outline" className="flex-1">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF
                                      </Button>
                                      {selectedReservation.email_cliente && (
                                        <Button 
                                          className="flex-1"
                                          onClick={() => enviarFatura(selectedReservation)}
                                        >
                                          <Send className="w-4 h-4 mr-2" />
                                          Enviar por Email
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredReservations.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {reservations.length === 0 ? 'Nenhuma fatura encontrada' : 'Nenhuma fatura corresponde aos filtros'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
