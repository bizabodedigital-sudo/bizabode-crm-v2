/**
 * Validation utilities
 * 
 * This file centralizes common validation functions to ensure
 * consistent validation logic throughout the application.
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleaned = phone.replace(/\D/g, '')
  return phoneRegex.test(cleaned) && cleaned.length >= 10
}

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate required field
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Validate minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

/**
 * Validate maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

/**
 * Validate numeric range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Validate positive number
 */
export const isPositive = (value: number): boolean => {
  return value > 0
}

/**
 * Validate non-negative number
 */
export const isNonNegative = (value: number): boolean => {
  return value >= 0
}

/**
 * Validate date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

/**
 * Validate date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj > new Date()
}

/**
 * Validate date is within range
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  return dateObj >= start && dateObj <= end
}

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return strongPasswordRegex.test(password)
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) return false
  
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * Validate SKU format (alphanumeric with optional hyphens)
 */
export const isValidSku = (sku: string): boolean => {
  const skuRegex = /^[A-Za-z0-9\-_]+$/
  return skuRegex.test(sku) && sku.length >= 3 && sku.length <= 50
}

/**
 * Validate postal code (basic format)
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalRegex = /^[A-Za-z0-9\s\-]{3,10}$/
  return postalRegex.test(postalCode)
}

/**
 * Validate company name
 */
export const isValidCompanyName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100
}

/**
 * Validate person name
 */
export const isValidPersonName = (name: string): boolean => {
  const nameRegex = /^[A-Za-z\s\-'\.]+$/
  return nameRegex.test(name) && name.trim().length >= 2 && name.trim().length <= 50
}

/**
 * Validate percentage value
 */
export const isValidPercentage = (value: number): boolean => {
  return value >= 0 && value <= 100
}

/**
 * Validate file size (in bytes)
 */
export const isValidFileSize = (size: number, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return size <= maxSizeBytes
}

/**
 * Validate file type
 */
export const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

/**
 * Validate business hours format (HH:MM)
 */
export const isValidBusinessHours = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Validate currency amount
 */
export const isValidCurrencyAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0
}

/**
 * Validate discount percentage
 */
export const isValidDiscount = (discount: number): boolean => {
  return discount >= 0 && discount <= 100
}

/**
 * Validate tax rate
 */
export const isValidTaxRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 100
}

/**
 * Validate quantity
 */
export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity >= 0
}

/**
 * Validate reorder level
 */
export const isValidReorderLevel = (level: number): boolean => {
  return Number.isInteger(level) && level >= 0
}

/**
 * Validate lead score
 */
export const isValidLeadScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 0 && score <= 100
}

/**
 * Validate rating (1-5 stars)
 */
export const isValidRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating)
}

/**
 * Validate employee ID format
 */
export const isValidEmployeeId = (employeeId: string): boolean => {
  const employeeIdRegex = /^[A-Za-z0-9\-_]{3,20}$/
  return employeeIdRegex.test(employeeId)
}

/**
 * Validate department name
 */
export const isValidDepartment = (department: string): boolean => {
  return department.trim().length >= 2 && department.trim().length <= 50
}

/**
 * Validate position title
 */
export const isValidPosition = (position: string): boolean => {
  return position.trim().length >= 2 && position.trim().length <= 100
}

/**
 * Validate annual revenue
 */
export const isValidAnnualRevenue = (revenue: number): boolean => {
  return revenue >= 0 && revenue <= 999999999999 // Max 12 digits
}

/**
 * Validate employee count
 */
export const isValidEmployeeCount = (count: number): boolean => {
  return Number.isInteger(count) && count >= 0 && count <= 1000000
}

/**
 * Validate website URL
 */
export const isValidWebsite = (url: string): boolean => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  return isValidUrl(url)
}

/**
 * Validate social media handle
 */
export const isValidSocialHandle = (handle: string): boolean => {
  const handleRegex = /^@?[A-Za-z0-9_]{1,30}$/
  return handleRegex.test(handle)
}

/**
 * Validate business registration number
 */
export const isValidBusinessRegistration = (registration: string): boolean => {
  const regRegex = /^[A-Za-z0-9\-_]{5,20}$/
  return regRegex.test(registration)
}

/**
 * Validate license key format
 */
export const isValidLicenseKey = (key: string): boolean => {
  const licenseRegex = /^[A-Z0-9\-]{8,50}$/
  return licenseRegex.test(key)
}
