/**
 * Generic filter utilities
 * 
 * This file centralizes common filtering logic to eliminate
 * duplicate inline filter functions throughout the application.
 */

/**
 * Filter items by search query across multiple fields
 */
export const filterBySearch = <T extends Record<string, any>>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] => {
  if (!query.trim()) return items
  
  const searchTerm = query.toLowerCase()
  
  return items.filter(item =>
    fields.some(field => {
      const value = item[field]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchTerm)
    })
  )
}

/**
 * Filter items by date range
 */
export const filterByDateRange = <T extends Record<string, any>>(
  items: T[],
  dateField: keyof T,
  startDate?: Date,
  endDate?: Date
): T[] => {
  if (!startDate && !endDate) return items
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField])
    if (isNaN(itemDate.getTime())) return false
    
    if (startDate && itemDate < startDate) return false
    if (endDate && itemDate > endDate) return false
    
    return true
  })
}

/**
 * Filter items by status
 */
export const filterByStatus = <T extends Record<string, any>>(
  items: T[],
  statusField: keyof T,
  status?: string
): T[] => {
  if (!status || status === 'all') return items
  
  return items.filter(item => item[statusField] === status)
}

/**
 * Filter items by category
 */
export const filterByCategory = <T extends Record<string, any>>(
  items: T[],
  categoryField: keyof T,
  category?: string
): T[] => {
  if (!category || category === 'all') return items
  
  return items.filter(item => item[categoryField] === category)
}

/**
 * Filter items by priority
 */
export const filterByPriority = <T extends Record<string, any>>(
  items: T[],
  priorityField: keyof T,
  priority?: string
): T[] => {
  if (!priority || priority === 'all') return items
  
  return items.filter(item => item[priorityField] === priority)
}

/**
 * Filter items by assigned user
 */
export const filterByAssignedTo = <T extends Record<string, any>>(
  items: T[],
  assignedToField: keyof T,
  assignedTo?: string
): T[] => {
  if (!assignedTo || assignedTo === 'all') return items
  
  return items.filter(item => {
    const assigned = item[assignedToField]
    if (typeof assigned === 'string') {
      return assigned === assignedTo
    }
    if (typeof assigned === 'object' && assigned !== null) {
      return assigned._id === assignedTo || assigned.id === assignedTo
    }
    return false
  })
}

/**
 * Filter items by company
 */
export const filterByCompany = <T extends Record<string, any>>(
  items: T[],
  companyIdField: keyof T,
  companyId?: string
): T[] => {
  if (!companyId) return items
  
  return items.filter(item => item[companyIdField] === companyId)
}

/**
 * Filter items by boolean flag
 */
export const filterByBoolean = <T extends Record<string, any>>(
  items: T[],
  field: keyof T,
  value?: boolean
): T[] => {
  if (value === undefined) return items
  
  return items.filter(item => Boolean(item[field]) === value)
}

/**
 * Filter items by numeric range
 */
export const filterByNumericRange = <T extends Record<string, any>>(
  items: T[],
  field: keyof T,
  min?: number,
  max?: number
): T[] => {
  if (min === undefined && max === undefined) return items
  
  return items.filter(item => {
    const value = Number(item[field])
    if (isNaN(value)) return false
    
    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false
    
    return true
  })
}

/**
 * Filter items by array contains
 */
export const filterByArrayContains = <T extends Record<string, any>>(
  items: T[],
  field: keyof T,
  value?: string
): T[] => {
  if (!value) return items
  
  return items.filter(item => {
    const array = item[field]
    if (!Array.isArray(array)) return false
    return array.includes(value)
  })
}

/**
 * Filter items by multiple criteria
 */
export const filterByMultiple = <T extends Record<string, any>>(
  items: T[],
  filters: {
    search?: { query: string; fields: (keyof T)[] }
    status?: { field: keyof T; value: string }
    category?: { field: keyof T; value: string }
    priority?: { field: keyof T; value: string }
    dateRange?: { field: keyof T; startDate?: Date; endDate?: Date }
    assignedTo?: { field: keyof T; value: string }
    company?: { field: keyof T; value: string }
    boolean?: { field: keyof T; value: boolean }
    numericRange?: { field: keyof T; min?: number; max?: number }
    arrayContains?: { field: keyof T; value: string }
  }
): T[] => {
  let filteredItems = items
  
  if (filters.search) {
    filteredItems = filterBySearch(filteredItems, filters.search.query, filters.search.fields)
  }
  
  if (filters.status) {
    filteredItems = filterByStatus(filteredItems, filters.status.field, filters.status.value)
  }
  
  if (filters.category) {
    filteredItems = filterByCategory(filteredItems, filters.category.field, filters.category.value)
  }
  
  if (filters.priority) {
    filteredItems = filterByPriority(filteredItems, filters.priority.field, filters.priority.value)
  }
  
  if (filters.dateRange) {
    filteredItems = filterByDateRange(
      filteredItems,
      filters.dateRange.field,
      filters.dateRange.startDate,
      filters.dateRange.endDate
    )
  }
  
  if (filters.assignedTo) {
    filteredItems = filterByAssignedTo(filteredItems, filters.assignedTo.field, filters.assignedTo.value)
  }
  
  if (filters.company) {
    filteredItems = filterByCompany(filteredItems, filters.company.field, filters.company.value)
  }
  
  if (filters.boolean) {
    filteredItems = filterByBoolean(filteredItems, filters.boolean.field, filters.boolean.value)
  }
  
  if (filters.numericRange) {
    filteredItems = filterByNumericRange(
      filteredItems,
      filters.numericRange.field,
      filters.numericRange.min,
      filters.numericRange.max
    )
  }
  
  if (filters.arrayContains) {
    filteredItems = filterByArrayContains(filteredItems, filters.arrayContains.field, filters.arrayContains.value)
  }
  
  return filteredItems
}

/**
 * Sort items by field
 */
export const sortBy = <T extends Record<string, any>>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]
    
    if (aValue === null || aValue === undefined) return direction === 'asc' ? 1 : -1
    if (bValue === null || bValue === undefined) return direction === 'asc' ? -1 : 1
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }
    
    return 0
  })
}

/**
 * Paginate items
 */
export const paginate = <T>(
  items: T[],
  page: number,
  limit: number
): { items: T[]; total: number; pages: number } => {
  const total = items.length
  const pages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    items: items.slice(startIndex, endIndex),
    total,
    pages,
  }
}
