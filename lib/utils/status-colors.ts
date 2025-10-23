/**
 * Status and category color mappings
 * 
 * This file centralizes all color mappings to eliminate
 * duplicate inline color objects throughout the application.
 */

// Status color mappings
export const statusColors = {
  // General statuses
  Active: "bg-green-500/10 text-green-700 dark:text-green-400",
  Inactive: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  Pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  Approved: "bg-green-500/10 text-green-700 dark:text-green-400",
  Rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  Cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  Suspended: "bg-red-500/10 text-red-700 dark:text-red-400",
  Completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  "In Progress": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Discontinued: "bg-red-500/10 text-red-700 dark:text-red-400",

  // Lead statuses
  new: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  contacted: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  qualified: "bg-green-500/10 text-green-700 dark:text-green-400",
  unqualified: "bg-gray-500/10 text-gray-700 dark:text-gray-400",

  // Sales order statuses
  Processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Dispatched: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Delivered: "bg-green-500/10 text-green-700 dark:text-green-400",

  // Activity statuses
  Scheduled: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",

  // Leave statuses
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
} as const

// Category color mappings
export const categoryColors = {
  // Business categories
  Hotel: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Supermarket: "bg-green-500/10 text-green-700 dark:text-green-400",
  Restaurant: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Contractor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",

  // Product categories
  Electronics: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Clothing: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  "Food & Beverage": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  "Home & Garden": "bg-green-500/10 text-green-700 dark:text-green-400",
  Sports: "bg-red-500/10 text-red-700 dark:text-red-400",
  Books: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",

  // Document categories
  Quote: "bg-blue-100 text-blue-800",
  Invoice: "bg-green-100 text-green-800",
  Delivery: "bg-orange-100 text-orange-800",
  Payment: "bg-purple-100 text-purple-800",
  Contract: "bg-pink-100 text-pink-800",
} as const

// Priority color mappings
export const priorityColors = {
  Low: "bg-blue-100 text-blue-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-orange-100 text-orange-800",
  Urgent: "bg-red-100 text-red-800",
} as const

// Type color mappings
export const typeColors = {
  // Activity types
  Call: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Visit: "bg-green-500/10 text-green-700 dark:text-green-400",
  Meeting: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Email: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  WhatsApp: "bg-green-600/10 text-green-600 dark:text-green-400",
  Task: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  Note: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",

  // Approval types
  Quote: "bg-blue-100 text-blue-800",
  Discount: "bg-green-100 text-green-800",
  Credit: "bg-purple-100 text-purple-800",
  Return: "bg-orange-100 text-orange-800",
  Refund: "bg-red-100 text-red-800",
  Price: "bg-yellow-100 text-yellow-800",
  Order: "bg-indigo-100 text-indigo-800",

  // Leave types
  vacation: "bg-blue-100 text-blue-800",
  sick: "bg-red-100 text-red-800",
  personal: "bg-purple-100 text-purple-800",
  maternity: "bg-pink-100 text-pink-800",
  paternity: "bg-cyan-100 text-cyan-800",
  bereavement: "bg-gray-100 text-gray-800",
  other: "bg-orange-100 text-orange-800",
} as const

// Outcome color mappings
export const outcomeColors = {
  Positive: "bg-green-500/10 text-green-700 dark:text-green-400",
  Neutral: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  Negative: "bg-red-500/10 text-red-700 dark:text-red-400",
  "No Response": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  "Follow-up Required": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
} as const

// Access level color mappings
export const accessLevelColors = {
  Public: "bg-green-100 text-green-800",
  Customer: "bg-blue-100 text-blue-800",
  Internal: "bg-yellow-100 text-yellow-800",
  Private: "bg-red-100 text-red-800",
} as const

// Customer type color mappings
export const customerTypeColors = {
  "Volume Buyer": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Commercial: "bg-green-500/10 text-green-700 dark:text-green-400",
  Retail: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  Wholesale: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
} as const

// Stock status color mappings
export const stockStatusColors = {
  "In Stock": "text-green-600",
  "Low Stock": "text-orange-600",
  "Out of Stock": "text-red-600",
} as const

/**
 * Get color class for a given status
 */
export const getStatusColor = (status: string): string => {
  return statusColors[status as keyof typeof statusColors] || statusColors.Other
}

/**
 * Get color class for a given category
 */
export const getCategoryColor = (category: string): string => {
  return categoryColors[category as keyof typeof categoryColors] || categoryColors.Other
}

/**
 * Get color class for a given priority
 */
export const getPriorityColor = (priority: string): string => {
  return priorityColors[priority as keyof typeof priorityColors] || priorityColors.Medium
}

/**
 * Get color class for a given type
 */
export const getTypeColor = (type: string): string => {
  return typeColors[type as keyof typeof typeColors] || typeColors.Other
}

/**
 * Get color class for a given outcome
 */
export const getOutcomeColor = (outcome: string): string => {
  return outcomeColors[outcome as keyof typeof outcomeColors] || outcomeColors.Neutral
}

/**
 * Get color class for a given access level
 */
export const getAccessLevelColor = (accessLevel: string): string => {
  return accessLevelColors[accessLevel as keyof typeof accessLevelColors] || accessLevelColors.Internal
}

/**
 * Get color class for a given customer type
 */
export const getCustomerTypeColor = (customerType: string): string => {
  return customerTypeColors[customerType as keyof typeof customerTypeColors] || customerTypeColors.Other
}

/**
 * Get color class for stock status
 */
export const getStockStatusColor = (status: string): string => {
  return stockStatusColors[status as keyof typeof stockStatusColors] || stockStatusColors["In Stock"]
}
