import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { cards, users, giftLetters } from "@/lib/db/schema"
import { eq, and, or, inArray } from "drizzle-orm"
import { CardHand } from "@/components/CardHand"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Mail, Layers, Skull } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MtgCardData } from "@/components/MtgCard"

export default async function HandPage() {
  const session = await getSession()
  if (!session) redirect("/auth/signin")

  const userId = session.user.id

  const myCards = await db
    .select({
      id: cards.id,
      title: cards.title,
      description: cards.description,
      flavorText: cards.flavorText,
      type: cards.type,
      color: cards.color,
      imageUrl: cards.imageUrl,
      power: cards.power,
      toughness: cards.toughness,
      status: cards.status,
      redemptionDate: cards.redemptionDate,
      letterId: cards.letterId,
      creatorName: users.name,
    })
    .from(cards)
    .leftJoin(users, eq(cards.creatorId, users.id))
    .where(
      and(
        eq(cards.recipientId, userId),
        or(
          inArray(cards.status, ["active", "proposed", "scheduled"]),
        ),
      ),
    )
    .orderBy(cards.createdAt)

  const cardData: MtgCardData[] = myCards.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    flavorText: c.flavorText,
    type: c.type,
    color: c.color as MtgCardData["color"],
    imageUrl: c.imageUrl,
    power: c.power,
    toughness: c.toughness,
    status: c.status as MtgCardData["status"],
    redemptionDate: c.redemptionDate,
    creator: { name: c.creatorName },
  }))

  const letterIds = myCards.map((c) => c.letterId).filter(Boolean) as string[]
  const letters = letterIds.length
    ? await db
        .select({ id: giftLetters.id })
        .from(giftLetters)
        .where(inArray(giftLetters.id, letterIds))
    : []

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6">
      {/* Top nav */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your hand</h1>
          <p className="text-zinc-400 text-sm">Hi, {session.user.name}</p>
        </div>
        <div className="flex gap-2">
          {letters.length > 0 && (
            <Link
              href={`/hand/letter/${letters[0].id}`}
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <Mail className="size-4" />
            </Link>
          )}
          <Link href="/graveyard" className={buttonVariants({ variant: "outline", size: "icon" })}>
            <Skull className="size-4" />
          </Link>
          <Link href="/sent" className={buttonVariants({ variant: "outline", size: "icon" })}>
            <Layers className="size-4" />
          </Link>
          <Link
            href="/create"
            className={cn(buttonVariants({ size: "icon" }), "bg-amber-500 hover:bg-amber-400 text-black font-bold")}
          >
            <Plus className="size-4" />
          </Link>
        </div>
      </div>

      {letters.length > 0 && (
        <Link href={`/hand/letter/${letters[0].id}`}>
          <div className="mb-6 flex items-center gap-3 bg-amber-950/50 border border-amber-800 rounded-xl px-4 py-3 hover:bg-amber-950 transition-colors">
            <Mail className="size-5 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-300 text-sm font-medium">You have a letter</p>
              <p className="text-amber-500 text-xs truncate">Tap to read</p>
            </div>
            <Badge className="bg-amber-500 text-black text-xs">{letters.length}</Badge>
          </div>
        </Link>
      )}

      <CardHand cards={cardData} />
    </div>
  )
}
