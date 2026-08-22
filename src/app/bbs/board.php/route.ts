import fs from 'fs'
import path from 'path'

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REDIRECT_FILE =
  process.env.GNUBOARD_REDIRECT_FILE ||
  path.join(process.cwd(), 'data', 'gnuboard-redirects.json')

function loadRedirects(): Record<string, string> {
  try {
    if (!fs.existsSync(REDIRECT_FILE)) {
      return {}
    }

    const content = fs.readFileSync(REDIRECT_FILE, 'utf8')
    const parsed = JSON.parse(content)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return parsed as Record<string, string>
  } catch (error) {
    console.error('Failed to load Gnuboard redirect map:', error)
    return {}
  }
}

export function GET(request: NextRequest) {
  const boTable = request.nextUrl.searchParams
    .get('bo_table')
    ?.trim()
    .toLowerCase()

  const wrId = request.nextUrl.searchParams
    .get('wr_id')
    ?.trim()

  if (!boTable || !wrId) {
    return new NextResponse('Not Found', {
      status: 404,
    })
  }

  const redirects = loadRedirects()
  const key = `${boTable}:${wrId}`
  const destination = redirects[key]

  if (!destination) {
    return new NextResponse('Not Found', {
      status: 404,
    })
  }

  return new NextResponse(null, {
    status: 308,
    headers: {
      Location: destination,
    },
  })
}