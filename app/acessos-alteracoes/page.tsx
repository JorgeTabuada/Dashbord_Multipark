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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, Plus, Search, Shield, Users, Activity, 
  Edit, Trash2, Eye, Settings, AlertCircle, CheckCircle,
  Clock, UserPlus, UserMinus, Lock, Unlock
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Usuario {
  id: string
  email: string
  fullName: string
  role: string
  status: "ativo" | "inativo" | "bloqueado"
  lastLogin: string
  createdAt: string
  funcionarioId?: string
  permissions: string[]
}

interface LogEntry {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  subApp: string
  details: string
  timestamp: string
  ipAddress: string
  userAgent: string
  status: "sucesso" | "erro" | "tentativa"
}

interface FuncionarioRH {
  id: string
  nomeCompleto: string
  funcao: string
  status: string
}

export default function AcessosAlteracoesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [funcionarios, setFuncionarios] = useState<FuncionarioRH[]>([])
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [activeTab, setActiveTab] = useState("usuarios")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("todos")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [logFilters, setLogFilters] = useState({
    dataInicio: "",
    dataFim: "",
    utilizador: "",
    subApp: "",
    tipoAcao: "",
    resourceId: ""
  })

  const [newUser, setNewUser] = useState({
    funcionarioId: "",
    email: "",
    password: "",
    role: "user",
    permissions: [] as string[]
  })

  const roles = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Administrador" },
    { value: "supervisor", label: "Supervisor" },
    { value: "back_office", label: "Back Office" },
    { value: "tesoureiro", label: "Tesoureiro" },
    { value: "team_leader", label: "Team Leader" },
    { value: "user", label: "Utilizador" }
  ]

  const permissions = [
    "reservas:read", "reservas:write", "reservas:delete",
    "caixa:read", "caixa:write", "fecho_caixa:write",
    "usuarios:read", "usuarios:write", "usuarios:delete",
    "relatorios:read", "relatorios:export",
    "configuracoes:read", "configuracoes:write"
  ]

  // Mock data
  useEffect(() => {
    const mockUsuarios: Usuario[] = [
      {
        id: "1",
        email: "admin@multipark.pt",
        fullName: "Administrador Sistema",
        role: "super_admin",
        status: "ativo",
        lastLogin: "2024-01-15T10:30:00",
        createdAt: "2023-01-01T00:00:00",
        permissions: ["*"]
      },
      {
        id: "2",
        email: "joao.silva@multipark.pt",
        fullName: "João Silva Santos",
        role: "admin",
        status: "ativo",
        lastLogin: "2024-01-15T09:15:00",
        createdAt: "2023-06-15T00:00:00",
        funcionarioId: "func_001",
        permissions: ["reservas:read", "reservas:write", "caixa:read", "caixa:write"]
      },
      {
        id: "3",
        email: "maria.santos@multipark.pt",
        fullName: "Maria Santos Costa",
        role: "supervisor",
        status: "ativo",
        lastLogin: "2024-01-14T16:45:00",
        createdAt: "2023-08-01T00:00:00",
        funcionarioId: "func_002",
        permissions: ["reservas:read", "reservas:write", "relatorios:read"]
      },
      {
        id: "4",
        email: "pedro.costa@multipark.pt",
        fullName: "Pedro Costa",
        role: "user",
        status: "inativo",
        lastLogin: "2024-01-10T14:20:00",
        createdAt: "2023-09-15T00:00:00",
        funcionarioId: "func_003",
        permissions: ["reservas:read"]
      }
    ]

    const mockLogs: LogEntry[] = [
      {
        id: "1",
        userId: "2",
        userName: "João Silva Santos",
        action: "LOGIN",
        resource: "Sistema",
        subApp: "Dashboard",
        details: "Login realizado com sucesso",
        timestamp: "2024-01-15T09:15:00",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "sucesso"
      },
      {
        id: "2",
        userId: "2",
        userName: "João Silva Santos",
        action: "CREATE",
        resource: "Reserva",
        resourceId: "RES001",
        subApp: "Reservas",
        details: "Nova reserva criada para cliente António Silva",
        timestamp: "2024-01-15T09:30:00",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "sucesso"
      },
      {
        id: "3",
        userId: "3",
        userName: "Maria Santos Costa",
        action: "UPDATE",
        resource: "Reserva",
        resourceId: "RES001",
        subApp: "Reservas",
        details: "Alteração do status da reserva para 'Confirmada'",
        timestamp: "2024-01-15T10:00:00",
        ipAddress: "192.168.1.150",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "sucesso"
      },
      {
        id: "4",
        userId: "4",
        userName: "Pedro Costa",
        action: "LOGIN_FAILED",
        resource: "Sistema",
        subApp: "Dashboard",
        details: "Tentativa de login falhada - palavra-passe incorreta",
        timestamp: "2024-01-15T08:45:00",
        ipAddress: "192.168.1.200",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        status: "erro"
      }
    ]

    const mockFuncionarios: FuncionarioRH[] = [
      {
        id: "func_004",
        nomeCompleto: "Carlos Oliveira",
        funcao: "Operador de Caixa",
        status: "ativo"
      },
      {
        id: "func_005",
        nomeCompleto: "Ana Rodrigues",
        funcao: "Supervisora",
        status: "ativo"
      }
    ]

    setUsuarios(mockUsuarios)
    setLogEntries(mockLogs)
    setFuncionarios(mockFuncionarios)
  }, [])

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "todos" || usuario.role === roleFilter
    const matchesStatus = statusFilter === "todos" || usuario.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const filteredLogs = logEntries.filter(log => {
    const matchesUser = !logFilters.utilizador || log.userName.toLowerCase().includes(logFilters.utilizador.toLowerCase())
    const matchesSubApp = !logFilters.subApp || log.subApp === logFilters.subApp
    const matchesAction = !logFilters.tipoAcao || log.action === logFilters.tipoAcao
    const matchesResource = !logFilters.resourceId || log.resourceId?.includes(logFilters.resourceId)
    
    // Filtro de data (simplificado)
    const matchesDate = true // Implementar filtro de data se necessário
    
    return matchesUser && matchesSubApp && matchesAction && matchesResource && matchesDate
  })

  const handleCreateUser = () => {
    if (!newUser.funcionarioId || !newUser.email || !newUser.password || !newUser.role) {
      alert("Preencha todos os campos obrigatórios.")
      return
    }

    const funcionario = funcionarios.find(f => f.id === newUser.funcionarioId)
    if (!funcionario) {
      alert("Funcionário não encontrado.")
      return
    }

    const novoUsuario: Usuario = {
      id: Date.now().toString(),
      email: newUser.email,
      fullName: funcionario.nomeCompleto,
      role: newUser.role,
      status: "ativo",
      lastLogin: "",
      createdAt: new Date().toISOString(),
      funcionarioId: newUser.funcionarioId,
      permissions: newUser.permissions
    }

    setUsuarios([...usuarios, novoUsuario])
    setNewUser({
      funcionarioId: "",
      email: "",
      password: "",
      role: "user",
      permissions: []
    })
    setIsNewUserModalOpen(false)

    // Adicionar log entry
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      userId: user?.id || "",
      userName: user?.name || "",
      action: "CREATE_USER",
      resource: "Usuario",
      resourceId: novoUsuario.id,
      subApp: "Acessos e Alterações",
      details: `Novo utilizador criado: ${novoUsuario.email}`,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: navigator.userAgent,
      status: "sucesso"
    }
    setLogEntries([logEntry, ...logEntries])
  }

  const toggleUserStatus = (userId: string) => {
    const updatedUsuarios = usuarios.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === "ativo" ? "inativo" : "ativo" as const }
        : u
    )
    setUsuarios(updatedUsuarios)

    const usuario = usuarios.find(u => u.id === userId)
    if (usuario) {
      const logEntry: LogEntry = {
        id: Date.now().toString(),
        userId: user?.id || "",
        userName: user?.name || "",
        action: usuario.status === "ativo" ? "DEACTIVATE_USER" : "ACTIVATE_USER",
        resource: "Usuario",
        resourceId: userId,
        subApp: "Acessos e Alterações",
        details: `Status do utilizador ${usuario.email} alterado para ${usuario.status === "ativo" ? "inativo" : "ativo"}`,
        timestamp: new Date().toISOString(),
        ipAddress: "192.168.1.1",
        userAgent: navigator.userAgent,
        status: "sucesso"
      }
      setLogEntries([logEntry, ...logEntries])
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Nunca"
    return new Date(dateString).toLocaleString('pt-PT')
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-blue-100 text-blue-800",
      supervisor: "bg-purple-100 text-purple-800",
      back_office: "bg-green-100 text-green-800",
      tesoureiro: "bg-orange-100 text-orange-800",
      team_leader: "bg-yellow-100 text-yellow-800",
      user: "bg-gray-100 text-gray-800"
    }
    return roleMap[role as keyof typeof roleMap] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativo: "bg-green-100 text-green-800",
      inativo: "bg-red-100 text-red-800",
      bloqueado: "bg-orange-100 text-orange-800"
    }
    return statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800"
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "LOGIN_FAILED":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "CREATE":
      case "CREATE_USER":
        return <Plus className="w-4 h-4 text-blue-500" />
      case "UPDATE":
        return <Edit className="w-4 h-4 text-yellow-500" />
      case "DELETE":
        return <Trash2 className="w-4 h-4 text-red-500" />
      case "ACTIVATE_USER":
        return <Unlock className="w-4 h-4 text-green-500" />
      case "DEACTIVATE_USER":
        return <Lock className="w-4 h-4 text-orange-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Acessos e Alterações</h1>
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
                  <div className="text-2xl font-bold text-blue-600">{usuarios.length}</div>
                  <p className="text-sm text-gray-600">Total Utilizadores</p>
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
                    {usuarios.filter(u => u.status === "ativo").length}
                  </div>
                  <p className="text-sm text-gray-600">Utilizadores Ativos</p>
                </div>
                <UserPlus className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {logEntries.filter(l => l.timestamp.startsWith("2024-01-15")).length}
                  </div>
                  <p className="text-sm text-gray-600">Ações Hoje</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {logEntries.filter(l => l.status === "erro").length}
                  </div>
                  <p className="text-sm text-gray-600">Tentativas Falhadas</p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usuarios">Gestão de Utilizadores</TabsTrigger>
            <TabsTrigger value="logs">Log do Sistema</TabsTrigger>
          </TabsList>

          {/* Gestão de Utilizadores */}
          <TabsContent value="usuarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Utilizadores do Sistema</span>
                  <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Utilizador
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Utilizador</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="funcionario">Funcionário</Label>
                          <Select 
                            value={newUser.funcionarioId} 
                            onValueChange={(value) => setNewUser({ ...newUser, funcionarioId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um funcionário" />
                            </SelectTrigger>
                            <SelectContent>
                              {funcionarios.map((func) => (
                                <SelectItem key={func.id} value={func.id}>
                                  {func.nomeCompleto} - {func.funcao}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="email@multipark.pt"
                          />
                        </div>

                        <div>
                          <Label htmlFor="password">Palavra-passe</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Palavra-passe segura"
                          />
                        </div>

                        <div>
                          <Label htmlFor="role">Papel/Role</Label>
                          <Select 
                            value={newUser.role} 
                            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsNewUserModalOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateUser}>
                            Criar Utilizador
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Pesquisar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Papéis</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {usuario.fullName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{usuario.fullName}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {usuario.funcionarioId || "N/A"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge className={getRoleBadge(usuario.role)}>
                              {roles.find(r => r.value === usuario.role)?.label || usuario.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(usuario.status)}>
                              {usuario.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDateTime(usuario.lastLogin)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserStatus(usuario.id)}
                              >
                                {usuario.status === "ativo" ? (
                                  <Lock className="w-4 h-4" />
                                ) : (
                                  <Unlock className="w-4 h-4" />
                                )}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Log do Sistema */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Log de Atividades do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="logUtilizador">Utilizador</Label>
                    <Input
                      id="logUtilizador"
                      placeholder="Nome do utilizador..."
                      value={logFilters.utilizador}
                      onChange={(e) => setLogFilters({ ...logFilters, utilizador: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logSubApp">Aplicação</Label>
                    <Select 
                      value={logFilters.subApp} 
                      onValueChange={(value) => setLogFilters({ ...logFilters, subApp: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as aplicações" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        <SelectItem value="Dashboard">Dashboard</SelectItem>
                        <SelectItem value="Reservas">Reservas</SelectItem>
                        <SelectItem value="Recolhas">Recolhas</SelectItem>
                        <SelectItem value="Acessos e Alterações">Acessos e Alterações</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="logTipoAcao">Tipo de Ação</Label>
                    <Select 
                      value={logFilters.tipoAcao} 
                      onValueChange={(value) => setLogFilters({ ...logFilters, tipoAcao: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as ações" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas</SelectItem>
                        <SelectItem value="LOGIN">Login</SelectItem>
                        <SelectItem value="CREATE">Criar</SelectItem>
                        <SelectItem value="UPDATE">Atualizar</SelectItem>
                        <SelectItem value="DELETE">Eliminar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="logResourceId">ID do Recurso</Label>
                    <Input
                      id="logResourceId"
                      placeholder="ID do recurso..."
                      value={logFilters.resourceId}
                      onChange={(e) => setLogFilters({ ...logFilters, resourceId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Recurso</TableHead>
                        <TableHead>Aplicação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {formatDateTime(log.timestamp)}
                          </TableCell>
                          <TableCell>{log.userName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              {log.action}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.resource}</div>
                              {log.resourceId && (
                                <div className="text-sm text-gray-500 font-mono">
                                  {log.resourceId}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{log.subApp}</TableCell>
                          <TableCell>
                            <Badge className={
                              log.status === "sucesso" ? "bg-green-100 text-green-800" :
                              log.status === "erro" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}