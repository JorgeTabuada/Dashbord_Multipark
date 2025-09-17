"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { User, Car, TrendingUp, Clock, Award, Target, RefreshCw, BarChart3 } from "lucide-react"

interface Reservation {
  id_pk: string
  booking_id?: string
  cidade_cliente?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  condutor_recolha_id?: string
  condutor_entrega_id?: string
  user_id_modificacao_registo?: string
  action_date?: string
  created_at_db: string
  updated_at_db: string
}

interface ConductorStats {
  id: string
  name: string
  totalRecolhas: number
  totalEntregas: number
  totalOperacoes: number
  tempoMedioRecolha: number
  tempoMedioEntrega: number
  rating: number
  efficiency: number
  todayOperations: number
  weekOperations: number
  monthOperations: number
}

export default function ProdutividadeCondutores() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [conductorStats, setConductorStats] = useState<ConductorStats[]>([])
  const [loading, setLoading] = useState(true)
  const [periodFilter, setPeriodFilter] = useState("month")
  const [sortBy, setSortBy] = useState("total")

  // Lista simulada de condutores
  const conductors = [
    { id: 'condutor1', name: 'João Silva' },
    { id: 'condutor2', name: 'Maria Santos' },
    { id: 'condutor3', name: 'Pedro Costa' },
    { id: 'condutor4', name: 'Ana Ferreira' },
    { id: 'condutor5', name: 'Carlos Mendes' }
  ]

  useEffect(() => {
    loadProdutividade()
  }, [periodFilter])

  const loadProdutividade = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=5000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar por período
        const filteredReservations = filterByPeriod(allReservations)
        setReservations(filteredReservations)
        
        // Calcular estatísticas por condutor
        const stats = calculateConductorStats(filteredReservations)
        setConductorStats(stats)
      }
    } catch (error) {
      console.error('Erro ao carregar produtividade:', error)
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

  const calculateConductorStats = (reservations: Reservation[]): ConductorStats[] => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
    
    return conductors.map(conductor => {
      // Recolhas feitas pelo condutor
      const recolhas = reservations.filter(r => 
        r.condutor_recolha_id === conductor.id
      )
      
      // Entregas feitas pelo condutor
      const entregas = reservations.filter(r => 
        r.condutor_entrega_id === conductor.id
      )
      
      // Operações de hoje
      const todayOps = reservations.filter(r => {
        const actionDate = r.action_date ? new Date(r.action_date) : new Date(r.updated_at_db)
        return actionDate >= today && 
               (r.condutor_recolha_id === conductor.id || r.condutor_entrega_id === conductor.id)
      })
      
      // Operações da semana
      const weekOps = reservations.filter(r => {
        const actionDate = r.action_date ? new Date(r.action_date) : new Date(r.updated_at_db)
        return actionDate >= weekAgo && 
               (r.condutor_recolha_id === conductor.id || r.condutor_entrega_id === conductor.id)
      })
      
      // Operações do mês
      const monthOps = reservations.filter(r => {
        const actionDate = r.action_date ? new Date(r.action_date) : new Date(r.updated_at_db)
        return actionDate >= monthAgo && 
               (r.condutor_recolha_id === conductor.id || r.condutor_entrega_id === conductor.id)
      })
      
      // Calcular tempos médios (simulado)
      const tempoMedioRecolha = 15 + Math.random() * 10 // 15-25 minutos
      const tempoMedioEntrega = 10 + Math.random() * 10 // 10-20 minutos
      
      // Calcular rating (simulado)
      const rating = 3.5 + Math.random() * 1.5 // 3.5 - 5.0
      
      // Calcular eficiência
      const totalOperacoes = recolhas.length + entregas.length
      const efficiency = totalOperacoes > 0 ? 
        Math.min(100, (totalOperacoes / 50) * 100) : 0 // Max 50 operações = 100%
      
      return {
        id: conductor.id,
        name: conductor.name,
        totalRecolhas: recolhas.length,
        totalEntregas: entregas.length,
        totalOperacoes,
        tempoMedioRecolha: Math.round(tempoMedioRecolha),
        tempoMedioEntrega: Math.round(tempoMedioEntrega),
        rating: Math.round(rating * 10) / 10,
        efficiency: Math.round(efficiency),
        todayOperations: todayOps.length,
        weekOperations: weekOps.length,
        monthOperations: monthOps.length
      }
    })
  }

  const sortedConductors = [...conductorStats].sort((a, b) => {
    switch (sortBy) {
      case 'total':
        return b.totalOperacoes - a.totalOperacoes
      case 'efficiency':
        return b.efficiency - a.efficiency
      case 'rating':
        return b.rating - a.rating
      case 'today':
        return b.todayOperations - a.todayOperations
      default:
        return 0
    }
  })

  const topConductor = sortedConductors[0]

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'bg-green-500'
    if (efficiency >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Layout title="Produtividade de Condutores">
      <div className="space-y-6">
        {/* Header com filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Análise de Desempenho
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
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Total Operações</SelectItem>
                    <SelectItem value="efficiency">Eficiência</SelectItem>
                    <SelectItem value="rating">Avaliação</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={loadProdutividade} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Top Performer */}
        {topConductor && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                Condutor Destaque do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{topConductor.name}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm">
                      <strong>{topConductor.totalOperacoes}</strong> operações
                    </span>
                    <span className="text-sm">
                      <strong>{topConductor.efficiency}%</strong> eficiência
                    </span>
                    <span className={`text-sm font-bold ${getRatingColor(topConductor.rating)}`}>
                      ⭐ {topConductor.rating}
                    </span>
                  </div>
                </div>
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Recolhas</p>
                  <div className="text-2xl font-bold">
                    {conductorStats.reduce((sum, c) => sum + c.totalRecolhas, 0)}
                  </div>
                </div>
                <Car className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Entregas</p>
                  <div className="text-2xl font-bold">
                    {conductorStats.reduce((sum, c) => sum + c.totalEntregas, 0)}
                  </div>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      conductorStats.reduce((sum, c) => sum + c.tempoMedioRecolha, 0) / 
                      conductorStats.length
                    )} min
                  </div>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <div className="text-2xl font-bold">
                    ⭐ {(conductorStats.reduce((sum, c) => sum + c.rating, 0) / 
                        conductorStats.length).toFixed(1)}
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Condutores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Desempenho Individual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">A carregar dados...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Condutor</TableHead>
                    <TableHead>Hoje</TableHead>
                    <TableHead>Semana</TableHead>
                    <TableHead>Mês</TableHead>
                    <TableHead>Recolhas</TableHead>
                    <TableHead>Entregas</TableHead>
                    <TableHead>Tempo Médio</TableHead>
                    <TableHead>Eficiência</TableHead>
                    <TableHead>Avaliação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedConductors.map((conductor, index) => (
                    <TableRow key={conductor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                          <span className="font-medium">{conductor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{conductor.todayOperations}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{conductor.weekOperations}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{conductor.monthOperations}</Badge>
                      </TableCell>
                      <TableCell>{conductor.totalRecolhas}</TableCell>
                      <TableCell>{conductor.totalEntregas}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>R: {conductor.tempoMedioRecolha}m</span>
                          <span>E: {conductor.tempoMedioEntrega}m</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress 
                            value={conductor.efficiency} 
                            className="h-2"
                          />
                          <span className="text-xs text-gray-600">
                            {conductor.efficiency}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getRatingColor(conductor.rating)}`}>
                          ⭐ {conductor.rating}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Desempenho */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Operações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedConductors.map(conductor => {
                const maxOps = Math.max(...conductorStats.map(c => c.totalOperacoes))
                const percentage = maxOps > 0 ? (conductor.totalOperacoes / maxOps) * 100 : 0
                
                return (
                  <div key={conductor.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{conductor.name}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                          <div 
                            className={`h-6 rounded-full flex items-center justify-end pr-2 ${getEfficiencyColor(conductor.efficiency)}`}
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs text-white font-bold">
                              {conductor.totalOperacoes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

// Trophy icon component
function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
}
