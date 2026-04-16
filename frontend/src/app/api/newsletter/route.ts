import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";

    const response = await fetch(`${apiUrl}/api/users/newsletter/subscribe/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudo suscribir" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
