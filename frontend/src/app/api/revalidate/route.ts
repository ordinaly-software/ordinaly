import {NextRequest, NextResponse} from 'next/server'
import {revalidateTag, revalidatePath} from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ok:false}, {status:401})
  }
  const { slugs = [], tags = [] } = await req.json().catch(()=>({}))
  tags.forEach((t: string) => revalidateTag(t, 'max'))
  slugs.forEach((s:string)=> revalidatePath(`/blog/${s}`))
  revalidatePath('/blog')
  return NextResponse.json({ok:true, ts: Date.now()})
}
