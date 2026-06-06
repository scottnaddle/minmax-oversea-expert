import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'guide')

// GET /api/guide - Get all guide items or a specific one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('item')

    // Read meta
    const metaPath = path.join(CONTENT_DIR, '_meta.json')
    const metaContent = await fs.readFile(metaPath, 'utf-8')
    const meta = JSON.parse(metaContent)

    // If requesting specific content
    if (itemId) {
      const item = meta.items?.find((i: any) => i.id === itemId)
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      const filePath = path.join(CONTENT_DIR, item.file)
      const fileContent = await fs.readFile(filePath, 'utf-8')

      return NextResponse.json({
        meta: {
          title: meta.title,
          description: meta.description,
        },
        item: {
          id: item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
          content: fileContent,
        },
      })
    }

    // List all items
    return NextResponse.json({
      meta: {
        title: meta.title,
        description: meta.description,
      },
      items: meta.items || [],
    })
  } catch (error) {
    console.error('Error reading guide:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}