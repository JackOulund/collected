import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  try {
    await requireSession()
    const form = await req.formData()
    const file = form.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const blob = await put(file.name, file, { access: "public" })
    return NextResponse.json({ url: blob.url })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
