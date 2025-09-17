'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react'

interface SyncResult {
  status: 'idle' | 'syncing' | 'completed' | 'error'
  message: string
  progress?: number
  details?: any
}

export default function AdminSyncPage() {
  const [syncResult, setSyncResult] = useState<SyncResult>({ status: 'idle', message: '' })
  const [lastSync, setLastSync] = useState<string>('')

  const handleSyncAll = async () => {
    setSyncResult({ status: 'syncing', message: 'Iniciando sincronização de todas as reservas...', progress: 0 })
    
    try {
      const response = await fetch('/api/sync/admin-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' })
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        setSyncResult({
          status: 'completed',
          message: `✅ Sincronização completa: ${result.summary.total_synced} reservas sincronizadas`,
          details: result
        })
        setLastSync(new Date().toLocaleString('pt-PT'))
      } else {
        setSyncResult({
          status: 'error',
          message: `❌ Erro: ${result.error || result.message}`
        })
      }
    } catch (error) {
      setSyncResult({
        status: 'error',
        message: `❌ Erro de conexão: ${error}`
      })
    }
  }

  const handleSyncLocation = async (city: string, brand: string) => {
    setSyncResult({ 
      status: 'syncing', 
      message: `Sincronizando ${city}/${brand}...`, 
      progress: 50 
    })
    
    try {
      const response = await fetch('/api/sync/admin-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_location', city, brand })
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        setSyncResult({
          status: 'completed',
          message: `✅ ${city}/${brand}: ${result.result.success} sucessos, ${result.result.errors} erros`
        })
        setLastSync(new Date().toLocaleString('pt-PT'))
      } else {
        setSyncResult({
          status: 'error',
          message: `❌ Erro em ${city}/${brand}: ${result.error}`
        })
      }
    } catch (error) {
      setSyncResult({
        status: 'error',
        message: `❌ Erro de conexão: ${error}`
      })
    }
  }

  const locations = [
    { city: 'lisbon', brand: 'airpark', count: 14919 },
    { city: 'lisbon', brand: 'redpark', count: 15695 },
    { city: 'faro', brand: 'airpark', count: 3012 },
    { city: 'porto', brand: 'redpark', count: 1548 },
    { city: 'porto', brand: 'airpark', count: 1118 },
    { city: 'lisbon', brand: 'skypark', count: 511 },
    { city: 'lisbon', brand: 'top-parking', count: 263 },
    { city: 'porto', brand: 'skypark', count: 202 },
    { city: 'faro', brand: 'skypark', count: 166 },
    { city: 'faro', brand: 'redpark', count: 122 },
    { city: 'lisbon', brand: 'lispark', count: 18 }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Database className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Sincronização Firebase ↔ Supabase</h1>
          <p className="text-gray-600">Controlo manual da sincronização de dados</p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {syncResult.status === 'syncing' && <Loader2 className="h-5 w-5 animate-spin" />}
            {syncResult.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {syncResult.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            Status da Sincronização
          </CardTitle>
          <CardDescription>
            {lastSync && `Última sincronização: ${lastSync}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncResult.message && (
            <div className="mb-4">
              <Badge 
                variant={
                  syncResult.status === 'completed' ? 'default' :
                  syncResult.status === 'error' ? 'destructive' : 
                  'secondary'
                }
              >
                {syncResult.message}
              </Badge>
            </div>
          )}
          
          {syncResult.status === 'syncing' && syncResult.progress !== undefined && (
            <Progress value={syncResult.progress} className="mb-4" />
          )}
          
          {syncResult.details?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {syncResult.details.summary.total_processed.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">Total Processadas</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {syncResult.details.summary.total_synced.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Sincronizadas</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {syncResult.details.summary.total_errors.toLocaleString()}
                </div>
                <div className="text-sm text-red-600">Erros</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">
                  {syncResult.details.summary.success_rate}
                </div>
                <div className="text-sm text-purple-600">Taxa de Sucesso</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sync All */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sincronização Completa</CardTitle>
            <CardDescription>
              Sincronizar todas as 37.574 reservas de todas as localizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSyncAll}
              disabled={syncResult.status === 'syncing'}
              className="w-full"
              size="lg"
            >
              {syncResult.status === 'syncing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sincronizar Tudo
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo das Localizações</CardTitle>
            <CardDescription>Total de reservas por localização</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {locations.reduce((sum, loc) => sum + loc.count, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-4">Total de Reservas</div>
              <div className="text-sm text-gray-500">
                {locations.length} localizações diferentes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location-specific sync */}
      <Card>
        <CardHeader>
          <CardTitle>Sincronização por Localização</CardTitle>
          <CardDescription>
            Sincronizar localizações específicas individualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {locations.map((location) => (
              <Button
                key={`${location.city}-${location.brand}`}
                variant="outline"
                onClick={() => handleSyncLocation(location.city, location.brand)}
                disabled={syncResult.status === 'syncing'}
                className="justify-between h-auto p-4"
              >
                <div className="text-left">
                  <div className="font-medium">
                    {location.city}/{location.brand}
                  </div>
                  <div className="text-sm text-gray-500">
                    {location.count.toLocaleString()} reservas
                  </div>
                </div>
                <RefreshCw className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}