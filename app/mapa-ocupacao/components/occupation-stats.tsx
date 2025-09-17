"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Car, Shield, Sun, Calendar } from "lucide-react"
import { OccupationData } from "../hooks/use-occupation"

interface Park {
  id: string
  name: string
  city: string
  covered_capacity: number
  uncovered_capacity: number
}

interface OccupationStatsProps {
  park: Park
  date: string
  occupation: OccupationData | null
  loading: boolean
}

export default function OccupationStats({ park, date, occupation, loading }: OccupationStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!occupation) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Selecione um parque e data para ver a ocupação
        </CardContent>
      </Card>
    )
  }

  const coveredPercentage = occupation.covered_capacity > 0 
    ? Math.round((occupation.covered_occupied / occupation.covered_capacity) * 100)
    : 0

  const uncoveredPercentage = occupation.uncovered_capacity > 0
    ? Math.round((occupation.uncovered_occupied / occupation.uncovered_capacity) * 100)
    : 0

  const totalOccupied = occupation.covered_occupied + occupation.uncovered_occupied
  const totalCapacity = occupation.covered_capacity + occupation.uncovered_capacity
  const totalPercentage = totalCapacity > 0 
    ? Math.round((totalOccupied / totalCapacity) * 100)
    : 0

  const getOccupationLevel = (percentage: number) => {
    if (percentage >= 95) return { label: 'Cheio', color: 'destructive' as const }
    if (percentage >= 80) return { label: 'Alto', color: 'destructive' as const }
    if (percentage >= 50) return { label: 'Médio', color: 'secondary' as const }
    return { label: 'Baixo', color: 'default' as const }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Car className="w-5 h-5" />
                {park.name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDate(date)}
              </p>
            </div>
            <Badge variant={getOccupationLevel(totalPercentage).color}>
              Ocupação {getOccupationLevel(totalPercentage).label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Covered Spaces */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Lugares Cobertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold">{occupation.covered_occupied}</span>
                <span className="text-gray-600">/ {occupation.covered_capacity}</span>
              </div>
              
              <Progress value={coveredPercentage} className="h-2" />
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{coveredPercentage}% Ocupado</span>
                <span>{Math.max(0, occupation.covered_capacity - occupation.covered_occupied)} Livres</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uncovered Spaces */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="w-4 h-4" />
              Lugares Descobertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold">{occupation.uncovered_occupied}</span>
                <span className="text-gray-600">/ {occupation.uncovered_capacity}</span>
              </div>
              
              <Progress value={uncoveredPercentage} className="h-2" />
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{uncoveredPercentage}% Ocupado</span>
                <span>{Math.max(0, occupation.uncovered_capacity - occupation.uncovered_occupied)} Livres</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="w-4 h-4" />
              Total Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold">{totalOccupied}</span>
                <span className="text-gray-600">/ {totalCapacity}</span>
              </div>
              
              <Progress value={totalPercentage} className="h-2" />
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{totalPercentage}% Ocupado</span>
                <span>{Math.max(0, totalCapacity - totalOccupied)} Livres</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}