'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { firebaseClient } from '@/lib/firebase-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Target, Users, Eye, TrendingUp, 
  Mail, Send, Share2, Gift, 
  Plus, BarChart3, PieChart, 
  Percent, Star, Calendar
} from 'lucide-react'

const mockCampanhas = [
  {
    id: '1',
    nome: 'Campanha Verão 2024',
    tipo: 'email',
    status: 'ativa',
    dataInicio: '2024-01-01',
    dataFim: '2024-03-31',
    publico: 'Clientes Premium',
    orcamento: 5000,
    gastoAtual: 3250,
    impressoes: 45000,
    cliques: 2250,
    conversoes: 180,
    receita: 18500,
    ctr: 5.0,
    roi: 469.2
  },
  {
    id: '2',
    nome: 'Promoção Weekend',
    tipo: 'sms',
    status: 'concluida',
    dataInicio: '2024-01-15',
    dataFim: '2024-01-17',
    publico: 'Todos os Clientes',
    orcamento: 2000,
    gastoAtual: 1850,
    impressoes: 18500,
    cliques: 1480,
    conversoes: 95,
    receita: 8750,
    ctr: 8.0,
    roi: 373.0
  }
]

const mockPromocoes = [
  {
    id: '1',
    nome: 'Desconto 20% Primeira Reserva',
    tipo: 'desconto_percentual',
    valor: 20,
    codigoPromocional: 'PRIMEIRO20',
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31',
    limitUso: 1000,
    usoAtual: 245,
    status: 'ativa',
    condicoes: 'Válido apenas para novos clientes'
  },
  {
    id: '2',
    nome: 'Frete Grátis Weekend',
    tipo: 'frete_gratis',
    valor: 0,
    codigoPromocional: 'FRETEGRATIS',
    dataInicio: '2024-01-15',
    dataFim: '2024-01-17',
    limitUso: 500,
    usoAtual: 487,
    status: 'expirada',
    condicoes: 'Reservas acima de €25'
  }
]

const mockSegmentos = [
  {
    id: '1',
    nome: 'Clientes VIP',
    criterios: 'Gasto > €500/mês, Frequência > 10 reservas/mês',
    totalClientes: 145,
    taxaEngajamento: 85.2,
    receitaMedia: 750,
    ultimaAtualizacao: '2024-01-15'
  },
  {
    id: '2',
    nome: 'Novos Clientes',
    criterios: 'Primeira reserva nos últimos 30 dias',
    totalClientes: 320,
    taxaEngajamento: 65.8,
    receitaMedia: 85,
    ultimaAtualizacao: '2024-01-15'
  }
]

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [campanhas, setCampanhas] = useState([])
  const [promocoes, setPromocoes] = useState([])
  const [segmentos, setSegmentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState([])

  // Carregar dados reais das bases de dados
  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    try {
      setLoading(true)
      
      // Carregar campanhas do Supabase
      const { data: campanhasData } = await supabase
        .from('campanhas_marketing')
        .select('*')
        .order('created_at', { ascending: false })

      if (campanhasData) {
        setCampanhas(campanhasData)
      }

      // Carregar promoções do Supabase
      const { data: promocoesData } = await supabase
        .from('promocoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (promocoesData) {
        setPromocoes(promocoesData)
      }

      // Carregar segmentos de clientes
      const { data: segmentosData } = await supabase
        .from('segmentos_clientes')
        .select('*')

      if (segmentosData) {
        setSegmentos(segmentosData)
      }

      // Carregar dados do Firebase para análise
      try {
        const cities = await firebaseClient.getCities()
        if (cities.length > 0) {
          const brands = await firebaseClient.getBrandsForCity(cities[0])
          if (brands.length > 0) {
            const firebaseReservations = await firebaseClient.getAllReservations(cities[0], brands[0], 1000)
            setReservations(firebaseReservations)
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase não disponível, usando dados locais:', firebaseError)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Fallback para dados mock se a base de dados não estiver disponível
      setCampanhas(mockCampanhas)
      setPromocoes(mockPromocoes)  
      setSegmentos(mockSegmentos)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'rascunho': 'bg-gray-100 text-gray-800',
      'ativa': 'bg-green-100 text-green-800',
      'pausada': 'bg-yellow-100 text-yellow-800',
      'concluida': 'bg-blue-100 text-blue-800',
      'expirada': 'bg-red-100 text-red-800'
    }
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT')
  }

  // Cálculos baseados nos dados reais ou fallback para mock data
  const campaignData = campanhas.length > 0 ? campanhas : mockCampanhas
  const promocaoData = promocoes.length > 0 ? promocoes : mockPromocoes
  const segmentoData = segmentos.length > 0 ? segmentos : mockSegmentos

  const totalCampanhas = campaignData.length
  const campanhasAtivas = campaignData.filter(c => c.status === 'ativa').length
  const impressoesTotais = campaignData.reduce((acc, c) => acc + (c.impressoes || 0), 0)
  const receitaTotal = campaignData.reduce((acc, c) => acc + (c.receita || 0), 0)
  const ctrMedio = campaignData.length > 0 ? campaignData.reduce((acc, c) => acc + (c.ctr || 0), 0) / campaignData.length : 0

  // Análise de dados do Firebase para insights de marketing
  const totalReservationsToday = reservations.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    return r.createdAt?.includes(today)
  }).length

  const averageBookingValue = reservations.length > 0 
    ? reservations.reduce((acc, r) => acc + (parseFloat(r.bookingPrice) || 0), 0) / reservations.length 
    : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground">
            Gestão de campanhas, promoções e análise de segmentos
          </p>
          {loading && <p className="text-sm text-blue-600">Carregando dados...</p>}
        </div>
        <Button onClick={loadRealData} disabled={loading}>
          {loading ? 'Carregando...' : 'Atualizar Dados'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{campanhasAtivas}</div>
            <p className="text-xs text-muted-foreground">
              De {totalCampanhas} campanhas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(impressoesTotais / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Total de visualizações
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{ctrMedio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de cliques
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(receitaTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gerada pelas campanhas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções</TabsTrigger>
          <TabsTrigger value="segmentos">Segmentos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance de Campanhas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignData.slice(0, 3).map((campanha) => (
                    <div key={campanha.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{campanha.nome}</div>
                        <div className="text-sm text-gray-500">
                          {campanha.cliques || 0} cliques • {campanha.conversoes || 0} conversões
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(campanha.receita || 0)}
                        </div>
                        <div className="text-sm text-gray-500">ROI: {(campanha.roi || 0).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segmentos de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentoData.map((segmento) => (
                    <div key={segmento.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{segmento.nome}</span>
                        <span className="text-sm">{segmento.totalClientes} clientes</span>
                      </div>
                      <Progress value={segmento.taxaEngajamento || 0} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {segmento.taxaEngajamento || 0}% engajamento • {formatCurrency(segmento.receitaMedia || 0)} receita média
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campanhas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Campanhas de Marketing</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Orçamento</TableHead>
                    <TableHead>Impressões</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignData.map((campanha) => (
                    <TableRow key={campanha.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campanha.nome}</div>
                          <div className="text-sm text-gray-500">{campanha.publico}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(campanha.status)}>
                          {campanha.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(campanha.dataInicio || campanha.data_inicio)}</div>
                          <div className="text-gray-500">até {formatDate(campanha.dataFim || campanha.data_fim)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatCurrency(campanha.gastoAtual || campanha.gasto_atual || 0)}</div>
                          <div className="text-gray-500">de {formatCurrency(campanha.orcamento || 0)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{(campanha.impressoes || 0).toLocaleString()}</TableCell>
                      <TableCell>{(campanha.ctr || 0).toFixed(1)}%</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {(campanha.roi || 0).toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promocoes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Códigos Promocionais</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Promoção
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promoção</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promocaoData.map((promocao) => (
                    <TableRow key={promocao.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promocao.nome}</div>
                          <div className="text-sm text-gray-500">{promocao.condicoes}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {promocao.codigoPromocional || promocao.codigo_promocional}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4" />
                          {(promocao.tipo || '').replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {promocao.tipo === 'desconto_percentual' ? `${promocao.valor || 0}%` :
                         promocao.tipo === 'desconto_fixo' ? formatCurrency(promocao.valor || 0) :
                         promocao.tipo === 'frete_gratis' ? 'Grátis' : formatCurrency(promocao.valor || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {promocao.usoAtual || promocao.uso_atual || 0} / {promocao.limitUso || promocao.limit_uso || '∞'}
                          </div>
                          <Progress 
                            value={(promocao.limitUso || promocao.limit_uso) ? ((promocao.usoAtual || promocao.uso_atual || 0) / (promocao.limitUso || promocao.limit_uso)) * 100 : 0} 
                            className="w-16 h-2" 
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(promocao.status)}>
                          {promocao.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segmentação de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Critérios</TableHead>
                    <TableHead>Total Clientes</TableHead>
                    <TableHead>Taxa Engajamento</TableHead>
                    <TableHead>Receita Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segmentoData.map((segmento) => (
                    <TableRow key={segmento.id}>
                      <TableCell className="font-medium">{segmento.nome}</TableCell>
                      <TableCell className="max-w-xs truncate">{segmento.criterios}</TableCell>
                      <TableCell>{segmento.totalClientes || segmento.total_clientes || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={segmento.taxaEngajamento || segmento.taxa_engajamento || 0} className="w-16 h-2" />
                          <span className="text-sm">{segmento.taxaEngajamento || segmento.taxa_engajamento || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(segmento.receitaMedia || segmento.receita_media || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  Performance Campanhas
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <PieChart className="w-6 h-6 mb-2" />
                  Análise de Segmentos
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  ROI por Canal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}