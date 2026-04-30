import { NextResponse } from 'next/server'

// This route is deprecated. The active research pipeline is /api/n8n
// Kept as a stub to prevent 404 errors on any legacy requests.
export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint is deprecated.',
      message: 'Please use /api/n8n for research queries.',
    },
    { status: 410 }
  )
}
