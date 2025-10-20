import { NextResponse } from "next/server"

export function successResponse(data: any, message: string, status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
    message,
  }, { status })
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({
    success: false,
    error: message,
  }, { status })
}
