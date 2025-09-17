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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, Plus, Search, FileSpreadsheet, Users, Calendar, 
  Clock, Euro, User, Building, Phone, Mail, MapPin, 
  Camera, Upload, Download, Edit, Trash2, UserCheck 
} from "lucide-react"
import { supabase } from '@/lib/supabase'
import { firebaseClient } from '@/lib/firebase-client'

interface Funcionario {
  id: string
  nomeCompleto: string
  morada: string
  dataNascimento: string
  nif: string
  docIdTipo: "CC" | "Passaporte" | "Outro"
  docIdNumero: string
  foto?: string
  funcao: string
  dataEntrada: string
  dataSaida?: string
  parquePrincipal: string
  supervisorDireto: string
  tipoColaborador: "Efetivo" | "Temporario" | "Estagiario" | "Consultor"
  ordenadoBruto: number
  horarioTrabalho: string
  nivelExtra?: string
  valorHoraExtra?: number
  status: "ativo" | "inativo" | "ferias" | "baixa"
  contacto?: string
  email?: string
  observacoes?: string
}

interface Ponto {
  id: string
  funcionarioId: string
  data: string
  horaEntrada: string
  horaSaida?: string
  pausaInicio?: string
  pausaFim?: string
  horasTrabalhadasNormal: number
  horasExtra: number
  observacoes?: string
}

interface Vencimento {
  id: string
  funcionarioId: string
  mes: number
  ano: number
  ordenadoBruto: number
  horasExtra: number
  valorHorasExtra: number
  subsidioAlimentacao: number
  outrosSubsidios: number
  descontos: number
  valorLiquido: number
  dataProcessamento: string
}

export default function RecursosHumanosPage() {
  const router = useRouter()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [vencimentos, setVencimentos] = useState<Vencimento[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null)
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null)
  const [activeTab, setActiveTab] = useState("funcionarios")
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState([])

  // Carregar dados reais das bases de dados
  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    try {
      setLoading(true)
      
      // Carregar funcionários do Supabase
      const { data: funcionariosData } = await supabase
        .from('funcionarios')
        .select('*')
        .order('nome_completo', { ascending: true })

      if (funcionariosData && funcionariosData.length > 0) {
        // Converter nomes de campos snake_case para camelCase
        const funcionariosFormatted = funcionariosData.map(f => ({
          ...f,
          nomeCompleto: f.nome_completo || f.nomeCompleto,
          dataNascimento: f.data_nascimento || f.dataNascimento,
          docIdTipo: f.doc_id_tipo || f.docIdTipo || 'CC',
          docIdNumero: f.doc_id_numero || f.docIdNumero,
          dataEntrada: f.data_entrada || f.dataEntrada,
          dataSaida: f.data_saida || f.dataSaida,
          parquePrincipal: f.parque_principal || f.parquePrincipal,
          supervisorDireto: f.supervisor_direto || f.supervisorDireto,
          tipoColaborador: f.tipo_colaborador || f.tipoColaborador || 'Efetivo',
          ordenadoBruto: f.ordenado_bruto || f.ordenadoBruto || 0,
          horarioTrabalho: f.horario_trabalho || f.horarioTrabalho,
          nivelExtra: f.nivel_extra || f.nivelExtra,
          valorHoraExtra: f.valor_hora_extra || f.valorHoraExtra
        }))
        setFuncionarios(funcionariosFormatted)
      }

      // Carregar pontos do Supabase
      const { data: pontosData } = await supabase
        .from('pontos_funcionarios')
        .select('*')
        .order('data', { ascending: false })
        .limit(1000)

      if (pontosData) {
        const pontosFormatted = pontosData.map(p => ({
          ...p,
          funcionarioId: p.funcionario_id || p.funcionarioId,
          horaEntrada: p.hora_entrada || p.horaEntrada,
          horaSaida: p.hora_saida || p.horaSaida,
          horasExtras: p.horas_extras || p.horasExtras || 0
        }))
        setPontos(pontosFormatted)
      }

      // Carregar vencimentos do Supabase
      const { data: vencimentosData } = await supabase
        .from('vencimentos_funcionarios')
        .select('*')
        .order('mes_ano', { ascending: false })

      if (vencimentosData) {
        const vencimentosFormatted = vencimentosData.map(v => ({
          ...v,
          funcionarioId: v.funcionario_id || v.funcionarioId,
          mesAno: v.mes_ano || v.mesAno,
          salarioBase: v.salario_base || v.salarioBase || 0,
          horasExtras: v.horas_extras || v.horasExtras || 0,
          valorExtras: v.valor_extras || v.valorExtras || 0,
          subsidios: v.subsidios || 0,
          descontos: v.descontos || 0,
          valorTotal: v.valor_total || v.valorTotal || 0
        }))
        setVencimentos(vencimentosFormatted)
      }

      // Importar dados de condutores do Firebase para Supabase
      try {
        await importDriversFromFirebase()
      } catch (firebaseError) {
        console.warn('Firebase não disponível:', firebaseError)
      }

    } catch (error) {
      console.error('Erro ao carregar dados RH:', error)
    } finally {
      setLoading(false)
    }
  }

  const importDriversFromFirebase = async () => {
    try {
      const cities = await firebaseClient.getCities()
      if (cities.length === 0) return

      for (const city of cities.slice(0, 2)) { // Limitar a 2 cidades
        const brands = await firebaseClient.getBrandsForCity(city)
        for (const brand of brands.slice(0, 2)) { // Limitar a 2 marcas por cidade
          const reservations = await firebaseClient.getAllReservations(city, brand, 500)
          setReservations(prev => [...prev, ...reservations])

          // Extrair condutores únicos das reservas
          const condutores = new Set()
          reservations.forEach(r => {
            if (r.condutorRecolha) condutores.add(r.condutorRecolha)
            if (r.condutorEntrega) condutores.add(r.condutorEntrega)
          })

          // Criar funcionários para condutores que não existem no Supabase
          for (const condutor of Array.from(condutores)) {
            if (condutor && typeof condutor === 'string') {
              const { data: existingFuncionario } = await supabase
                .from('funcionarios')
                .select('id')
                .eq('nome_completo', condutor)
                .single()

              if (!existingFuncionario) {
                const novoFuncionario = {
                  nome_completo: condutor,
                  funcao: 'Condutor',
                  data_entrada: new Date().toISOString().split('T')[0],
                  parque_principal: city,
                  tipo_colaborador: 'Efetivo',
                  status: 'ativo',
                  ordenado_bruto: 760, // Salário mínimo português
                  horario_trabalho: '08:00-17:00',
                  supervisor_direto: 'Supervisor de Operações',
                  nif: '999999990', // NIF genérico
                  morada: `${city}, Portugal`,
                  data_nascimento: '1990-01-01',
                  doc_id_tipo: 'CC',
                  doc_id_numero: '00000000'
                }

                await supabase.from('funcionarios').insert([novoFuncionario])
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao importar condutores do Firebase:', error)
    }
  }

  const [newFuncionario, setNewFuncionario] = useState({
    nomeCompleto: "",
    morada: "",
    dataNascimento: "",
    nif: "",
    docIdTipo: "CC" as const,
    docIdNumero: "",
    funcao: "",
    dataEntrada: "",
    parquePrincipal: "lisboa",
    supervisorDireto: "",
    tipoColaborador: "Efetivo" as const,
    ordenadoBruto: 0,
    horarioTrabalho: "",
    contacto: "",
    email: "",
    observacoes: ""
  })

  // Mock data
  useEffect(() => {
    const mockFuncionarios: Funcionario[] = [
      {
        id: "1",
        nomeCompleto: "João Silva Santos",
        morada: "Rua das Flores, 123, Lisboa",
        dataNascimento: "1985-03-15",
        nif: "123456789",
        docIdTipo: "CC",
        docIdNumero: "12345678",
        funcao: "Supervisor de Operações",
        dataEntrada: "2020-01-15",
        parquePrincipal: "lisboa",
        supervisorDireto: "Maria Costa",
        tipoColaborador: "Efetivo",
        ordenadoBruto: 1200,
        horarioTrabalho: "08:00-17:00",
        status: "ativo",
        contacto: "912345678",
        email: "joao.silva@multipark.pt",
        valorHoraExtra: 8.5
      },
      {
        id: "2",
        nomeCompleto: "Maria Santos Costa",
        morada: "Av. da República, 456, Porto",
        dataNascimento: "1990-07-22",
        nif: "987654321",
        docIdTipo: "CC",
        docIdNumero: "87654321",
        funcao: "Operadora de Caixa",
        dataEntrada: "2021-06-01",
        parquePrincipal: "porto",
        supervisorDireto: "Pedro Oliveira",
        tipoColaborador: "Efetivo",
        ordenadoBruto: 900,
        horarioTrabalho: "09:00-18:00",
        status: "ativo",
        contacto: "923456789",
        email: "maria.santos@multipark.pt",
        valorHoraExtra: 6.5
      },
      {
        id: "3",
        nomeCompleto: "Pedro Oliveira",
        morada: "Rua do Sol, 789, Faro",
        dataNascimento: "1982-11-10",
        nif: "456789123",
        docIdTipo: "CC",
        docIdNumero: "45678912",
        funcao: "Team Leader",
        dataEntrada: "2019-03-10",
        parquePrincipal: "faro",
        supervisorDireto: "Ana Rodrigues",
        tipoColaborador: "Efetivo",
        ordenadoBruto: 1100,
        horarioTrabalho: "07:00-16:00",
        status: "ferias",
        contacto: "934567890",
        email: "pedro.oliveira@multipark.pt",
        valorHoraExtra: 7.8
      }
    ]

    const mockPontos: Ponto[] = [
      {
        id: "1",
        funcionarioId: "1",
        data: "2024-01-15",
        horaEntrada: "08:00",
        horaSaida: "17:30",
        pausaInicio: "12:00",
        pausaFim: "13:00",
        horasTrabalhadasNormal: 8.5,
        horasExtra: 0.5
      },
      {
        id: "2",
        funcionarioId: "2",
        data: "2024-01-15",
        horaEntrada: "09:00",
        horaSaida: "18:00",
        pausaInicio: "13:00",
        pausaFim: "14:00",
        horasTrabalhadasNormal: 8,
        horasExtra: 0
      }
    ]

    const mockVencimentos: Vencimento[] = [
      {
        id: "1",
        funcionarioId: "1",
        mes: 12,
        ano: 2023,
        ordenadoBruto: 1200,
        horasExtra: 10,
        valorHorasExtra: 85,
        subsidioAlimentacao: 150,
        outrosSubsidios: 50,
        descontos: 285,
        valorLiquido: 1200,
        dataProcessamento: "2023-12-28"
      }
    ]

    setFuncionarios(mockFuncionarios)
    setPontos(mockPontos)
    setVencimentos(mockVencimentos)
  }, [])

  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesSearch = funcionario.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.nif.includes(searchTerm)
    
    const matchesStatus = statusFilter === "todos" || funcionario.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleAddFuncionario = () => {
    const id = Date.now().toString()
    const newFunc: Funcionario = {
      ...newFuncionario,
      id,
      status: "ativo"
    }

    setFuncionarios([...funcionarios, newFunc])
    setNewFuncionario({
      nomeCompleto: "",
      morada: "",
      dataNascimento: "",
      nif: "",
      docIdTipo: "CC",
      docIdNumero: "",
      funcao: "",
      dataEntrada: "",
      parquePrincipal: "lisboa",
      supervisorDireto: "",
      tipoColaborador: "Efetivo",
      ordenadoBruto: 0,
      horarioTrabalho: "",
      contacto: "",
      email: "",
      observacoes: ""
    })
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativo: "bg-green-100 text-green-800",
      inativo: "bg-red-100 text-red-800",
      ferias: "bg-blue-100 text-blue-800",
      baixa: "bg-orange-100 text-orange-800"
    }
    return statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      ativo: "Ativo",
      inativo: "Inativo",
      ferias: "Férias",
      baixa: "Baixa Médica"
    }
    return statusMap[status as keyof typeof statusMap] || status
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

  const calcularEstatisticas = () => {
    const total = funcionarios.length
    const ativos = funcionarios.filter(f => f.status === "ativo").length
    const ferias = funcionarios.filter(f => f.status === "ferias").length
    const folhaVencimentos = funcionarios
      .filter(f => f.status === "ativo")
      .reduce((sum, f) => sum + f.ordenadoBruto, 0)

    return { total, ativos, ferias, folhaVencimentos }
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
              <h1 className="text-xl font-semibold text-gray-900">Recursos Humanos</h1>
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
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <p className="text-sm text-gray-600">Total Funcionários</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
                  <p className="text-sm text-gray-600">Ativos</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.ferias}</div>
                  <p className="text-sm text-gray-600">Em Férias</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.folhaVencimentos)}
                  </div>
                  <p className="text-sm text-gray-600">Folha Vencimentos</p>
                </div>
                <Euro className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            <TabsTrigger value="pontos">Ponto</TabsTrigger>
            <TabsTrigger value="vencimentos">Vencimentos</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Funcionários Tab */}
          <TabsContent value="funcionarios" className="space-y-6">
            {/* Filters and Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Funcionários</CardTitle>
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
                        placeholder="Nome, função ou NIF..."
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
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="ferias">Férias</SelectItem>
                        <SelectItem value="baixa">Baixa Médica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Funcionário
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Novo Funcionário</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="nomeCompleto">Nome Completo</Label>
                              <Input
                                id="nomeCompleto"
                                value={newFuncionario.nomeCompleto}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, nomeCompleto: e.target.value })
                                }
                                placeholder="Nome completo"
                              />
                            </div>

                            <div>
                              <Label htmlFor="funcao">Função</Label>
                              <Input
                                id="funcao"
                                value={newFuncionario.funcao}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, funcao: e.target.value })
                                }
                                placeholder="Função"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="morada">Morada</Label>
                            <Input
                              id="morada"
                              value={newFuncionario.morada}
                              onChange={(e) =>
                                setNewFuncionario({ ...newFuncionario, morada: e.target.value })
                              }
                              placeholder="Morada completa"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="dataNascimento">Data Nascimento</Label>
                              <Input
                                id="dataNascimento"
                                type="date"
                                value={newFuncionario.dataNascimento}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, dataNascimento: e.target.value })
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor="nif">NIF</Label>
                              <Input
                                id="nif"
                                value={newFuncionario.nif}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, nif: e.target.value })
                                }
                                placeholder="123456789"
                              />
                            </div>

                            <div>
                              <Label htmlFor="docIdNumero">Nº Documento</Label>
                              <Input
                                id="docIdNumero"
                                value={newFuncionario.docIdNumero}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, docIdNumero: e.target.value })
                                }
                                placeholder="12345678"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="dataEntrada">Data Entrada</Label>
                              <Input
                                id="dataEntrada"
                                type="date"
                                value={newFuncionario.dataEntrada}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, dataEntrada: e.target.value })
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor="ordenadoBruto">Ordenado Bruto (€)</Label>
                              <Input
                                id="ordenadoBruto"
                                type="number"
                                value={newFuncionario.ordenadoBruto}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, ordenadoBruto: Number(e.target.value) })
                                }
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="contacto">Contacto</Label>
                              <Input
                                id="contacto"
                                value={newFuncionario.contacto}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, contacto: e.target.value })
                                }
                                placeholder="912345678"
                              />
                            </div>

                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={newFuncionario.email}
                                onChange={(e) =>
                                  setNewFuncionario({ ...newFuncionario, email: e.target.value })
                                }
                                placeholder="email@multipark.pt"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsModalOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={handleAddFuncionario}>Adicionar</Button>
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

            {/* Funcionários Table */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionários ({filteredFuncionarios.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Ordenado</TableHead>
                        <TableHead>Data Entrada</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFuncionarios.map((funcionario) => (
                        <TableRow key={funcionario.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={funcionario.foto} />
                                <AvatarFallback>
                                  {funcionario.nomeCompleto.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{funcionario.nomeCompleto}</div>
                                <div className="text-sm text-gray-500">NIF: {funcionario.nif}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{funcionario.funcao}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(funcionario.status)}>
                              {getStatusText(funcionario.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {funcionario.contacto}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Mail className="w-3 h-3" />
                                {funcionario.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(funcionario.ordenadoBruto)}</TableCell>
                          <TableCell>{formatDate(funcionario.dataEntrada)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <User className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredFuncionarios.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                            Nenhum funcionário encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outros tabs (Ponto, Vencimentos, Relatórios) - placeholder */}
          <TabsContent value="pontos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Ponto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Funcionalidade de ponto em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vencimentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processamento de Vencimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Euro className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Processamento de vencimentos em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de RH</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Relatórios em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}