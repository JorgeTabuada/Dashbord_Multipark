"use client"
'use client'

import { useState } from 'react'
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Calendar,
  Plus,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react"
import { useReservasEnhanced, ReservaEnhanced } from "@/hooks/use-reservas-enhanced"
import { ReservaCard, CheckInOutModal, MetricasReservasComponent } from "./components"

export default function ReservasEnhancedPage() {
  const {
    reservas,
    metricas,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    estadoFilter,
    setEstadoFilter,
    dateRange,
    setDateRange,
    fetchReservas,
    fetchMetricas,
    checkInVeiculo,
    checkOutVeiculo,
    cancelarReserva,
    atualizarEstado
  } = useReservasEnhanced({
    autoRefresh: true,
    refreshInterval: 30000 // 30 segundos
  })

  // Estados do modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'checkin' | 'checkout'>('checkin')
  const [selectedReserva, setSelectedReserva] = useState<ReservaEnhanced | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelMotivo, setCancelMotivo] = useState('')

  // Abrir modal de check-in
  const handleCheckIn = (reserva: ReservaEnhanced) => {
    setSelectedReserva(reserva)
    setModalType('checkin')
    setModalOpen(true)
  }

  // Abrir modal de check-out
  const handleCheckOut = (reserva: ReservaEnhanced) => {
    setSelectedReserva(reserva)
    setModalType('checkout')
    setModalOpen(true)
  }

  // Processar check-in/out
  const handleModalConfirm = async (dados: any) => {
    if (!selectedReserva) return false
    
    if (modalType === 'checkin') {
      return await checkInVeiculo(selectedReserva.id_pk, dados)
    } else {
      return await checkOutVeiculo(selectedReserva.id_pk, dados)
    }
  }

  // Cancelar reserva
  const handleCancel = async (reserva: ReservaEnhanced) => {
    const motivo = prompt('Motivo do cancelamento:')
    if (motivo) {
      await cancelarReserva(reserva.id_pk, motivo)
    }
  }

  // Exportar dados
  const exportarDados = () => {
    const csv = [
      ['ID', 'Matrícula', 'Cliente', 'Check-in', 'Check-out', 'Estado', 'Valor'],
      ...reservas.map(r => [
        r.booking_id || r.id_pk,
        r.license_plate,
        `${r.name_cliente} ${r.lastname_cliente}`,
        r.check_in_previsto || '',
        r.check_out_previsto || '',
        r.estado_reserva_atual,
        r.total_price?.toString() || '0'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Agrupar reservas por estado
  const reservasPorEstado = {
    pendentes: reservas.filter(r => r.estado_reserva_atual === 'PENDENTE'),
    confirmadas: reservas.filter(r => r.estado_reserva_atual === 'CONFIRMADA'),
    check_in: reservas.filter(r => r.estado_reserva_atual === 'CHECK_IN'),
    check_out: reservas.filter(r => r.estado_reserva_atual === 'CHECK_OUT'),
    canceladas: reservas.filter(r => r.estado_reserva_atual === 'CANCELADA'),
    no_show: reservas.filter(r => r.estado_reserva_atual === 'NO_SHOW')
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Reservas</h1>
            <p className="text-gray-500">Sistema completo de controlo e gestão</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReservas} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportarDados}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Métricas */}
        <MetricasReservasComponent metricas={metricas} loading={loading} />

        {/* Filtros */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por matrícula, cliente, email, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
              <SelectItem value="CHECK_IN">No Parque</SelectItem>
              <SelectItem value="CHECK_OUT">Entregue</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
              <SelectItem value="NO_SHOW">No-show</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Lista de Reservas com Tabs */}
        <Tabs defaultValue="todas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="todas">
              Todas ({reservas.length})
            </TabsTrigger>
            <TabsTrigger value="pendentes">
              Pendentes ({reservasPorEstado.pendentes.length})
            </TabsTrigger>
            <TabsTrigger value="confirmadas">
              Confirmadas ({reservasPorEstado.confirmadas.length})
            </TabsTrigger>
            <TabsTrigger value="check_in">
              No Parque ({reservasPorEstado.check_in.length})
            </TabsTrigger>
            <TabsTrigger value="check_out">
              Entregues ({reservasPorEstado.check_out.length})
            </TabsTrigger>
            <TabsTrigger value="canceladas">
              Canceladas ({reservasPorEstado.canceladas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">A carregar reservas...</p>
              </div>
            ) : reservas.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma reserva encontrada</p>
              </div>
            ) : (
              reservas.map(reserva => (
                <ReservaCard
                  key={reserva.id_pk}
                  reserva={reserva}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  onCancel={handleCancel}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pendentes" className="space-y-4">
            {reservasPorEstado.pendentes.map(reserva => (
              <ReservaCard
                key={reserva.id_pk}
                reserva={reserva}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancel}
              />
            ))}
          </TabsContent>

          <TabsContent value="confirmadas" className="space-y-4">
            {reservasPorEstado.confirmadas.map(reserva => (
              <ReservaCard
                key={reserva.id_pk}
                reserva={reserva}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancel}
              />
            ))}
          </TabsContent>

          <TabsContent value="check_in" className="space-y-4">
            {reservasPorEstado.check_in.map(reserva => (
              <ReservaCard
                key={reserva.id_pk}
                reserva={reserva}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancel}
              />
            ))}
          </TabsContent>

          <TabsContent value="check_out" className="space-y-4">
            {reservasPorEstado.check_out.map(reserva => (
              <ReservaCard
                key={reserva.id_pk}
                reserva={reserva}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancel}
              />
            ))}
          </TabsContent>

          <TabsContent value="canceladas" className="space-y-4">
            {reservasPorEstado.canceladas.map(reserva => (
              <ReservaCard
                key={reserva.id_pk}
                reserva={reserva}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancel}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Modal Check-in/Check-out */}
        <CheckInOutModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          reserva={selectedReserva}
          type={modalType}
          onConfirm={handleModalConfirm}
        />
      </div>
    </Layout>
  )
}
