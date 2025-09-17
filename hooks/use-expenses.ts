"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Expense {
  id?: number
  date: string
  type: string
  amount: number
  method: string
  description: string
  status: 'Pendente' | 'Aprovada' | 'Rejeitada'
  created_at?: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todas as despesas
  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setExpenses(data || [])
    } catch (err) {
      console.error('Erro ao buscar despesas:', err)
      setError('Erro ao carregar despesas')
    } finally {
      setLoading(false)
    }
  }

  // Adicionar nova despesa
  const addExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expense,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      if (data) {
        setExpenses(prev => [data[0], ...prev])
      }

      return { success: true, data }
    } catch (err) {
      console.error('Erro ao adicionar despesa:', err)
      return { success: false, error: 'Erro ao adicionar despesa' }
    }
  }

  // Atualizar despesa
  const updateExpense = async (id: number, updates: Partial<Expense>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      if (data) {
        setExpenses(prev => 
          prev.map(expense => 
            expense.id === id ? { ...expense, ...data[0] } : expense
          )
        )
      }

      return { success: true, data }
    } catch (err) {
      console.error('Erro ao atualizar despesa:', err)
      return { success: false, error: 'Erro ao atualizar despesa' }
    }
  }

  // Eliminar despesa
  const deleteExpense = async (id: number) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setExpenses(prev => prev.filter(expense => expense.id !== id))

      return { success: true }
    } catch (err) {
      console.error('Erro ao eliminar despesa:', err)
      return { success: false, error: 'Erro ao eliminar despesa' }
    }
  }

  // Estatísticas
  const getStats = () => {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear
    })

    const total = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const approved = thisMonthExpenses
      .filter(expense => expense.status === 'Aprovada')
      .reduce((sum, expense) => sum + expense.amount, 0)
    const pending = thisMonthExpenses
      .filter(expense => expense.status === 'Pendente')
      .reduce((sum, expense) => sum + expense.amount, 0)

    return {
      total,
      approved,
      pending,
      count: thisMonthExpenses.length
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
    stats: getStats()
  }
}
