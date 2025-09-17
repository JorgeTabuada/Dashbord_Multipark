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
import { DollarSign, RefreshCw, CheckCircle, XCircle, AlertCircle, CreditCard } from "lucide-react"

interface Reservation {
  id_pk: string
  booking_id?: string
  cidade_cliente?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  email_cliente?: string
  phone_number_cliente?: string
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
  parking_type?: string
  payment_method?: string
  payment_intent_id?: string
  has_online_payment?: boolean
  created_at_db: string
  updated_at_db: string
}

interface PaymentStats {
  totalPending: number
  totalConfirmed: number
  totalFailed: number
  totalAmount: number
  pendingAmount: number
}

export default function ConfirmacaoCaixa() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar reservas que precisam de confirmação de pagamento
        const paymentReservations = allReservations.filter((r: Reservation) => 
          ['entregue', 'recolhido', 'em_entrega'].includes(r.estado_reserva_atual)
        )
        
        setReservations(paymentReservations)
        
        // Calcular estatísticas
        const pending = paymentReservations.filter((r: Reservation) => 
          !r.has_online_payment || !r.payment_intent_id
        )
        
        const confirmed = paymentReservations.filter((r: Reservation) => 
          r.has_online_payment && r.payment_intent_id
        )
        
        const totalAmount = paymentReservations.reduce((sum, r) => 
          sum + (r.total_price || r.booking_price || 0), 0
        )
        
        const pendingAmount = pending.reduce((sum, r) => 
          sum + (r.total_price || r.booking_price || 0), 0
        )
        
        setStats({
          totalPending: pending.length,
          totalConfirmed: confirmed.length,
          totalFailed: 0,
          totalAmount,
          pendingAmount
        })
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatusBadge = (reservation: Reservation) => {
    if (reservation.has_online_payment && reservation.payment_intent_id) {
      return <Badge className="bg-green-500">Pago Online</Badge>
    } else if (reservation.payment_method === 'cash') {
      return <Badge variant="secondary">Pagamento no Local</Badge>
    } else if (reservation.payment_method === 'card') {
      return <Badge className="bg-blue-500">Cartão no Local</Badge>
    } else {
      return <Badge variant="destructive">Pendente</Badge>
    }
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

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === "" || 
      reservation.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.name_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.lastname_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.booking_id || "").includes(searchTerm)
    
    let matchesStatus = true
    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        matchesStatus = reservation.has_online_payment === true
      } else if (statusFilter === "pending") {
        matchesStatus = !reservation.has_online_payment
      }
    }
    
    let matchesPayment = true
    if (paymentFilter !== "all") {
      matchesPayment = reservation.payment_method === paymentFilter
    }
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const confirmPayment = async (reservationId: string) => {
    // Aqui seria a lógica para confirmar o pagamento
    console.log('Confirmar pagamento:', reservationId)
    // Recarregar dados após confirmação
    await loadPayments()
  }

  return (
    <Layout title="Confirmação de Caixa">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {loading ? '-' : stats?.totalPending || 0}
                  </div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? '-' : stats?.totalConfirmed || 0}
                  </div>
                  <p className="text-sm text-gray-600">Confirmados</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {loading ? '-' : stats?.totalFailed || 0}
                  </div>
                  <p className="text-sm text-gray-600">Falhados</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {loading ? '-' : formatCurrency(stats?.totalAmount)}
                  </div>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-orange-600">
                    {loading ? '-' : formatCurrency(stats?.pendingAmount)}
                  </div>
                  <p className="text-sm text-gray-600">A Receber</p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pagamentos para Confirmação
              </span>
              <Button onClick={loadPayments} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por matrícula, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Método de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Métodos</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="mbway">MB Way</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Pagamentos ({filteredReservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">A carregar pagamentos...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valores</TableHead>
                    <TableHead>Status Pagamento</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id_pk}>
                      <TableCell className="font-mono font-semibold">
                        {reservation.license_plate}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {reservation.name_cliente} {reservation.lastname_cliente}
                          </span>
                          {reservation.email_cliente && (
                            <span className="text-xs text-gray-500">
                              {reservation.email_cliente}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {formatCurrency(reservation.total_price || reservation.booking_price)}
                          </span>
                          {reservation.parking_price && (
                            <span className="text-xs text-gray-500">
                              Parking: {formatCurrency(reservation.parking_price)}
                            </span>
                          )}
                          {reservation.delivery_price && reservation.delivery_price > 0 && (
                            <span className="text-xs text-gray-500">
                              Entrega: {formatCurrency(reservation.delivery_price)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(reservation)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reservation.payment_method || 'N/D'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(reservation.check_out_real || reservation.check_out_previsto)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReservation(reservation)}
                            >
                              Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Confirmação de Pagamento - {reservation.license_plate}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedReservation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Cliente:</label>
                                    <p>{selectedReservation.name_cliente} {selectedReservation.lastname_cliente}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Estado Reserva:</label>
                                    <p className="capitalize">{selectedReservation.estado_reserva_atual}</p>
                                  </div>
                                </div>
                                
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-2">Detalhes do Pagamento</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Valor Base:</span>
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
                                
                                <div className="flex gap-2">
                                  {!selectedReservation.has_online_payment && (
                                    <Button 
                                      className="flex-1"
                                      onClick={() => confirmPayment(selectedReservation.id_pk)}
                                    >
                                      Confirmar Pagamento
                                    </Button>
                                  )}
                                  <Button variant="outline" className="flex-1">
                                    Imprimir Recibo
                                  </Button>
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
                <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {reservations.length === 0 ? 'Nenhum pagamento pendente' : 'Nenhum pagamento corresponde aos filtros'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
