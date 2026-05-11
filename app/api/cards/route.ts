import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cards, giftLetters } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession()
    const body = await req.json()

    const {
      title,
      description,
      flavorText,
      type,
      color,
      imageUrl,
      power,
      toughness,
      recipientId,
      letterBody,
    } = body

    if (!title || !description || !type || !recipientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let letterId: string | null = null

    if (letterBody?.trim()) {
      const [letter] = await db
        .insert(giftLetters)
        .values({
          id: nanoid(),
          body: letterBody.trim(),
          creatorId: session.user.id,
          recipientId,
        })
        .returning({ id: giftLetters.id })
      letterId = letter.id
    }

    const [card] = await db
      .insert(cards)
      .values({
        id: nanoid(),
        title,
        description,
        flavorText: flavorText || null,
        type,
        color: color || "colorless",
        imageUrl: imageUrl || null,
        power: power || null,
        toughness: toughness || null,
        creatorId: session.user.id,
        recipientId,
        letterId,
      })
      .returning()

    return NextResponse.json(card, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
