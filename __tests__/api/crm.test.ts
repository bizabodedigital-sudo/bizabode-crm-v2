import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST as createLeadHandler } from '@/app/api/leads/route'
import { POST as createOpportunityHandler } from '@/app/api/opportunities/route'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('@/lib/models/Lead', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn()
  }
}))

jest.mock('@/lib/models/Opportunity', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn()
  }
}))

describe('CRM API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('POST /api/leads', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await createLeadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('name')
    })

    it('should return 400 for invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Lead',
          email: 'invalid-email',
          phone: '1234567890'
        })
      })

      const response = await createLeadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('email')
    })

    it('should return 400 for invalid phone number', async () => {
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Lead',
          email: 'test@example.com',
          phone: '123'
        })
      })

      const response = await createLeadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('phone')
    })

    it('should return 400 for invalid status', async () => {
      const request = new NextRequest('http://localhost:3000/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Lead',
          email: 'test@example.com',
          phone: '1234567890',
          status: 'invalid_status'
        })
      })

      const response = await createLeadHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('status')
    })
  })

  describe('POST /api/opportunities', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await createOpportunityHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('leadId')
      expect(data.errors).toHaveProperty('name')
      expect(data.errors).toHaveProperty('stage')
      expect(data.errors).toHaveProperty('value')
      expect(data.errors).toHaveProperty('probability')
      expect(data.errors).toHaveProperty('expectedCloseDate')
    })

    it('should return 400 for invalid stage', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          leadId: '507f1f77bcf86cd799439011',
          name: 'Test Opportunity',
          stage: 'invalid_stage',
          value: 1000,
          probability: 50,
          expectedCloseDate: '2024-12-31T00:00:00.000Z'
        })
      })

      const response = await createOpportunityHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('stage')
    })

    it('should return 400 for invalid probability', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          leadId: '507f1f77bcf86cd799439011',
          name: 'Test Opportunity',
          stage: 'prospecting',
          value: 1000,
          probability: 150,
          expectedCloseDate: '2024-12-31T00:00:00.000Z'
        })
      })

      const response = await createOpportunityHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('probability')
    })

    it('should return 400 for negative value', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          leadId: '507f1f77bcf86cd799439011',
          name: 'Test Opportunity',
          stage: 'prospecting',
          value: -1000,
          probability: 50,
          expectedCloseDate: '2024-12-31T00:00:00.000Z'
        })
      })

      const response = await createOpportunityHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toHaveProperty('value')
    })
  })
})
