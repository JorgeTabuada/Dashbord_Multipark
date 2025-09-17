'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

export default function MonitorPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Testar conexão ao Firebase
  const testFirebase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-firebase')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  // Obter estatísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sync')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  // Tentar sincronizar manualmente
  const syncNow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' })
      })
      
      const data = await response.json()
      console.log('Resultado da sincronização:', data)
      
      // Atualizar estatísticas
      await fetchStats()
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testFirebase()
    fetchStats()
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 10000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Monitor de Sincronização</h1>
          <div className="flex gap-2">
            <Button onClick={testFirebase} disabled={loading}>
              <Database className="mr-2 h-4 w-4" />
              Testar Firebase
            </Button>
            <Button onClick={syncNow} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar Agora
            </Button>
          </div>
        </div>

        {/* Teste de Conexão */}
        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conexão Firebase</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro: {testResults.error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {testResults.connected ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span>Firebase: {testResults.connected ? 'Conectado' : 'Desconectado'}</span>
                  </div>
                  
                  {testResults.cities && (
                    <div>
                      <p className="font-medium">Cidades encontradas:</p>
                      <ul className="list-disc list-inside ml-4">
                        {testResults.cities.map((city: string) => (
                          <li key={city}>{city}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {testResults.sample && (
                    <div>
                      <p className="font-medium">Exemplo de reserva:</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(testResults.sample, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Firebase Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.firebase?.total || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Supabase Sincronizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.supabase?.synced || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold">
                  {stats.isRunning ? 'Sincronizando...' : 'Parado'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}
