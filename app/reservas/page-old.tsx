"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, Filter, RefreshCw, Download, TrendingUp, Calendar, BarChart3, Clock } from "lucide-react"
import Script from "next/script"

interface Reservation {
  id_pk: string
  booking_id?: string
  cidade_cliente?: string
  park_name?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  email_cliente?: string
  phone_number_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  total_price?: number
  booking_date?: string // Data quando a reserva foi feita
  check_in_previsto?: string
  check_out_previsto?: string
  created_at_db: string
  updated_at_db: string
  parque_id?: string
  parking_type?: string
  campanha?: string // Campo para campanhas
}

interface DashboardStats {
  totalReservations: number
  totalValue: number
  byCampaign: { [key: string]: number }
  byWeekday: { [key: string]: number }
  byHour: { [key: string]: number }
  byCity: { [key: string]: number }
  byStatus: { [key: string]: number }
  topCampaigns: Array<{ name: string; count: number }>
  busiestDay: { day: string; count: number }
  dateRange: { start: string; end: string }
}

export default function Reservas() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  
  // Filtros
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const [quickPeriod, setQuickPeriod] = useState("Este Mês")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [parkFilter, setParkFilter] = useState("all")
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Charts
  const [chartLoaded, setChartLoaded] = useState(false)
  const [charts, setCharts] = useState<{hourChart?: any, weekdayChart?: any}>({})

  useEffect(() => {
    // Set default dates
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    setDateStart(firstDayOfMonth.toISOString().split('T')[0])
    setDateEnd(today.toISOString().split('T')[0])
    
    loadReservations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reservations, dateStart, dateEnd, searchTerm, statusFilter, parkFilter])

  useEffect(() => {
    if (filteredReservations.length > 0) {
      calculateDashboardStats()
    }
  }, [filteredReservations])

  useEffect(() => {
    if (chartLoaded && stats) {
      createCharts()
    }
  }, [chartLoaded, stats])

  const handleChartJSLoad = () => {
    setChartLoaded(true)
  }

  const loadReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sync/supabase?limit=50000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Processar reservas para adicionar campos derivados
        const processedReservations = allReservations.map((res: Reservation) => ({
          ...res,
          // Determinar campanha baseado em alguma lógica (exemplo)
          campanha: determineCampaign(res),
          // Garantir que temos booking_date
          booking_date: res.booking_date || res.check_in_previsto || res.created_at_db
        }))
        
        setReservations(processedReservations)
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  const determineCampaign = (reservation: Reservation): string => {
    // Lógica para determinar campanha baseada em diferentes critérios
    if (reservation.booking_id?.includes('PARK')) return 'Parkos'
    if (reservation.booking_id?.includes('VB')) return 'Viagens Baratas'
    if (reservation.booking_id?.includes('PC')) return 'Parclick'
    if (reservation.booking_id?.includes('L4P')) return 'Looking4Parking'
    if (reservation.booking_id?.includes('PV')) return 'Parkvia'
    return 'Sem Campanha'
  }

  const applyFilters = () => {
    let filtered = [...reservations]

    // Filtro por data
    if (dateStart && dateEnd) {
      filtered = filtered.filter(res => {
        const bookingDate = new Date(res.booking_date || res.created_at_db)
        const start = new Date(dateStart)
        const end = new Date(dateEnd)
        end.setHours(23, 59, 59, 999)
        return bookingDate >= start && bookingDate <= end
      })
    }

    // Filtro por pesquisa
    if (searchTerm) {
      filtered = filtered.filter(res => 
        res.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.name_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(res => res.estado_reserva_atual === statusFilter)
    }

    // Filtro por parque
    if (parkFilter !== "all") {
      filtered = filtered.filter(res => res.cidade_cliente === parkFilter)
    }

    setFilteredReservations(filtered)
    setCurrentPage(1)
  }

  const calculateDashboardStats = () => {
    const stats: DashboardStats = {
      totalReservations: filteredReservations.length,
      totalValue: 0,
      byCampaign: {},
      byWeekday: {},
      byHour: {},
      byCity: {},
      byStatus: {},
      topCampaigns: [],
      busiestDay: { day: '', count: 0 },
      dateRange: { start: dateStart, end: dateEnd }
    }

    // Inicializar dias da semana
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    weekdays.forEach(day => stats.byWeekday[day] = 0)

    // Processar cada reserva
    filteredReservations.forEach(reservation => {
      // Valor total
      const price = reservation.total_price || reservation.booking_price || 0
      stats.totalValue += price

      // Por campanha
      const campaign = reservation.campanha || 'Sem Campanha'
      stats.byCampaign[campaign] = (stats.byCampaign[campaign] || 0) + 1

      // Por dia da semana
      const bookingDate = new Date(reservation.booking_date || reservation.created_at_db)
      const weekday = weekdays[bookingDate.getDay()]
      stats.byWeekday[weekday] = (stats.byWeekday[weekday] || 0) + 1

      // Por hora
      const hour = bookingDate.getHours()
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1

      // Por cidade
      const city = reservation.cidade_cliente || 'N/A'
      stats.byCity[city] = (stats.byCity[city] || 0) + 1

      // Por estado
      const status = reservation.estado_reserva_atual
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
    })

    // Top campanhas
    stats.topCampaigns = Object.entries(stats.byCampaign)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }))

    // Dia mais movimentado
    const busiestEntry = Object.entries(stats.byWeekday)
      .sort(([,a], [,b]) => b - a)[0]
    if (busiestEntry) {
      stats.busiestDay = { day: busiestEntry[0], count: busiestEntry[1] }
    }

    setStats(stats)
  }

  const createCharts = () => {
    if (!stats || typeof window === 'undefined') return

    // Destroy existing charts
    if (charts.hourChart) charts.hourChart.destroy()
    if (charts.weekdayChart) charts.weekdayChart.destroy()

    const Chart = (window as any).Chart

    // Gráfico por Hora
    const hourCtx = document.getElementById('hourChart') as HTMLCanvasElement
    if (hourCtx && Chart) {
      const hourData = Object.entries(stats.byHour)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([hour, count]) => ({
          hour: `${hour.padStart(2, '0')}:00`,
          count
        }))

      const hourChart = new Chart(hourCtx, {
        type: 'line',
        data: {
          labels: hourData.map(d => d.hour),
          datasets: [{
            label: 'Reservas por Hora',
            data: hourData.map(d => d.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      })

      // Gráfico por Dia da Semana
      const weekdayCtx = document.getElementById('weekdayChart') as HTMLCanvasElement
      if (weekdayCtx) {
        const weekdayData = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
          .map(day => ({
            day: day.substring(0, 3),
            count: stats.byWeekday[day] || 0
          }))

        const weekdayChart = new Chart(weekdayCtx, {
          type: 'bar',
          data: {
            labels: weekdayData.map(d => d.day),
            datasets: [{
              label: 'Reservas',
              data: weekdayData.map(d => d.count),
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        })

        setCharts({ hourChart, weekdayChart })
      }
    }
  }

  const handleQuickPeriod = (period: string) => {
    const today = new Date()
    let start = new Date()
    let end = new Date()

    switch (period) {
      case 'Este Mês':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'Último Mês':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case 'Últimos 7 dias':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        end = today
        break
      case 'Últimos 30 dias':
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        end = today
        break
    }

    setDateStart(start.toISOString().split('T')[0])
    setDateEnd(end.toISOString().split('T')[0])
    setQuickPeriod(period)
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/sync/admin-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' })
      })
      
      const result = await response.json()
      if (result.status === 'success') {
        await loadReservations()
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      setSyncing(false)
    }
  }

  const exportToExcel = () => {
    const csvContent = [
      ['ID', 'Matrícula', 'Nome', 'Email', 'Estado', 'Cidade', 'Preço', 'Campanha', 'Data Reserva'].join(','),
      ...filteredReservations.map(res => [
        res.booking_id || res.id_pk.slice(0, 8),
        res.license_plate,
        `${res.name_cliente || ''} ${res.lastname_cliente || ''}`.trim(),
        res.email_cliente || '',
        res.estado_reserva_atual,
        res.cidade_cliente || '',
        res.booking_price || 0,
        res.campanha || 'Sem Campanha',
        new Date(res.booking_date || res.created_at_db).toLocaleDateString('pt-PT')
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '0,00 €'
    return new Intl.NumberFormat('pt-PT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reservado': return 'bg-blue-100 text-blue-800'
      case 'em_recolha': return 'bg-yellow-100 text-yellow-800'
      case 'recolhido': return 'bg-orange-100 text-orange-800'
      case 'em_entrega': return 'bg-purple-100 text-purple-800'
      case 'entregue': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage)

  return (
    <Layout title="Gestão de Reservas">
      <div className="space-y-6">
        {/* File Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Importar Reservas / Sincronizar</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToExcel}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button 
                  onClick={handleSync} 
                  disabled={syncing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar Firebase'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".xlsx,.csv"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Processar Ficheiro</Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard de Análise de Reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data Início:</label>
                <Input 
                  type="date" 
                  value={dateStart} 
                  onChange={(e) => setDateStart(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data Fim:</label>
                <Input 
                  type="date" 
                  value={dateEnd} 
                  onChange={(e) => setDateEnd(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Período Rápido:</label>
                <Select value={quickPeriod} onValueChange={handleQuickPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Este Mês">Este Mês</SelectItem>
                    <SelectItem value="Último Mês">Último Mês</SelectItem>
                    <SelectItem value="Últimos 7 dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="Últimos 30 dias">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={loadReservations}
                  disabled={loading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Carregando...' : 'Analisar'}
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.totalReservations.toLocaleString() || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total de Reservas</p>
                  <p className="text-xs text-gray-500">
                    {dateStart && dateEnd && `${new Date(dateStart).toLocaleDateString('pt-PT')} a ${new Date(dateEnd).toLocaleDateString('pt-PT')}`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.totalValue)}
                  </div>
                  <p className="text-sm text-gray-600">Valor Total Estimado</p>
                  <p className="text-xs text-gray-500">
                    {dateStart && dateEnd && `${new Date(dateStart).toLocaleDateString('pt-PT')} a ${new Date(dateEnd).toLocaleDateString('pt-PT')}`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-2">Reservas por Campanha</div>
                  <div className="space-y-1 text-xs">
                    {stats?.topCampaigns.map((campaign, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="truncate">{campaign.name}</span>
                        <span className="font-semibold">{campaign.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-2">Reservas por Dia da Semana</div>
                  <div className="text-xs">
                    <div className="font-semibold mb-1">
                      {stats?.busiestDay.day} - Dia com mais reservas ({stats?.busiestDay.count})
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
                        const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
                        const count = stats?.byWeekday[weekdays[index]] || 0
                        return (
                          <div key={day}>
                            {day}
                            <br />
                            <span className="font-semibold">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribuição por Hora</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <canvas id="hourChart"></canvas>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribuição por Dia da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <canvas id="weekdayChart"></canvas>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Reservations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Reservas ({filteredReservations.length})</span>
              <div className="flex gap-2">
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="em_recolha">Em Recolha</SelectItem>
                    <SelectItem value="recolhido">Recolhido</SelectItem>
                    <SelectItem value="em_entrega">Em Entrega</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReservations.map((reservation) => (
                  <TableRow key={reservation.id_pk}>
                    <TableCell className="font-mono text-xs">
                      {reservation.booking_id?.slice(0, 8) || reservation.id_pk.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {reservation.license_plate}
                    </TableCell>
                    <TableCell>
                      {reservation.name_cliente} {reservation.lastname_cliente}
                    </TableCell>
                    <TableCell className="capitalize">
                      {reservation.cidade_cliente || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(reservation.booking_price)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {reservation.campanha || 'Sem Campanha'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reservation.estado_reserva_atual)}>
                        {reservation.estado_reserva_atual}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(reservation.booking_date || reservation.created_at_db).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredReservations.length)} de {filteredReservations.length} reservas
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Chart.js Script */}
      <Script 
        src="https://cdn.jsdelivr.net/npm/chart.js" 
        onLoad={handleChartJSLoad}
      />
    </Layout>
  )
}
