import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: '로그아웃되었습니다' })
  response.headers.set('Set-Cookie', clearAuthCookie())
  return response
}