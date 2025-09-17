"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users, Car, Euro, RefreshCw } from "lucide-react"

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
  payment_method?: string
  has_online_payment?: boolean
  created_at_db: string
  updated_at_db: string
}

interface ReportData {
  type: string
  title: string
  description: string
  icon: any
  data?: any
}

export default function Relatorios() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState("revenue")
  const [periodFilter, setPeriodFilter] = useState("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportData, setReportData] = useState<any>(null)

  const reports: ReportData[] = [
    {
      type: 'revenue',
      title: 'Relatório de Receitas',
      description: 'Análise detalhada de receitas por período',
      icon: Euro
    },
    {
      type: 'operations',
      title: 'Relatório Operacional',
      description: 'Estatísticas de recolhas, entregas e ocupação',
      icon: Car
    },
    {
      type: 'customers',
      title: 'Relatório de Clientes',
      description: 'Análise de clientes e comportamentos',
      icon: Users
    },
    {
      type: 'performance',
      title: 'Relatório de Desempenho',
      description: 'KPIs e métricas de performance',
      icon: TrendingUp
    },
    {
      type: 'financial',
      title: 'Relatório Financeiro',
      description: 'Resumo financeiro completo',
      icon: BarChart3
    }
  ]

  useEffect(() => {
    loadReportData()
  }, [selectedReport, periodFilter])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=5000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar por período
        const filteredReservations = filterByPeriod(allReservations)
        setReservations(filteredReservations)
        
        // Gerar dados do relatório baseado no tipo selecionado
        const report = generateReport(selectedReport, filteredReservations)
        setReportData(report)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterByPeriod = (reservations: Reservation[]) => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = now
    
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
      case "quarter":
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return reservations
    }
    
    return reservations.filter((r: Reservation) => {
      const date = new Date(r.created_at_db)
      return date >= startDate && date <= endDate
    })
  }

  const generateReport = (type: string, data: Reservation[]) => {
    switch (type) {
      case 'revenue':
        return generateRevenueReport(data)
      case 'operations':
        return generateOperationsReport(data)
      case 'customers':
        return generateCustomersReport(data)
      case 'performance':
        return generatePerformanceReport(data)
      case 'financial':
        return generateFinancialReport(data)
      default:
        return null
    }
  }

  const generateRevenueReport = (data: Reservation[]) => {
    const totalRevenue = data.reduce((sum, r) => 
      sum + (r.total_price || r.booking_price || 0), 0
    )
    
    const byStatus = data.reduce((acc, r) => {
      const status = r.estado_reserva_atual
      if (!acc[status]) acc[status] = { count: 0, revenue: 0 }
      acc[status].count++
      acc[status].revenue += r.total_price || r.booking_price || 0
      return acc
    }, {} as any)
    
    const byPaymentMethod = data.reduce((acc, r) => {
      const method = r.has_online_payment ? 'online' : (r.payment_method || 'cash')
      if (!acc[method]) acc[method] = { count: 0, revenue: 0 }
      acc[method].count++
      acc[method].revenue += r.total_price || r.booking_price || 0
      return acc
    }, {} as any)
    
    const byCity = data.reduce((acc, r) => {
      const city = r.cidade_cliente || 'Desconhecida'
      if (!acc[city]) acc[city] = { count: 0, revenue: 0 }
      acc[city].count++
      acc[city].revenue += r.total_price || r.booking_price || 0
      return acc
    }, {} as any)
    
    // Receita por dia
    const dailyRevenue = data.reduce((acc, r) => {
      const date = new Date(r.created_at_db).toLocaleDateString('pt-PT')
      if (!acc[date]) acc[date] = 0
      acc[date] += r.total_price || r.booking_price || 0
      return acc
    }, {} as any)
    
    return {
      summary: {
        totalRevenue,
        totalReservations: data.length,
        averageTicket: data.length > 0 ? totalRevenue / data.length : 0,
        completedReservations: data.filter(r => r.estado_reserva_atual === 'entregue').length,
        canceledReservations: data.filter(r => r.estado_reserva_atual === 'cancelado').length
      },
      byStatus,
      byPaymentMethod,
      byCity,
      dailyRevenue,
      topReservations: data
        .sort((a, b) => (b.total_price || b.booking_price || 0) - (a.total_price || a.booking_price || 0))
        .slice(0, 10)
    }
  }

  const generateOperationsReport = (data: Reservation[]) => {
    const totalOperations = data.length
    const pickups = data.filter(r => ['reservado', 'em_recolha', 'recolhido'].includes(r.estado_reserva_atual)).length
    const deliveries = data.filter(r => ['em_entrega', 'entregue'].includes(r.estado_reserva_atual)).length
    
    // Tempo médio de permanência (simulado)
    const avgStayTime = 4.5 // dias
    
    // Taxa de ocupação (simulado)
    const occupancyRate = 75 // %
    
    // Operações por hora do dia
    const operationsByHour = data.reduce((acc, r) => {
      const hour = new Date(r.created_at_db).getHours()
      if (!acc[hour]) acc[hour] = 0
      acc[hour]++
      return acc
    }, {} as any)
    
    return {
      summary: {
        totalOperations,
        pickups,
        deliveries,
        avgStayTime,
        occupancyRate
      },
      operationsByHour,
      peakHours: Object.entries(operationsByHour)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
    }
  }

  const generateCustomersReport = (data: Reservation[]) => {
    // Clientes únicos
    const uniqueCustomers = new Set(data.map(r => r.email_cliente || `${r.name_cliente}_${r.lastname_cliente}`)).size
    
    // Clientes por cidade
    const customersByCity = data.reduce((acc, r) => {
      const city = r.cidade_cliente || 'Desconhecida'
      if (!acc[city]) acc[city] = new Set()
      acc[city].add(r.email_cliente || `${r.name_cliente}_${r.lastname_cliente}`)
      return acc
    }, {} as any)
    
    const citiesData = Object.entries(customersByCity).map(([city, customers]: [string, any]) => ({
      city,
      count: customers.size
    }))
    
    // Clientes recorrentes (simulado)
    const recurringCustomers = Math.floor(uniqueCustomers * 0.3)
    
    return {
      summary: {
        uniqueCustomers,
        recurringCustomers,
        newCustomers: uniqueCustomers - recurringCustomers,
        avgReservationsPerCustomer: data.length / uniqueCustomers
      },
      citiesData: citiesData.sort((a, b) => b.count - a.count)
    }
  }

  const generatePerformanceReport = (data: Reservation[]) => {
    const totalRevenue = data.reduce((sum, r) => 
      sum + (r.total_price || r.booking_price || 0), 0
    )
    
    // KPIs
    const completionRate = (data.filter(r => r.estado_reserva_atual === 'entregue').length / data.length) * 100
    const cancellationRate = (data.filter(r => r.estado_reserva_atual === 'cancelado').length / data.length) * 100
    const avgProcessingTime = 2.5 // horas (simulado)
    
    return {
      kpis: {
        totalRevenue,
        totalReservations: data.length,
        completionRate,
        cancellationRate,
        avgProcessingTime,
        customerSatisfaction: 4.5 // simulado
      },
      trends: {
        revenueGrowth: 15.5, // % (simulado)
        reservationsGrowth: 12.3, // % (simulado)
        avgTicketGrowth: 8.7 // % (simulado)
      }
    }
  }

  const generateFinancialReport = (data: Reservation[]) => {
    const revenue = data.reduce((sum, r) => 
      sum + (r.total_price || r.booking_price || 0), 0
    )
    
    const byPaymentMethod = data.reduce((acc, r) => {
      const method = r.has_online_payment ? 'online' : (r.payment_method || 'cash')
      if (!acc[method]) acc[method] = 0
      acc[method] += r.total_price || r.booking_price || 0
      return acc
    }, {} as any)
    
    // Simulação de custos e lucros
    const costs = revenue * 0.6
    const profit = revenue - costs
    const profitMargin = (profit / revenue) * 100
    
    return {
      summary: {
        revenue,
        costs,
        profit,
        profitMargin,
        taxes: revenue * 0.23, // IVA
        netProfit: profit - (revenue * 0.23)
      },
      byPaymentMethod,
      monthlyProgression: generateMonthlyProgression(data)
    }
  }

  const generateMonthlyProgression = (data: Reservation[]) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const progression = data.reduce((acc, r) => {
      const month = new Date(r.created_at_db).getMonth()
      if (!acc[month]) acc[month] = 0
      acc[month] += r.total_price || r.booking_price || 0
      return acc
    }, {} as any)
    
    return months.map((month, index) => ({
      month,
      revenue: progression[index] || 0
    }))
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '0,00 €'
    return new Intl.NumberFormat('pt-PT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value)
  }

  const exportReport = () => {
    // Lógica para exportar relatório
    console.log('Exportar relatório:', selectedReport, reportData)
    // Aqui implementaria download de PDF/Excel
  }

  const currentReport = reports.find(r => r.type === selectedReport)
  const Icon = currentReport?.icon || FileText

  return (
    <Layout title="Relatórios">
      <div className="space-y-6">
        {/* Header com filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Central de Relatórios
              </span>
              <div className="flex gap-2">
                <Button onClick={exportReport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={loadReportData} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reports.map(report => (
                    <SelectItem key={report.type} value={report.type}>
                      {report.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              
              {periodFilter === 'custom' && (
                <>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Data início"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Data fim"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {reports.map(report => {
            const ReportIcon = report.icon
            return (
              <Card 
                key={report.type}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedReport === report.type ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedReport(report.type)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <ReportIcon className={`w-8 h-8 mb-2 ${
                      selectedReport === report.type ? 'text-blue-500' : 'text-gray-500'
                    }`} />
                    <p className="text-sm font-medium">{report.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Conteúdo do Relatório */}
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin mr-2" />
                <span>A gerar relatório...</span>
              </div>
            </CardContent>
          </Card>
        ) : reportData && (
          <>
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {currentReport?.title} - Resumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {reportData.summary && Object.entries(reportData.summary).slice(0, 5).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xl font-bold">
                        {typeof value === 'number' && key.includes('Revenue') || key.includes('Ticket') || key.includes('Profit') ? 
                          formatCurrency(value) : 
                          typeof value === 'number' && key.includes('Rate') ? 
                          `${value.toFixed(1)}%` :
                          typeof value === 'number' ? 
                          value.toFixed(1) : 
                          value
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dados Detalhados */}
            {selectedReport === 'revenue' && reportData.topReservations && (
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Reservas por Valor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.topReservations.map((r: Reservation) => (
                        <TableRow key={r.id_pk}>
                          <TableCell className="font-mono">{r.license_plate}</TableCell>
                          <TableCell>{r.name_cliente} {r.lastname_cliente}</TableCell>
                          <TableCell>{r.cidade_cliente || 'Desconhecida'}</TableCell>
                          <TableCell>{new Date(r.created_at_db).toLocaleDateString('pt-PT')}</TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(r.total_price || r.booking_price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Gráficos */}
            {reportData.dailyRevenue && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Diária</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(reportData.dailyRevenue).slice(-7).map(([date, revenue]: [string, any]) => (
                      <div key={date} className="flex items-center justify-between">
                        <span className="text-sm">{date}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-64 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-500 h-4 rounded-full"
                              style={{ 
                                width: `${(revenue / Math.max(...Object.values(reportData.dailyRevenue))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-24 text-right">
                            {formatCurrency(revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
