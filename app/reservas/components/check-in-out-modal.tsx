'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Car, 
  Camera, 
  MapPin, 
  Gauge, 
  AlertTriangle, 
  Upload,
  X,
  CheckCircle,
  Info
} from "lucide-react"
import { ReservaEnhanced } from "@/hooks/use-reservas-enhanced"

interface CheckInOutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reserva: ReservaEnhanced | null
  type: 'checkin' | 'checkout'
  onConfirm: (dados: any) => Promise<boolean>
}

export function CheckInOutModal({
  open,
  onOpenChange,
  reserva,
  type,
  onConfirm
}: CheckInOutModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  
  // Estados do formulário
  const [kms, setKms] = useState('')
  const [danos, setDanos] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [fila, setFila] = useState('')
  const [lugar, setLugar] = useState('')
  const [fotos, setFotos] = useState<File[]>([])
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([])
  
  // Templates de danos comuns
  const danosComuns = [
    'Risco na porta do condutor',
    'Amolgadela no para-choques traseiro',
    'Vidro partido',
    'Espelho partido',
    'Pneu furado',
    'Interior sujo',
    'Cheiro a tabaco',
    'Falta tapete',
    'Luz de avaria acesa'
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newFotos = [...fotos, ...files].slice(0, 5) // Max 5 fotos
    setFotos(newFotos)
    
    // Criar previews
    const previews: string[] = []
    newFotos.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result as string)
        if (previews.length === newFotos.length) {
          setFotoPreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFoto = (index: number) => {
    const newFotos = fotos.filter((_, i) => i !== index)
    const newPreviews = fotoPreviews.filter((_, i) => i !== index)
    setFotos(newFotos)
    setFotoPreviews(newPreviews)
  }

  const handleSubmit = async () => {
    if (!kms || parseInt(kms) <= 0) {
      alert('Por favor insira a quilometragem')
      return
    }

    if (type === 'checkin' && (!fila || !lugar)) {
      alert('Por favor indique a localização do veículo')
      return
    }

    setLoading(true)
    
    const dados = type === 'checkin' ? {
      kms_entrada: parseInt(kms),
      danos: danos || undefined,
      fotos: fotos.length > 0 ? fotos : undefined,
      observacoes: observacoes || undefined,
      localizacao_fila: fila || undefined,
      localizacao_lugar: lugar || undefined
    } : {
      kms_saida: parseInt(kms),
      danos: danos || undefined,
      fotos: fotos.length > 0 ? fotos : undefined,
      observacoes: observacoes || undefined
    }

    const success = await onConfirm(dados)
    
    if (success) {
      // Limpar formulário
      setKms('')
      setDanos('')
      setObservacoes('')
      setFila('')
      setLugar('')
      setFotos([])
      setFotoPreviews([])
      onOpenChange(false)
    }
    
    setLoading(false)
  }

  if (!reserva) return null

  const isCheckIn = type === 'checkin'
  const title = isCheckIn ? 'Check-In do Veículo' : 'Check-Out do Veículo'
  const kmsLabel = isCheckIn ? 'Quilometragem de Entrada' : 'Quilometragem de Saída'
  const kmsAnterior = isCheckIn ? null : reserva.kms_entrada

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Veículo: <strong>{reserva.license_plate}</strong> | 
            Cliente: <strong>{reserva.name_cliente} {reserva.lastname_cliente}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info do veículo */}
          {(reserva.marca_veiculo || reserva.modelo_veiculo || reserva.cor_veiculo) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {reserva.marca_veiculo} {reserva.modelo_veiculo} - {reserva.cor_veiculo}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basico" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basico">Informações Básicas</TabsTrigger>
              <TabsTrigger value="danos">Danos e Observações</TabsTrigger>
              <TabsTrigger value="fotos">Fotos</TabsTrigger>
            </TabsList>

            <TabsContent value="basico" className="space-y-4">
              {/* Quilometragem */}
              <div className="space-y-2">
                <Label htmlFor="kms" className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  {kmsLabel} *
                </Label>
                <Input
                  id="kms"
                  type="number"
                  value={kms}
                  onChange={(e) => setKms(e.target.value)}
                  placeholder="Ex: 45000"
                  min="0"
                />
                {kmsAnterior && (
                  <p className="text-sm text-gray-500">
                    KMs na entrada: {kmsAnterior} 
                    {kms && parseInt(kms) > kmsAnterior && (
                      <span className="ml-2 font-medium text-blue-600">
                        (+{parseInt(kms) - kmsAnterior} KMs)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Localização (apenas para check-in) */}
              {isCheckIn && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Localização no Parque *
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fila" className="text-sm text-gray-600">Fila</Label>
                      <Select value={fila} onValueChange={setFila}>
                        <SelectTrigger id="fila">
                          <SelectValue placeholder="Selecione a fila" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A', 'B', 'C', 'D', 'E', 'F'].map(f => (
                            <SelectItem key={f} value={f}>Fila {f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lugar" className="text-sm text-gray-600">Lugar</Label>
                      <Input
                        id="lugar"
                        value={lugar}
                        onChange={(e) => setLugar(e.target.value)}
                        placeholder="Ex: 12"
                        type="number"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="danos" className="space-y-4">
              {/* Danos */}
              <div className="space-y-2">
                <Label htmlFor="danos" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Registo de Danos
                </Label>
                <Textarea
                  id="danos"
                  value={danos}
                  onChange={(e) => setDanos(e.target.value)}
                  placeholder="Descreva quaisquer danos encontrados no veículo..."
                  rows={4}
                />
                
                {/* Templates de danos */}
                <div className="flex flex-wrap gap-2">
                  <p className="text-sm text-gray-500 w-full">Danos comuns:</p>
                  {danosComuns.map(dano => (
                    <Button
                      key={dano}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDanos(prev => prev ? `${prev}\n- ${dano}` : `- ${dano}`)}
                    >
                      {dano}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="obs">Observações Gerais</Label>
                <Textarea
                  id="obs"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Outras observações relevantes..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="fotos" className="space-y-4">
              {/* Upload de fotos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Fotografias do Veículo
                </Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  
                  {fotoPreviews.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 text-center hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Clique para adicionar fotos (máx. 5)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG ou GIF até 5MB cada
                      </p>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {fotoPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeFoto(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        
                        {fotoPreviews.length < 5 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center"
                          >
                            <Camera className="h-6 w-6 text-gray-400" />
                            <span className="text-sm text-gray-600 mt-1">Adicionar</span>
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        {fotos.length} foto(s) selecionada(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Alertas importantes */}
          {!isCheckIn && kms && reserva.kms_entrada && parseInt(kms) - reserva.kms_entrada > 200 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Foram percorridos mais de 200km. 
                Será cobrado €0.15 por km extra (Total extra: €{((parseInt(kms) - reserva.kms_entrada - 200) * 0.15).toFixed(2)})
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !kms || (isCheckIn && (!fila || !lugar))}
          >
            {loading ? 'A processar...' : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar {isCheckIn ? 'Check-In' : 'Check-Out'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
