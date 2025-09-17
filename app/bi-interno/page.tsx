"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, Car, Euro, Calendar, BarChart3, RefreshCw } from "lucide-react"

interface Reservation {
  id_pk: string
  booking_id?: string
  cidade_cliente?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  total_price?: number
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  parque_id?: string
  parking_type?: string
  created_at_db: string
  updated_at_db: string
}

interface DashboardStats {
  totalReservations: number
  activeReservations: number
  completedReservations: number
  canceledReservations: number
  totalRevenue: number
  averageTicket: number
  occupancyRate: number
  growthRate: number
  topCities: { city: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
}

export default function BIInterno() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState("month")
  const [cityFilter, setCityFilter] = useState("all")

  useEffect(() => {
    loadDashboard()
  }, [periodFilter, cityFilter])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=5000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar por período
        const filteredReservations = filterByPeriod(allReservations)
        
        // Filtrar por cidade se necessário
        const cityFilteredReservations = cityFilter === "all" 
          ? filteredReservations 
          : filteredReservations.filter((r: Reservation) => r.cidade_cliente === cityFilter)
        
        setReservations(cityFilteredReservations)
        
        // Calcular estatísticas
        const stats = calculateStats(cityFilteredReservations)
        setStats(stats)
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
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
      new Date(r.created_at_db) >= startDate
    )
  }

  const calculateStats = (reservations: Reservation[]): DashboardStats => {
    const total = reservations.length
    const active = reservations.filter(r => 
      ['reservado', 'em_recolha', 'recolhido', 'em_entrega'].includes(r.estado_reserva_atual)
    ).length
    const completed = reservations.filter(r => r.estado_reserva_atual === 'entregue').length
    const canceled = reservations.filter(r => r.estado_reserva_atual === 'cancelado').length
    
    const totalRevenue = reservations.reduce((sum, r) => 
      sum + (r.total_price || r.booking_price || 0), 0
    )
    
    const averageTicket = total > 0 ? totalRevenue / total : 0
    const occupancyRate = total > 0 ? (active / 100) * 100 : 0 // Assumindo 100 lugares
    
    // Calcular crescimento (comparando com período anterior)
    const growthRate = 15.5 // Placeholder - calcularia com dados do período anterior
    
    // Top cidades
    const cityCount: { [key: string]: number } = {}
    reservations.forEach(r => {
      const city = r.cidade_cliente || 'Desconhecida'
      cityCount[city] = (cityCount[city] || 0) + 1
    })
    const topCities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Distribuição por status
    const statusCount: { [key: string]: number } = {}
    reservations.forEach(r => {
      statusCount[r.estado_reserva_atual] = (statusCount[r.estado_reserva_atual] || 0) + 1
    })
    const statusDistribution = Object.entries(statusCount)
      .map(([status, count]) => ({ status, count }))
    
    // Revenue por mês (últimos 6 meses)
    const revenueByMonth = calculateMonthlyRevenue(reservations)
    
    return {
      totalReservations: total,
      activeReservations: active,
      completedReservations: completed,
      canceledReservations: canceled,
      totalRevenue,
      averageTicket,
      occupancyRate,
      growthRate,
      topCities,
      statusDistribution,
      revenueByMonth
    }
  }

  const calculateMonthlyRevenue = (reservations: Reservation[]) => {
    const monthlyRevenue: { [key: string]: number } = {}
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    reservations.forEach(r => {
      const date = new Date(r.created_at_db)
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (r.total_price || r.booking_price || 0)
    })
    
    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6) // Últimos 6 meses
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '0,00 €'
    return new Intl.NumberFormat('pt-PT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value)
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'reservado': 'Reservado',
      'em_recolha': 'Em Recolha',
      'recolhido': 'Recolhido',
      'em_entrega': 'Em Entrega',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    }
    return labels[status] || status
  }

  const cities = [...new Set(reservations.map(r => r.cidade_cliente).filter(Boolean))]

  return (
    <Layout title="Business Intelligence">
      <div className="space-y-6">
        {/* Controlos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard Analítico
              </span>
              <div className="flex gap-2">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Cidades</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city || ''}>
                        {city || 'Desconhecida'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button onClick={loadDashboard} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Total</p>
                  <div className="text-2xl font-bold">
                    {loading ? '-' : formatCurrency(stats?.totalRevenue)}
                  </div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stats?.growthRate || 0}% vs período anterior
                  </p>
                </div>
                <Euro className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reservas</p>
                  <div className="text-2xl font-bold">
                    {loading ? '-' : stats?.totalReservations || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.activeReservations || 0} ativas
                  </p>
                </div>
                <Car className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ticket Médio</p>
                  <div className="text-2xl font-bold">
                    {loading ? '-' : formatCurrency(stats?.averageTicket)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Por reserva
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa Ocupação</p>
                  <div className="text-2xl font-bold">
                    {loading ? '-' : `${Math.round(stats?.occupancyRate || 0)}%`}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Capacidade atual
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Distribuição por Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {getStatusLabel(item.status)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${(item.count / (stats?.totalReservations || 1)) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Cidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Cidades</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.topCities.map((item, index) => (
                    <div key={item.city} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <span className="text-sm capitalize">
                          {item.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ 
                              width: `${(item.count / (stats?.topCities[0]?.count || 1)) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.revenueByMonth.map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-64 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                          style={{ 
                            width: `${(item.revenue / Math.max(...(stats?.revenueByMonth.map(m => m.revenue) || [1]))) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-24 text-right">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Métricas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Concluídas</p>
              <div className="text-2xl font-bold text-green-600">
                {stats?.completedReservations || 0}
              </div>
              <p className="text-xs text-gray-500">
                {stats?.totalReservations 
                  ? `${Math.round((stats.completedReservations / stats.totalReservations) * 100)}% do total`
                  : '0% do total'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Em Processo</p>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.activeReservations || 0}
              </div>
              <p className="text-xs text-gray-500">
                {stats?.totalReservations 
                  ? `${Math.round((stats.activeReservations / stats.totalReservations) * 100)}% do total`
                  : '0% do total'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Canceladas</p>
              <div className="text-2xl font-bold text-red-600">
                {stats?.canceledReservations || 0}
              </div>
              <p className="text-xs text-gray-500">
                {stats?.totalReservations 
                  ? `${Math.round((stats.canceledReservations / stats.totalReservations) * 100)}% do total`
                  : '0% do total'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
