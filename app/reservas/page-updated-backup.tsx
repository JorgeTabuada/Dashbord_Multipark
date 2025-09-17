"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, RefreshCw, Database, Download, Calendar } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { 
  Reserva, 
  ReservasStats, 
  EstadoReserva, 
  formatCurrency, 
  formatDate,
  getStatusColor 
} from '@/lib/types'

export default function Reservas() {
  const [reservations, setReservations] = useState<Reserva[]>([])
  const [stats, setStats] = useState<ReservasStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      
      // Buscar reservas diretamente do Supabase
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .order('created_at_db', { ascending: false })
        .limit(1000)
      
      if (error) throw error
      
      const reservationsData = data || []
      setReservations(reservationsData)
      
      // Calcular estatísticas
      const totalValue = reservationsData.reduce((sum, r) => sum + (r.booking_price || 0), 0)
      
      const byStatus: Record<string, number> = {}
      const byCity: Record<string, number> = {}
      
      reservationsData.forEach((r) => {
        byStatus[r.estado_reserva_atual] = (byStatus[r.estado_reserva_atual] || 0) + 1
        byCity[r.cidade_cliente || 'Desconhecida'] = (byCity[r.cidade_cliente || 'Desconhecida'] || 0) + 1
      })
      
      // Calcular check-ins e check-outs de hoje
      const today = new Date().toISOString().split('T')[0]
      const todayCheckIns = reservationsData.filter(r => 
        r.check_in_previsto && new Date(r.check_in_previsto).toISOString().split('T')[0] === today
      ).length
      
      const todayCheckOuts = reservationsData.filter(r => 
        r.check_out_previsto && new Date(r.check_out_previsto).toISOString().split('T')[0] === today
      ).length
      
      setStats({
        total: reservationsData.length,
        totalValue,
        byStatus,
        byCity,
        todayCheckIns,
        todayCheckOuts
      })
    } catch (error) {
      console.error('Erro ao carregar reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncWithFirebase = async () => {
    try {
      setLoading(true)
      
      // Chamar API de sincronização
      const response = await fetch('/api/sync/firebase-to-supabase', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Sincronização concluída:', result)
        
        // Recarregar dados
        await loadReservations()
      } else {
        throw new Error('Erro na sincronização')
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      [EstadoReserva.RESERVADO]: 'Reservado',
      [EstadoReserva.EM_RECOLHA]: 'Em Recolha',
      [EstadoReserva.RECOLHIDO]: 'Recolhido',
      [EstadoReserva.EM_ENTREGA]: 'Em Entrega',
      [EstadoReserva.ENTREGUE]: 'Entregue',
      [EstadoReserva.CANCELADO]: 'Cancelado'
    }
    
    return (
      <Badge className={getStatusColor(status as EstadoReserva)}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      searchTerm === "" ||
      reservation.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.name_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.lastname_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.booking_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "all" || 
      reservation.estado_reserva_atual === statusFilter
    
    const matchesCity = 
      cityFilter === "all" || 
      reservation.cidade_cliente === cityFilter
    
    return matchesSearch && matchesStatus && matchesCity
  })

  const exportToCSV = () => {
    const headers = [
      'ID Reserva',
      'Matrícula',
      'Cliente',
      'Email',
      'Telefone',
      'Cidade',
      'Estado',
      'Valor',
      'Check-in Previsto',
      'Check-out Previsto'
    ]
    
    const rows = filteredReservations.map(r => [
      r.booking_id || r.id_pk,
      r.license_plate,
      `${r.name_cliente || ''} ${r.lastname_cliente || ''}`.trim(),
      r.email_cliente || '',
      r.phone_number_cliente || '',
      r.cidade_cliente || '',
      r.estado_reserva_atual,
      r.booking_price?.toString() || '0',
      r.check_in_previsto ? formatDate(r.check_in_previsto) : '',
      r.check_out_previsto ? formatDate(r.check_out_previsto) : ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestão de Reservas</h1>
          <div className="flex gap-2">
            <Button onClick={syncWithFirebase} disabled={loading}>
              <Database className="mr-2 h-4 w-4" />
              Sincronizar Firebase
            </Button>
            <Button onClick={loadReservations} variant="outline" disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.todayCheckIns} check-ins hoje
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.todayCheckOuts} check-outs hoje
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(stats.byStatus).slice(0, 3).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Por Cidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(stats.byCity).slice(0, 3).map(([city, count]) => (
                    <div key={city} className="flex justify-between text-sm">
                      <span>{city}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar por matrícula, nome, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  <SelectItem value={EstadoReserva.RESERVADO}>Reservado</SelectItem>
                  <SelectItem value={EstadoReserva.EM_RECOLHA}>Em Recolha</SelectItem>
                  <SelectItem value={EstadoReserva.RECOLHIDO}>Recolhido</SelectItem>
                  <SelectItem value={EstadoReserva.EM_ENTREGA}>Em Entrega</SelectItem>
                  <SelectItem value={EstadoReserva.ENTREGUE}>Entregue</SelectItem>
                  <SelectItem value={EstadoReserva.CANCELADO}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Cidades</SelectItem>
                  {stats && Object.keys(stats.byCity).map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Reservas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Reservas ({filteredReservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Carregando reservas...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Reserva</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contactos</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id_pk}>
                        <TableCell className="font-mono text-xs">
                          {reservation.booking_id || reservation.id_pk.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {reservation.license_plate}
                        </TableCell>
                        <TableCell>
                          {reservation.name_cliente || reservation.lastname_cliente ? (
                            <div>
                              <p className="font-medium">
                                {reservation.name_cliente} {reservation.lastname_cliente}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {reservation.email_cliente || reservation.phone_number_cliente ? (
                            <div className="text-sm">
                              {reservation.email_cliente && (
                                <p className="text-xs">{reservation.email_cliente}</p>
                              )}
                              {reservation.phone_number_cliente && (
                                <p className="text-xs">{reservation.phone_number_cliente}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {reservation.cidade_cliente || '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(reservation.estado_reserva_atual)}
                        </TableCell>
                        <TableCell>
                          {reservation.booking_price 
                            ? formatCurrency(reservation.booking_price) 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {reservation.check_in_previsto 
                            ? formatDate(reservation.check_in_previsto) 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {reservation.check_out_previsto 
                            ? formatDate(reservation.check_out_previsto) 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredReservations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma reserva encontrada
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
