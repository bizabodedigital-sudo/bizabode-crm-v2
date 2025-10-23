/**
 * Formatter utilities for consistent data display
 * 
 * This file centralizes all formatting functions to eliminate
 * duplicate inline formatters throughout the application.
 */

/**
 * Format currency values with proper locale formatting
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format date values with consistent formatting
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

/**
 * Format date and time with consistent formatting
 */
export const formatDateTime = (
  date: string | Date,
  locale: string = 'en-US'
): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }, locale)
}

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format percentage values
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format number with thousand separators
 */
export const formatNumber = (
  value: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format phone number (basic formatting)
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Basic formatting for common patterns
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone // Return original if no pattern matches
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (
  date: string | Date,
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
  
  // For older dates, use regular date formatting
  return formatDate(dateObj)
}

/**
 * Format duration in minutes to human-readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Format address for display
 */
export const formatAddress = (address: {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean)
  
  return parts.join(', ')
}

/**
 * Format name for display (first name + last name)
 */
export const formatName = (
  firstName?: string,
  lastName?: string
): string => {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.join(' ') || 'Unknown'
}

/**
 * Format initials from name
 */
export const formatInitials = (
  firstName?: string,
  lastName?: string
): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last
}
