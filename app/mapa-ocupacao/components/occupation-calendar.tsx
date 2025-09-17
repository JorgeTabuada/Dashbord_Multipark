"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react"

interface OccupationCalendarProps {
  parkId: string
  onDateSelect: (date: string) => void
  onRangeChange: (parkId: string, startDate: string, endDate: string) => void
}

declare global {
  interface Window {
    FullCalendar: any
  }
}

export default function OccupationCalendar({ 
  parkId, 
  onDateSelect, 
  onRangeChange 
}: OccupationCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarInstance = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFullCalendar = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if FullCalendar is already loaded
        if (typeof window !== 'undefined' && window.FullCalendar) {
          initializeCalendar()
          return
        }

        // Dynamically load FullCalendar
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js'
        script.onload = () => initializeCalendar()
        script.onerror = () => setError('Erro ao carregar o calendário')
        document.head.appendChild(script)

      } catch (err) {
        setError('Erro ao inicializar calendário')
        console.error('Calendar load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadFullCalendar()

    return () => {
      if (calendarInstance.current) {
        calendarInstance.current.destroy()
        calendarInstance.current = null
      }
    }
  }, [])

  useEffect(() => {
    // Update calendar when parkId changes
    if (calendarInstance.current && parkId) {
      refreshCalendarData()
    }
  }, [parkId])

  const initializeCalendar = () => {
    if (!calendarRef.current || !window.FullCalendar) return

    try {
      // Destroy existing calendar
      if (calendarInstance.current) {
        calendarInstance.current.destroy()
      }

      calendarInstance.current = new window.FullCalendar.Calendar(calendarRef.current, {
        initialView: 'dayGridMonth',
        locale: 'pt',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: 'auto',
        dateClick: function(info: any) {
          onDateSelect(info.dateStr)
        },
        datesSet: function(info: any) {
          // When calendar view changes, load data for visible range
          const startDate = info.startStr.split('T')[0]
          const endDate = info.endStr.split('T')[0]
          onRangeChange(parkId, startDate, endDate)
        },
        dayCellDidMount: function(info: any) {
          // Add custom styling based on occupation level
          const dateStr = info.date.toISOString().split('T')[0]
          const occupationLevel = getOccupationLevelForDate(dateStr)
          
          if (occupationLevel) {
            info.el.classList.add(`occupation-${occupationLevel}`)
          }
        },
        events: [],
        eventDisplay: 'block'
      })

      calendarInstance.current.render()
      setIsLoading(false)
    } catch (err) {
      setError('Erro ao renderizar calendário')
      console.error('Calendar initialization error:', err)
      setIsLoading(false)
    }
  }

  const getOccupationLevelForDate = (dateStr: string): string | null => {
    // Mock occupation data - replace with actual data from hook
    const mockOccupation = Math.random() * 100
    
    if (mockOccupation >= 90) return 'full'
    if (mockOccupation >= 70) return 'high'
    if (mockOccupation >= 40) return 'medium'
    return 'low'
  }

  const refreshCalendarData = () => {
    if (!calendarInstance.current) return
    
    try {
      // Remove existing events
      calendarInstance.current.removeAllEvents()
      
      // Add occupation indicators as events
      const view = calendarInstance.current.view
      const startDate = view.activeStart.toISOString().split('T')[0]
      const endDate = view.activeEnd.toISOString().split('T')[0]
      
      // This would be replaced with actual data
      const mockEvents = generateMockOccupationEvents(startDate, endDate)
      calendarInstance.current.addEventSource(mockEvents)
      
    } catch (err) {
      console.error('Error refreshing calendar data:', err)
    }
  }

  const generateMockOccupationEvents = (startDate: string, endDate: string) => {
    const events = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const covered = Math.floor(Math.random() * 50)
      const uncovered = Math.floor(Math.random() * 100)
      
      // Add small indicator events
      events.push({
        title: `C: ${covered}`,
        start: dateStr,
        allDay: true,
        display: 'background',
        classNames: ['occupation-covered']
      })
      
      events.push({
        title: `D: ${uncovered}`,
        start: dateStr,
        allDay: true,
        display: 'list-item',
        classNames: ['occupation-uncovered']
      })
    }
    
    return events
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <CalendarIcon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
          <span>Ocupação Baixa (&lt;40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
          <span>Ocupação Média (40-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
          <span>Ocupação Alta (70-90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
          <span>Lotado (&gt;90%)</span>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>A carregar calendário...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={calendarRef}
          className="min-h-[500px] bg-white rounded border"
        />
      </div>

      <style jsx>{`
        .occupation-low {
          background-color: rgba(74, 222, 128, 0.2) !important;
        }
        .occupation-medium {
          background-color: rgba(250, 204, 21, 0.2) !important;
        }
        .occupation-high {
          background-color: rgba(248, 113, 113, 0.2) !important;
        }
        .occupation-full {
          background-color: rgba(239, 68, 68, 0.4) !important;
        }
        .occupation-covered {
          background-color: #3b82f6 !important;
          color: white !important;
          font-size: 0.7em !important;
          padding: 1px 3px !important;
          border-radius: 3px !important;
        }
        .occupation-uncovered {
          background-color: #f59e0b !important;
          color: white !important;
          font-size: 0.7em !important;
          padding: 1px 3px !important;
          border-radius: 3px !important;
        }
      `}</style>
    </div>
  )
}