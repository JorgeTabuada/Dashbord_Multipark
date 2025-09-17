"use client"

import { useState } from "react"
import Layout from "@/components/layout"
import ExcelUpload from "@/components/excel-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Filter, Edit, Trash2 } from "lucide-react"
import { useExpenses, Expense } from "@/hooks/use-expenses"

export default function Despesas() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense, stats } = useExpenses()
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '',
    amount: '',
    method: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const expenseData = {
      date: formData.date,
      type: formData.type,
      amount: parseFloat(formData.amount),
      method: formData.method,
      description: formData.description,
      status: 'Pendente' as const
    }

    let result
    if (editingExpense) {
      result = await updateExpense(editingExpense.id!, expenseData)
    } else {
      result = await addExpense(expenseData)
    }

    if (result.success) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: '',
        amount: '',
        method: '',
        description: ''
      })
      setShowForm(false)
      setEditingExpense(null)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      date: expense.date,
      type: expense.type,
      amount: expense.amount.toString(),
      method: expense.method,
      description: expense.description
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tens a certeza que queres eliminar esta despesa?')) {
      await deleteExpense(id)
    }
  }

  if (loading) {
    return (
      <Layout title="Gestão de Despesas">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">A carregar...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Gestão de Despesas">
      <div className="space-y-6">
        {/* Upload de Excel */}
        <ExcelUpload />

        {/* Botão para mostrar/esconder form */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        )}

        {/* Add Expense Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editingExpense ? 'Editar Despesa' : 'Registar Nova Despesa'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data:</label>
                    <Input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Despesa:</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="combustivel">Combustível</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor (€):</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Método de Pagamento:</label>
                    <Select value={formData.method} onValueChange={(value) => setFormData({...formData, method: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="numerario">Numerário</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Descrição:</label>
                    <Input 
                      placeholder="Descrição da despesa"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingExpense ? 'Atualizar' : 'Registar'} Despesa
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false)
                      setEditingExpense(null)
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        type: '',
                        amount: '',
                        method: '',
                        description: ''
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">€{stats.total.toFixed(2)}</div>
              <p className="text-sm text-gray-600">Total Este Mês</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">€{stats.approved.toFixed(2)}</div>
              <p className="text-sm text-gray-600">Aprovadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">€{stats.pending.toFixed(2)}</div>
              <p className="text-sm text-gray-600">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.count}</div>
              <p className="text-sm text-gray-600">Total Registos</p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Despesas</span>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma despesa encontrada. Adiciona a primeira!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString('pt-PT')}</TableCell>
                      <TableCell>{expense.type}</TableCell>
                      <TableCell>€{expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{expense.method}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            expense.status === "Aprovada"
                              ? "bg-green-100 text-green-800"
                              : expense.status === "Rejeitada"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {expense.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(expense.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
