"use client"

import { useState, useCallback } from 'react'

export interface OccupationData {
  covered_occupied: number
  uncovered_occupied: number
  covered_capacity: number
  uncovered_capacity: number
  date: string
  park_id: string
}

export interface DailyOccupation {
  [date: string]: {
    covered_occupied: number
    uncovered_occupied: number
  }
}

export function useOccupation() {
  const [occupation, setOccupation] = useState<OccupationData | null>(null)
  const [dailyOccupation, setDailyOccupation] = useState<DailyOccupation>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOccupationForDate = useCallback(async (parkId: string, date: string) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call - replace with actual Supabase logic
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock calculation based on park capacity and random occupancy
      const mockOccupation: OccupationData = {
        park_id: parkId,
        date: date,
        covered_capacity: parkId === "1" ? 50 : 30,
        uncovered_capacity: parkId === "1" ? 100 : 80,
        covered_occupied: Math.floor(Math.random() * (parkId === "1" ? 50 : 30)),
        uncovered_occupied: Math.floor(Math.random() * (parkId === "1" ? 100 : 80))
      }

      setOccupation(mockOccupation)
    } catch (err) {
      console.error('Error loading occupation:', err)
      setError('Erro ao carregar dados de ocupação')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadOccupationForRange = useCallback(async (
    parkId: string, 
    startDate: string, 
    endDate: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call for date range
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const rangeOccupation: DailyOccupation = {}
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      // Generate mock data for each day in range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        rangeOccupation[dateStr] = {
          covered_occupied: Math.floor(Math.random() * (parkId === "1" ? 50 : 30)),
          uncovered_occupied: Math.floor(Math.random() * (parkId === "1" ? 100 : 80))
        }
      }

      setDailyOccupation(rangeOccupation)
    } catch (err) {
      console.error('Error loading range occupation:', err)
      setError('Erro ao carregar dados do calendário')
    } finally {
      setLoading(false)
    }
  }, [])

  const calculateOccupationLevel = useCallback((
    occupied: number, 
    capacity: number
  ): 'low' | 'medium' | 'high' | 'full' => {
    if (capacity === 0) return 'low'
    const percentage = (occupied / capacity) * 100
    
    if (percentage >= 95) return 'full'
    if (percentage >= 80) return 'high' 
    if (percentage >= 50) return 'medium'
    return 'low'
  }, [])

  const getOccupationColor = useCallback((level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 border-green-300'
      case 'medium': return 'bg-yellow-100 border-yellow-300'
      case 'high': return 'bg-orange-100 border-orange-300'
      case 'full': return 'bg-red-100 border-red-300'
      default: return 'bg-gray-100 border-gray-300'
    }
  }, [])

  return {
    occupation,
    dailyOccupation,
    loading,
    error,
    loadOccupationForDate,
    loadOccupationForRange,
    calculateOccupationLevel,
    getOccupationColor
  }
}