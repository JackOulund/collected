import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { cards, users, memories } from "@/lib/db/schema"
import { eq, and, or } from "drizzle-orm"
import { MtgCard, type MtgCardData } from "@/components/MtgCard"
import { AddMemoryForm } from "@/components/AddMemoryForm"
import { CompleteCardButton } from "@/components/CompleteCardButton"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function GraveyardCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect("/auth/signin")

  const { id } = await params
  const userId = session.user.id

  const [card] = await db
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
      creatorId: cards.creatorId,
      recipientId: cards.recipientId,
      creatorName: users.name,
    })
    .from(cards)
    .leftJoin(users, eq(cards.creatorId, users.id))
    .where(
      and(
        eq(cards.id, id),
        or(eq(cards.recipientId, userId), eq(cards.creatorId, userId)),
      ),
    )

  if (!card) redirect("/graveyard")

  const isScheduled = card.status === "scheduled"
  const dateHasPassed = card.redemptionDate && new Date(card.redemptionDate) <= new Date()
  const canComplete = isScheduled && dateHasPassed

  if (isScheduled && !canComplete) redirect("/sent")

  const cardMemories = await db
    .select()
    .from(memories)
    .where(eq(memories.cardId, id))
    .orderBy(memories.createdAt)

  const isInGraveyard = card.status === "graveyard"

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/graveyard" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold">{card.title}</h1>
      </div>

      <div className="flex justify-center">
        <MtgCard
          card={{
            ...card,
            color: card.color as MtgCardData["color"],
            status: card.status as MtgCardData["status"],
          }}
        />
      </div>

      {card.redeemedAt && (
        <p className="text-center text-zinc-500 text-sm">
          Completed on {new Date(card.redeemedAt).toLocaleDateString("en-US", { dateStyle: "long" })}
        </p>
      )}

      {canComplete && <CompleteCardButton cardId={card.id} />}

      {isInGraveyard && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold">Memories</h2>

          {cardMemories.length === 0 && (
            <p className="text-zinc-500 text-sm">No memories yet — add one below!</p>
          )}

          <div className="space-y-4">
            {cardMemories.map((memory) => (
              <div key={memory.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                {memory.imageUrl && (
                  <div className="relative w-full aspect-video">
                    <Image src={memory.imageUrl} alt="Memory" fill className="object-cover" />
                  </div>
                )}
                {memory.note && (
                  <div className="p-4">
                    <p className="text-sm text-zinc-200 leading-relaxed">{memory.note}</p>
                    <p className="text-xs text-zinc-500 mt-2">
                      {new Date(memory.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <AddMemoryForm cardId={card.id} />
        </section>
      )}
    </div>
  )
}
