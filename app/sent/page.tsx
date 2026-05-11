import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { cards, users } from "@/lib/db/schema"
import { eq, and, ne } from "drizzle-orm"
import { MtgCard, type MtgCardData } from "@/components/MtgCard"
import { AcceptCardButton } from "@/components/AcceptCardButton"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function SentPage() {
  const session = await getSession()
  if (!session) redirect("/auth/signin")

  const userId = session.user.id

  const sentCards = await db
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
      playNote: cards.playNote,
      recipientName: users.name,
      recipientEmail: users.email,
    })
    .from(cards)
    .leftJoin(users, eq(cards.recipientId, users.id))
    .where(
      and(
        eq(cards.creatorId, userId),
        ne(cards.status, "graveyard"),
      ),
    )
    .orderBy(cards.createdAt)

  const proposed = sentCards.filter((c) => c.status === "proposed")
  const active = sentCards.filter((c) => c.status === "active")
  const scheduled = sentCards.filter((c) => c.status === "scheduled")

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/hand" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Cards sent</h1>
          <p className="text-zinc-400 text-sm">Cards you&apos;ve created for others</p>
        </div>
        <Link
          href="/create"
          className={cn(buttonVariants({ size: "sm" }), "bg-amber-500 hover:bg-amber-400 text-black font-bold")}
        >
          <Plus className="size-4 mr-1" /> New
        </Link>
      </div>

      {proposed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-amber-400">Awaiting your acceptance</h2>
            <Badge className="bg-amber-500 text-black">{proposed.length}</Badge>
          </div>
          <div className="space-y-6">
            {proposed.map((card) => (
              <div key={card.id} className="space-y-3">
                <div className="flex justify-center">
                  <MtgCard
                    card={{ ...card, color: card.color as MtgCardData["color"], status: card.status as MtgCardData["status"] }}
                  />
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
                  <p className="text-zinc-400 text-xs">
                    Played by <span className="text-white font-medium">{card.recipientName}</span>
                  </p>
                  {card.playNote && (
                    <blockquote className="border-l-2 border-amber-500 pl-3 text-sm text-zinc-300 italic">
                      &ldquo;{card.playNote}&rdquo;
                    </blockquote>
                  )}
                  <AcceptCardButton cardId={card.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {scheduled.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300">Scheduled</h2>
          <div className="flex flex-wrap gap-5 justify-center">
            {scheduled.map((card) => (
              <div key={card.id} className="space-y-2 text-center">
                <MtgCard
                  card={{ ...card, color: card.color as MtgCardData["color"], status: card.status as MtgCardData["status"] }}
                />
                {card.redemptionDate && (
                  <p className="text-xs text-amber-400">
                    {new Date(card.redemptionDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-500">In their hand</h2>
          <div className="flex flex-wrap gap-5 justify-center opacity-60">
            {active.map((card) => (
              <MtgCard
                key={card.id}
                card={{ ...card, color: card.color as MtgCardData["color"], status: card.status as MtgCardData["status"] }}
              />
            ))}
          </div>
        </section>
      )}

      {sentCards.length === 0 && (
        <div className="text-center py-24 text-zinc-500">
          <p className="text-lg">No cards sent yet.</p>
          <Link
            href="/create"
            className={cn(buttonVariants(), "mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold")}
          >
            Create your first card
          </Link>
        </div>
      )}
    </div>
  )
}
