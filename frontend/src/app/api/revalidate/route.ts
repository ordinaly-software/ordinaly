import {NextRequest, NextResponse} from 'next/server'
import {revalidateTag, revalidatePath} from 'next/cache'

export async function POST(req: NextRequest) {
  // Header preferred (query strings end up in logs); query kept for existing webhooks.
  const secret = req.headers.get('x-revalidate-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ok:false}, {status:401})
  }
  const { slugs = [], tags = [] } = await req.json().catch(()=>({}))
  tags.forEach((t: string) => revalidateTag(t, 'max'))
  slugs.forEach((s:string) => {
    revalidatePath(`/${s}`);
  });
  revalidatePath('/blog')
  return NextResponse.json({ok:true, ts: Date.now()})
}
