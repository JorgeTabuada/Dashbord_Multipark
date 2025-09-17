'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Euro, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity
} from "lucide-react"
import { MetricasReservas } from "@/hooks/use-reservas-enhanced"

interface MetricasReservasProps {
  metricas: MetricasReservas | null
  loading?: boolean
}

export function MetricasReservasComponent({ metricas, loading }: MetricasReservasProps) {
  if (loading || !metricas) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.reservas_hoje}</div>
            <p className="text-xs text-muted-foreground">
              de {metricas.total_reservas} total
            </p>
            <Progress 
              value={(metricas.reservas_hoje / metricas.total_reservas) * 100} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Hoje
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metricas.receita_hoje)}</div>
            <div className="flex items-center text-xs">
              {metricas.receita_hoje > metricas.receita_mes / 30 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">Acima da média</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">Abaixo da média</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Veículos no Parque
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.reservas_ativas}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.check_in} check-ins hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Médio
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metricas.ticket_medio)}</div>
            <p className="text-xs text-muted-foreground">
              por reserva
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Estado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Estados das Reservas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Pendentes</span>
              </div>
              <span className="font-bold">{metricas.pendentes}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Confirmadas</span>
              </div>
              <span className="font-bold">{metricas.confirmadas}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-green-600" />
                <span className="text-sm">Check-in</span>
              </div>
              <span className="font-bold">{metricas.check_in}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Check-out</span>
              </div>
              <span className="font-bold">{metricas.check_out}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Canceladas</span>
              </div>
              <span className="font-bold">{metricas.canceladas}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">No-show</span>
              </div>
              <span className="font-bold">{metricas.no_show}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Taxas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Taxa de Conclusão</span>
                <span className="font-bold text-green-600">
                  {formatPercentage(metricas.taxa_conclusao)}
                </span>
              </div>
              <Progress value={metricas.taxa_conclusao} className="mt-1 h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Taxa de Cancelamento</span>
                <span className="font-bold text-red-600">
                  {formatPercentage(metricas.taxa_cancelamento)}
                </span>
              </div>
              <Progress 
                value={metricas.taxa_cancelamento} 
                className="mt-1 h-2"
                indicatorClassName="bg-red-500"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Taxa de No-Show</span>
                <span className="font-bold text-orange-600">
                  {formatPercentage(metricas.taxa_no_show)}
                </span>
              </div>
              <Progress 
                value={metricas.taxa_no_show} 
                className="mt-1 h-2"
                indicatorClassName="bg-orange-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">{formatCurrency(metricas.receita_total)}</p>
            </div>
            
            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Este Mês</span>
                <span className="font-medium">{formatCurrency(metricas.receita_mes)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoje</span>
                <span className="font-medium">{formatCurrency(metricas.receita_hoje)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
                <span className="font-medium">{formatCurrency(metricas.ticket_medio)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Avisos */}
      {(metricas.taxa_cancelamento > 10 || metricas.taxa_no_show > 5) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              Alertas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metricas.taxa_cancelamento > 10 && (
              <div className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Taxa de cancelamento elevada</p>
                  <p className="text-orange-600">
                    {formatPercentage(metricas.taxa_cancelamento)} das reservas foram canceladas
                  </p>
                </div>
              </div>
            )}
            
            {metricas.taxa_no_show > 5 && (
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">Taxa de no-show acima do normal</p>
                  <p className="text-orange-600">
                    {formatPercentage(metricas.taxa_no_show)} dos clientes não compareceram
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
