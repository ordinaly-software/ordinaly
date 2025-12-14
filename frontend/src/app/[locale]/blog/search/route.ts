import {NextRequest, NextResponse} from 'next/server'
import {client} from '@/lib/sanity'
import {paginatedPosts} from '@/lib/queries'

const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const tag = searchParams.get('tag')
  const cat = searchParams.get('category')
  const pageParam = Number(searchParams.get('page') || '1')
  const pageSizeParam = Number(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE)

  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0
    ? Math.min(Math.floor(pageSizeParam), MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE
  const offset = (page - 1) * pageSize
  const end = offset + pageSize

  const params: Record<string, string | number> = {
    offset,
    end,
    q: q ?? '',
    tag: tag ?? '',
    cat: cat ?? ''
  }

  const { items, total } = await client.fetch(
    paginatedPosts,
    params,
    { next:{ revalidate: 60, tags:['blog'] } }
  )
  return NextResponse.json({items, total, page, pageSize})
}
