import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { cards, users, memories } from "@/lib/db/schema"
import { eq, and, or } from "drizzle-orm"
import { MtgCard, type MtgCardData } from "@/components/MtgCard"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Image as ImageIcon } from "lucide-react"

export default async function GraveyardPage() {
  const session = await getSession()
  if (!session) redirect("/auth/signin")

  const userId = session.user.id

  const graveyardCards = await db
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
      redeemedAt: cards.redeemedAt,
      creatorName: users.name,
    })
    .from(cards)
    .leftJoin(users, eq(cards.creatorId, users.id))
    .where(
      and(
        eq(cards.status, "graveyard"),
        or(eq(cards.recipientId, userId), eq(cards.creatorId, userId)),
      ),
    )
    .orderBy(cards.redeemedAt)

  const memoryCounts = await Promise.all(
    graveyardCards.map(async (card) => {
      const mems = await db.select().from(memories).where(eq(memories.cardId, card.id))
      return { cardId: card.id, count: mems.length }
    }),
  )
  const memoryMap = Object.fromEntries(memoryCounts.map(({ cardId, count }) => [cardId, count]))

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hand" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Graveyard</h1>
          <p className="text-zinc-400 text-sm">Experiences you&apos;ve lived</p>
        </div>
      </div>

      {graveyardCards.length === 0 ? (
        <div className="text-center py-24 text-zinc-500">
          <p className="text-lg">The graveyard is empty.</p>
          <p className="text-sm mt-2">Play some cards and make memories!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {graveyardCards.map((card) => (
            <Link key={card.id} href={`/graveyard/${card.id}`}>
              <div className="flex items-start gap-4 bg-zinc-900/60 rounded-2xl p-4 hover:bg-zinc-900 transition-colors border border-zinc-800">
                <div className="shrink-0 scale-75 origin-top-left" style={{ width: 192, height: 280 }}>
                  <MtgCard
                    card={{
                      ...card,
                      color: card.color as MtgCardData["color"],
                      status: "graveyard",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 pt-2 space-y-2">
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <p className="text-zinc-400 text-sm">{card.type}</p>
                  {card.redeemedAt && (
                    <p className="text-zinc-500 text-xs">
                      {new Date(card.redeemedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                  )}
                  {memoryMap[card.id] > 0 && (
                    <Badge variant="outline" className="text-xs gap-1 border-amber-700 text-amber-400">
                      <ImageIcon className="size-3" />
                      {memoryMap[card.id]} {memoryMap[card.id] === 1 ? "memory" : "memories"}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
