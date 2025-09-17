"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, FileText, Download, Check, AlertCircle, Calculator, Banknote, CreditCard, Smartphone } from "lucide-react"

interface Reservation {
  id_pk: string
  booking_id?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  total_price?: number
  payment_method?: string
  has_online_payment?: boolean
  created_at_db: string
  updated_at_db: string
}

interface CaixaSession {
  id: string
  date: Date
  operator: string
  startTime: string
  endTime?: string
  openingBalance: number
  expectedTotal: number
  countedCash: number
  countedCard: number
  countedMBWay: number
  countedOnline: number
  difference: number
  status: 'open' | 'closed' | 'reconciled'
  transactions: Transaction[]
  notes?: string
}

interface Transaction {
  id: string
  time: string
  license_plate: string
  amount: number
  method: string
  type: 'payment' | 'refund'
}

interface FechoCaixaStats {
  totalRevenue: number
  totalCash: number
  totalCard: number
  totalMBWay: number
  totalOnline: number
  totalRefunds: number
  transactionCount: number
  difference: number
}

export default function FechoCaixa() {
  const [currentSession, setCurrentSession] = useState<CaixaSession | null>(null)
  const [stats, setStats] = useState<FechoCaixaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [countedValues, setCountedValues] = useState({
    cash: 0,
    card: 0,
    mbway: 0,
    online: 0
  })
  const [closingNotes, setClosingNotes] = useState("")
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    loadSessionData()
  }, [])

  const loadSessionData = async () => {
    try {
      setLoading(true)
      
      // Buscar reservas do dia
      const response = await fetch('/api/sync/supabase?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar reservas de hoje
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayReservations = allReservations.filter((r: Reservation) => {
          const updated = new Date(r.updated_at_db)
          return updated >= today && 
                 ['entregue', 'cancelado'].includes(r.estado_reserva_atual)
        })
        
        setReservations(todayReservations)
        
        // Criar sessão de caixa simulada
        const session = createCaixaSession(todayReservations)
        setCurrentSession(session)
        
        // Calcular estatísticas
        const stats = calculateStats(todayReservations)
        setStats(stats)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de caixa:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCaixaSession = (reservations: Reservation[]): CaixaSession => {
    const transactions: Transaction[] = reservations.map(r => ({
      id: r.id_pk,
      time: new Date(r.updated_at_db).toLocaleTimeString('pt-PT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      license_plate: r.license_plate,
      amount: r.total_price || r.booking_price || 0,
      method: r.has_online_payment ? 'online' : (r.payment_method || 'cash'),
      type: 'payment' as const
    }))
    
    const totalExpected = transactions.reduce((sum, t) => 
      t.type === 'payment' ? sum + t.amount : sum - t.amount, 0
    )
    
    return {
      id: 'session-' + Date.now(),
      date: new Date(),
      operator: 'Operador 1',
      startTime: '08:00',
      openingBalance: 100,
      expectedTotal: totalExpected,
      countedCash: 0,
      countedCard: 0,
      countedMBWay: 0,
      countedOnline: 0,
      difference: 0,
      status: 'open',
      transactions
    }
  }

  const calculateStats = (reservations: Reservation[]): FechoCaixaStats => {
    let totalCash = 0
    let totalCard = 0
    let totalMBWay = 0
    let totalOnline = 0
    let totalRefunds = 0
    
    reservations.forEach(r => {
      const amount = r.total_price || r.booking_price || 0
      
      if (r.estado_reserva_atual === 'cancelado') {
        totalRefunds += amount
      } else {
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
              totalCash += amount
          }
        }
      }
    })
    
    const totalRevenue = totalCash + totalCard + totalMBWay + totalOnline - totalRefunds
    
    return {
      totalRevenue,
      totalCash,
      totalCard,
      totalMBWay,
      totalOnline,
      totalRefunds,
      transactionCount: reservations.length,
      difference: 0
    }
  }

  const handleCloseSession = () => {
    if (currentSession && stats) {
      // Calcular diferença
      const totalCounted = countedValues.cash + countedValues.card + 
                          countedValues.mbway + countedValues.online
      const difference = totalCounted - stats.totalRevenue
      
      // Atualizar sessão
      currentSession.countedCash = countedValues.cash
      currentSession.countedCard = countedValues.card
      currentSession.countedMBWay = countedValues.mbway
      currentSession.countedOnline = countedValues.online
      currentSession.difference = difference
      currentSession.notes = closingNotes
      currentSession.endTime = new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
      })
      currentSession.status = 'closed'
      
      setCurrentSession({...currentSession})
      setShowCloseDialog(false)
      
      // Aqui guardaria na BD
      console.log('Sessão fechada:', currentSession)
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '0,00 €'
    return new Intl.NumberFormat('pt-PT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value)
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />
      case 'card':
        return <CreditCard className="w-4 h-4" />
      case 'mbway':
        return <Smartphone className="w-4 h-4" />
      case 'online':
        return <DollarSign className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  return (
    <Layout title="Fecho de Caixa">
      <div className="space-y-6">
        {/* Informação da Sessão */}
        <Card className={currentSession?.status === 'open' ? 'border-green-500' : 'border-gray-300'}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Sessão de Caixa - {currentSession?.date.toLocaleDateString('pt-PT')}
              </span>
              <Badge variant={currentSession?.status === 'open' ? 'default' : 'secondary'}>
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
                <p className="text-sm text-gray-600">Abertura</p>
                <p className="font-medium">{currentSession?.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Inicial</p>
                <p className="font-medium">{formatCurrency(currentSession?.openingBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Esperado</p>
                <p className="font-bold text-lg">{formatCurrency(stats?.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo por Método de Pagamento */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dinheiro</p>
                  <div className="text-xl font-bold">
                    {formatCurrency(stats?.totalCash)}
                  </div>
                </div>
                <Banknote className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cartão</p>
                  <div className="text-xl font-bold">
                    {formatCurrency(stats?.totalCard)}
                  </div>
                </div>
                <CreditCard className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MB Way</p>
                  <div className="text-xl font-bold">
                    {formatCurrency(stats?.totalMBWay)}
                  </div>
                </div>
                <Smartphone className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Online</p>
                  <div className="text-xl font-bold">
                    {formatCurrency(stats?.totalOnline)}
                  </div>
                </div>
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <div className="text-xl font-bold text-indigo-600">
                    {formatCurrency(stats?.totalRevenue)}
                  </div>
                </div>
                <Calculator className="w-6 h-6 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movimentos do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Movimentos do Dia ({currentSession?.transactions.length || 0})</span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>A carregar movimentos...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSession?.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.time}</TableCell>
                      <TableCell className="font-mono font-semibold">
                        {transaction.license_plate}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'payment' ? 'default' : 'destructive'}>
                          {transaction.type === 'payment' ? 'Pagamento' : 'Reembolso'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(transaction.method)}
                          <span className="capitalize">{transaction.method}</span>
                        </div>
                      </TableCell>
                      <TableCell className={transaction.type === 'refund' ? 'text-red-600' : ''}>
                        {transaction.type === 'refund' && '-'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        {currentSession?.status === 'open' && (
          <Card>
            <CardHeader>
              <CardTitle>Ações de Fecho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  className="flex-1"
                  onClick={() => setShowCloseDialog(true)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Fechar Caixa
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Imprimir Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog de Fecho */}
        <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fecho de Caixa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-3">Contagem de Valores</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Dinheiro Contado</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={countedValues.cash}
                      onChange={(e) => setCountedValues({
                        ...countedValues,
                        cash: parseFloat(e.target.value) || 0
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esperado: {formatCurrency(stats?.totalCash)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Cartão Confirmado</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={countedValues.card}
                      onChange={(e) => setCountedValues({
                        ...countedValues,
                        card: parseFloat(e.target.value) || 0
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esperado: {formatCurrency(stats?.totalCard)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">MB Way Confirmado</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={countedValues.mbway}
                      onChange={(e) => setCountedValues({
                        ...countedValues,
                        mbway: parseFloat(e.target.value) || 0
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esperado: {formatCurrency(stats?.totalMBWay)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Online Confirmado</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={countedValues.online}
                      onChange={(e) => setCountedValues({
                        ...countedValues,
                        online: parseFloat(e.target.value) || 0
                      })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esperado: {formatCurrency(stats?.totalOnline)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total Contado:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(
                      countedValues.cash + countedValues.card + 
                      countedValues.mbway + countedValues.online
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total Esperado:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(stats?.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Diferença:</span>
                  <span className={`text-xl font-bold ${
                    (countedValues.cash + countedValues.card + countedValues.mbway + countedValues.online) - 
                    (stats?.totalRevenue || 0) === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(
                      (countedValues.cash + countedValues.card + countedValues.mbway + countedValues.online) - 
                      (stats?.totalRevenue || 0)
                    )}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  placeholder="Adicione observações sobre o fecho de caixa..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              {Math.abs(
                (countedValues.cash + countedValues.card + countedValues.mbway + countedValues.online) - 
                (stats?.totalRevenue || 0)
              ) > 0.01 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      Atenção: Existe uma diferença nos valores
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Por favor, verifique a contagem ou adicione uma justificação nas observações.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCloseDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleCloseSession}
                >
                  Confirmar Fecho
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
