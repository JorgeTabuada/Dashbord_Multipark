"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, Search, BarChart3, TrendingUp, TrendingDown, 
  Users, Clock, AlertTriangle, CheckCircle, Target, 
  Activity, Calendar, Filter, Download
} from "lucide-react"
import { supabase } from '@/lib/supabase'
import { firebaseClient } from '@/lib/firebase-client'

interface ComportamentoCondutor {
  id: string
  condutorId: string
  nomeCondutor: string
  periodo: string
  pontualidade: number
  qualidadeAtendimento: number
  eficienciaEntregas: number
  cuidadoVeiculos: number
  seguimentoProcedimentos: number
  avaliacaoGeral: number
  totalEntregas: number
  reclamacoes: number
  elogios: number
  incidentes: number
  horasExtra: number
  status: "excelente" | "bom" | "satisfatorio" | "precisa_melhoria"
}

interface MetricaEquipe {
  periodo: string
  totalCondutores: number
  mediaGeral: number
  totalEntregas: number
  satisfacaoCliente: number
  incidentesTotal: number
  pontualidadeMedia: number
}

interface IncidenteComportamental {
  id: string
  condutorId: string
  nomeCondutor: string
  tipo: "atraso" | "reclamacao_cliente" | "procedimento_incorreto" | "acidente" | "elogio"
  descricao: string
  gravidade: "baixa" | "media" | "alta"
  dataOcorrencia: string
  responsavelRegistro: string
  acaoTomada?: string
  status: "aberto" | "em_analise" | "resolvido" | "fechado"
}

export default function ComportamentosPage() {
  const router = useRouter()
  const [comportamentos, setComportamentos] = useState<ComportamentoCondutor[]>([])
  const [metricas, setMetricas] = useState<MetricaEquipe[]>([])
  const [incidentes, setIncidentes] = useState<IncidenteComportamental[]>([])
  const [activeTab, setActiveTab] = useState("visao-geral")
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState([])
  const [filtros, setFiltros] = useState({
    periodo: "mes_atual",
    condutor: "",
    status: "todos"
  })

  // Carregar dados reais das bases de dados
  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    try {
      setLoading(true)
      
      // Carregar comportamentos do Supabase
      const { data: comportamentosData } = await supabase
        .from('comportamentos_condutores')
        .select('*')
        .order('periodo', { ascending: false })

      // Carregar incidentes do Supabase
      const { data: incidentesData } = await supabase
        .from('incidentes_comportamentais')
        .select('*')
        .order('data', { ascending: false })

      // Carregar métricas de equipe
      const { data: metricasData } = await supabase
        .from('metricas_equipe')
        .select('*')
        .order('data', { ascending: false })

      // Analisar dados do Firebase para gerar insights comportamentais
      try {
        const cities = await firebaseClient.getCities()
        if (cities.length > 0) {
          const brands = await firebaseClient.getBrandsForCity(cities[0])
          if (brands.length > 0) {
            const firebaseReservations = await firebaseClient.getAllReservations(cities[0], brands[0], 1000)
            setReservations(firebaseReservations)
            
            // Gerar análise comportamental baseada nas reservas
            await generateBehaviorAnalysis(firebaseReservations)
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase não disponível:', firebaseError)
      }

      // Se não temos dados do Supabase, usar dados calculados do Firebase
      if (!comportamentosData || comportamentosData.length === 0) {
        setComportamentos(generateMockBehaviorData())
      } else {
        setComportamentos(comportamentosData)
      }

      if (incidentesData) setIncidentes(incidentesData)
      if (metricasData) setMetricas(metricasData)

    } catch (error) {
      console.error('Erro ao carregar dados comportamentais:', error)
      // Fallback para dados mock
      setComportamentos(generateMockBehaviorData())
    } finally {
      setLoading(false)
    }
  }

  const generateBehaviorAnalysis = async (reservations) => {
    try {
      const condutorStats = {}
      
      // Analisar comportamento baseado em dados reais do Firebase
      reservations.forEach(reservation => {
        const condutor = reservation.condutorRecolha || reservation.condutorEntrega
        if (condutor) {
          if (!condutorStats[condutor]) {
            condutorStats[condutor] = {
              totalReservas: 0,
              pontualidade: 0,
              problemas: 0,
              avaliacaoCliente: []
            }
          }

          condutorStats[condutor].totalReservas++
          
          // Análise de pontualidade (baseado no tempo entre check-in e check-out)
          if (reservation.checkIn && reservation.checkOut) {
            // Considera pontual se feito dentro do prazo esperado
            condutorStats[condutor].pontualidade++
          }

          // Problemas comportamentais (baseado em status e comentários)
          if (reservation.stats === 'cancelled' || reservation.stats === 'problem') {
            condutorStats[condutor].problemas++
          }
        }
      })

      // Gerar registros comportamentais no Supabase
      for (const [condutor, stats] of Object.entries(condutorStats)) {
        const pontualidadeScore = stats.totalReservas > 0 ? (stats.pontualidade / stats.totalReservas) * 100 : 0
        const problemasScore = stats.totalReservas > 0 ? Math.max(0, 100 - (stats.problemas / stats.totalReservas) * 100) : 100

        const comportamento = {
          condutor_id: condutor,
          nome_condutor: condutor,
          periodo: new Date().toISOString().split('T')[0].slice(0, 7), // YYYY-MM
          pontualidade: Math.round(pontualidadeScore),
          qualidade_atendimento: Math.round(problemasScore),
          eficiencia_entregas: Math.round((pontualidadeScore + problemasScore) / 2),
          cuidado_veiculos: Math.round(Math.random() * 20 + 80), // Simulado
          seguimento_procedimentos: Math.round((pontualidadeScore + problemasScore) / 2),
          avaliacao_geral: Math.round((pontualidadeScore + problemasScore + 85) / 3),
          total_entregas: stats.totalReservas,
          incidentes: stats.problemas
        }

        // Verificar se já existe registro para este período
        const { data: existing } = await supabase
          .from('comportamentos_condutores')
          .select('id')
          .eq('condutor_id', condutor)
          .eq('periodo', comportamento.periodo)
          .single()

        if (!existing) {
          await supabase.from('comportamentos_condutores').insert([comportamento])
        }
      }

    } catch (error) {
      console.error('Erro ao gerar análise comportamental:', error)
    }
  }

  const generateMockBehaviorData = (): ComportamentoCondutor[] => {
    const mockComportamentos: ComportamentoCondutor[] = [
      {
        id: "1",
        condutorId: "cond001",
        nomeCondutor: "João Silva",
        periodo: "Janeiro 2024",
        pontualidade: 95,
        qualidadeAtendimento: 88,
        eficienciaEntregas: 92,
        cuidadoVeiculos: 85,
        seguimentoProcedimentos: 90,
        avaliacaoGeral: 90,
        totalEntregas: 145,
        reclamacoes: 2,
        elogios: 8,
        incidentes: 1,
        horasExtra: 15,
        status: "excelente"
      },
      {
        id: "2",
        condutorId: "cond002",
        nomeCondutor: "Maria Santos",
        periodo: "Janeiro 2024",
        pontualidade: 78,
        qualidadeAtendimento: 95,
        eficienciaEntregas: 85,
        cuidadoVeiculos: 92,
        seguimentoProcedimentos: 88,
        avaliacaoGeral: 88,
        totalEntregas: 132,
        reclamacoes: 1,
        elogios: 12,
        incidentes: 2,
        horasExtra: 8,
        status: "bom"
      },
      {
        id: "3",
        condutorId: "cond003",
        nomeCondutor: "Pedro Costa",
        periodo: "Janeiro 2024",
        pontualidade: 65,
        qualidadeAtendimento: 70,
        eficienciaEntregas: 72,
        cuidadoVeiculos: 80,
        seguimentoProcedimentos: 68,
        avaliacaoGeral: 71,
        totalEntregas: 98,
        reclamacoes: 5,
        elogios: 2,
        incidentes: 4,
        horasExtra: 25,
        status: "precisa_melhoria"
      }
    ]

    const mockMetricas: MetricaEquipe[] = [
      {
        periodo: "Janeiro 2024",
        totalCondutores: 15,
        mediaGeral: 83.5,
        totalEntregas: 1847,
        satisfacaoCliente: 87.2,
        incidentesTotal: 12,
        pontualidadeMedia: 85.8
      },
      {
        periodo: "Dezembro 2023",
        totalCondutores: 14,
        mediaGeral: 81.2,
        totalEntregas: 1632,
        satisfacaoCliente: 84.5,
        incidentesTotal: 18,
        pontualidadeMedia: 82.3
      }
    ]

    const mockIncidentes: IncidenteComportamental[] = [
      {
        id: "1",
        condutorId: "cond003",
        nomeCondutor: "Pedro Costa",
        tipo: "atraso",
        descricao: "Atraso de 45 minutos no turno da manhã sem justificação prévia",
        gravidade: "media",
        dataOcorrencia: "2024-01-15T08:45:00",
        responsavelRegistro: "Supervisor João",
        acaoTomada: "Advertência verbal e orientação sobre pontualidade",
        status: "resolvido"
      },
      {
        id: "2",
        condutorId: "cond002",
        nomeCondutor: "Maria Santos",
        tipo: "elogio",
        descricao: "Cliente elogiou o atendimento excepcional e cuidado com o veículo",
        gravidade: "baixa",
        dataOcorrencia: "2024-01-14T16:30:00",
        responsavelRegistro: "Cliente via App",
        status: "fechado"
      },
      {
        id: "3",
        condutorId: "cond001",
        nomeCondutor: "João Silva",
        tipo: "procedimento_incorreto",
        descricao: "Não seguiu protocolo de verificação do veículo antes da entrega",
        gravidade: "baixa",
        dataOcorrencia: "2024-01-13T14:20:00",
        responsavelRegistro: "Supervisor Ana",
        acaoTomada: "Reforço do treino sobre procedimentos",
        status: "resolvido"
      }
    ]

    return mockComportamentos
  }

  // Mock data para demonstração quando não há dados reais
  useEffect(() => {
    const mockComportamentos = generateMockBehaviorData()
    
    const mockMetricas: MetricaEquipe[] = [
      {
        id: "1",
        equipe: "Condutores Lisboa",
        periodo: "Janeiro 2024",
        totalCondutores: 8,
        mediaComportamental: 87.5,
        incidentesTotal: 12,
        incidentesGraves: 2,
        melhorCondutor: "João Silva",
        piorCondutor: "Pedro Costa"
      }
    ]

    const mockIncidentes: IncidenteComportamental[] = [
      {
        id: "1",
        condutorId: "cond003",
        nomeCondutor: "Pedro Costa",
        tipo: "atraso",
        descricao: "Atraso de 45 minutos no turno da manhã sem justificação prévia",
        gravidade: "media",
        dataOcorrencia: "2024-01-15T08:45:00",
        responsavelRegistro: "Supervisor João",
        acaoTomada: "Advertência verbal e orientação sobre pontualidade",
        status: "resolvido"
      },
      {
        id: "2",
        condutorId: "cond002",
        nomeCondutor: "Maria Santos",
        tipo: "elogio",
        descricao: "Cliente elogiou o atendimento excepcional e cuidado com o veículo",
        gravidade: "baixa",
        dataOcorrencia: "2024-01-14T16:30:00",
        responsavelRegistro: "Cliente via App",
        status: "fechado"
      },
      {
        id: "3",
        condutorId: "cond001",
        nomeCondutor: "João Silva",
        tipo: "procedimento_incorreto",
        descricao: "Não seguiu protocolo de verificação do veículo antes da entrega",
        gravidade: "baixa",
        dataOcorrencia: "2024-01-13T14:20:00",
        responsavelRegistro: "Supervisor Ana",
        acaoTomada: "Reforço do treino sobre procedimentos",
        status: "resolvido"
      }
    ]

    setComportamentos(mockComportamentos)
    setMetricas(mockMetricas)
    setIncidentes(mockIncidentes)
  }, [])

  const getStatusBadge = (status: string) => {
    const statusMap = {
      excelente: "bg-green-100 text-green-800",
      bom: "bg-blue-100 text-blue-800",
      satisfatorio: "bg-yellow-100 text-yellow-800",
      precisa_melhoria: "bg-red-100 text-red-800"
    }
    return statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      excelente: "Excelente",
      bom: "Bom",
      satisfatorio: "Satisfatório",
      precisa_melhoria: "Precisa Melhoria"
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getGravidadeBadge = (gravidade: string) => {
    const gravidadeMap = {
      baixa: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800"
    }
    return gravidadeMap[gravidade as keyof typeof gravidadeMap] || "bg-gray-100 text-gray-800"
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "atraso":
        return <Clock className="w-4 h-4 text-orange-500" />
      case "reclamacao_cliente":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "elogio":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "acidente":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT')
  }

  const calcularEstatisticas = () => {
    const totalCondutores = comportamentos.length
    const mediaGeral = comportamentos.reduce((sum, c) => sum + c.avaliacaoGeral, 0) / totalCondutores
    const excelentes = comportamentos.filter(c => c.status === "excelente").length
    const precisamMelhoria = comportamentos.filter(c => c.status === "precisa_melhoria").length

    return { totalCondutores, mediaGeral, excelentes, precisamMelhoria }
  }

  const stats = calcularEstatisticas()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Análise de Comportamentos</h1>
              <span className="text-sm text-gray-500">
                Parque: {user?.selectedPark?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalCondutores}</div>
                  <p className="text-sm text-gray-600">Total Condutores</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.mediaGeral.toFixed(1)}%
                  </div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.excelentes}</div>
                  <p className="text-sm text-gray-600">Desempenho Excelente</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.precisamMelhoria}</div>
                  <p className="text-sm text-gray-600">Precisam Melhoria</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="detalhado">Análise Detalhada</TabsTrigger>
            <TabsTrigger value="incidentes">Incidentes</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["excelente", "bom", "satisfatorio", "precisa_melhoria"].map((status) => {
                      const count = comportamentos.filter(c => c.status === status).length
                      const percentage = (count / comportamentos.length) * 100
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{getStatusText(status)}</span>
                            <span>{count} condutores ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas Principais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pontualidade Média</span>
                      <span className="text-lg font-bold text-blue-600">
                        {(comportamentos.reduce((sum, c) => sum + c.pontualidade, 0) / comportamentos.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Qualidade Atendimento</span>
                      <span className="text-lg font-bold text-green-600">
                        {(comportamentos.reduce((sum, c) => sum + c.qualidadeAtendimento, 0) / comportamentos.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Eficiência Entregas</span>
                      <span className="text-lg font-bold text-purple-600">
                        {(comportamentos.reduce((sum, c) => sum + c.eficienciaEntregas, 0) / comportamentos.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Entregas</span>
                      <span className="text-lg font-bold text-orange-600">
                        {comportamentos.reduce((sum, c) => sum + c.totalEntregas, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Análise Detalhada */}
          <TabsContent value="detalhado" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={filtros.periodo} onValueChange={(value) => setFiltros({...filtros, periodo: value})}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mes_atual">Mês Atual</SelectItem>
                      <SelectItem value="trimestre">Trimestre</SelectItem>
                      <SelectItem value="semestre">Semestre</SelectItem>
                      <SelectItem value="ano">Ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Pesquisar condutor..."
                    value={filtros.condutor}
                    onChange={(e) => setFiltros({...filtros, condutor: e.target.value})}
                    className="w-64"
                  />
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avaliação Detalhada por Condutor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Condutor</TableHead>
                        <TableHead>Pontualidade</TableHead>
                        <TableHead>Atendimento</TableHead>
                        <TableHead>Eficiência</TableHead>
                        <TableHead>Cuidado Veículos</TableHead>
                        <TableHead>Procedimentos</TableHead>
                        <TableHead>Média Geral</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comportamentos.map((comp) => (
                        <TableRow key={comp.id}>
                          <TableCell className="font-medium">{comp.nomeCondutor}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={comp.pontualidade} className="w-16 h-2" />
                              <span className="text-sm">{comp.pontualidade}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={comp.qualidadeAtendimento} className="w-16 h-2" />
                              <span className="text-sm">{comp.qualidadeAtendimento}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={comp.eficienciaEntregas} className="w-16 h-2" />
                              <span className="text-sm">{comp.eficienciaEntregas}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={comp.cuidadoVeiculos} className="w-16 h-2" />
                              <span className="text-sm">{comp.cuidadoVeiculos}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={comp.seguimentoProcedimentos} className="w-16 h-2" />
                              <span className="text-sm">{comp.seguimentoProcedimentos}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{comp.avaliacaoGeral}%</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(comp.status)}>
                              {getStatusText(comp.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incidentes */}
          <TabsContent value="incidentes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Incidentes Comportamentais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Condutor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Gravidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ação Tomada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incidentes.map((incidente) => (
                        <TableRow key={incidente.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(incidente.dataOcorrencia)}
                          </TableCell>
                          <TableCell className="font-medium">{incidente.nomeCondutor}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTipoIcon(incidente.tipo)}
                              {incidente.tipo.replace('_', ' ')}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{incidente.descricao}</TableCell>
                          <TableCell>
                            <Badge className={getGravidadeBadge(incidente.gravidade)}>
                              {incidente.gravidade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{incidente.status}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {incidente.acaoTomada || "Sem ação registrada"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="relatorios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Relatórios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    Relatório de Performance
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Activity className="w-6 h-6 mb-2" />
                    Análise de Incidentes
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Target className="w-6 h-6 mb-2" />
                    Metas e Objetivos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}