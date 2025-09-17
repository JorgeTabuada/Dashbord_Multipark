"use client"

import Layout from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Camera } from "lucide-react"

export default function PerdidosAchados() {
  const mockCases = [
    {
      id: 1,
      date: "2025-01-15",
      location: "Lisboa - Setor A",
      item: "Carteira de couro",
      status: "Aberto",
      reporter: "João Silva",
    },
    {
      id: 2,
      date: "2025-01-14",
      location: "Porto - Receção",
      item: "Chaves de carro",
      status: "Investigação",
      reporter: "Maria Santos",
    },
    {
      id: 3,
      date: "2025-01-13",
      location: "Faro - Parque Coberto",
      item: "Telemóvel Samsung",
      status: "Resolvido",
      reporter: "Pedro Costa",
    },
  ]

  return (
    <Layout title="Perdidos & Achados">
      <div className="space-y-6">
        {/* New Case Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Registar Novo Caso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data do Incidente:</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Localização:</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lisboa-a">Lisboa - Setor A</SelectItem>
                    <SelectItem value="lisboa-b">Lisboa - Setor B</SelectItem>
                    <SelectItem value="lisboa-recepcao">Lisboa - Receção</SelectItem>
                    <SelectItem value="porto-a">Porto - Setor A</SelectItem>
                    <SelectItem value="porto-recepcao">Porto - Receção</SelectItem>
                    <SelectItem value="faro-coberto">Faro - Parque Coberto</SelectItem>
                    <SelectItem value="faro-descoberto">Faro - Parque Descoberto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Descrição do Item:</label>
                <Textarea placeholder="Descreva detalhadamente o item perdido ou encontrado..." rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado do Caso:</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="investigacao">Investigação</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagens/Documentos:</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    className="hidden"
                    id="attachments-upload"
                  />
                  <label htmlFor="attachments-upload" className="cursor-pointer">
                    <Camera className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Clique para anexar ficheiros</p>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Registar Caso</Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <p className="text-sm text-gray-600">Casos Abertos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <p className="text-sm text-gray-600">Em Investigação</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">1</div>
              <p className="text-sm text-gray-600">Resolvidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-600">3</div>
              <p className="text-sm text-gray-600">Total de Casos</p>
            </CardContent>
          </Card>
        </div>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Casos</span>
              <div className="flex gap-2">
                <Input placeholder="Pesquisar..." className="w-64" />
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCases.map((case_) => (
                  <TableRow key={case_.id}>
                    <TableCell>#{case_.id}</TableCell>
                    <TableCell>{case_.date}</TableCell>
                    <TableCell>{case_.location}</TableCell>
                    <TableCell>{case_.item}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          case_.status === "Aberto"
                            ? "bg-red-100 text-red-800"
                            : case_.status === "Investigação"
                              ? "bg-yellow-100 text-yellow-800"
                              : case_.status === "Resolvido"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {case_.status}
                      </span>
                    </TableCell>
                    <TableCell>{case_.reporter}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
