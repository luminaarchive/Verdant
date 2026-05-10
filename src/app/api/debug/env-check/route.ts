import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    OPENROUTER_API_KEY_length: process.env.OPENROUTER_API_KEY?.length ?? 0,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    INNGEST_SIGNING_KEY: !!process.env.INNGEST_SIGNING_KEY,
    INNGEST_EVENT_KEY: !!process.env.INNGEST_EVENT_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  })
}
