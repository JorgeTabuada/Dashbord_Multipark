"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Loader2, RefreshCw, Database } from "lucide-react"
import { getAvailableApps, groupAppsBySection } from "@/lib/permissions"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

interface Reservation {
  id_pk: string
  booking_id?: string
  cidade_cliente?: string
  license_plate: string
  name_cliente?: string
  lastname_cliente?: string
  estado_reserva_atual: string
  booking_price?: number
  total_price?: number
  check_in_previsto?: string
  check_out_previsto?: string
  check_in_real?: string
  check_out_real?: string
  parque_id?: string
  created_at_db: string
  updated_at_db: string
}

interface DashboardStats {
  // Hoje
  todayCheckIns: number
  todayCheckOuts: number
  todayRevenue: number
  todayNewReservations: number
  
  // Operacional
  carsInPark: number
  pendingPickups: number
  pendingDeliveries: number
  occupancyRate: number
  
  // Financeiro
  monthRevenue: number
  monthGrowth: number
  avgTicket: number
  pendingPayments: number
  
  // Status
  activeReservations: number
  completedToday: number
  canceledToday: number
  
  // Alertas
  alerts: {
    type: 'warning' | 'error' | 'info'
    message: string
  }[]
}

interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error'
  message: string
  lastSync?: string
  totalReservations?: number
  syncedCount?: number
}

export default function Dashboard() {
  const { user, loading, signOut, updateSelectedPark } = useAuth()
  const [availableApps, setAvailableApps] = useState<any>({})
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ 
    status: 'idle', 
    message: 'Clique em Sincronizar para atualizar dados do Firebase' 
  })
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/")
      return
    }

    // Get available apps for user role
    if (user) {
      const apps = getAvailableApps(user.role)
      const groupedApps = groupAppsBySection(apps)
      setAvailableApps(groupedApps)
      loadDashboard()
    }
  }, [user, loading, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Atualizar a cada minuto
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboard = async () => {
    try {      
      const response = await fetch('/api/sync/supabase?limit=1000')
      if (response.ok) {
        const data = await response.json()
        const allReservations = data.data || []
        setReservations(allReservations)
        
        // Calcular estatísticas
        const stats = calculateDashboardStats(allReservations)
        setStats(stats)
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    }
  }

  const calculateDashboardStats = (reservations: Reservation[]): DashboardStats => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Filtrar reservas de hoje
    const todayReservations = reservations.filter(r => {
      const checkIn = r.check_in_previsto ? new Date(r.check_in_previsto) : null
      const checkOut = r.check_out_previsto ? new Date(r.check_out_previsto) : null
      return (checkIn && checkIn >= today && checkIn < new Date(today.getTime() + 24 * 60 * 60 * 1000)) ||
             (checkOut && checkOut >= today && checkOut < new Date(today.getTime() + 24 * 60 * 60 * 1000))
    })
    
    // Reservas do mês
    const monthReservations = reservations.filter(r => 
      new Date(r.created_at_db) >= monthStart
    )
    
    // Calcular métricas
    const todayCheckIns = todayReservations.filter(r => {
      const checkIn = r.check_in_previsto ? new Date(r.check_in_previsto) : null
      return checkIn && checkIn >= today
    }).length
    
    const todayCheckOuts = todayReservations.filter(r => {
      const checkOut = r.check_out_previsto ? new Date(r.check_out_previsto) : null
      return checkOut && checkOut >= today
    }).length
    
    const todayRevenue = todayReservations.reduce((sum, r) => 
      sum + (r.total_price || r.booking_price || 0), 0
    )
    
    const carsInPark = reservations.filter(r => 
      r.estado_reserva_atual === 'recolhido'
    ).length
    
    const pendingPickups = reservations.filter(r => 
      ['reservado', 'em_recolha'].includes(r.estado_reserva_atual)
    ).length
    
    const pendingDeliveries = reservations.filter(r => 
      r.estado_reserva_atual === 'em_entrega'
    ).length
    
    const occupancyRate = 75 // Placeholder - calcularia com base em capacidade total
    
    const monthRevenue = monthReservations.reduce((sum, r) => 
      sum + (r.total_price || r.booking_price || 0), 0
    )
    
    const activeReservations = reservations.filter(r => 
      !['entregue', 'cancelado'].includes(r.estado_reserva_atual)
    ).length
    
    const completedToday = reservations.filter(r => {
      const updated = new Date(r.updated_at_db)
      return updated >= today && r.estado_reserva_atual === 'entregue'
    }).length
    
    const canceledToday = reservations.filter(r => {
      const updated = new Date(r.updated_at_db)
      return updated >= today && r.estado_reserva_atual === 'cancelado'
    }).length
    
    // Alertas
    const alerts: { type: 'warning' | 'error' | 'info', message: string }[] = []
    
    if (pendingPickups > 10) {
      alerts.push({
        type: 'warning',
        message: `${pendingPickups} recolhas pendentes`
      })
    }
    
    if (occupancyRate > 90) {
      alerts.push({
        type: 'error',
        message: 'Capacidade próxima do limite'
      })
    }
    
    if (canceledToday > 5) {
      alerts.push({
        type: 'warning',
        message: `${canceledToday} cancelamentos hoje`
      })
    }
    
    return {
      todayCheckIns,
      todayCheckOuts,
      todayRevenue,
      todayNewReservations: todayReservations.length,
      carsInPark,
      pendingPickups,
      pendingDeliveries,
      occupancyRate,
      monthRevenue,
      monthGrowth: 12.5, // Placeholder
      avgTicket: monthReservations.length > 0 ? monthRevenue / monthReservations.length : 0,
      pendingPayments: reservations.filter(r => !r.booking_price).length,
      activeReservations,
      completedToday,
      canceledToday,
      alerts
    }
  }

  const handleParkChange = (park: string) => {
    updateSelectedPark(park)
  }

  const handleAppClick = (route: string) => {
    router.push(route)
  }

  const handleSync = async () => {
    setSyncStatus({ status: 'syncing', message: 'Sincronizando dados do Firebase...' })
    
    try {
      const response = await fetch('/api/sync/admin-mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' })
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        setSyncStatus({
          status: 'completed',
          message: `✅ ${result.summary.total_synced} reservas sincronizadas com sucesso`,
          lastSync: new Date().toLocaleString('pt-PT'),
          totalReservations: result.summary.total_processed,
          syncedCount: result.summary.total_synced
        })
        
        // Recarregar dados após sincronização
        await loadDashboard()
      } else {
        setSyncStatus({
          status: 'error',
          message: `❌ Erro na sincronização: ${result.error || result.message}`
        })
      }
    } catch (error) {
      setSyncStatus({
        status: 'error',
        message: `❌ Erro de conexão: ${error}`
      })
    }
  }

  const parkOptions = [
    { value: "lisboa", label: "LISBOA" },
    { value: "porto", label: "PORTO" },
    { value: "faro", label: "FARO" },
  ]

  if (user?.role === "super_admin") {
    parkOptions.push({ value: "todos", label: "Todos os Parques" })
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#003d82]" />
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header - NOVO VISUAL */}
      <header className="bg-white shadow-sm relative">
        <div className="max-w-[1400px] mx-auto px-5 py-5">
          {/* Sync Button */}
          <Button 
            onClick={handleSync}
            disabled={syncStatus.status === 'syncing'}
            className="absolute top-5 right-5 bg-green-600 hover:bg-green-700 text-white font-semibold"
            size="default"
          >
            {syncStatus.status === 'syncing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar
              </>
            )}
          </Button>

          {/* Sync Status Badge */}
          <div className="absolute top-5 right-[180px]">
            <Badge 
              variant={
                syncStatus.status === 'completed' ? 'default' :
                syncStatus.status === 'error' ? 'destructive' : 
                syncStatus.status === 'syncing' ? 'secondary' : 'outline'
              }
            >
              {syncStatus.status === 'syncing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {syncStatus.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
              {syncStatus.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
              {syncStatus.message.substring(0, 50)}...
            </Badge>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="w-10 h-10 bg-[#003d82] rounded flex items-center justify-center">
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <span className="text-[28px] font-bold text-[#003d82] tracking-wider">MULTIPARK</span>
          </div>

          {/* Welcome */}
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-800 mb-5 tracking-wider">
              BEM-VINDO DE VOLTA, {user.name.toUpperCase()}!
            </h1>

            {/* Park Selector */}
            <div className="max-w-[200px] mx-auto">
              <Select value={user.selectedPark} onValueChange={handleParkChange}>
                <SelectTrigger className="w-full h-10 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {parkOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - MANTÉM A LÓGICA, MUDA SÓ O VISUAL */}
      <main className="flex-1 max-w-[1400px] mx-auto px-5 py-10 w-full">
        
        {/* App Sections - RENDERIZAÇÃO DINÂMICA BASEADA NAS PERMISSÕES */}
        <div className="space-y-10">
          {/* Operational Dashboard Section */}
          <section>
            <h2 className="text-xl font-semibold text-[#003d82] mb-5 pb-2 border-b-2 border-[#003d82]">
              Operational Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleAppClick('/reservas')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Reservations & Check-ins
              </button>
              <button
                onClick={() => handleAppClick('/caixa')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Cash & Transactions
              </button>
              <button
                onClick={() => handleAppClick('/recolhas')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Vehicle Movements
              </button>
              <button
                onClick={() => handleAppClick('/operacoes')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Operational Management
              </button>
            </div>
          </section>

          {/* HR & Analytics Tools Section */}
          <section>
            <h2 className="text-xl font-semibold text-[#003d82] mb-5 pb-2 border-b-2 border-[#003d82]">
              HR & Analytics Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleAppClick('/recursos-humanos')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Horários & Ordenados
              </button>
              <button
                onClick={() => handleAppClick('/formacao')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Training & Knowledge
              </button>
              <button
                onClick={() => handleAppClick('/auditoria')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Audit & Quality
              </button>
              <button
                onClick={() => handleAppClick('/marketing')}
                className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
              >
                Marketing & Analytics
              </button>
            </div>
          </section>

          {/* Dynamic Sections from permissions - MANTÉM AS OUTRAS SEÇÕES DINÂMICAS */}
          {Object.entries(availableApps).map(([sectionName, apps]: [string, any]) => {
            // Skip sections we already rendered manually
            if (sectionName === 'Operational Dashboard' || sectionName === 'HR & Analytics Tools') {
              return null;
            }
            
            return (
              <section key={sectionName}>
                <h2 className="text-xl font-semibold text-[#003d82] mb-5 pb-2 border-b-2 border-[#003d82]">
                  {sectionName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apps.map((app: any) => {
                    const displayName = app.name === "Recursos Humanos" ? "Horários & Ordenados" : app.name;
                    
                    return (
                      <button
                        key={app.id}
                        onClick={() => handleAppClick(app.route)}
                        className="bg-white border-2 border-[#0066cc] text-[#0066cc] py-5 px-4 rounded-lg hover:bg-[#0066cc] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 font-medium text-[15px] min-h-[70px] flex items-center justify-center"
                      >
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Logout Button - NOVO VISUAL */}
        <div className="flex justify-center mt-10">
          <Button 
            onClick={signOut}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-16 py-6 text-base font-semibold rounded-lg hover:-translate-y-0.5 transition-all"
          >
            Sair
          </Button>
        </div>
      </main>
    </div>
  )
}
