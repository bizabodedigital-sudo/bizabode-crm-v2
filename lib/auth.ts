import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  companyId?: string
}

interface AuthToken {
  userId: string
  email: string
  role: string
  companyId?: string
  iat?: number
  exp?: number
}

class AuthService {
  private jwtSecret: string
  private jwtExpiresIn: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d'
  }

  // Password hashing
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  // JWT token generation
  generateToken(user: AuthUser): string {
    const payload: AuthToken = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    }

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    })
  }

  // JWT token verification
  verifyToken(token: string): AuthToken | null {
    try {
      return jwt.verify(token, this.jwtSecret) as AuthToken
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }

  // Validate user permissions
  hasPermission(userRole: string, requiredRole: string): boolean {
    const roleHierarchy = {
      'super-admin': 4,
      'admin': 3,
      'manager': 2,
      'employee': 1,
      'viewer': 0
    }

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }

  // Generate refresh token
  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, this.jwtSecret, {
      expiresIn: '30d'
    })
  }

  // Verify refresh token
  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any
      if (decoded.type === 'refresh') {
        return { userId: decoded.userId }
      }
      return null
    } catch (error) {
      console.error('Refresh token verification failed:', error)
      return null
    }
  }

  // Password strength validation
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Generate secure random password
  generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    return password
  }
}

// Create default instance
const authService = new AuthService()

export default authService
export { AuthService }
export type { AuthUser, AuthToken }
