'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, MessageSquare, Star, TrendingUp, Users, MessageCircle } from 'lucide-react'
import Layout from "@/components/layout"

export default function ComentariosReclamacoesPage() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')
  
  // Formulário para nova reclamação
  const [newComment, setNewComment] = useState({
    nome_cliente: '',
    contacto_cliente: '',
    matricula_veiculo: '',
    tipo_reclamacao: 'comentario',
    descricao_reclamacao: '',
    origem_reclamacao: 'website',
    estado_reclamacao: 'Aberta'
  })

  useEffect(() => {
    loadComments()
  }, [])

  const loadComments = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('comentarios_reclamacoes')
        .select(`
          *,
          reserva_id (
            booking_id,
            license_plate,
            name_cliente,
            email_cliente
          )
        `)
        .order('data_reclamacao', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Erro ao carregar comentários:', error)
      } else {
        setComments(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('comentarios_reclamacoes')
        .insert([{
          ...newComment,
          data_reclamacao: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      // Limpar formulário
      setNewComment({
        nome_cliente: '',
        contacto_cliente: '',
        matricula_veiculo: '',
        tipo_reclamacao: 'comentario',
        descricao_reclamacao: '',
        origem_reclamacao: 'website',
        estado_reclamacao: 'Aberta'
      })

      // Recarregar lista
      await loadComments()
    } catch (error) {
      console.error('Erro ao guardar:', error)
      alert('Erro ao guardar comentário/reclamação')
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('comentarios_reclamacoes')
        .update({ 
          estado_reclamacao: newStatus,
          data_resolucao: newStatus === 'Fechada' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error
      
      await loadComments()
    } catch (error) {
      console.error('Erro ao atualizar estado:', error)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Aberta': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
      'Em Progresso': { color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="w-3 h-3" /> },
      'Fechada': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> }
    }
    
    const config = statusConfig[status] || statusConfig['Aberta']
    
    return (
      <Badge className={config.color}>
        <span className="flex items-center gap-1">
          {config.icon}
          {status}
        </span>
      </Badge>
    )
  }

  const getTypeLabel = (tipo) => {
    const types = {
      'comentario': 'Comentário',
      'reclamacao': 'Reclamação',
      'sugestao': 'Sugestão',
      'elogio': 'Elogio'
    }
    return types[tipo] || tipo
  }

  const filteredComments = comments.filter(comment => {
    const matchesSearch = searchTerm === '' || 
      comment.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.matricula_veiculo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.descricao_reclamacao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'todos' || comment.tipo_reclamacao === filterType
    
    return matchesSearch && matchesType
  })

  // Estatísticas
  const stats = {
    total: comments.length,
    abertas: comments.filter(c => c.estado_reclamacao === 'Aberta').length,
    emProgresso: comments.filter(c => c.estado_reclamacao === 'Em Progresso').length,
    fechadas: comments.filter(c => c.estado_reclamacao === 'Fechada').length
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Comentários e Reclamações</h1>
          <Button onClick={loadComments} variant="outline">
            Atualizar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Abertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.abertas}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.emProgresso}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fechadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.fechadas}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lista">
          <TabsList>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="novo">Nova Entrada</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Pesquisar por nome, matrícula ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="comentario">Comentários</SelectItem>
                      <SelectItem value="reclamacao">Reclamações</SelectItem>
                      <SelectItem value="sugestao">Sugestões</SelectItem>
                      <SelectItem value="elogio">Elogios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Comentários */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p>Carregando...</p>
                  </CardContent>
                </Card>
              ) : filteredComments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum comentário encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                filteredComments.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {comment.nome_cliente || 'Cliente Anónimo'}
                          </CardTitle>
                          <CardDescription>
                            {comment.matricula_veiculo && (
                              <span className="mr-3">Matrícula: {comment.matricula_veiculo}</span>
                            )}
                            {comment.contacto_cliente && (
                              <span>Contacto: {comment.contacto_cliente}</span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {getTypeLabel(comment.tipo_reclamacao)}
                          </Badge>
                          {getStatusBadge(comment.estado_reclamacao)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{comment.descricao_reclamacao}</p>
                      
                      {comment.detalhes_resolucao && (
                        <div className="bg-gray-50 p-3 rounded mt-3">
                          <p className="text-sm font-medium">Resolução:</p>
                          <p className="text-sm">{comment.detalhes_resolucao}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.data_reclamacao).toLocaleString('pt-PT')}
                        </span>
                        
                        {comment.estado_reclamacao !== 'Fechada' && (
                          <div className="flex gap-2">
                            {comment.estado_reclamacao === 'Aberta' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(comment.id, 'Em Progresso')}
                              >
                                Iniciar Análise
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(comment.id, 'Fechada')}
                            >
                              Fechar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="novo">
            <Card>
              <CardHeader>
                <CardTitle>Registar Novo Comentário/Reclamação</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome do Cliente</label>
                      <Input
                        value={newComment.nome_cliente}
                        onChange={(e) => setNewComment({...newComment, nome_cliente: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Contacto</label>
                      <Input
                        value={newComment.contacto_cliente}
                        onChange={(e) => setNewComment({...newComment, contacto_cliente: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Matrícula</label>
                      <Input
                        value={newComment.matricula_veiculo}
                        onChange={(e) => setNewComment({...newComment, matricula_veiculo: e.target.value})}
                        placeholder="XX-XX-XX"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <Select 
                        value={newComment.tipo_reclamacao} 
                        onValueChange={(value) => setNewComment({...newComment, tipo_reclamacao: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comentario">Comentário</SelectItem>
                          <SelectItem value="reclamacao">Reclamação</SelectItem>
                          <SelectItem value="sugestao">Sugestão</SelectItem>
                          <SelectItem value="elogio">Elogio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={newComment.descricao_reclamacao}
                      onChange={(e) => setNewComment({...newComment, descricao_reclamacao: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Guardar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
