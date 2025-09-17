"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ParkingSquare, RefreshCw, MapPin, Car, Clock, CheckCircle } from "lucide-react"

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
  spot_code?: string
  row_code?: string
  alocation?: string
  created_at_db: string
  updated_at_db: string
}

interface ParkingSpot {
  code: string
  row: string
  status: 'free' | 'occupied' | 'reserved'
  reservation?: Reservation
}

interface OccupancyStats {
  totalSpots: number
  occupied: number
  free: number
  reserved: number
  occupancyRate: number
}

export default function MapaOcupacao() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([])
  const [stats, setStats] = useState<OccupancyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPark, setSelectedPark] = useState("all")
  const [selectedRow, setSelectedRow] = useState("all")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadOccupancy()
  }, [])

  const loadOccupancy = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/sync/supabase?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        
        // Filtrar apenas reservas ativas (recolhido ou em parque)
        const activeReservations = allReservations.filter((r: Reservation) => 
          ['recolhido', 'reservado', 'em_recolha'].includes(r.estado_reserva_atual)
        )
        
        setReservations(activeReservations)
        
        // Simular spots (em produção viria da BD)
        const spots = generateParkingSpots(activeReservations)
        setParkingSpots(spots)
        
        // Calcular estatísticas
        const occupied = spots.filter(s => s.status === 'occupied').length
        const reserved = spots.filter(s => s.status === 'reserved').length
        const free = spots.filter(s => s.status === 'free').length
        const total = spots.length
        
        setStats({
          totalSpots: total,
          occupied,
          reserved,
          free,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
        })
      }
    } catch (error) {
      console.error('Erro ao carregar ocupação:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateParkingSpots = (reservations: Reservation[]): ParkingSpot[] => {
    const spots: ParkingSpot[] = []
    const rows = ['A', 'B', 'C', 'D', 'E']
    const spotsPerRow = 20
    
    rows.forEach(row => {
      for (let i = 1; i <= spotsPerRow; i++) {
        const code = `${row}${i.toString().padStart(2, '0')}`
        
        // Verificar se há reserva para este spot
        const reservation = reservations.find(r => 
          r.spot_code === code || r.alocation === code
        )
        
        let status: 'free' | 'occupied' | 'reserved' = 'free'
        if (reservation) {
          status = reservation.estado_reserva_atual === 'recolhido' ? 'occupied' : 'reserved'
        }
        
        spots.push({
          code,
          row,
          status,
          reservation
        })
      }
    })
    
    return spots
  }

  const getSpotColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600'
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'free':
        return 'bg-green-500 hover:bg-green-600'
      default:
        return 'bg-gray-500'
    }
  }

  const getSpotIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return <Car className="w-4 h-4" />
      case 'reserved':
        return <Clock className="w-4 h-4" />
      case 'free':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <ParkingSquare className="w-4 h-4" />
    }
  }

  const filteredSpots = parkingSpots.filter(spot => {
    const matchesRow = selectedRow === "all" || spot.row === selectedRow
    // Aqui poderia filtrar por parque se tivéssemos múltiplos parques
    return matchesRow
  })

  const rows = [...new Set(parkingSpots.map(s => s.row))]

  return (
    <Layout title="Mapa de Ocupação">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? '-' : stats?.free || 0}
                  </div>
                  <p className="text-sm text-gray-600">Lugares Livres</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {loading ? '-' : stats?.occupied || 0}
                  </div>
                  <p className="text-sm text-gray-600">Ocupados</p>
                </div>
                <Car className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {loading ? '-' : stats?.reserved || 0}
                  </div>
                  <p className="text-sm text-gray-600">Reservados</p>
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
                    {loading ? '-' : `${stats?.occupancyRate || 0}%`}
                  </div>
                  <p className="text-sm text-gray-600">Taxa Ocupação</p>
                </div>
                <ParkingSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controlos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Mapa de Ocupação em Tempo Real
              </span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} 
                  variant="outline" 
                  size="sm"
                >
                  {viewMode === 'grid' ? 'Ver Lista' : 'Ver Grelha'}
                </Button>
                <Button onClick={loadOccupancy} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedRow} onValueChange={setSelectedRow}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por fila" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Filas</SelectItem>
                  {rows.map(row => (
                    <SelectItem key={row} value={row}>
                      Fila {row}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Legenda */}
              <div className="flex items-center gap-4 col-span-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Livre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Ocupado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Reservado</span>
                </div>
              </div>
            </div>

            {/* Mapa de Lugares */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">A carregar mapa...</span>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-10 md:grid-cols-20 gap-2 p-4 bg-gray-50 rounded-lg">
                {filteredSpots.map((spot) => (
                  <div
                    key={spot.code}
                    className={`
                      relative p-2 rounded cursor-pointer transition-all
                      ${getSpotColor(spot.status)}
                      text-white text-xs font-bold text-center
                      hover:scale-110 hover:z-10
                    `}
                    title={
                      spot.reservation 
                        ? `${spot.reservation.license_plate} - ${spot.reservation.name_cliente}`
                        : 'Livre'
                    }
                  >
                    <div className="flex flex-col items-center">
                      {getSpotIcon(spot.status)}
                      <span className="mt-1">{spot.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSpots.filter(s => s.status !== 'free').map((spot) => (
                  <div key={spot.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getSpotColor(spot.status)}>
                        {spot.code}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {spot.reservation?.license_plate || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {spot.reservation?.name_cliente} {spot.reservation?.lastname_cliente}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Check-in: {spot.reservation?.check_in_real ? 
                          new Date(spot.reservation.check_in_real).toLocaleTimeString('pt-PT') : 
                          'Previsto'
                        }
                      </p>
                      <Badge variant={spot.status === 'occupied' ? 'destructive' : 'secondary'}>
                        {spot.status === 'occupied' ? 'Ocupado' : 'Reservado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
