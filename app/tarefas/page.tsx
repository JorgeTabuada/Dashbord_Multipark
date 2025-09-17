"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckSquare, Clock, AlertCircle, Plus, RefreshCw, User, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  type: 'recolha' | 'entrega' | 'limpeza' | 'manutencao' | 'administrativa' | 'outro'
  priority: 'baixa' | 'media' | 'alta' | 'urgente'
  status: 'pendente' | 'em_progresso' | 'concluida' | 'cancelada'
  assigned_to?: string
  reservation_id?: string
  license_plate?: string
  due_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
  notes?: string
}

interface Reservation {
  id_pk: string
  booking_id?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  estado_reserva_atual: string
  check_in_previsto?: string
  check_out_previsto?: string
  created_at_db: string
  updated_at_db: string
}

interface TaskStats {
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  urgentTasks: number
  todayTasks: number
}

export default function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)

  // Lista de funcionários
  const staff = [
    'João Silva',
    'Maria Santos',
    'Pedro Costa',
    'Ana Ferreira',
    'Carlos Mendes'
  ]

  useEffect(() => {
    loadTasks()
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      const response = await fetch('/api/sync/supabase?limit=100')
      if (response.ok) {
        const data = await response.json()
        setReservations(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error)
    }
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      
      // Simular tarefas (em produção viria da BD)
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Recolher veículo AA-11-BB',
          description: 'Recolher no Terminal 1',
          type: 'recolha',
          priority: 'alta',
          status: 'pendente',
          assigned_to: 'João Silva',
          license_plate: 'AA-11-BB',
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Limpeza completa CC-22-DD',
          description: 'Lavagem e aspiração interior',
          type: 'limpeza',
          priority: 'media',
          status: 'em_progresso',
          assigned_to: 'Maria Santos',
          license_plate: 'CC-22-DD',
          due_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Verificar documentação',
          description: 'Organizar faturas do mês',
          type: 'administrativa',
          priority: 'baixa',
          status: 'concluida',
          assigned_to: 'Ana Ferreira',
          completed_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Entregar EE-33-FF urgente',
          description: 'Cliente VIP - Aeroporto',
          type: 'entrega',
          priority: 'urgente',
          status: 'pendente',
          assigned_to: 'Pedro Costa',
          license_plate: 'EE-33-FF',
          due_date: new Date(Date.now() + 3600000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Manutenção preventiva',
          description: 'Verificar óleo e pneus da frota',
          type: 'manutencao',
          priority: 'media',
          status: 'pendente',
          assigned_to: 'Carlos Mendes',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      setTasks(mockTasks)
      
      // Calcular estatísticas
      const stats = calculateTaskStats(mockTasks)
      setStats(stats)
      
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTaskStats = (tasks: Task[]): TaskStats => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const pendingTasks = tasks.filter(t => t.status === 'pendente').length
    const inProgressTasks = tasks.filter(t => t.status === 'em_progresso').length
    const completedTasks = tasks.filter(t => t.status === 'concluida').length
    const urgentTasks = tasks.filter(t => t.priority === 'urgente' && t.status !== 'concluida').length
    
    const todayTasks = tasks.filter(t => {
      const taskDate = t.due_date ? new Date(t.due_date) : new Date(t.created_at)
      return taskDate >= today && taskDate < new Date(today.getTime() + 86400000)
    }).length
    
    return {
      totalTasks: tasks.length,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      urgentTasks,
      todayTasks
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { variant: 'secondary' as const, label: 'Pendente' },
      'em_progresso': { variant: 'default' as const, label: 'Em Progresso' },
      'concluida': { variant: 'default' as const, label: 'Concluída', className: 'bg-green-500' },
      'cancelada': { variant: 'destructive' as const, label: 'Cancelada' }
    }
    
    const config = statusMap[status as keyof typeof statusMap] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      'baixa': { variant: 'outline' as const, label: 'Baixa' },
      'media': { variant: 'secondary' as const, label: 'Média' },
      'alta': { variant: 'default' as const, label: 'Alta', className: 'bg-orange-500' },
      'urgente': { variant: 'destructive' as const, label: 'Urgente' }
    }
    
    const config = priorityMap[priority as keyof typeof priorityMap] || { variant: 'outline' as const, label: priority }
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const typeMap = {
      'recolha': { icon: '🚗', label: 'Recolha' },
      'entrega': { icon: '📦', label: 'Entrega' },
      'limpeza': { icon: '🧹', label: 'Limpeza' },
      'manutencao': { icon: '🔧', label: 'Manutenção' },
      'administrativa': { icon: '📋', label: 'Administrativa' },
      'outro': { icon: '📌', label: 'Outro' }
    }
    
    const config = typeMap[type as keyof typeof typeMap] || { icon: '📌', label: type }
    return (
      <span className="flex items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    )
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (Math.abs(hours) < 24) {
      if (hours > 0) return `Em ${hours}h`
      if (hours < 0) return `Há ${Math.abs(hours)}h`
      return 'Agora'
    }
    
    return date.toLocaleString('pt-PT')
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === "" || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.license_plate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assigned_to || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesType = typeFilter === "all" || task.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      task.status = newStatus as any
      task.updated_at = new Date().toISOString()
      if (newStatus === 'concluida') {
        task.completed_at = new Date().toISOString()
      }
      setTasks([...tasks])
      setStats(calculateTaskStats(tasks))
    }
  }

  return (
    <Layout title="Gestão de Tarefas">
      <div className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? '-' : stats?.totalTasks || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <CheckSquare className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {loading ? '-' : stats?.pendingTasks || 0}
                  </div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                </div>
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {loading ? '-' : stats?.inProgressTasks || 0}
                  </div>
                  <p className="text-sm text-gray-600">Em Progresso</p>
                </div>
                <RefreshCw className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? '-' : stats?.completedTasks || 0}
                  </div>
                  <p className="text-sm text-gray-600">Concluídas</p>
                </div>
                <CheckSquare className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {loading ? '-' : stats?.urgentTasks || 0}
                  </div>
                  <p className="text-sm text-gray-600">Urgentes</p>
                </div>
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {loading ? '-' : stats?.todayTasks || 0}
                  </div>
                  <p className="text-sm text-gray-600">Hoje</p>
                </div>
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Lista de Tarefas
              </span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowNewTaskDialog(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
                <Button onClick={loadTasks} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_progresso">Em Progresso</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Prioridades</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="recolha">Recolha</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="limpeza">Limpeza</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="administrativa">Administrativa</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Tarefas */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">A carregar tarefas...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{getTypeBadge(task.type)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{task.title}</span>
                          <span className="text-xs text-gray-500">{task.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="text-sm">{task.assigned_to || 'Não atribuído'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={task.priority === 'urgente' ? 'text-red-600 font-semibold' : ''}>
                          {formatDateTime(task.due_date)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {task.status === 'pendente' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'em_progresso')}
                            >
                              Iniciar
                            </Button>
                          )}
                          {task.status === 'em_progresso' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'concluida')}
                            >
                              Concluir
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedTask(task)}
                              >
                                Ver
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalhes da Tarefa</DialogTitle>
                              </DialogHeader>
                              {selectedTask && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Título:</label>
                                    <p>{selectedTask.title}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Descrição:</label>
                                    <p>{selectedTask.description}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Tipo:</label>
                                      <p>{getTypeBadge(selectedTask.type)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Prioridade:</label>
                                      <p>{getPriorityBadge(selectedTask.priority)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status:</label>
                                      <p>{getStatusBadge(selectedTask.status)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Responsável:</label>
                                      <p>{selectedTask.assigned_to || 'Não atribuído'}</p>
                                    </div>
                                  </div>
                                  {selectedTask.license_plate && (
                                    <div>
                                      <label className="text-sm font-medium">Matrícula:</label>
                                      <p className="font-mono font-semibold">{selectedTask.license_plate}</p>
                                    </div>
                                  )}
                                  <div>
                                    <label className="text-sm font-medium">Notas:</label>
                                    <Textarea 
                                      placeholder="Adicionar notas..."
                                      defaultValue={selectedTask.notes}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredTasks.length === 0 && (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {tasks.length === 0 ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa corresponde aos filtros'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
