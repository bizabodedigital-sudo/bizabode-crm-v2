import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status }
  )
}

export function errorResponse(error: string, status: number = 400, errors?: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      error,
      errors,
    } as ApiResponse,
    { status }
  )
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      errors,
    } as ApiResponse,
    { status: 422 }
  )
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message: string = "Forbidden") {
  return errorResponse(message, 403)
}

export function notFoundResponse(message: string = "Resource not found") {
  return errorResponse(message, 404)
}

export function serverErrorResponse(message: string = "Internal server error") {
  return errorResponse(message, 500)
}

