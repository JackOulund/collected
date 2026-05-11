import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cards, memories } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await params

    const [card] = await db.select().from(cards).where(eq(cards.id, id))
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const isCreator = card.creatorId === session.user.id
    const isRecipient = card.recipientId === session.user.id
    if (!isCreator && !isRecipient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await db.select().from(memories).where(eq(memories.cardId, id))
    return NextResponse.json(result)
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await params
    const { imageUrl, note } = await req.json()

    const [card] = await db.select().from(cards).where(eq(cards.id, id))
    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const isCreator = card.creatorId === session.user.id
    const isRecipient = card.recipientId === session.user.id
    if (!isCreator && !isRecipient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (card.status !== "graveyard") {
      return NextResponse.json({ error: "Memories can only be added to graveyard cards" }, { status: 400 })
    }

    const [memory] = await db
      .insert(memories)
      .values({
        id: nanoid(),
        cardId: id,
        imageUrl: imageUrl || null,
        note: note?.trim() || null,
      })
      .returning()

    return NextResponse.json(memory, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
