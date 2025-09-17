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
import { CalendarIcon, XCircle, Search, RefreshCw, AlertCircle, Calendar, Euro, TrendingDown, BarChart3, Clock, MapPin, User } from "lucide-react"
import { format, startOfDay, endOfDay, subDays, isToday, isThisWeek, isThisMonth } from "date-fns"
import { pt } from "date-fns/locale"

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
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  parque_id?: string
  parking_type?: string
  created_at_db: string
  updated_at_db: string
}

interface CancelamentoStats {
  total: number
  totalLost: number
  byCity: { [key: string]: number }
  byBrand: { [key: string]: number }
  byHour: { [key: string]: number }
  byDay: { [key: string]: number }
  byWeek: { [key: string]: number }
  byMonth: { [key: string]: number }
  todayCancellations: number
  weekCancellations: number
  monthCancellations: number
  averageValue: number
  weeklyGrowth: number
  monthlyGrowth: number
}

export default function Cancelamentos() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<CancelamentoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: startOfDay(new Date()),
    end: endOfDay(new Date())
  })
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    loadCancelamentos()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reservations, searchTerm, periodFilter, cityFilter, brandFilter, dateRange])

  const loadCancelamentos = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=5000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar apenas reservas canceladas
        const canceledReservations = allReservations.filter((r: Reservation) => 
          r.estado_reserva_atual === 'cancelado'
        )
        
        setReservations(canceledReservations)
        calculateStats(canceledReservations)
      }
    } catch (error) {
      console.error('Erro ao carregar cancelamentos:', error)
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

    // Filtros por data
    const todayCancellations = data.filter(r => {
      const date = new Date(r.updated_at_db)
      return isToday(date)
    }).length

    const thisWeekData = data.filter(r => new Date(r.updated_at_db) >= thisWeekStart)
    const lastWeekData = data.filter(r => {
      const date = new Date(r.updated_at_db)
      return date >= lastWeekStart && date < thisWeekStart
    })

    const thisMonthData = data.filter(r => new Date(r.updated_at_db) >= thisMonthStart)
    const lastMonthData = data.filter(r => {
      const date = new Date(r.updated_at_db)
      return date >= lastMonthStart && date < thisMonthStart
    })

    const weekCancellations = thisWeekData.length
    const monthCancellations = thisMonthData.length

    // Calcular crescimentos (no caso dos cancelamentos, crescimento é negativo)
    const weeklyGrowth = lastWeekData.length > 0 
      ? ((thisWeekData.length - lastWeekData.length) / lastWeekData.length) * 100 
      : 0

    const monthlyGrowth = lastMonthData.length > 0 
      ? ((thisMonthData.length - lastMonthData.length) / lastMonthData.length) * 100 
      : 0

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

    // Por hora
    const byHour = data.reduce((acc, r) => {
      const hour = new Date(r.updated_at_db).getHours().toString()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por dia da semana
    const byDay = data.reduce((acc, r) => {
      const day = new Date(r.updated_at_db).toLocaleDateString('pt-PT', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por semana
    const byWeek = data.reduce((acc, r) => {
      const weekStart = format(subDays(new Date(r.updated_at_db), new Date(r.updated_at_db).getDay()), 'dd/MM', { locale: pt })
      acc[weekStart] = (acc[weekStart] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Por mês
    const byMonth = data.reduce((acc, r) => {
      const month = format(new Date(r.updated_at_db), 'MMM yyyy', { locale: pt })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const totalLost = data.reduce((sum, r) => sum + (r.booking_price || 0), 0)
    const averageValue = data.length > 0 ? totalLost / data.length : 0

    setStats({
      total: data.length,
      totalLost,
      byCity,
      byBrand,
      byHour,
      byDay,
      byWeek,
      byMonth,
      todayCancellations,
      weekCancellations,
      monthCancellations,
      averageValue,
      weeklyGrowth,
      monthlyGrowth
    })
  }

  const applyFilters = () => {
    let filtered = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.updated_at_db)
      const inDateRange = reservationDate >= dateRange.start && reservationDate <= dateRange.end
      
      const matchesSearch = searchTerm === "" || 
        reservation.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.name_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.lastname_cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.booking_id || "").includes(searchTerm) ||
        (reservation.email_cliente || "").toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesPeriod = true
      if (periodFilter !== "all") {
        const cancelDate = new Date(reservation.updated_at_db)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        switch (periodFilter) {
          case "today":
            matchesPeriod = cancelDate >= today
            break
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesPeriod = cancelDate >= weekAgo
            break
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesPeriod = cancelDate >= monthAgo
            break
        }
      }
      
      const matchesCity = cityFilter === "all" || reservation.cidade_cliente === cityFilter
      const matchesBrand = brandFilter === "all" || reservation.park_name === brandFilter
      
      return inDateRange && matchesSearch && matchesPeriod && matchesCity && matchesBrand
    })
    
    setFilteredReservations(filtered)
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

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Ontem'
    return `Há ${days} dias`
  }

  const cities = [...new Set(reservations.map(r => r.cidade_cliente).filter(Boolean))]
  const brands = [...new Set(reservations.map(r => r.park_name).filter(Boolean))]

  return (
    <Layout title="Gestão de Cancelamentos">
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {loading ? '-' : stats?.todayCancellations || 0}
                  </div>
                  <p className="text-sm text-gray-600">Hoje</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {loading ? '-' : stats?.weekCancellations || 0}
                  </div>
                  <p className="text-sm text-gray-600">Esta Semana</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {loading ? '-' : stats?.monthCancellations || 0}
                  </div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                </div>
                <XCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {loading ? '-' : formatCurrency(stats?.averageValue || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Valor Médio</p>
                </div>
                <Euro className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {loading ? '-' : formatCurrency(stats?.totalLost || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Total Perdido</p>
                </div>
                <TrendingDown className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
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
            <Button onClick={loadCancelamentos} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Análise de Tendências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Taxa de Cancelamentos Semanal</h4>
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl font-bold ${
                        (stats?.weeklyGrowth || 0) <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(stats?.weeklyGrowth || 0).toFixed(1)}%
                      </div>
                      <TrendingDown className={`w-5 h-5 ${
                        (stats?.weeklyGrowth || 0) <= 0 ? 'text-green-500' : 'text-red-500'
                      }`} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {(stats?.weeklyGrowth || 0) <= 0 ? 'Menos cancelamentos vs. semana anterior' : 'Mais cancelamentos vs. semana anterior'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Taxa de Cancelamentos Mensal</h4>
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl font-bold ${
                        (stats?.monthlyGrowth || 0) <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(stats?.monthlyGrowth || 0).toFixed(1)}%
                      </div>
                      <TrendingDown className={`w-5 h-5 ${
                        (stats?.monthlyGrowth || 0) <= 0 ? 'text-green-500' : 'text-red-500'
                      }`} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {(stats?.monthlyGrowth || 0) <= 0 ? 'Menos cancelamentos vs. mês anterior' : 'Mais cancelamentos vs. mês anterior'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Cidades com Mais Cancelamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Cidades com Mais Cancelamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byCity || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([city, count]) => {
                      const percentage = stats?.total ? (count / stats.total) * 100 : 0
                      const lostValue = reservations
                        .filter(r => r.cidade_cliente === city)
                        .reduce((sum, r) => sum + (r.booking_price || 0), 0)
                      
                      return (
                        <div key={city} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium capitalize">{city}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-right">
                              <div className="font-bold text-red-600">{count} cancelamentos</div>
                              <div className="text-gray-500">{formatCurrency(lostValue)} perdidos</div>
                            </div>
                            <div className="text-gray-500">({percentage.toFixed(1)}%)</div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </CardContent>
            </Card>

            {/* Principais Marcas */}
            <Card>
              <CardHeader>
                <CardTitle>Cancelamentos por Marca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.byBrand || {})
                    .sort(([,a], [,b]) => b - a)
                    .map(([brand, count]) => {
                      const percentage = stats?.total ? (count / stats.total) * 100 : 0
                      const lostValue = reservations
                        .filter(r => r.park_name === brand)
                        .reduce((sum, r) => sum + (r.booking_price || 0), 0)
                      
                      return (
                        <div key={brand} className="flex items-center justify-between">
                          <span className="font-medium capitalize">{brand}</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-red-600 font-bold">{count}</span>
                            <span className="text-gray-500">({percentage.toFixed(1)}%)</span>
                            <Badge variant="destructive">{formatCurrency(lostValue)}</Badge>
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
              {/* Cancelamentos por Hora */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Cancelamentos por Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => {
                      const count = stats?.byHour[hour.toString()] || 0
                      const maxCount = Math.max(...Object.values(stats?.byHour || {}))
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
                      
                      return (
                        <div key={hour} className="flex items-center gap-3">
                          <div className="w-12 text-sm text-gray-600">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                            <div 
                              className="bg-red-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-12 text-sm font-medium text-right">
                            {count}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Cancelamentos por Dia da Semana */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Cancelamentos por Dia da Semana
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
                              className="bg-orange-500 h-full rounded-full transition-all duration-300"
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
            </div>

            {/* Análise Temporal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal dos Cancelamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(stats?.byMonth || {})
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .slice(-4)
                    .map(([month, count]) => {
                      const lostValue = reservations
                        .filter(r => format(new Date(r.updated_at_db), 'MMM yyyy', { locale: pt }) === month)
                        .reduce((sum, r) => sum + (r.booking_price || 0), 0)
                      
                      return (
                        <div key={month} className="p-4 bg-red-50 rounded-lg text-center">
                          <div className="font-medium mb-2">{month}</div>
                          <div className="text-2xl font-bold text-red-600 mb-1">{count}</div>
                          <div className="text-sm text-gray-600">cancelamentos</div>
                          <div className="text-sm font-medium text-red-500 mt-2">{formatCurrency(lostValue)}</div>
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
                    placeholder="Buscar por matrícula, cliente, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Períodos</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última Semana</SelectItem>
                      <SelectItem value="month">Último Mês</SelectItem>
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
                  Cancelamentos ({filteredReservations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <span className="ml-2">A carregar cancelamentos...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Cancelamento</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contactos</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Check-in Previsto</TableHead>
                        <TableHead>Valor Perdido</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.slice(0, 100).map((reservation) => (
                        <TableRow key={reservation.id_pk}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{getDaysSince(reservation.updated_at_db)}</span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(reservation.updated_at_db)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-semibold">
                            {reservation.license_plate}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {reservation.name_cliente} {reservation.lastname_cliente}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {reservation.email_cliente && (
                                <span className="text-xs text-gray-600">
                                  {reservation.email_cliente}
                                </span>
                              )}
                              {reservation.phone_cliente && (
                                <span className="text-xs text-gray-600">
                                  {reservation.phone_cliente}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{reservation.cidade_cliente || 'Desconhecida'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{reservation.park_name || '-'}</span>
                          </TableCell>
                          <TableCell>
                            {formatDateTime(reservation.check_in_previsto)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {formatCurrency(reservation.booking_price)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Ver Motivo
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {!loading && filteredReservations.length === 0 && (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      {reservations.length === 0 ? 'Nenhum cancelamento encontrado' : 'Nenhum cancelamento corresponde aos filtros'}
                    </p>
                  </div>
                )}
                
                {filteredReservations.length > 100 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Mostrando primeiros 100 de {filteredReservations.length} cancelamentos
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
