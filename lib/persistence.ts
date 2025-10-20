interface ClockState {
  isClockedIn: boolean
  clockInTime: string | null
  clockOutTime: string | null
  breakStartTime: string | null
  breakEndTime: string | null
  isOnBreak: boolean
  totalHours: number
  currentSessionHours: number
  lastSyncTime: string
  pendingActions: PendingAction[]
}

interface PendingAction {
  id: string
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
  timestamp: string
  data: any
  retryCount: number
  maxRetries: number
}

interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  breakStart?: string
  breakEnd?: string
  totalHours: number
  status: string
  synced: boolean
  lastModified: string
}

class DataPersistence {
  private static instance: DataPersistence
  private storageKey = 'employee-clock-data'
  private maxRetries = 3
  private syncInterval = 30000 // 30 seconds

  static getInstance(): DataPersistence {
    if (!DataPersistence.instance) {
      DataPersistence.instance = new DataPersistence()
    }
    return DataPersistence.instance
  }

  // Clock state persistence
  saveClockState(state: Partial<ClockState>): void {
    if (typeof window === 'undefined') return
    
    try {
      const existing = this.getClockState()
      const updated = { ...existing, ...state, lastSyncTime: new Date().toISOString() }
      localStorage.setItem(this.storageKey, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save clock state:', error)
    }
  }

  getClockState(): ClockState {
    if (typeof window === 'undefined') return this.getDefaultClockState()
    
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) {
        return this.getDefaultClockState()
      }
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to load clock state:', error)
      return this.getDefaultClockState()
    }
  }

  private getDefaultClockState(): ClockState {
    return {
      isClockedIn: false,
      clockInTime: null,
      clockOutTime: null,
      breakStartTime: null,
      breakEndTime: null,
      isOnBreak: false,
      totalHours: 0,
      currentSessionHours: 0,
      lastSyncTime: new Date().toISOString(),
      pendingActions: []
    }
  }

  // Pending actions management
  addPendingAction(action: Omit<PendingAction, 'id' | 'retryCount'>): void {
    if (typeof window === 'undefined') return
    
    const state = this.getClockState()
    const newAction: PendingAction = {
      ...action,
      id: this.generateId(),
      retryCount: 0
    }
    
    state.pendingActions.push(newAction)
    this.saveClockState(state)
  }

  removePendingAction(actionId: string): void {
    if (typeof window === 'undefined') return
    
    const state = this.getClockState()
    state.pendingActions = state.pendingActions.filter(action => action.id !== actionId)
    this.saveClockState(state)
  }

  updatePendingActionRetry(actionId: string): void {
    if (typeof window === 'undefined') return
    
    const state = this.getClockState()
    const action = state.pendingActions.find(a => a.id === actionId)
    if (action) {
      action.retryCount++
      if (action.retryCount >= action.maxRetries) {
        state.pendingActions = state.pendingActions.filter(a => a.id !== actionId)
      }
    }
    this.saveClockState(state)
  }

  getPendingActions(): PendingAction[] {
    if (typeof window === 'undefined') return []
    return this.getClockState().pendingActions
  }

  // Attendance records persistence
  saveAttendanceRecord(record: AttendanceRecord): void {
    if (typeof window === 'undefined') return
    
    try {
      const key = `attendance-${record.employeeId}-${record.date}`
      localStorage.setItem(key, JSON.stringify(record))
    } catch (error) {
      console.error('Failed to save attendance record:', error)
    }
  }

  getAttendanceRecord(employeeId: string, date: string): AttendanceRecord | null {
    if (typeof window === 'undefined') return null
    
    try {
      const key = `attendance-${employeeId}-${date}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load attendance record:', error)
      return null
    }
  }

  getAllAttendanceRecords(employeeId: string): AttendanceRecord[] {
    if (typeof window === 'undefined') return []
    
    try {
      const records: AttendanceRecord[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`attendance-${employeeId}-`)) {
          const data = localStorage.getItem(key)
          if (data) {
            records.push(JSON.parse(data))
          }
        }
      }
      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error('Failed to load attendance records:', error)
      return []
    }
  }

  // Data synchronization
  async syncPendingActions(): Promise<void> {
    const pendingActions = this.getPendingActions()
    if (pendingActions.length === 0) return

    for (const action of pendingActions) {
      try {
        await this.executePendingAction(action)
        this.removePendingAction(action.id)
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error)
        this.updatePendingActionRetry(action.id)
      }
    }
  }

  private async executePendingAction(action: PendingAction): Promise<void> {
    // This would integrate with your API client
    // For now, we'll just simulate the sync
    console.log('Syncing pending action:', action)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mark as synced
    const state = this.getClockState()
    state.lastSyncTime = new Date().toISOString()
    this.saveClockState(state)
  }

  // Data cleanup
  cleanupOldData(daysToKeep: number = 30): void {
    if (typeof window === 'undefined') return
    
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('attendance-')) {
          const data = localStorage.getItem(key)
          if (data) {
            const record: AttendanceRecord = JSON.parse(data)
            if (new Date(record.date) < cutoffDate) {
              localStorage.removeItem(key)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error)
    }
  }

  // Data export/import
  exportData(): string {
    if (typeof window === 'undefined') return '{}'
    
    try {
      const data = {
        clockState: this.getClockState(),
        attendanceRecords: this.getAllAttendanceRecords('all'),
        exportDate: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      return '{}'
    }
  }

  importData(jsonData: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const data = JSON.parse(jsonData)
      if (data.clockState) {
        this.saveClockState(data.clockState)
      }
      if (data.attendanceRecords) {
        data.attendanceRecords.forEach((record: AttendanceRecord) => {
          this.saveAttendanceRecord(record)
        })
      }
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Start auto-sync
  startAutoSync(): void {
    setInterval(() => {
      this.syncPendingActions()
    }, this.syncInterval)
  }

  // Clear all data
  clearAllData(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.storageKey)
      
      // Remove all attendance records
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith('attendance-')) {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.error('Failed to clear data:', error)
    }
  }
}

export const dataPersistence = DataPersistence.getInstance()
export default dataPersistence
