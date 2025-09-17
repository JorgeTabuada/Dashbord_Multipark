'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Database, RefreshCw, PlayCircle, StopCircle, 
  CheckCircle, AlertCircle, Clock, Activity,
  Download, Upload, Zap, Globe
} from 'lucide-react'

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [realtimeActive, setRealtimeActive] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    synced: 0,
    pending: 0,
    lastSync: null
  })
  const [logs, setLogs] = useState<any[]>([])
  const [progress, setProgress] = useState(0)

  // Localizações disponíveis
  const locations = [
    { city: 'Lisboa', brand: 'ParkVia' },
    { city: 'Porto', brand: 'ParkVia' },
    { city: 'Faro', brand: 'ParkVia' },
    { city: 'Lisboa', brand: 'LowCostParking' },
    { city: 'Porto', brand: 'LowCostParking' }
  ]

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/sync/firebase')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const syncAll = async () => {
    setSyncing(true)
    setProgress(0)
    
    try {
      const totalLocations = locations.length
      
      for (let i = 0; i < totalLocations; i++) {
        const location = locations[i]
        
        addLog(`🔄 Sincronizando ${location.city}/${location.brand}...`)
        
        const response = await fetch('/api/sync/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_single',
            city: location.city,
            brand: location.brand
          })
        })

        if (response.ok) {
          addLog(`✅ ${location.city}/${location.brand} sincronizado`)
        } else {
          addLog(`❌ Erro em ${location.city}/${location.brand}`)
        }

        setProgress(((i + 1) / totalLocations) * 100)
      }

      await loadStats()
      addLog('🎉 Sincronização completa!')
      
    } catch (error) {
      console.error('Erro na sincronização:', error)
      addLog('❌ Erro na sincronização')
    } finally {
      setSyncing(false)
      setProgress(0)
    }
  }

  const toggleRealtime = async () => {
    try {
      if (realtimeActive) {
        // Parar sincronização em tempo real
        await fetch('/api/sync/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop_realtime' })
        })
        
        setRealtimeActive(false)
        addLog('🛑 Sincronização em tempo real parada')
      } else {
        // Iniciar para todas as localizações
        for (const location of locations) {
          await fetch('/api/sync/firebase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'start_realtime',
              city: location.city,
              brand: location.brand
            })
          })
        }
        
        setRealtimeActive(true)
        addLog('⚡ Sincronização em tempo real iniciada')
      }
    } catch (error) {
      console.error('Erro ao alternar tempo real:', error)
    }
  }

  const addLog = (message: string) => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString('pt-PT'),
      message
    }, ...prev].slice(0, 50)) // Manter apenas os últimos 50 logs
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Sincronização Firebase → Supabase</h1>
          <div className="flex gap-2">
            <Button 
              onClick={toggleRealtime}
              variant={realtimeActive ? "destructive" : "default"}
            >
              {realtimeActive ? (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Parar Tempo Real
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Iniciar Tempo Real
                </>
              )}
            </Button>
            <Button onClick={syncAll} disabled={syncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar Tudo
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                No Supabase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.synced}</div>
              <p className="text-xs text-muted-foreground">
                Do Firebase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                A sincronizar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {realtimeActive ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Zap className="mr-1 h-3 w-3" />
                    Tempo Real Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Manual
                  </Badge>
                )}
              </div>
              {stats.lastSync && (
                <p className="text-xs text-muted-foreground mt-1">
                  Última: {new Date(stats.lastSync).toLocaleString('pt-PT')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {syncing && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Sincronização</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="locations">
          <TabsList>
            <TabsTrigger value="locations">Localizações</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Localizações Configuradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((loc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{loc.city}</p>
                          <p className="text-sm text-muted-foreground">{loc.brand}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          setSyncing(true)
                          addLog(`🔄 Sincronizando ${loc.city}/${loc.brand}...`)
                          
                          try {
                            const response = await fetch('/api/sync/firebase', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                action: 'sync_single',
                                city: loc.city,
                                brand: loc.brand
                              })
                            })
                            
                            if (response.ok) {
                              addLog(`✅ ${loc.city}/${loc.brand} sincronizado`)
                              await loadStats()
                            }
                          } catch (error) {
                            addLog(`❌ Erro em ${loc.city}/${loc.brand}`)
                          } finally {
                            setSyncing(false)
                          }
                        }}
                        disabled={syncing}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Sincronizar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Sincronização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Sem logs ainda
                    </p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="flex gap-3 text-sm font-mono p-2 hover:bg-gray-50 rounded">
                        <span className="text-muted-foreground">{log.timestamp}</span>
                        <span>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Sincronização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    A sincronização automática irá buscar novas reservas do Firebase a cada 30 segundos quando ativada.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sincronização em Tempo Real</p>
                      <p className="text-sm text-muted-foreground">
                        Sincroniza automaticamente novas reservas
                      </p>
                    </div>
                    <Badge variant={realtimeActive ? "default" : "outline"}>
                      {realtimeActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Intervalo de Sincronização</p>
                      <p className="text-sm text-muted-foreground">
                        Tempo entre verificações
                      </p>
                    </div>
                    <Badge variant="outline">30 segundos</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Modo de Sincronização</p>
                      <p className="text-sm text-muted-foreground">
                        Incremental ou completo
                      </p>
                    </div>
                    <Badge variant="outline">Incremental</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
