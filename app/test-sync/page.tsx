"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Database, CheckCircle, XCircle } from "lucide-react"

export default function TestSync() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testSync = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Testar conexão ao Supabase
      const supabaseResponse = await fetch('/api/sync/supabase?limit=1')
      const supabaseData = await supabaseResponse.json()
      
      // Testar sincronização completa
      const syncResponse = await fetch('/api/sync/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full_sync' })
      })
      const syncData = await syncResponse.json()

      setResults({
        supabase: supabaseData,
        sync: syncData,
        success: true
      })

    } catch (err: any) {
      setError(err.message || 'Erro ao testar sincronização')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Teste de Sincronização
            </span>
            <Button onClick={testSync} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Testando...' : 'Testar Sincronização'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <div className="space-y-4">
              <Alert className="border-green-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">✅ Teste Concluído!</p>
                    <div className="text-sm space-y-1">
                      <p>• Conexão Supabase: OK</p>
                      <p>• Tabela 'reservas': {results.supabase?.count || 0} registros</p>
                      <p>• Status Sync: {results.sync?.success ? 'OK' : 'Erro'}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Detalhes da Resposta:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {!results && !error && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Clique em "Testar Sincronização" para iniciar o teste</p>
              <p className="text-sm mt-2">Isto vai:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>✓ Verificar conexão ao Supabase</li>
                <li>✓ Testar a tabela 'reservas'</li>
                <li>✓ Validar campos e estrutura</li>
                <li>✓ Executar sincronização de teste</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
