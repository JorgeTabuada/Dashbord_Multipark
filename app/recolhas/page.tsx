"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, Filter, RefreshCw, Download, Calendar, Clock, 
  Car, CheckCircle, TrendingUp, BarChart3, MapPin,
  Loader2, Activity, Users, Euro
} from "lucide-react"

interface Reservation {
  id_pk: string
  booking_id?: string
  cidade_cliente?: string
  park_name?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  email_cliente?: string
  phone_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  total_price?: number
  check_in_previsto?: string
  check_out_previsto?: string
  booking_date?: string
  parque_id?: string
  created_at_db: string
  updated_at_db: string
}

interface RecolhaStats {
  total: number
  totalValue: number
  byStatus: { [key: string]: number }
  byCity: { [key: string]: number }
  byBrand: { [key: string]: number }
  byHour: { [key: string]: number }
  byDay: { [key: string]: number }
  byWeekDay: { [key: string]: number }
  todayPickups: number
  pendingPickups: number
  inProgressPickups: number
  completedPickups: number
  weeklyGrowth: number
  monthlyGrowth: number
  avgTicket: number
}

export default function Recolhas() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<RecolhaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  
  // Filtros
  const [dateStart, setDateStart] = useState(() => {
    const date = new Date()
    date.setDate(1) // Primeiro dia do mês
    return date.toISOString().split('T')[0]
  })
  const [dateEnd, setDateEnd] = useState(() => {
    const date = new Date()
    return date.toISOString().split('T')[0]
  })
  const [quickPeriod, setQuickPeriod] = useState("Este Mês")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("dashboard")

  // Status relacionados com recolhas
  const recolhaStatuses = ['reservado', 'em_recolha', 'recolhido']

  useEffect(() => {
    loadRecolhas()
  }, [])

  // Função para calcular estatísticas
  const calculateRecolhaStats = (reservationsData: Reservation[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(weekStart.getDate() - 7)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const totalValue = reservationsData.reduce((sum: number, r: Reservation) => 
      sum + (r.total_price || r.booking_price || 0), 0
    )
    
    const byStatus: { [key: string]: number } = {}
    const byCity: { [key: string]: number } = {}
    const byBrand: { [key: string]: number } = {}
    const byHour: { [key: string]: number } = {}
    const byDay: { [key: string]: number } = {}
    const byWeekDay: { [key: string]: number } = {
      'Dom': 0, 'Seg': 0, 'Ter': 0, 'Qua': 0, 'Qui': 0, 'Sex': 0, 'Sáb': 0
    }
    
    let todayPickups = 0
    let pendingPickups = 0
    let inProgressPickups = 0
    let completedPickups = 0
    let thisWeekCount = 0
    let lastWeekCount = 0
    let thisMonthCount = 0
    let lastMonthCount = 0

    reservationsData.forEach((r: Reservation) => {
      // Usar booking_date como data principal se disponível, senão check_in_previsto
      const pickupDate = r.booking_date ? new Date(r.booking_date) : 
                        r.check_in_previsto ? new Date(r.check_in_previsto) : 
                        new Date(r.created_at_db)
      
      const isToday = pickupDate >= today && pickupDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      
      // Por status
      byStatus[r.estado_reserva_atual] = (byStatus[r.estado_reserva_atual] || 0) + 1
      
      // Por cidade
      const city = r.cidade_cliente || 'Desconhecida'
      byCity[city] = (byCity[city] || 0) + 1
      
      // Por marca/parque
      const brand = r.park_name || 'Desconhecido'
      byBrand[brand] = (byBrand[brand] || 0) + 1
      
      // Recolhas de hoje
      if (isToday) {
        todayPickups++
      }
      
      // Contagens por status
      if (r.estado_reserva_atual === 'reservado') pendingPickups++
      else if (r.estado_reserva_atual === 'em_recolha') inProgressPickups++
      else if (r.estado_reserva_atual === 'recolhido') completedPickups++
      
      // Por hora do dia
      const hour = pickupDate.getHours()
      const hourKey = `${hour.toString().padStart(2, '0')}:00`
      byHour[hourKey] = (byHour[hourKey] || 0) + 1
      
      // Por dia da semana
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const dayName = dayNames[pickupDate.getDay()]
      byWeekDay[dayName] = (byWeekDay[dayName] || 0) + 1
      
      // Por dia do mês
      const dayOfMonth = pickupDate.getDate()
      byDay[dayOfMonth.toString()] = (byDay[dayOfMonth.toString()] || 0) + 1
      
      // Crescimento semanal e mensal
      if (pickupDate >= weekStart) thisWeekCount++
      if (pickupDate >= lastWeekStart && pickupDate < weekStart) lastWeekCount++
      if (pickupDate >= monthStart) thisMonthCount++
      if (pickupDate >= lastMonthStart && pickupDate < monthStart) lastMonthCount++
    })

    const weeklyGrowth = lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0
    const monthlyGrowth = lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0
    const avgTicket = reservationsData.length > 0 ? totalValue / reservationsData.length : 0

    return {
      total: reservationsData.length,
      totalValue,
      byStatus,
      byCity,
      byBrand,
      byHour,
      byDay,
      byWeekDay,
      todayPickups,
      pendingPickups,
      inProgressPickups,
      completedPickups,
      weeklyGrowth,
      monthlyGrowth,
      avgTicket
    }
  }

  const loadRecolhas = async () => {
    setLoading(true)
    try {
      // Buscar reservas reais do Supabase via API
      const response = await fetch('/api/sync/supabase?limit=1000')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Filtrar apenas reservas relacionadas com recolhas
        const recolhasData = result.data.filter((r: any) => 
          recolhaStatuses.includes(r.estado_reserva_atual || r.status)
        )
        
        // Mapear os dados do Supabase para o formato esperado
        const mappedData: Reservation[] = recolhasData.map((r: any) => ({
          id_pk: r.id_pk || r.id || '',
          booking_id: r.booking_id,
          cidade_cliente: r.cidade_cliente || r.city,
          park_name: r.park_name || r.park_brand,
          license_plate: r.license_plate || '',
          name_cliente: r.name_cliente || r.client_first_name,
          lastname_cliente: r.lastname_cliente || r.client_last_name,
          email_cliente: r.email_cliente || r.client_email,
          phone_cliente: r.phone_cliente || r.client_phone,
          estado_reserva_atual: r.estado_reserva_atual || r.status || 'reservado',
          booking_price: r.booking_price,
          total_price: r.total_price || r.booking_price,
          check_in_previsto: r.check_in_previsto || r.check_in_datetime,
          check_out_previsto: r.check_out_previsto || r.check_out_datetime,
          booking_date: r.booking_date || r.created_at_db,
          parque_id: r.parque_id,
          created_at_db: r.created_at_db || new Date().toISOString(),
          updated_at_db: r.updated_at_db || new Date().toISOString()
        }))
        
        console.log(`Carregadas ${mappedData.length} recolhas do Supabase`)
        setReservations(mappedData)
        const calculatedStats = calculateRecolhaStats(mappedData)
        setStats(calculatedStats)
      } else {
        console.error('Erro ao carregar dados:', result.message || 'Erro desconhecido')
        // Se falhar, usar array vazio
        setReservations([])
        setStats(calculateRecolhaStats([]))
      }
    } catch (error) {
      console.error('Erro ao carregar recolhas:', error)
      setReservations([])
      setStats(calculateRecolhaStats([]))
    } finally {
      setLoading(false)
    }
  }

  const syncRecolhas = async () => {
    setSyncing(true)
    try {
      await loadRecolhas()
    } finally {
      setSyncing(false)
    }
  }

  const applyQuickPeriod = (period: string) => {
    const today = new Date()
    setQuickPeriod(period)
    
    switch(period) {
      case 'Hoje':
        setDateStart(today.toISOString().split('T')[0])
        setDateEnd(today.toISOString().split('T')[0])
        break
      case 'Esta Semana':
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        setDateStart(weekStart.toISOString().split('T')[0])
        setDateEnd(today.toISOString().split('T')[0])
        break
      case 'Este Mês':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        setDateStart(monthStart.toISOString().split('T')[0])
        setDateEnd(today.toISOString().split('T')[0])
        break
      case 'Último Mês':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
        setDateStart(lastMonthStart.toISOString().split('T')[0])
        setDateEnd(lastMonthEnd.toISOString().split('T')[0])
        break
    }
  }

  const filteredReservations = reservations.filter(r => {
    let matches = true
    
    if (statusFilter !== 'all') {
      matches = matches && r.estado_reserva_atual === statusFilter
    }
    
    if (cityFilter !== 'all') {
      matches = matches && (r.cidade_cliente || 'Desconhecida') === cityFilter
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      matches = matches && (
        r.license_plate?.toLowerCase().includes(search) ||
        r.name_cliente?.toLowerCase().includes(search) ||
        r.email_cliente?.toLowerCase().includes(search) ||
        r.phone_cliente?.toLowerCase().includes(search) ||
        r.booking_id?.toLowerCase().includes(search)
      )
    }
    
    return matches
  })

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'warning' | 'success' } = {
      'reservado': 'warning',
      'em_recolha': 'secondary',
      'recolhido': 'success'
    }
    
    const labels: { [key: string]: string } = {
      'reservado': 'Pendente',
      'em_recolha': 'Em Recolha',
      'recolhido': 'Recolhido'
    }
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Gestão de Recolhas</h1>
          <p className="text-gray-600">Monitorize e gerencie as recolhas de veículos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="list">Lista de Recolhas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Dashboard de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recolhas Hoje</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.todayPickups || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingPickups || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Em Recolha</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.inProgressPickups || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.completedPickups || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recolhas por Hora</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Aqui poderia ter um gráfico de barras */}
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <BarChart3 className="h-12 w-12" />
                    <span className="ml-2">Gráfico de Recolhas por Hora</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Recolhas</span>
                    <span className="font-bold">{stats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor Total</span>
                    <span className="font-bold">€ {stats?.totalValue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ticket Médio</span>
                    <span className="font-bold">€ {stats?.avgTicket?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Crescimento Semanal</span>
                    <span className={`font-bold ${(stats?.weeklyGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(stats?.weeklyGrowth || 0) >= 0 ? '+' : ''}{stats?.weeklyGrowth?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Crescimento Mensal</span>
                    <span className={`font-bold ${(stats?.monthlyGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(stats?.monthlyGrowth || 0) >= 0 ? '+' : ''}{stats?.monthlyGrowth?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="list">
            {/* Filtros */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Select value={quickPeriod} onValueChange={applyQuickPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Período Rápido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoje">Hoje</SelectItem>
                      <SelectItem value="Esta Semana">Esta Semana</SelectItem>
                      <SelectItem value="Este Mês">Este Mês</SelectItem>
                      <SelectItem value="Último Mês">Último Mês</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Estados</SelectItem>
                      <SelectItem value="reservado">Pendente</SelectItem>
                      <SelectItem value="em_recolha">Em Recolha</SelectItem>
                      <SelectItem value="recolhido">Recolhido</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Cidades</SelectItem>
                      {Object.keys(stats?.byCity || {}).map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <Button onClick={syncRecolhas} disabled={syncing}>
                    {syncing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sincronizar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Recolhas */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Reserva</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Parque</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.length > 0 ? (
                        filteredReservations.map((reservation) => (
                          <TableRow key={reservation.id_pk}>
                            <TableCell className="font-mono text-xs">
                              {reservation.booking_id || reservation.id_pk.slice(0, 8)}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {reservation.license_plate}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {reservation.name_cliente} {reservation.lastname_cliente}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {reservation.email_cliente}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{reservation.park_name || 'N/A'}</TableCell>
                            <TableCell>{reservation.cidade_cliente || 'N/A'}</TableCell>
                            <TableCell>
                              {reservation.check_in_previsto ? 
                                new Date(reservation.check_in_previsto).toLocaleString('pt-PT') : 
                                'N/A'
                              }
                            </TableCell>
                            <TableCell>{getStatusBadge(reservation.estado_reserva_atual)}</TableCell>
                            <TableCell className="font-semibold">
                              € {(reservation.total_price || reservation.booking_price || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            Nenhuma recolha encontrada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}