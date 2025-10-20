"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, LogOut, Coffee, Play, Pause, Square, RotateCcw, Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { ErrorBoundary } from "@/components/error-boundary"
import apiClient from "@/lib/api-client-robust"
import dataPersistence from "@/lib/persistence"
import { validateEmployeeId, validateTimeFormat, validateClockSequence, validateRateLimit } from "@/lib/validation"

interface ClockState {
  isClockedIn: boolean
  clockInTime: string | null
  clockOutTime: string | null
  breakStartTime: string | null
  breakEndTime: string | null
  isOnBreak: boolean
  totalHours: number
  currentSessionHours: number
}

export default function EmployeeClockPage() {
  const [clockState, setClockState] = useState<ClockState>({
    isClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
    breakStartTime: null,
    breakEndTime: null,
    isOnBreak: false,
    totalHours: 0,
    currentSessionHours: 0
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [employeeName, setEmployeeName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [isOnline, setIsOnline] = useState(true) // Default to true to avoid hydration mismatch
  const [lastActionTime, setLastActionTime] = useState<string | null>(null)
  const [pendingActions, setPendingActions] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Set client-side flag and update current time every second
  useEffect(() => {
    setIsClient(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Online/offline detection
  useEffect(() => {
    // Set initial online status once client-side
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-sync pending actions
  useEffect(() => {
    if (isOnline) {
      dataPersistence.syncPendingActions()
    }
  }, [isOnline])

  // Load pending actions count
  useEffect(() => {
    const updatePendingCount = () => {
      const pending = dataPersistence.getPendingActions()
      setPendingActions(pending.length)
    }
    
    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)
    return () => clearInterval(interval)
  }, [])

  // Check if employee is logged in
  useEffect(() => {
    const employeeId = localStorage.getItem("employeeId")
    const name = localStorage.getItem("employeeName")
    
    if (!employeeId) {
      router.push("/employee/login")
      return
    }
    
    setEmployeeName(name || `Employee ${employeeId}`)
    
    // Load existing clock state
    loadClockState()
  }, [router])

  const loadClockState = async () => {
    try {
      const employeeId = localStorage.getItem("employeeId")
      const token = localStorage.getItem("employeeToken")
      if (!employeeId || !token) return

      // Validate employee ID
      const validation = validateEmployeeId(employeeId)
      if (!validation.valid) {
        setError(validation.error || "Invalid employee ID")
        return
      }

      // Try to load from API first
      const response = await apiClient.getAttendance(employeeId, true, token)
      
      if (response.success && response.data && response.data.length > 0) {
        const today = response.data[0]
        
        // Validate clock sequence
        const sequenceValidation = validateClockSequence(
          today.checkIn,
          today.checkOut,
          today.breakStart,
          today.breakEnd
        )
        
        if (!sequenceValidation.valid) {
          setError(sequenceValidation.error || "Invalid clock sequence")
          return
        }

        const newState = {
          isClockedIn: !!today.checkIn && !today.checkOut,
          clockInTime: today.checkIn,
          clockOutTime: today.checkOut,
          breakStartTime: today.breakStart,
          breakEndTime: today.breakEnd,
          isOnBreak: !!today.breakStart && !today.breakEnd,
          totalHours: today.totalHours || 0,
          currentSessionHours: calculateCurrentHours(today.checkIn, today.breakStart, today.breakEnd)
        }

        setClockState(newState)
        dataPersistence.saveClockState(newState)
      } else {
        // Load from local storage as fallback
        const localState = dataPersistence.getClockState()
        if (localState.isClockedIn || localState.clockInTime) {
          setClockState(localState)
        }
      }
    } catch (error) {
      console.error("Error loading clock state:", error)
      setError("Failed to load clock state. Using offline data.")
      
      // Load from local storage as fallback
      const localState = dataPersistence.getClockState()
      if (localState.isClockedIn || localState.clockInTime) {
        setClockState(localState)
      }
    }
  }

  const calculateCurrentHours = (clockIn: string, breakStart: string | null, breakEnd: string | null) => {
    if (!clockIn) return 0
    
    const start = new Date(clockIn)
    const now = new Date()
    let totalMinutes = (now.getTime() - start.getTime()) / (1000 * 60)
    
    // Subtract break time if currently on break
    if (breakStart && !breakEnd) {
      const breakStartTime = new Date(breakStart)
      totalMinutes -= (now.getTime() - breakStartTime.getTime()) / (1000 * 60)
    }
    
    return Math.max(0, totalMinutes / 60)
  }

  const handleClockIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const employeeId = localStorage.getItem("employeeId")
      const token = localStorage.getItem("employeeToken")
      if (!employeeId || !token) return

      // Validate rate limiting
      const rateLimitValidation = validateRateLimit(lastActionTime, 'clock_in')
      if (!rateLimitValidation.valid) {
        setError(rateLimitValidation.error || "Please wait before clocking in again")
        return
      }

      // Validate employee ID
      const employeeValidation = validateEmployeeId(employeeId)
      if (!employeeValidation.valid) {
        setError(employeeValidation.error || "Invalid employee ID")
        return
      }

      const clockInTime = new Date().toISOString()
      
      // Validate time format
      const timeValidation = validateTimeFormat(clockInTime)
      if (!timeValidation.valid) {
        setError(timeValidation.error || "Invalid time format")
        return
      }

      const response = await apiClient.clockIn(employeeId, token)

      if (response.success) {
        const newState = {
          ...clockState,
          isClockedIn: true,
          clockInTime,
          currentSessionHours: 0
        }
        
        setClockState(newState)
        dataPersistence.saveClockState(newState)
        setLastActionTime(clockInTime)
        setMessage("Clocked in successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        // Handle offline scenario
        if (response.data?.offline) {
          const newState = {
            ...clockState,
            isClockedIn: true,
            clockInTime,
            currentSessionHours: 0
          }
          
          setClockState(newState)
          dataPersistence.saveClockState(newState)
          dataPersistence.addPendingAction({
            type: 'clock_in',
            timestamp: clockInTime,
            data: { employeeId, date: new Date().toISOString().split('T')[0], checkIn: clockInTime, status: 'present' },
            maxRetries: 3
          })
          
          setMessage("Clocked in offline - will sync when online")
          setTimeout(() => setMessage(""), 5000)
        } else {
          setError(response.error || "Failed to clock in")
        }
      }
    } catch (error) {
      console.error("Clock in error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      const employeeId = localStorage.getItem("employeeId")
      const token = localStorage.getItem("employeeToken")
      if (!employeeId || !token) return

      const response = await fetch("/api/attendance", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          date: new Date().toISOString().split('T')[0],
          checkOut: new Date().toISOString()
        })
      })

      if (response.ok) {
        setClockState(prev => ({
          ...prev,
          isClockedIn: false,
          clockOutTime: new Date().toISOString()
        }))
        setMessage("Clocked out successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to clock out")
        setTimeout(() => setMessage(""), 5000)
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
      setTimeout(() => setMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleBreakStart = async () => {
    setLoading(true)
    try {
      const employeeId = localStorage.getItem("employeeId")
      const token = localStorage.getItem("employeeToken")
      if (!employeeId || !token) return

      const response = await fetch("/api/attendance", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          date: new Date().toISOString().split('T')[0],
          breakStart: new Date().toISOString()
        })
      })

      if (response.ok) {
        setClockState(prev => ({
          ...prev,
          isOnBreak: true,
          breakStartTime: new Date().toISOString()
        }))
        setMessage("Break started!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to start break")
        setTimeout(() => setMessage(""), 5000)
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
      setTimeout(() => setMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleBreakEnd = async () => {
    setLoading(true)
    try {
      const employeeId = localStorage.getItem("employeeId")
      const token = localStorage.getItem("employeeToken")
      if (!employeeId || !token) return

      const response = await fetch("/api/attendance", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          date: new Date().toISOString().split('T')[0],
          breakEnd: new Date().toISOString()
        })
      })

      if (response.ok) {
        setClockState(prev => ({
          ...prev,
          isOnBreak: false,
          breakEndTime: new Date().toISOString()
        }))
        setMessage("Break ended!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Failed to end break")
        setTimeout(() => setMessage(""), 5000)
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
      setTimeout(() => setMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("employeeId")
    localStorage.removeItem("employeeName")
    localStorage.removeItem("employeeToken")
    router.push("/employee")
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A"
    return format(new Date(timeString), "h:mm a")
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    return `${h}h ${m}m`
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
              <p className="text-gray-600">Welcome, {employeeName}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            
            {pendingActions > 0 && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">
                  {pendingActions} pending sync
                </span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            Last sync: {isClient ? format(new Date(), "h:mm a") : "--:-- --"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Clock Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Clock Status</span>
                  <Badge variant={clockState.isClockedIn ? "default" : "secondary"}>
                    {clockState.isClockedIn ? "Clocked In" : "Clocked Out"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Current time: {isClient ? format(currentTime, "h:mm:ss a") : "--:--:-- --"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Session Hours */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {isClient ? formatDuration(clockState.currentSessionHours) : "0h 0m"}
                  </div>
                  <p className="text-sm text-gray-600">Current Session</p>
                </div>

                {/* Clock In/Out Buttons */}
                <div className="flex space-x-4">
                  {!clockState.isClockedIn ? (
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={handleClockIn}
                      disabled={loading}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Clock In
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="destructive"
                      className="flex-1"
                      onClick={handleClockOut}
                      disabled={loading}
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Clock Out
                    </Button>
                  )}
                </div>

                {/* Break Controls */}
                {clockState.isClockedIn && (
                  <div className="flex space-x-4">
                    {!clockState.isOnBreak ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleBreakStart}
                        disabled={loading}
                      >
                        <Coffee className="h-5 w-5 mr-2" />
                        Start Break
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleBreakEnd}
                        disabled={loading}
                      >
                        <Pause className="h-5 w-5 mr-2" />
                        End Break
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clock In:</span>
                  <span className="text-sm font-medium">
                    {formatTime(clockState.clockInTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clock Out:</span>
                  <span className="text-sm font-medium">
                    {formatTime(clockState.clockOutTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Break Start:</span>
                  <span className="text-sm font-medium">
                    {formatTime(clockState.breakStartTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Break End:</span>
                  <span className="text-sm font-medium">
                    {formatTime(clockState.breakEndTime)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Total Hours:</span>
                    <span className="text-sm font-semibold text-primary">
                      {formatDuration(clockState.totalHours)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
