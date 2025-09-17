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
import { DollarSign, RefreshCw, Download, CreditCard, Banknote, Smartphone, Calculator } from "lucide-react"

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
  payment_method?: string
  payment_intent_id?: string
  has_online_payment?: boolean
  created_at_db: string
  updated_at_db: string
}

interface CaixaSession {
  id: string
  startTime: Date
  endTime?: Date
  operator: string
  status: 'open' | 'closed'
  openingBalance: number
  currentBalance: number
  transactions: Transaction[]
}

interface Transaction {
  id: string
  reservation_id: string
  type: 'payment' | 'refund'
  amount: number
  method: 'cash' | 'card' | 'mbway' | 'online'
  timestamp: Date
  license_plate?: string
  notes?: string
}

interface CaixaStats {
  totalCash: number
  totalCard: number
  totalMBWay: number
  totalOnline: number
  totalRefunds: number
  totalRevenue: number
  transactionCount: number
}

export default function Caixa() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentSession, setCurrentSession] = useState<CaixaSession | null>(null)
  const [stats, setStats] = useState<CaixaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    loadCaixa()
    checkCurrentSession()
  }, [])

  const checkCurrentSession = () => {
    // Verificar se há uma sessão de caixa aberta
    const session: CaixaSession = {
      id: 'session-' + Date.now(),
      startTime: new Date(),
      operator: 'Operador 1',
      status: 'open',
      openingBalance: 100,
      currentBalance: 100,
      transactions: []
    }
    setCurrentSession(session)
  }

  const loadCaixa = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar apenas reservas de hoje que precisam de pagamento
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayReservations = allReservations.filter((r: Reservation) => {
          const checkOut = r.check_out_real || r.check_out_previsto
          if (!checkOut) return false
          
          const checkOutDate = new Date(checkOut)
          return checkOutDate >= today && 
                 ['recolhido', 'em_entrega', 'entregue'].includes(r.estado_reserva_atual)
        })
        
        setReservations(todayReservations)
        
        // Calcular estatísticas
        const stats = calculateCaixaStats(todayReservations)
        setStats(stats)
      }
    } catch (error) {
      console.error('Erro ao carregar caixa:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCaixaStats = (reservations: Reservation[]): CaixaStats => {
    let totalCash = 0
    let totalCard = 0
    let totalMBWay = 0
    let totalOnline = 0
    let totalRefunds = 0
    
    reservations.forEach(r => {
      const amount = r.total_price || r.booking_price || 0
      
      if (r.has_online_payment) {
        totalOnline += amount
      } else {
        switch (r.payment_method) {
          case 'cash':
            totalCash += amount
            break
          case 'card':
            totalCard += amount
            break
          case 'mbway':
            totalMBWay += amount
            break
          default:
            totalCash += amount // Default para dinheiro
        }
      }
    })
    
    const totalRevenue = totalCash + totalCard + totalMBWay + totalOnline - totalRefunds
    
    return {
      totalCash,
      totalCard,
      totalMBWay,
      totalOnline,
      totalRefunds,
      totalRevenue,
      transactionCount: reservations.length
    }
  }

  const processPayment = async (reservation: Reservation, method: string) => {
    // Processar pagamento
    console.log('Processar pagamento:', reservation.id_pk, method)
    
    // Adicionar transação à sessão
    if (currentSession) {
      const transaction: Transaction = {
        id: 'trans-' + Date.now(),
        reservation_id: reservation.id_pk,
        type: 'payment',
        amount: reservation.total_price || reservation.booking_price || 0,
        method: method as any,
        timestamp: new Date(),
        license_plate: reservation.license_plate
      }
      
      currentSession.transactions.push(transaction)
      currentSession.currentBalance += transaction.amount
    }
    
    // Recarregar dados
    await loadCaixa()
  }

  const closeCaixaSession = () => {
    if (currentSession) {
      currentSession.endTime = new Date()
      currentSession.status = 'closed'
      // Aqui guardaria a sessão na BD
      console.log('Fechar caixa:', currentSession)
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

  const getPaymentMethodBadge = (method?: string, hasOnline?: boolean) => {
    if (hasOnline) {
      return <Badge className="bg-green-500">Online</Badge>
    }
    
    const methodConfig = {
      'cash': { icon: Banknote, label: 'Dinheiro', color: 'bg-blue-500' },
      'card': { icon: CreditCard, label: 'Cartão', color: 'bg-purple-500' },
      'mbway': { icon: Smartphone, label: 'MB Way', color: 'bg-orange-500' }
    }
    
    const config = methodConfig[method as keyof typeof methodConfig] || 
                   { icon: DollarSign, label: 'Pendente', color: 'bg-gray-500' }
    
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === "" || 
      reservation.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.name_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.lastname_cliente || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesMethod = true
    if (methodFilter !== "all") {
      if (methodFilter === "online") {
        matchesMethod = reservation.has_online_payment === true
      } else {
        matchesMethod = reservation.payment_method === methodFilter && !reservation.has_online_payment
      }
    }
    
    return matchesSearch && matchesMethod
  })

  return (
    <Layout title="Gestão de Caixa">
      <div className="space-y-6">
        {/* Status da Sessão */}
        <Card className={currentSession?.status === 'open' ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Sessão de Caixa
              </span>
              <Badge variant={currentSession?.status === 'open' ? 'default' : 'destructive'}>
                {currentSession?.status === 'open' ? 'Aberta' : 'Fechada'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Operador</p>
                <p className="font-medium">{currentSession?.operator}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Início</p>
                <p className="font-medium">
                  {currentSession?.startTime.toLocaleTimeString('pt-PT')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Inicial</p>
                <p className="font-medium">
                  {formatCurrency(currentSession?.openingBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="font-bold text-lg">
                  {formatCurrency(currentSession?.currentBalance)}
                </p>
              </div>
            </div>
            
            {currentSession?.status === 'open' && (
              <div className="mt-4 flex justify-end">
                <Button variant="destructive" onClick={closeCaixaSession}>
                  Fechar Caixa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {loading ? '-' : formatCurrency(stats?.totalCash)}
                  </div>
                  <p className="text-sm text-gray-600">Dinheiro</p>
                </div>
                <Banknote className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-purple-600">
                    {loading ? '-' : formatCurrency(stats?.totalCard)}
                  </div>
                  <p className="text-sm text-gray-600">Cartão</p>
                </div>
                <CreditCard className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-orange-600">
                    {loading ? '-' : formatCurrency(stats?.totalMBWay)}
                  </div>
                  <p className="text-sm text-gray-600">MB Way</p>
                </div>
                <Smartphone className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {loading ? '-' : formatCurrency(stats?.totalOnline)}
                  </div>
                  <p className="text-sm text-gray-600">Online</p>
                </div>
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-indigo-600">
                    {loading ? '-' : formatCurrency(stats?.totalRevenue)}
                  </div>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <Calculator className="w-6 h-6 text-indigo-500" />
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
                Transações do Dia
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={loadCaixa} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Buscar por matrícula ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Métodos</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="mbway">MB Way</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Pagamentos ({filteredReservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">A carregar transações...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id_pk}>
                      <TableCell>
                        {new Date(reservation.check_out_real || reservation.check_out_previsto || '').toLocaleTimeString('pt-PT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {reservation.license_plate}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {reservation.name_cliente} {reservation.lastname_cliente}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {formatCurrency(reservation.total_price || reservation.booking_price)}
                          </span>
                          {reservation.parking_price && (
                            <span className="text-xs text-gray-500">
                              Park: {formatCurrency(reservation.parking_price)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(reservation.payment_method, reservation.has_online_payment)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reservation.has_online_payment ? 'default' : 'secondary'}>
                          {reservation.has_online_payment ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReservation(reservation)}
                            >
                              Processar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>
                                Processar Pagamento - {reservation.license_plate}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedReservation && (
                              <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-2">Resumo</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Cliente:</span>
                                      <span>{selectedReservation.name_cliente} {selectedReservation.lastname_cliente}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Check-out:</span>
                                      <span>{formatDateTime(selectedReservation.check_out_previsto)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                      <span>Total:</span>
                                      <span>{formatCurrency(selectedReservation.total_price || selectedReservation.booking_price)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {!selectedReservation.has_online_payment && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                      className="flex items-center gap-2"
                                      onClick={() => processPayment(selectedReservation, 'cash')}
                                    >
                                      <Banknote className="w-4 h-4" />
                                      Dinheiro
                                    </Button>
                                    <Button 
                                      className="flex items-center gap-2"
                                      onClick={() => processPayment(selectedReservation, 'card')}
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      Cartão
                                    </Button>
                                    <Button 
                                      className="flex items-center gap-2"
                                      onClick={() => processPayment(selectedReservation, 'mbway')}
                                    >
                                      <Smartphone className="w-4 h-4" />
                                      MB Way
                                    </Button>
                                    <Button variant="outline">
                                      Imprimir Recibo
                                    </Button>
                                  </div>
                                )}
                                
                                {selectedReservation.has_online_payment && (
                                  <div className="text-center">
                                    <Badge className="bg-green-500 mb-2">Pagamento Online Confirmado</Badge>
                                    <Button variant="outline" className="w-full">
                                      Imprimir Recibo
                                    </Button>
                                  </div>
                                )}
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
                  {reservations.length === 0 ? 'Nenhuma transação hoje' : 'Nenhuma transação corresponde aos filtros'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
