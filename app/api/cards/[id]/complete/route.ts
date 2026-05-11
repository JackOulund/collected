import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cards } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"
import { eq } from "drizzle-orm"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (card.status !== "scheduled") {
      return NextResponse.json({ error: "Card must be scheduled before completing" }, { status: 400 })
    }

    const [updated] = await db
      .update(cards)
      .set({ status: "graveyard", redeemedAt: new Date() })
      .where(eq(cards.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
