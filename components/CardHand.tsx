"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { MtgCard, type MtgCardData } from "@/components/MtgCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skull } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function DraggableCard({ card }: { card: MtgCardData }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <MtgCard card={card} isDragging={isDragging} />
    </div>
  )
}

function GraveyardDrop({ isOver }: { isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: "graveyard-drop" })

  return (
    <div
      ref={setNodeRef}
      className={`
        fixed bottom-0 left-0 right-0 h-28 flex flex-col items-center justify-center gap-2
        border-t-2 transition-all duration-200
        ${isOver
          ? "border-amber-400 bg-amber-950/80 text-amber-400"
          : "border-zinc-700 bg-zinc-900/90 text-zinc-500"}
      `}
    >
      <Skull className="size-8" />
      <p className="text-sm font-medium">Drop here to play</p>
    </div>
  )
}

interface CardHandProps {
  cards: MtgCardData[]
}

export function CardHand({ cards: initialCards }: CardHandProps) {
  const router = useRouter()
  const [cards, setCards] = useState(initialCards)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isOver, setIsOver] = useState(false)
  const [pendingCard, setPendingCard] = useState<MtgCardData | null>(null)
  const [playNote, setPlayNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  )

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  function handleDragOver(e: { over: { id: string } | null }) {
    setIsOver(e.over?.id === "graveyard-drop")
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    setIsOver(false)
    if (e.over?.id === "graveyard-drop") {
      const card = cards.find((c) => c.id === e.active.id)
      if (card) {
        setPendingCard(card)
        setPlayNote("")
      }
    }
  }

  async function confirmPlay() {
    if (!pendingCard) return
    setSubmitting(true)
    const res = await fetch(`/api/cards/${pendingCard.id}/play`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playNote }),
    })
    setSubmitting(false)
    if (res.ok) {
      setCards((prev) => prev.map((c) => c.id === pendingCard.id ? { ...c, status: "proposed" as const } : c))
      setPendingCard(null)
      toast.success("Card played! Waiting for acceptance.")
      router.refresh()
    } else {
      toast.error("Failed to play card")
    }
  }

  const activeCards = cards.filter((c) => c.status === "active")
  const proposedCards = cards.filter((c) => c.status === "proposed")
  const scheduledCards = cards.filter((c) => c.status === "scheduled")
  const activeCard = cards.find((c) => c.id === activeId)

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver as never}
        onDragEnd={handleDragEnd}
      >
        <div className="pb-32 space-y-10">
          {/* Active cards — draggable */}
          {activeCards.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-300 px-1">Your hand</h2>
              <div className="flex flex-wrap gap-5 justify-center">
                {activeCards.map((card) => (
                  <DraggableCard key={card.id} card={card} />
                ))}
              </div>
              <p className="text-center text-zinc-500 text-xs mt-2">Drag a card to the bottom to play it</p>
            </section>
          )}

          {/* Proposed */}
          {proposedCards.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-500 px-1">Waiting for acceptance</h2>
              <div className="flex flex-wrap gap-5 justify-center opacity-60">
                {proposedCards.map((card) => (
                  <MtgCard key={card.id} card={card} />
                ))}
              </div>
            </section>
          )}

          {/* Scheduled */}
          {scheduledCards.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-amber-400 px-1">Scheduled</h2>
              <div className="flex flex-wrap gap-5 justify-center">
                {scheduledCards.map((card) => (
                  <MtgCard
                    key={card.id}
                    card={card}
                    onClick={() => router.push(`/cards/${card.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {activeCards.length === 0 && proposedCards.length === 0 && scheduledCards.length === 0 && (
            <div className="text-center py-24 text-zinc-500">
              <p className="text-lg">Your hand is empty.</p>
              <p className="text-sm mt-2">Ask someone to send you a card!</p>
            </div>
          )}
        </div>

        <GraveyardDrop isOver={isOver} />

        <DragOverlay>
          {activeCard && <MtgCard card={activeCard} className="rotate-6 scale-105" />}
        </DragOverlay>
      </DndContext>

      {/* Play confirmation dialog */}
      <Dialog open={!!pendingCard} onOpenChange={() => setPendingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Play &ldquo;{pendingCard?.title}&rdquo;?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-zinc-400 text-sm">
              This will notify the card creator. They&apos;ll set a date and accept it.
            </p>
            <div className="space-y-2">
              <Label>Add a note <span className="text-zinc-500">(optional)</span></Label>
              <Textarea
                placeholder="Tell them when you'd like to use it, or just say something sweet…"
                value={playNote}
                onChange={(e) => setPlayNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingCard(null)}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
              onClick={confirmPlay}
              disabled={submitting}
            >
              {submitting ? "Playing…" : "Play card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
