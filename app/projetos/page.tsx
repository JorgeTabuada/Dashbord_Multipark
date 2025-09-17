"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, FileSpreadsheet, Calendar, Users, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Projeto {
  id: string
  nome: string
  descricao: string
  responsavel: string
  dataInicio: string
  dataFim: string
  status: "planejamento" | "em_andamento" | "pausado" | "concluido" | "cancelado"
  prioridade: "baixa" | "media" | "alta" | "critica"
  progresso: number
  orcamento?: number
  gastoAtual?: number
  equipe: string[]
  observacoes?: string
}

export default function ProjetosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [filteredProjetos, setFilteredProjetos] = useState<Projeto[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [prioridadeFilter, setPrioridadeFilter] = useState("todas")
  const [newProjeto, setNewProjeto] = useState({
    nome: "",
    descricao: "",
    responsavel: "",
    dataInicio: "",
    dataFim: "",
    status: "planejamento" as const,
    prioridade: "media" as const,
    progresso: 0,
    orcamento: 0,
    equipe: [] as string[],
    observacoes: ""
  })

  // Mock data
  useEffect(() => {
    const mockData: Projeto[] = [
      {
        id: "1",
        nome: "Modernização Sistema de Reservas",
        descricao: "Atualização completa do sistema de reservas online",
        responsavel: "João Silva",
        dataInicio: "2024-01-15",
        dataFim: "2024-06-30",
        status: "em_andamento",
        prioridade: "alta",
        progresso: 65,
        orcamento: 50000,
        gastoAtual: 32500,
        equipe: ["João Silva", "Maria Santos", "Pedro Costa"],
        observacoes: "Projeto em fase de desenvolvimento do frontend"
      },
      {
        id: "2",
        nome: "Implementação App Mobile",
        descricao: "Desenvolvimento de aplicação móvel para clientes",
        responsavel: "Maria Santos",
        dataInicio: "2024-03-01",
        dataFim: "2024-09-15",
        status: "planejamento",
        prioridade: "critica",
        progresso: 10,
        orcamento: 75000,
        gastoAtual: 5000,
        equipe: ["Maria Santos", "Carlos Oliveira"],
        observacoes: "Aguardando aprovação final do orçamento"
      },
      {
        id: "3",
        nome: "Automatização Relatórios",
        descricao: "Criação de sistema automático de relatórios gerenciais",
        responsavel: "Pedro Costa",
        dataInicio: "2024-02-01",
        dataFim: "2024-04-30",
        status: "concluido",
        prioridade: "media",
        progresso: 100,
        orcamento: 25000,
        gastoAtual: 23500,
        equipe: ["Pedro Costa", "Ana Rodrigues"],
        observacoes: "Projeto concluído com sucesso"
      }
    ]
    setProjetos(mockData)
    setFilteredProjetos(mockData)
  }, [])

  // Filter projetos
  useEffect(() => {
    let filtered = projetos

    if (searchTerm) {
      filtered = filtered.filter(
        (projeto) =>
          projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projeto.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter((projeto) => projeto.status === statusFilter)
    }

    if (prioridadeFilter !== "todas") {
      filtered = filtered.filter((projeto) => projeto.prioridade === prioridadeFilter)
    }

    setFilteredProjetos(filtered)
  }, [projetos, searchTerm, statusFilter, prioridadeFilter])

  const handleAddProjeto = () => {
    const id = Date.now().toString()
    const newProjetoData: Projeto = {
      ...newProjeto,
      id,
      equipe: newProjeto.equipe.length > 0 ? newProjeto.equipe : [newProjeto.responsavel]
    }

    setProjetos([...projetos, newProjetoData])
    setNewProjeto({
      nome: "",
      descricao: "",
      responsavel: "",
      dataInicio: "",
      dataFim: "",
      status: "planejamento",
      prioridade: "media",
      progresso: 0,
      orcamento: 0,
      equipe: [],
      observacoes: ""
    })
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      planejamento: "bg-gray-100 text-gray-800",
      em_andamento: "bg-blue-100 text-blue-800",
      pausado: "bg-orange-100 text-orange-800",
      concluido: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800"
    }
    return statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      planejamento: "Planejamento",
      em_andamento: "Em Andamento",
      pausado: "Pausado",
      concluido: "Concluído",
      cancelado: "Cancelado"
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getPrioridadeBadge = (prioridade: string) => {
    const prioridadeMap = {
      baixa: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-orange-100 text-orange-800",
      critica: "bg-red-100 text-red-800"
    }
    return prioridadeMap[prioridade as keyof typeof prioridadeMap] || "bg-gray-100 text-gray-800"
  }

  const getPrioridadeText = (prioridade: string) => {
    const prioridadeMap = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      critica: "Crítica"
    }
    return prioridadeMap[prioridade as keyof typeof prioridadeMap] || prioridade
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planejamento":
        return <Calendar className="w-4 h-4" />
      case "em_andamento":
        return <Clock className="w-4 h-4" />
      case "pausado":
        return <AlertTriangle className="w-4 h-4" />
      case "concluido":
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
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

  const calcularStats = () => {
    const total = projetos.length
    const emAndamento = projetos.filter(p => p.status === "em_andamento").length
    const concluidos = projetos.filter(p => p.status === "concluido").length
    const atrasados = projetos.filter(p => {
      const hoje = new Date()
      const dataFim = new Date(p.dataFim)
      return p.status !== "concluido" && dataFim < hoje
    }).length

    return { total, emAndamento, concluidos, atrasados }
  }

  const stats = calcularStats()

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
              <h1 className="text-xl font-semibold text-gray-900">Gestão de Projetos</h1>

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
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <p className="text-sm text-gray-600">Total Projetos</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.emAndamento}</div>
                  <p className="text-sm text-gray-600">Em Andamento</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.concluidos}</div>
                  <p className="text-sm text-gray-600">Concluídos</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.atrasados}</div>
                  <p className="text-sm text-gray-600">Atrasados</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Nome, responsável ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="min-w-48">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-48">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Projeto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Projeto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome do Projeto</Label>
                          <Input
                            id="nome"
                            value={newProjeto.nome}
                            onChange={(e) =>
                              setNewProjeto({ ...newProjeto, nome: e.target.value })
                            }
                            placeholder="Nome do projeto"
                          />
                        </div>

                        <div>
                          <Label htmlFor="responsavel">Responsável</Label>
                          <Input
                            id="responsavel"
                            value={newProjeto.responsavel}
                            onChange={(e) =>
                              setNewProjeto({ ...newProjeto, responsavel: e.target.value })
                            }
                            placeholder="Nome do responsável"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={newProjeto.descricao}
                          onChange={(e) =>
                            setNewProjeto({ ...newProjeto, descricao: e.target.value })
                          }
                          placeholder="Descrição detalhada do projeto"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dataInicio">Data Início</Label>
                          <Input
                            id="dataInicio"
                            type="date"
                            value={newProjeto.dataInicio}
                            onChange={(e) =>
                              setNewProjeto({ ...newProjeto, dataInicio: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="dataFim">Data Fim</Label>
                          <Input
                            id="dataFim"
                            type="date"
                            value={newProjeto.dataFim}
                            onChange={(e) =>
                              setNewProjeto({ ...newProjeto, dataFim: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select 
                            value={newProjeto.status} 
                            onValueChange={(value) => 
                              setNewProjeto({ ...newProjeto, status: value as any })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planejamento">Planejamento</SelectItem>
                              <SelectItem value="em_andamento">Em Andamento</SelectItem>
                              <SelectItem value="pausado">Pausado</SelectItem>
                              <SelectItem value="concluido">Concluído</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="prioridade">Prioridade</Label>
                          <Select 
                            value={newProjeto.prioridade} 
                            onValueChange={(value) => 
                              setNewProjeto({ ...newProjeto, prioridade: value as any })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="critica">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="orcamento">Orçamento (€)</Label>
                        <Input
                          id="orcamento"
                          type="number"
                          value={newProjeto.orcamento}
                          onChange={(e) =>
                            setNewProjeto({ ...newProjeto, orcamento: Number(e.target.value) })
                          }
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={newProjeto.observacoes}
                          onChange={(e) =>
                            setNewProjeto({ ...newProjeto, observacoes: e.target.value })
                          }
                          placeholder="Observações adicionais"
                          rows={2}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleAddProjeto}>Criar Projeto</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Projetos ({filteredProjetos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Datas</TableHead>
                    <TableHead>Orçamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjetos.map((projeto) => (
                    <TableRow key={projeto.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{projeto.nome}</div>
                          <div className="text-sm text-gray-500 truncate max-w-64">
                            {projeto.descricao}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{projeto.responsavel}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(projeto.status)}
                          <Badge 
                            className={getStatusBadge(projeto.status)}
                          >
                            {getStatusText(projeto.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={getPrioridadeBadge(projeto.prioridade)}
                        >
                          {getPrioridadeText(projeto.prioridade)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={projeto.progresso} className="h-2" />
                          <span className="text-xs text-gray-500">{projeto.progresso}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Início: {formatDate(projeto.dataInicio)}</div>
                          <div>Fim: {formatDate(projeto.dataFim)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatCurrency(projeto.orcamento || 0)}</div>
                          {projeto.gastoAtual && (
                            <div className="text-gray-500">
                              Gasto: {formatCurrency(projeto.gastoAtual)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProjetos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Nenhum projeto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}