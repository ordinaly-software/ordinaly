import {NextRequest, NextResponse} from 'next/server'
import {client} from '@/lib/sanity'
import {searchPosts} from '@/lib/queries'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const tag = searchParams.get('tag')
  const cat = searchParams.get('category')

  const params: Record<string, string> = {}
  if (q !== null) params.q = q
  if (tag !== null) params.tag = tag
  if (cat !== null) params.cat = cat

  const items = await client.fetch(searchPosts, params, { next:{ revalidate: 60, tags:['blog'] } })
  return NextResponse.json({items})
}
