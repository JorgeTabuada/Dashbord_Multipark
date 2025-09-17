"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react"

interface Park {
  id: string
  name: string
  city: string
  covered_capacity: number
  uncovered_capacity: number
}

interface CapacityAdminProps {
  parks: Park[]
  onCapacityUpdated: () => void
}

export default function CapacityAdmin({ parks, onCapacityUpdated }: CapacityAdminProps) {
  const [selectedParkId, setSelectedParkId] = useState<string>("")
  const [coveredCapacity, setCoveredCapacity] = useState<string>("")
  const [uncoveredCapacity, setUncoveredCapacity] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleParkSelect = (parkId: string) => {
    setSelectedParkId(parkId)
    const park = parks.find(p => p.id === parkId)
    if (park) {
      setCoveredCapacity(park.covered_capacity.toString())
      setUncoveredCapacity(park.uncovered_capacity.toString())
    } else {
      setCoveredCapacity("")
      setUncoveredCapacity("")
    }
    setMessage(null)
  }

  const handleSave = async () => {
    if (!selectedParkId) {
      setMessage({ type: 'error', text: 'Selecione um parque para atualizar.' })
      return
    }

    const coveredNum = parseInt(coveredCapacity)
    const uncoveredNum = parseInt(uncoveredCapacity)

    if (isNaN(coveredNum) || isNaN(uncoveredNum) || coveredNum < 0 || uncoveredNum < 0) {
      setMessage({ type: 'error', text: 'Valores de capacidade inválidos.' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      // TODO: Replace with actual Supabase call
      // const { error } = await supabase
      //   .from('parks')
      //   .update({
      //     covered_capacity: coveredNum,
      //     uncovered_capacity: uncoveredNum,
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', selectedParkId)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMessage({ type: 'success', text: 'Capacidade atualizada com sucesso!' })
      onCapacityUpdated()
      
      // Clear form after delay
      setTimeout(() => {
        setMessage(null)
      }, 3000)

    } catch (error) {
      console.error('Error updating capacity:', error)
      setMessage({ type: 'error', text: 'Erro ao atualizar capacidade.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Gerir Capacidade dos Parques (Admin)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selecionar Parque
            </label>
            <Select value={selectedParkId} onValueChange={handleParkSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um parque" />
              </SelectTrigger>
              <SelectContent>
                {parks.map((park) => (
                  <SelectItem key={park.id} value={park.id}>
                    {park.name} ({park.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Lugares Cobertos Totais
            </label>
            <Input
              type="number"
              min="0"
              value={coveredCapacity}
              onChange={(e) => setCoveredCapacity(e.target.value)}
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Lugares Descobertos Totais
            </label>
            <Input
              type="number"
              min="0"
              value={uncoveredCapacity}
              onChange={(e) => setUncoveredCapacity(e.target.value)}
              placeholder="0"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleSave}
              disabled={saving || !selectedParkId}
              className="w-full"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  A guardar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Capacidade
                </>
              )}
            </Button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}