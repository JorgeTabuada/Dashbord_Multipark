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
import { CalendarIcon, Package, Search, RefreshCw, MapPin, Clock, CheckCircle, AlertCircle, User, TrendingUp, BarChart3, Calendar, Euro, Download } from "lucide-react"
import { format, startOfDay, endOfDay, subDays, isToday, isThisWeek, isThisMonth } from "date-fns"
import { pt } from "date-fns/locale"
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
  phone_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  total_price?: number
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  parque_id?: string
  parking_type?: string
  spot_code?: string
  row_code?: string
  alocation?: string
  condutor_recolha_id?: string
  condutor_entrega_id?: string
  observacoes_recolha?: string
  created_at_db: string
  updated_at_db: string
}

interface EntregaStats {
  total: number
  totalValue: number
  byStatus: { [key: string]: number }
  byCity: { [key: string]: number }
  byBrand: { [key: string]: number }
  byHour: { [key: string]: number }
  byDay: { [key: string]: number }
  byWeek: { [key: string]: number }
  byMonth: { [key: string]: number }
  todayDeliveries: number
  pendingDeliveries: number
  inProgressDeliveries: number
  completedDeliveries: number
  weeklyGrowth: number
  monthlyGrowth: number
}

export default function Entregas() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<EntregaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: startOfDay(new Date()),
    end: endOfDay(new Date())
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [chartsReady, setChartsReady] = useState(false)

  const entregaStatuses = ['recolhido', 'em_entrega', 'entregue']

  useEffect(() => {
    loadEntregas()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reservations, searchTerm, statusFilter, cityFilter, brandFilter, dateRange])

  useEffect(() => {
    if (chartsReady && stats && activeTab === "analytics") {
      setTimeout(() => {
        createCharts()
      }, 100)
    }
  }, [chartsReady, stats, activeTab])

  const loadEntregas = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=5000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar apenas reservas para entrega
        const entregaReservations = allReservations.filter((r: Reservation) => 
          entregaStatuses.includes(r.estado_reserva_atual)
        )
        
        setReservations(entregaReservations)
        calculateStats(entregaReservations)
      }
    } catch (error) {
      console.error('Erro ao carregar entregas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Reservation[]) => {
    const now = new Date()
    const today = startOfDay(now)
    const thisWeekStart = subDays(now, 7)
    const thisMonthStart = subDays(now, 30)
    const lastWeekStart = subDays(now, 14)
    const lastMonthStart = subDays(now, 60)

    // Usar check_out_previsto como data principal ao invés de booking_date que está null
    const todayDeliveries = data.filter(r => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      return isToday(deliveryDate) && r.estado_reserva_atual === 'entregue'
    }).length

    const thisWeekData = data.filter(r => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      return deliveryDate >= thisWeekStart
    })
    
    const lastWeekData = data.filter(r => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      return deliveryDate >= lastWeekStart && deliveryDate < thisWeekStart
    })

    const thisMonthData = data.filter(r => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      return deliveryDate >= thisMonthStart
    })
    
    const lastMonthData = data.filter(r => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      return deliveryDate >= lastMonthStart && deliveryDate < thisMonthStart
    })

    // Calcular crescimentos
    const weeklyGrowth = lastWeekData.length > 0 
      ? ((thisWeekData.length - lastWeekData.length) / lastWeekData.length) * 100 
      : 0

    const monthlyGrowth = lastMonthData.length > 0 
      ? ((thisMonthData.length - lastMonthData.length) / lastMonthData.length) * 100 
      : 0

    // Estatísticas por status
    const byStatus = data.reduce((acc, r) => {
      acc[r.estado_reserva_atual] = (acc[r.estado_reserva_atual] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por cidade
    const byCity = data.reduce((acc, r) => {
      const city = r.cidade_cliente || 'Desconhecida'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por marca (park_name)
    const byBrand = data.reduce((acc, r) => {
      const brand = r.park_name || 'Desconhecida'
      acc[brand] = (acc[brand] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por hora - usando check_out_previsto
    const byHour = data.reduce((acc, r) => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      const hour = deliveryDate.getHours().toString()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por dia da semana
    const byDay = data.reduce((acc, r) => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      const day = deliveryDate.toLocaleDateString('pt-PT', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por semana
    const byWeek = data.reduce((acc, r) => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      const weekStart = format(subDays(deliveryDate, deliveryDate.getDay()), 'dd/MM', { locale: pt })
      acc[weekStart] = (acc[weekStart] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por mês
    const byMonth = data.reduce((acc, r) => {
      const deliveryDate = r.check_out_real ? new Date(r.check_out_real) : 
                          r.check_out_previsto ? new Date(r.check_out_previsto) : 
                          new Date(r.updated_at_db)
      const month = format(deliveryDate, 'MMM yyyy', { locale: pt })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const totalValue = data.reduce((sum, r) => sum + (r.total_price || r.booking_price || 0), 0)

    const pendingDeliveries = byStatus['recolhido'] || 0
    const inProgressDeliveries = byStatus['em_entrega'] || 0
    const completedDeliveries = byStatus['entregue'] || 0

    setStats({
      total: data.length,
      totalValue,
      byStatus,
      byCity,
      byBrand,
      byHour,
      byDay,
      byWeek,
      byMonth,
      todayDeliveries,
      pendingDeliveries,
      inProgressDeliveries,
      completedDeliveries,
      weeklyGrowth,
      monthlyGrowth
    })
  }

  const applyFilters = () => {
    let filtered = reservations.filter(reservation => {
      const deliveryDate = reservation.check_out_real ? new Date(reservation.check_out_real) : 
                         reservation.check_out_previsto ? new Date(reservation.check_out_previsto) : 
                         new Date(reservation.updated_at_db)
      const inDateRange = deliveryDate >= dateRange.start && deliveryDate <= dateRange.end
      
      const matchesSearch = searchTerm === "" || 
        reservation.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.name_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.lastname_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.booking_id || "").includes(searchTerm) ||
        (reservation.condutor_entrega_id || "").toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || reservation.estado_reserva_atual === statusFilter
      const matchesCity = cityFilter === "all" || reservation.cidade_cliente === cityFilter
      const matchesBrand = brandFilter === "all" || reservation.park_name === brandFilter
      
      return inDateRange && matchesSearch && matchesStatus && matchesCity && matchesBrand
    })
    
    setFilteredReservations(filtered)
  }

  const createCharts = () => {
    // @ts-ignore
    if (typeof Chart === 'undefined' || !stats) return

    // Entregas por Hora - Bar Chart
    const hourCtx = document.getElementById('entregasHourChart') as HTMLCanvasElement
    if (hourCtx) {
      const existingChart = (window as any).entregasHourChart
      if (existingChart) existingChart.destroy()

      const hours = Array.from({ length: 24 }, (_, i) => i)
      const hourData = hours.map(hour => stats.byHour[hour.toString()] || 0)

      // @ts-ignore
      ;(window as any).entregasHourChart = new Chart(hourCtx, {
        type: 'bar',
        data: {
          labels: hours.map(h => `${h.toString().padStart(2, '0')}:00`),
          datasets: [{
            label: 'Entregas por Hora',
            data: hourData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      })
    }

    // Entregas por Status - Doughnut Chart
    const statusCtx = document.getElementById('entregasStatusChart') as HTMLCanvasElement
    if (statusCtx) {
      const existingChart = (window as any).entregasStatusChart
      if (existingChart) existingChart.destroy()

      const statusLabels = {
        'recolhido': 'Aguarda Entrega',
        'em_entrega': 'Em Entrega', 
        'entregue': 'Entregue'
      }

      const statusData = Object.entries(stats.byStatus).map(([status, count]) => ({
        label: statusLabels[status as keyof typeof statusLabels] || status,
        value: count
      }))

      // @ts-ignore
      ;(window as any).entregasStatusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: statusData.map(d => d.label),
          datasets: [{
            data: statusData.map(d => d.value),
            backgroundColor: [
              'rgba(251, 191, 36, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)'
            ],
            borderColor: [
              'rgba(251, 191, 36, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(34, 197, 94, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Status',
      'Matrícula', 
      'Cliente',
      'Cidade',
      'Marca',
      'Condutor Entrega',
      'Check-out Previsto',
      'Check-out Real',
      'Valor',
      'Booking ID'
    ]

    const csvData = [
      headers.join(','),
      ...filteredReservations.map(r => [
        r.estado_reserva_atual,
        r.license_plate,
        `"${(r.name_cliente || '') + ' ' + (r.lastname_cliente || '')}"`,
        r.cidade_cliente || '',
        r.park_name || '',
        r.condutor_entrega_id || '',
        r.check_out_previsto || '',
        r.check_out_real || '',
        r.total_price || r.booking_price || 0,
        r.booking_id || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `entregas_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'recolhido': { variant: 'secondary' as const, label: 'Aguarda Entrega', color: 'text-yellow-600' },
      'em_entrega': { variant: 'default' as const, label: 'Em Entrega', color: 'text-blue-600' },
      'entregue': { variant: 'default' as const, label: 'Entregue', color: 'text-green-600' }
    }
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'outline' as const, label: status, color: 'text-gray-600' }
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>
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

  const cities = [...new Set(reservations.map(r => r.cidade_cliente).filter(Boolean))]
  const brands = [...new Set(reservations.map(r => r.park_name).filter(Boolean))]

  return (
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/chart.js"
        onLoad={() => setChartsReady(true)}
      />
      
      <Layout title="Gestão de Entregas">
        <div className="space-y-6">
          {/* Header com estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {loading ? '-' : stats?.pendingDeliveries || 0}
                    </div>
                    <p className="text-sm text-gray-600">Aguarda Entrega</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {loading ? '-' : stats?.inProgressDeliveries || 0}
                    </div>
                    <p className="text-sm text-gray-600">Em Entrega</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {loading ? '-' : stats?.completedDeliveries || 0}
                    </div>
                    <p className="text-sm text-gray-600">Entregues</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-indigo-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {loading ? '-' : stats?.todayDeliveries || 0}
                    </div>
                    <p className="text-sm text-gray-600">Hoje</p>
                  </div>
                  <Calendar className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {loading ? '-' : formatCurrency(stats?.totalValue || 0)}
                    </div>
                    <p className="text-sm text-gray-600">Volume Total</p>
                  </div>
                  <Euro className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Dados
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button onClick={exportToCSV} disabled={loading || filteredReservations.length === 0} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button onClick={loadEntregas} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Crescimento e Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Crescimento Semanal</h4>
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${
                          (stats?.weeklyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(stats?.weeklyGrowth || 0).toFixed(1)}%
                        </div>
                        <TrendingUp className={`w-5 h-5 ${
                          (stats?.weeklyGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'
                        }`} />
                      </div>
                      <p className="text-sm text-gray-600">vs. semana anterior</p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Crescimento Mensal</h4>
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${
                          (stats?.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(stats?.monthlyGrowth || 0).toFixed(1)}%
                        </div>
                        <TrendingUp className={`w-5 h-5 ${
                          (stats?.monthlyGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'
                        }`} />
                      </div>
                      <p className="text-sm text-gray-600">vs. mês anterior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.byStatus || {}).map(([status, count]) => {
                      const percentage = stats?.total ? (count / stats.total) * 100 : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            <span className="font-medium">{count} entregas</span>
                          </div>
                          <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 Cidades */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Cidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.byCity || {})
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([city, count]) => {
                        const percentage = stats?.total ? (count / stats.total) * 100 : 0
                        return (
                          <div key={city} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="font-medium capitalize">{city}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{count}</span>
                              <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entregas por Hora */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Entregas por Hora
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <canvas id="entregasHourChart"></canvas>
                    </div>
                  </CardContent>
                </Card>

                {/* Distribuição por Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Distribuição por Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <canvas id="entregasStatusChart"></canvas>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Entregas por Dia da Semana */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Entregas por Dia da Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.byDay || {}).map(([day, count]) => {
                      const maxCount = Math.max(...Object.values(stats?.byDay || {}))
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                      
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <div className="w-20 text-sm capitalize">{day}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            <div 
                              className="bg-green-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-12 text-sm font-medium text-right">{count}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Performance por Marca */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Marca</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(stats?.byBrand || {})
                      .sort(([,a], [,b]) => b - a)
                      .map(([brand, count]) => {
                        const percentage = stats?.total ? (count / stats.total) * 100 : 0
                        return (
                          <div key={brand} className="p-4 bg-gray-50 rounded-lg">
                            <div className="font-medium capitalize mb-1">{brand}</div>
                            <div className="text-2xl font-bold text-blue-600 mb-1">{count}</div>
                            <div className="text-sm text-gray-600">{percentage.toFixed(1)}% do total</div>
                          </div>
                        )
                      })
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-6">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Filtros de Pesquisa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data de Início</label>
                      <Input
                        type="date"
                        value={format(dateRange.start, 'yyyy-MM-dd')}
                        onChange={(e) => setDateRange(prev => ({ 
                          ...prev, 
                          start: startOfDay(new Date(e.target.value)) 
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Data de Fim</label>
                      <Input
                        type="date"
                        value={format(dateRange.end, 'yyyy-MM-dd')}
                        onChange={(e) => setDateRange(prev => ({ 
                          ...prev, 
                          end: endOfDay(new Date(e.target.value)) 
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Buscar por matrícula, cliente, condutor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="recolhido">Aguarda Entrega</SelectItem>
                        <SelectItem value="em_entrega">Em Entrega</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={cityFilter} onValueChange={setCityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Cidades</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city} value={city || ''} className="capitalize">
                            {city || 'Desconhecida'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Marca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Marcas</SelectItem>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand || ''} className="capitalize">
                            {brand || 'Desconhecida'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Dados */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Lista de Entregas ({filteredReservations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <span className="ml-2">A carregar entregas...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Matrícula</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Marca</TableHead>
                          <TableHead>Condutor</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReservations.slice(0, 100).map((reservation) => (
                          <TableRow key={reservation.id_pk}>
                            <TableCell>
                              {getStatusBadge(reservation.estado_reserva_atual)}
                            </TableCell>
                            <TableCell className="font-mono font-semibold">
                              {reservation.license_plate}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {reservation.name_cliente} {reservation.lastname_cliente}
                                </span>
                                {reservation.phone_cliente && (
                                  <span className="text-xs text-gray-500">
                                    {reservation.phone_cliente}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="capitalize font-medium">{reservation.cidade_cliente || 'Desconhecida'}</span>
                                {reservation.parking_type && (
                                  <span className="text-xs text-gray-500">
                                    {reservation.parking_type}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="capitalize">{reservation.park_name || '-'}</span>
                            </TableCell>
                            <TableCell>
                              {reservation.condutor_entrega_id && (
                                <span className="text-sm">
                                  <User className="w-3 h-3 inline mr-1" />
                                  {reservation.condutor_entrega_id}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {formatDateTime(reservation.check_out_previsto)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(reservation.total_price || reservation.booking_price)}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  {!loading && filteredReservations.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        {reservations.length === 0 ? 'Nenhuma entrega encontrada' : 'Nenhuma entrega corresponde aos filtros'}
                      </p>
                    </div>
                  )}
                  
                  {filteredReservations.length > 100 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Mostrando primeiras 100 de {filteredReservations.length} entregas
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </>
  )
}