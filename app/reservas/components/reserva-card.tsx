'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Euro, 
  Camera,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Gauge,
  Navigation
} from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { ReservaEnhanced } from "@/hooks/use-reservas-enhanced"

interface ReservaCardProps {
  reserva: ReservaEnhanced
  onCheckIn?: (reserva: ReservaEnhanced) => void
  onCheckOut?: (reserva: ReservaEnhanced) => void
  onCancel?: (reserva: ReservaEnhanced) => void
  onViewDetails?: (reserva: ReservaEnhanced) => void
  expanded?: boolean
}

const estadoConfig = {
  PENDENTE: { 
    label: 'Pendente', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Clock
  },
  CONFIRMADA: { 
    label: 'Confirmada', 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: CheckCircle2
  },
  CHECK_IN: { 
    label: 'No Parque', 
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: Car
  },
  CHECK_OUT: { 
    label: 'Entregue', 
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: CheckCircle2
  },
  CANCELADA: { 
    label: 'Cancelada', 
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle
  },
  NO_SHOW: { 
    label: 'Não Compareceu', 
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: AlertTriangle
  }
}

export function ReservaCard({ 
  reserva, 
  onCheckIn, 
  onCheckOut, 
  onCancel,
  onViewDetails,
  expanded: initialExpanded = false 
}: ReservaCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  
  const estado = estadoConfig[reserva.estado_reserva_atual as keyof typeof estadoConfig] || estadoConfig.PENDENTE
  const EstadoIcon = estado.icon

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: pt })
  }

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '€0.00'
    return `€${value.toFixed(2)}`
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Car className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {reserva.license_plate}
                {reserva.alocation && (
                  <span className="text-sm text-gray-500">({reserva.alocation})</span>
                )}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                {reserva.marca_veiculo && (
                  <span>{reserva.marca_veiculo} {reserva.modelo_veiculo}</span>
                )}
                {reserva.cor_veiculo && (
                  <span className="capitalize">{reserva.cor_veiculo}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${estado.color} border`}>
              <EstadoIcon className="h-3 w-3 mr-1" />
              {estado.label}
            </Badge>
            {reserva.tem_danos && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Danos
              </Badge>
            )}
            {reserva.tem_fotos && (
              <Badge variant="secondary">
                <Camera className="h-3 w-3" />
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info Principal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Cliente</p>
              <p className="font-medium">{reserva.name_cliente} {reserva.lastname_cliente}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Telefone</p>
              <p className="font-medium">{reserva.phone_number_cliente || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Check-in</p>
              <p className="font-medium">
                {formatDate(reserva.check_in_real || reserva.check_in_previsto)}
                {reserva.check_in_real && <CheckCircle2 className="h-3 w-3 text-green-500 inline ml-1" />}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Check-out</p>
              <p className="font-medium">
                {formatDate(reserva.check_out_real || reserva.check_out_previsto)}
                {reserva.check_out_real && <CheckCircle2 className="h-3 w-3 text-green-500 inline ml-1" />}
              </p>
            </div>
          </div>
        </div>

        {/* Localização e Valores */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {reserva.park_name || 'Parque não definido'}
                {reserva.localizacao_veiculo_fila && reserva.localizacao_veiculo_lugar && (
                  <span className="ml-2 font-medium">
                    Fila {reserva.localizacao_veiculo_fila} - Lugar {reserva.localizacao_veiculo_lugar}
                  </span>
                )}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-gray-400" />
            <span className="font-bold text-lg">
              {formatCurrency(reserva.corrected_price || reserva.total_price)}
            </span>
          </div>
        </div>

        {/* Seção Expandida */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            {/* Quilometragem e Danos */}
            {(reserva.kms_entrada || reserva.kms_saida) && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  <div className="text-sm">
                    <span className="text-gray-600">KMs Entrada:</span>
                    <span className="font-medium ml-2">{reserva.kms_entrada || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">KMs Saída:</span>
                    <span className="font-medium ml-2">{reserva.kms_saida || 'N/A'}</span>
                  </div>
                  {reserva.kms_percorridos && reserva.kms_percorridos > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {reserva.kms_percorridos} KMs percorridos
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Danos */}
            {(reserva.danos_checkin || reserva.danos_checkout) && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-1" />
                  <div className="space-y-2 text-sm">
                    {reserva.danos_checkin && (
                      <div>
                        <span className="font-medium text-red-800">Danos Check-in:</span>
                        <p className="text-red-700 mt-1">{reserva.danos_checkin}</p>
                      </div>
                    )}
                    {reserva.danos_checkout && (
                      <div>
                        <span className="font-medium text-red-800">Danos Check-out:</span>
                        <p className="text-red-700 mt-1">{reserva.danos_checkout}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            {(reserva.observacoes_recolha || reserva.observacoes_entrega) && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  {reserva.observacoes_recolha && (
                    <div>
                      <span className="font-medium text-yellow-800">Obs. Recolha:</span>
                      <p className="text-yellow-700 mt-1">{reserva.observacoes_recolha}</p>
                    </div>
                  )}
                  {reserva.observacoes_entrega && (
                    <div>
                      <span className="font-medium text-yellow-800">Obs. Entrega:</span>
                      <p className="text-yellow-700 mt-1">{reserva.observacoes_entrega}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detalhes Financeiros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Reserva:</span>
                <span className="font-medium ml-2">{formatCurrency(reserva.booking_price)}</span>
              </div>
              <div>
                <span className="text-gray-500">Parque:</span>
                <span className="font-medium ml-2">{formatCurrency(reserva.parking_price)}</span>
              </div>
              <div>
                <span className="text-gray-500">Entrega:</span>
                <span className="font-medium ml-2">{formatCurrency(reserva.delivery_price)}</span>
              </div>
              <div>
                <span className="text-gray-500">Extras:</span>
                <span className="font-medium ml-2">{formatCurrency(reserva.extras_price)}</span>
              </div>
            </div>

            {/* Info adicional */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>ID Reserva: {reserva.booking_id || reserva.id_pk.substring(0, 8)}</div>
              <div>Criado: {formatDate(reserva.created_at_db)}</div>
              {reserva.sync_status && (
                <div className="col-span-2">
                  Sync: {reserva.sync_status} {reserva.last_sync_at && `(${formatDate(reserva.last_sync_at)})`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-between items-center pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Menos detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Mais detalhes
              </>
            )}
          </Button>

          <div className="flex gap-2">
            {reserva.estado_reserva_atual === 'CONFIRMADA' && !reserva.check_in_real && (
              <Button
                size="sm"
                onClick={() => onCheckIn?.(reserva)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Navigation className="h-4 w-4 mr-1" />
                Check-in
              </Button>
            )}
            
            {reserva.estado_reserva_atual === 'CHECK_IN' && !reserva.check_out_real && (
              <Button
                size="sm"
                onClick={() => onCheckOut?.(reserva)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Check-out
              </Button>
            )}

            {['PENDENTE', 'CONFIRMADA'].includes(reserva.estado_reserva_atual) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onCancel?.(reserva)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}

            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(reserva)}
              >
                Ver Detalhes
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
