"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Search, RefreshCw, Globe, Calendar } from "lucide-react"

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
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  parque_id?: string
  parking_type?: string
  created_at_db: string
  updated_at_db: string
  origem_reserva?: string // booking.com, expedia, direto
  comissao_plataforma?: number
}

interface ExternalStats {
  totalExternal: number
  bySource: { [key: string]: number }
  totalCommission: number
  totalRevenue: number
}

export default function ReservasExternas() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<ExternalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadExternalReservations()
  }, [])

  const loadExternalReservations = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Simular origem externa (em produção viria da BD)
        const externalReservations = allReservations.map((r: Reservation) => ({
          ...r,
          origem_reserva: Math.random() > 0.5 ? 'Booking.com' : 
                          Math.random() > 0.5 ? 'Expedia' : 'Direto',
          comissao_plataforma: Math.random() > 0.5 ? (r.booking_price || 0) * 0.15 : 0
        }))
        
        setReservations(externalReservations)
        
        // Calcular estatísticas
        const bySource: { [key: string]: number } = {}
        let totalCommission = 0
        let totalRevenue = 0
        
        externalReservations.forEach((r: Reservation) => {
          const source = r.origem_reserva || 'Direto'
          bySource[source] = (bySource[source] || 0) + 1
          totalCommission += r.comissao_plataforma || 0
          totalRevenue += r.booking_price || 0
        })
        
        setStats({
          totalExternal: externalReservations.length,
          bySource,
          totalCommission,
          totalRevenue
        })
      }
    } catch (error) {
      console.error('Erro ao carregar reservas externas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSourceBadge = (source?: string) => {
    const sourceConfig = {
      'Booking.com': { variant: 'default' as const, className: 'bg-blue-500' },
      'Expedia': { variant: 'default' as const, className: 'bg-purple-500' },
      'Direto': { variant: 'secondary' as const, className: '' }
    }
    
    const config = sourceConfig[source as keyof typeof sourceConfig] || { variant: 'outline' as const, className: '' }
    return (
      <Badge variant={config.variant} className={config.className}>
        {source || 'Desconhecido'}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'reservado': { variant: 'secondary' as const, label: 'Reservado' },
      'em_recolha': { variant: 'default' as const, label: 'Em Recolha' },
      'recolhido': { variant: 'default' as const, label: 'Recolhido' },
      'em_entrega': { variant: 'default' as const, label: 'Em Entrega' },
      'entregue': { variant: 'default' as const, label: 'Entregue' },
      'cancelado': { variant: 'destructive' as const, label: 'Cancelado' }
    }
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
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
    
    const matchesSource = sourceFilter === "all" || reservation.origem_reserva === sourceFilter
    const matchesStatus = statusFilter === "all" || reservation.estado_reserva_atual === statusFilter
    
    return matchesSearch && matchesSource && matchesStatus
  })

  const sources = [...new Set(reservations.map(r => r.origem_reserva).filter(Boolean))]

  return (
    <Layout title="Reservas Externas">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? '-' : stats?.totalExternal || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total Externas</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? '-' : formatCurrency(stats?.totalRevenue)}
                  </div>
                  <p className="text-sm text-gray-600">Receita Total</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {loading ? '-' : formatCurrency(stats?.totalCommission)}
                  </div>
                  <p className="text-sm text-gray-600">Comissões</p>
                </div>
                <ExternalLink className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-2">Por Origem</div>
              <div className="space-y-1 text-xs">
                {stats && Object.entries(stats.bySource).map(([source, count]) => (
                  <div key={source} className="flex justify-between">
                    <span>{source}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Gestão de Reservas Externas
              </span>
              <Button onClick={loadExternalReservations} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Buscar por matrícula, cliente, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Origens</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source} value={source || ''}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="reservado">Reservado</SelectItem>
                  <SelectItem value="em_recolha">Em Recolha</SelectItem>
                  <SelectItem value="recolhido">Recolhido</SelectItem>
                  <SelectItem value="em_entrega">Em Entrega</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Reservas ({filteredReservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">A carregar reservas externas...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origem</TableHead>
                    <TableHead>ID Booking</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id_pk}>
                      <TableCell>
                        {getSourceBadge(reservation.origem_reserva)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {reservation.booking_id?.substring(0, 8)}...
                      </TableCell>
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
                        {getStatusBadge(reservation.estado_reserva_atual)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(reservation.booking_price)}
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600">
                          {formatCurrency(reservation.comissao_plataforma)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(reservation.check_in_previsto)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredReservations.length === 0 && (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {reservations.length === 0 ? 'Nenhuma reserva externa encontrada' : 'Nenhuma reserva corresponde aos filtros'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
