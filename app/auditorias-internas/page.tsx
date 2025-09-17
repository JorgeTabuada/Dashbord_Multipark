"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calendar, User, Car, Clock, MapPin, AlertTriangle, Activity,
  TrendingUp, Download, Filter, Search, Loader2, BarChart3,
  Navigation, Shield, CheckCircle, XCircle, Info, Gauge,
  Radio, Phone, Headphones, MessageSquare
} from "lucide-react"
import dynamic from "next/dynamic"

// Importar Leaflet dinamicamente para evitar erros SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
)

interface MovimentacaoCondutor {
  id_pk: string
  booking_id: string
  action_user: string // Condutor que fez a ação
  action_date: string
  action_description: string
  license_plate: string
  park_name?: string
  cidade_cliente?: string
  estado_reserva_atual: string
  check_in_datetime?: string
  check_out_datetime?: string
  booking_price?: number
  velocidade_media?: number
  velocidade_maxima?: number
  distancia_percorrida?: number
  tempo_conducao?: number
  coordenadas?: { lat: number; lng: number }[]
}

interface ZelloData {
  sender: string
  timestamp: string
  duration: number
  transcription?: string
  confidence?: number
  channel?: string
}

interface AnaliseCondutor {
  nome: string
  total_movimentacoes: number
  carros_usados: Set<string>
  velocidade_media: number
  velocidade_maxima: number
  distancia_total: number
  tempo_total_conducao: number
  incidentes_velocidade: number
  parques_visitados: Set<string>
  cidades_operacao: Set<string>
  primeiro_registo: string
  ultimo_registo: string
  dias_trabalhados: number
  score_conducao: number // 0-100
  // Dados Zello
  total_comunicacoes?: number
  tempo_comunicacao?: number
  transcricoes?: string[]
}

export default function AuditoriasInternas() {
  const [loading, setLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  const [condutores, setCondutores] = useState<string[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoCondutor[]>([])
  const [zelloData, setZelloData] = useState<ZelloData[]>([])
  const [analise, setAnalise] = useState<AnaliseCondutor | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mapCenter] = useState<[number, number]>([38.7223, -9.1393]) // Lisboa

  // Simular dados de velocidade/GPS (em produção viriam de dispositivos IoT)
  const mockGPSData = {
    velocidades: [45, 50, 55, 60, 70, 85, 90, 75, 60, 50, 40, 30],
    coordenadas: [
      { lat: 38.7223, lng: -9.1393 },
      { lat: 38.7250, lng: -9.1400 },
      { lat: 38.7280, lng: -9.1420 },
      { lat: 38.7300, lng: -9.1450 },
    ]
  }

  // Carregar lista de condutores únicos do Supabase
  useEffect(() => {
    loadCondutores()
    loadZelloData()
  }, [])

  const loadCondutores = async () => {
    try {
      const response = await fetch('/api/sync/supabase?limit=5000')
      const result = await response.json()

      if (result.success && result.data) {
        // Extrair lista única de condutores (action_user)
        const uniqueDrivers = new Set<string>()
        result.data.forEach((item: any) => {
          if (item.last_action_user || item.action_user) {
            uniqueDrivers.add(item.last_action_user || item.action_user)
          }
        })

        setCondutores(Array.from(uniqueDrivers).filter(d => d && d !== 'null' && d !== 'undefined').sort())
      }
    } catch (error) {
      console.error('Erro ao carregar condutores:', error)
    }
  }

  const loadZelloData = async () => {
    try {
      console.log('🚀 Carregando dados Zello...')

      // Usar dados de teste temporariamente
      const response = await fetch('/api/tracking/zello/test')
      const result = await response.json()

      if (result.success && result.data?.sessions) {
        const zelloSessions: ZelloData[] = result.data.sessions.map((session: any) => ({
          sender: session.conductor,
          timestamp: session.timestamp,
          duration: session.duration,
          transcription: session.transcription,
          confidence: session.confidence,
          channel: session.channel
        }))

        console.log(`✅ ${zelloSessions.length} comunicações Zello carregadas`)
        setZelloData(zelloSessions)
      } else {
        console.log('⚠️ Nenhum dado Zello encontrado')
        setZelloData([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados Zello:', error)
      // Fallback para dados mock se API falhar
      const mockZello: ZelloData[] = [
        {
          sender: "Extra 424",
          timestamp: new Date().toISOString(),
          duration: 180,
          transcription: "A locação 22431 entrar na entrega no terminal 1",
          confidence: 80.76,
          channel: "Multipark Comunicação"
        }
      ]
      setZelloData(mockZello)
    }
  }

  const analisarCondutor = async () => {
    if (!selectedEmployee) {
      alert('Selecione um condutor!')
      return
    }

    setLoading(true)
    try {
      // Buscar dados do Supabase
      const response = await fetch('/api/sync/supabase?limit=10000')
      const result = await response.json()

      if (result.success && result.data) {
        // Filtrar movimentações do condutor selecionado no período
        const movimentacoesCondutor = result.data.filter((item: any) => {
          const actionUser = item.last_action_user || item.action_user
          const actionDate = item.last_action_date || item.updated_at_db

          if (!actionUser || !actionDate) return false

          const isCorrectUser = actionUser === selectedEmployee
          const date = new Date(actionDate)
          const isInPeriod = date >= new Date(startDate) && date <= new Date(endDate + 'T23:59:59')

          return isCorrectUser && isInPeriod
        })

        // Mapear para formato de MovimentacaoCondutor
        const movimentacoesFormatadas: MovimentacaoCondutor[] = movimentacoesCondutor.map((item: any) => ({
          id_pk: item.id_pk || item.id,
          booking_id: item.booking_id || '',
          action_user: item.last_action_user || item.action_user,
          action_date: item.last_action_date || item.updated_at_db,
          action_description: item.last_action_description || item.status || '',
          license_plate: item.license_plate || '',
          park_name: item.park_name || item.park_brand,
          cidade_cliente: item.cidade_cliente || item.city,
          estado_reserva_atual: item.estado_reserva_atual || item.status,
          check_in_datetime: item.check_in_datetime || item.check_in_previsto,
          check_out_datetime: item.check_out_datetime || item.check_out_previsto,
          booking_price: item.booking_price || item.total_price,
          // Simular dados de velocidade (em produção viriam de IoT/GPS)
          velocidade_media: Math.random() * 30 + 40, // 40-70 km/h
          velocidade_maxima: Math.random() * 40 + 60, // 60-100 km/h
          distancia_percorrida: Math.random() * 20 + 5, // 5-25 km
          tempo_conducao: Math.random() * 60 + 10, // 10-70 minutos
          coordenadas: mockGPSData.coordenadas
        }))

        setMovimentacoes(movimentacoesFormatadas)

        // Calcular análise agregada
        const analiseAgregada = calcularAnalise(movimentacoesFormatadas, selectedEmployee)
        setAnalise(analiseAgregada)
        setActiveTab("dashboard")
      }
    } catch (error) {
      console.error('Erro ao analisar condutor:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularAnalise = (movs: MovimentacaoCondutor[], nomeCondutor: string): AnaliseCondutor => {
    const carrosUsados = new Set<string>()
    const parquesVisitados = new Set<string>()
    const cidadesOperacao = new Set<string>()
    const diasTrabalhados = new Set<string>()

    let velocidadeTotal = 0
    let velocidadeMaxima = 0
    let distanciaTotal = 0
    let tempoTotal = 0
    let incidentesVelocidade = 0

    movs.forEach(mov => {
      if (mov.license_plate) carrosUsados.add(mov.license_plate)
      if (mov.park_name) parquesVisitados.add(mov.park_name)
      if (mov.cidade_cliente) cidadesOperacao.add(mov.cidade_cliente)

      const dia = new Date(mov.action_date).toISOString().split('T')[0]
      diasTrabalhados.add(dia)

      velocidadeTotal += mov.velocidade_media || 0
      velocidadeMaxima = Math.max(velocidadeMaxima, mov.velocidade_maxima || 0)
      distanciaTotal += mov.distancia_percorrida || 0
      tempoTotal += mov.tempo_conducao || 0

      // Verificar incidentes de velocidade (>80 km/h em cidade, >120 autoestrada)
      if ((mov.velocidade_maxima || 0) > 80) {
        incidentesVelocidade++
      }
    })

    const velocidadeMedia = movs.length > 0 ? velocidadeTotal / movs.length : 0

    // Calcular score de condução (0-100)
    let score = 100
    score -= incidentesVelocidade * 5 // -5 por cada incidente
    score -= velocidadeMaxima > 120 ? 20 : 0 // -20 se passou de 120
    score = Math.max(0, Math.min(100, score))

    // Dados Zello do condutor
    const zelloCondutorData = zelloData.filter(z =>
      z.sender.includes(nomeCondutor.split(' ')[0]) ||
      nomeCondutor.includes(z.sender)
    )

    return {
      nome: nomeCondutor,
      total_movimentacoes: movs.length,
      carros_usados: carrosUsados,
      velocidade_media: Math.round(velocidadeMedia),
      velocidade_maxima: Math.round(velocidadeMaxima),
      distancia_total: Math.round(distanciaTotal),
      tempo_total_conducao: Math.round(tempoTotal),
      incidentes_velocidade: incidentesVelocidade,
      parques_visitados: parquesVisitados,
      cidades_operacao: cidadesOperacao,
      primeiro_registo: movs.length > 0 ? movs[movs.length - 1].action_date : '',
      ultimo_registo: movs.length > 0 ? movs[0].action_date : '',
      dias_trabalhados: diasTrabalhados.size,
      score_conducao: score,
      // Dados Zello
      total_comunicacoes: zelloCondutorData.length,
      tempo_comunicacao: zelloCondutorData.reduce((sum, z) => sum + z.duration, 0),
      transcricoes: zelloCondutorData.map(z => z.transcription || '')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excelente', variant: 'success' as const }
    if (score >= 60) return { label: 'Bom', variant: 'warning' as const }
    return { label: 'Necessita Melhoria', variant: 'destructive' as const }
  }

  return (
    <Layout>
      <div className="p-6 bg-slate-900 min-h-screen">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 text-indigo-500" />
            Dashboard de Auditoria de Condutores
          </h1>
          <p className="text-slate-400">Sistema de análise de performance e rastreamento de condutores</p>
        </div>

        {/* Controles de Pesquisa */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader className="bg-slate-900">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-400" />
              Parâmetros de Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Condutor
                </label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione um condutor" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {condutores.map(condutor => (
                      <SelectItem key={condutor} value={condutor} className="text-white">
                        {condutor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data Início
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data Fim
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={analisarCondutor}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Analisar Condutor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados da Análise */}
        {analise && (
          <div className="space-y-8">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-500/10 mr-4">
                      <User className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Condutor</p>
                      <p className="text-xl font-bold text-white">{analise.nome}</p>
                      <p className="text-xs text-slate-500">{analise.dias_trabalhados} dias ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-500/10 mr-4">
                      <Gauge className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Score Condução</p>
                      <p className={`text-2xl font-bold ${getScoreColor(analise.score_conducao)}`}>
                        {analise.score_conducao}/100
                      </p>
                      <Badge variant={getScoreBadge(analise.score_conducao).variant}>
                        {getScoreBadge(analise.score_conducao).label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-500/10 mr-4">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Incidentes</p>
                      <p className="text-2xl font-bold text-white">{analise.incidentes_velocidade}</p>
                      <p className="text-xs text-slate-500">Excesso velocidade</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-500/10 mr-4">
                      <Navigation className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Distância Total</p>
                      <p className="text-2xl font-bold text-white">{analise.distancia_total} km</p>
                      <p className="text-xs text-slate-500">{analise.tempo_total_conducao} min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-500/10 mr-4">
                      <Car className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Veículos</p>
                      <p className="text-2xl font-bold text-white">{analise.carros_usados.size}</p>
                      <p className="text-xs text-slate-500">{analise.total_movimentacoes} movim.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-500/10 mr-4">
                      <Radio className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Comunicações</p>
                      <p className="text-2xl font-bold text-white">{analise.total_comunicacoes || 0}</p>
                      <p className="text-xs text-slate-500">{Math.round((analise.tempo_comunicacao || 0) / 60)} min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs com Detalhes */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
                <TabsTrigger value="velocidades">Análise Velocidade</TabsTrigger>
                <TabsTrigger value="comunicacoes">Comunicações Zello</TabsTrigger>
                <TabsTrigger value="mapa">Mapa de Percursos</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Velocidades */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Análise de Velocidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Velocidade Média</span>
                          <span className="text-xl font-bold text-white">{analise.velocidade_media} km/h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Velocidade Máxima</span>
                          <span className={`text-xl font-bold ${analise.velocidade_maxima > 120 ? 'text-red-500' : 'text-white'}`}>
                            {analise.velocidade_maxima} km/h
                          </span>
                        </div>
                        <div className="mt-6">
                          <div className="h-32 bg-slate-900 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-8 w-8 text-slate-600" />
                            <span className="ml-2 text-slate-500">Gráfico de Velocidades</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumo de Operações */}
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Resumo de Operações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-2">Carros Utilizados:</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(analise.carros_usados).slice(0, 5).map(carro => (
                              <Badge key={carro} variant="outline" className="bg-slate-700 text-white border-slate-600">
                                {carro}
                              </Badge>
                            ))}
                            {analise.carros_usados.size > 5 && (
                              <Badge variant="outline" className="bg-slate-700 text-slate-400 border-slate-600">
                                +{analise.carros_usados.size - 5} mais
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400 mb-2">Parques Visitados:</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(analise.parques_visitados).slice(0, 4).map(parque => (
                              <Badge key={parque} className="bg-indigo-600 text-white">
                                {parque}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400 mb-2">Cidades de Operação:</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(analise.cidades_operacao).map(cidade => (
                              <Badge key={cidade} className="bg-slate-700 text-white">
                                <MapPin className="h-3 w-3 mr-1" />
                                {cidade}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="movimentacoes">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Histórico de Movimentações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700">
                            <TableHead className="text-slate-300">Data/Hora</TableHead>
                            <TableHead className="text-slate-300">Matrícula</TableHead>
                            <TableHead className="text-slate-300">Parque</TableHead>
                            <TableHead className="text-slate-300">Cidade</TableHead>
                            <TableHead className="text-slate-300">Ação</TableHead>
                            <TableHead className="text-slate-300">Velocidade</TableHead>
                            <TableHead className="text-slate-300">Distância</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movimentacoes.slice(0, 10).map((mov) => (
                            <TableRow key={mov.id_pk} className="border-slate-700">
                              <TableCell className="text-white">
                                {new Date(mov.action_date).toLocaleString('pt-PT')}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-slate-700 text-white border-slate-600">
                                  {mov.license_plate}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-300">{mov.park_name || 'N/A'}</TableCell>
                              <TableCell className="text-slate-300">{mov.cidade_cliente || 'N/A'}</TableCell>
                              <TableCell className="text-slate-300">{mov.action_description}</TableCell>
                              <TableCell>
                                <span className={`font-bold ${(mov.velocidade_maxima || 0) > 80 ? 'text-red-500' : 'text-green-500'}`}>
                                  {Math.round(mov.velocidade_maxima || 0)} km/h
                                </span>
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {Math.round(mov.distancia_percorrida || 0)} km
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="velocidades">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Incidentes de Velocidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analise.incidentes_velocidade > 0 ? (
                        <div className="space-y-3">
                          {movimentacoes
                            .filter(m => (m.velocidade_maxima || 0) > 80)
                            .slice(0, 5)
                            .map((mov, idx) => (
                              <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-red-500/30">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-white font-semibold">{mov.license_plate}</p>
                                    <p className="text-sm text-slate-400">
                                      {new Date(mov.action_date).toLocaleString('pt-PT')}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-red-500">
                                      {Math.round(mov.velocidade_maxima || 0)} km/h
                                    </p>
                                    <p className="text-xs text-slate-400">Excesso velocidade</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                          <p className="text-green-400 font-semibold">Excelente Condução!</p>
                          <p className="text-slate-400 text-sm mt-1">Sem incidentes de velocidade</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Estatísticas de Velocidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">0-50 km/h (Cidade)</span>
                            <span className="text-white">35%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '35%'}}></div>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">50-90 km/h (Estrada)</span>
                            <span className="text-white">45%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">90-120 km/h (Autoestrada)</span>
                            <span className="text-white">15%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '15%'}}></div>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">&gt;120 km/h (Excesso)</span>
                            <span className="text-white">5%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{width: '5%'}}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comunicacoes">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-purple-400" />
                      Comunicações Zello
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analise.transcricoes && analise.transcricoes.length > 0 ? (
                        <>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-900 p-4 rounded-lg">
                              <p className="text-slate-400 text-sm mb-1">Total Comunicações</p>
                              <p className="text-2xl font-bold text-white">{analise.total_comunicacoes}</p>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg">
                              <p className="text-slate-400 text-sm mb-1">Tempo Total</p>
                              <p className="text-2xl font-bold text-white">{Math.round((analise.tempo_comunicacao || 0) / 60)} min</p>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg">
                              <p className="text-slate-400 text-sm mb-1">Média por Comunicação</p>
                              <p className="text-2xl font-bold text-white">
                                {analise.total_comunicacoes ? Math.round((analise.tempo_comunicacao || 0) / analise.total_comunicacoes) : 0}s
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-white font-semibold">Transcrições Recentes:</h3>
                            {zelloData.filter(z =>
                              z.sender.includes(analise.nome.split(' ')[0]) ||
                              analise.nome.includes(z.sender)
                            ).map((zello, idx) => (
                              <div key={idx} className="bg-slate-900 p-4 rounded-lg border border-purple-500/20">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-purple-400" />
                                    <span className="text-white font-medium">{zello.sender}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-slate-400">
                                      {new Date(zello.timestamp).toLocaleTimeString('pt-PT')}
                                    </p>
                                    <p className="text-xs text-slate-500">{zello.duration}s</p>
                                  </div>
                                </div>
                                <p className="text-slate-300 italic">"{zello.transcription}"</p>
                                <div className="mt-2 flex items-center gap-4">
                                  <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">
                                    {zello.channel}
                                  </Badge>
                                  {zello.confidence && (
                                    <span className="text-xs text-slate-500">
                                      Confiança: {zello.confidence}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <Radio className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400">Sem comunicações registadas para este condutor</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mapa">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Mapa de Percursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px] rounded-lg overflow-hidden">
                      {typeof window !== 'undefined' && (
                        <MapContainer
                          center={mapCenter}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; OpenStreetMap &copy; CARTO'
                          />
                          {mockGPSData.coordenadas.length > 1 && (
                            <Polyline
                              positions={mockGPSData.coordenadas.map(c => [c.lat, c.lng])}
                              color="#6366f1"
                              weight={5}
                            />
                          )}
                          {mockGPSData.coordenadas.map((coord, idx) => (
                            <Marker key={idx} position={[coord.lat, coord.lng]}>
                              <Popup>
                                <div className="text-sm">
                                  <p className="font-semibold">Ponto {idx + 1}</p>
                                  <p>Velocidade: {mockGPSData.velocidades[idx]} km/h</p>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Botão de Exportar */}
            <div className="flex justify-end">
              <Button className="bg-green-600 hover:bg-green-500 text-white">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório Completo
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}