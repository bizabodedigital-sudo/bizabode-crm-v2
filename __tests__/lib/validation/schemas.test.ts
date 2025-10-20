import { 
  userCreateSchema, 
  userUpdateSchema, 
  loginSchema,
  employeeCreateSchema,
  leadCreateSchema,
  itemCreateSchema,
  validateInput
} from '@/lib/validation/schemas'

describe('Validation Schemas', () => {
  describe('User Schemas', () => {
    test('userCreateSchema validates correct data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'admin',
        companyId: '507f1f77bcf86cd799439011'
      }

      const result = userCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('userCreateSchema rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'admin',
        companyId: '507f1f77bcf86cd799439011'
      }

      const result = userCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email format')
      }
    })

    test('userCreateSchema rejects weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
        role: 'admin',
        companyId: '507f1f77bcf86cd799439011'
      }

      const result = userCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 6 characters')
      }
    })

    test('loginSchema validates correct data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Employee Schemas', () => {
    test('employeeCreateSchema validates correct data', () => {
      const validData = {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Software Engineer',
        department: 'IT',
        hireDate: '2024-01-01T00:00:00.000Z',
        salary: 50000,
        employmentType: 'full-time'
      }

      const result = employeeCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('employeeCreateSchema rejects invalid employment type', () => {
      const invalidData = {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Software Engineer',
        department: 'IT',
        hireDate: '2024-01-01T00:00:00.000Z',
        salary: 50000,
        employmentType: 'invalid-type'
      }

      const result = employeeCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Lead Schemas', () => {
    test('leadCreateSchema validates correct data', () => {
      const validData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        source: 'Website'
      }

      const result = leadCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('leadCreateSchema rejects invalid phone number', () => {
      const invalidData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: 'invalid-phone',
        company: 'Acme Corp',
        source: 'Website'
      }

      const result = leadCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid phone number format')
      }
    })
  })

  describe('Item Schemas', () => {
    test('itemCreateSchema validates correct data', () => {
      const validData = {
        sku: 'SKU001',
        name: 'Test Product',
        category: 'Electronics',
        quantity: 100,
        reorderLevel: 10,
        unitPrice: 99.99
      }

      const result = itemCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('itemCreateSchema rejects negative quantity', () => {
      const invalidData = {
        sku: 'SKU001',
        name: 'Test Product',
        category: 'Electronics',
        quantity: -10,
        reorderLevel: 10,
        unitPrice: 99.99
      }

      const result = itemCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('must be non-negative')
      }
    })
  })

  describe('validateInput helper', () => {
    test('returns success for valid data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'admin',
        companyId: '507f1f77bcf86cd799439011'
      }

      const result = validateInput(userCreateSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    test('returns errors for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        name: 'Test User',
        role: 'admin',
        companyId: '507f1f77bcf86cd799439011'
      }

      const result = validateInput(userCreateSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toHaveLength(2) // email and password errors
        expect(result.errors[0]).toContain('Invalid email format')
        expect(result.errors[1]).toContain('at least 6 characters')
      }
    })
  })
})
