'use client'

import { useState } from 'react'
import Layout from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function DebugSyncPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testFirebase = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' })
      })
      
      const data = await response.json()
      setResults(data)
      
      if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const forceSyncAll = async () => {
    if (!confirm('Isto vai forçar a sincronização de TODAS as reservas. Continuar?')) {
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_force' })
      })
      
      const data = await response.json()
      setResults(data)
      
      if (data.error) {
        setError(data.error)
      } else {
        alert(`Sincronização completa!\n\nTotal: ${data.total}\nSincronizadas: ${data.synced}\nErros: ${data.errors}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const checkSupabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/supabase/check', {
        method: 'GET'
      })
      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Debug - Sincronização Firebase</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={testFirebase} 
            disabled={loading}
            variant="outline"
            className="h-24"
          >
            <div className="flex flex-col items-center gap-2">
              <Database className="h-8 w-8" />
              <span>Testar Firebase</span>
            </div>
          </Button>

          <Button 
            onClick={forceSyncAll} 
            disabled={loading}
            variant="default"
            className="h-24"
          >
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className={`h-8 w-8 ${loading ? 'animate-spin' : ''}`} />
              <span>Forçar Sincronização</span>
            </div>
          </Button>

          <Button 
            onClick={checkSupabase} 
            disabled={loading}
            variant="outline"
            className="h-24"
          >
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8" />
              <span>Verificar Supabase</span>
            </div>
          </Button>
        </div>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {results.collections && Object.keys(results.collections).length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-bold">Coleções encontradas no Firebase:</h3>
                  {Object.entries(results.collections).map(([name, data]: [string, any]) => (
                    <div key={name} className="border-l-4 border-blue-500 pl-4">
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.count} documentos encontrados
                      </p>
                      {data.sample && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600">
                            Ver exemplo
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(data.sample, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                  
                  {results.syncResult && (
                    <div className="mt-4 p-4 bg-green-50 rounded">
                      <h4 className="font-bold text-green-800">Resultado da Sincronização:</h4>
                      <p>Total: {results.syncResult.total}</p>
                      <p>Sincronizadas: {results.syncResult.synced}</p>
                      <p>Erros: {results.syncResult.errors}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-600">Nenhuma coleção encontrada no Firebase!</p>
                  <p className="text-sm mt-2">Possíveis problemas:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Permissões do Firebase</li>
                    <li>Estrutura diferente dos dados</li>
                    <li>Necessita autenticação</li>
                  </ul>
                </div>
              )}
              
              {results.errorDetails && results.errorDetails.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 rounded">
                  <h4 className="font-bold text-red-800">Erros detalhados:</h4>
                  {results.errorDetails.map((err: any, i: number) => (
                    <p key={i} className="text-xs">
                      {err.id}: {err.error}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
