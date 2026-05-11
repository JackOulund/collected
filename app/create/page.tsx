"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MtgCard, type CardColor } from "@/components/MtgCard"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Send } from "lucide-react"

const STEPS = ["Design", "Recipient", "Letter"] as const
type Step = typeof STEPS[number]

const CARD_TYPES = ["Date Night", "Treat", "Adventure", "Escape", "Surprise", "Comfort", "Wild Card"]
const CARD_COLORS: { value: CardColor; label: string }[] = [
  { value: "white", label: "White — Pure" },
  { value: "blue", label: "Blue — Serene" },
  { value: "black", label: "Black — Mysterious" },
  { value: "red", label: "Red — Passionate" },
  { value: "green", label: "Green — Wild" },
  { value: "gold", label: "Gold — Legendary" },
  { value: "colorless", label: "Colorless — Classic" },
]

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [card, setCard] = useState({
    title: "",
    description: "",
    flavorText: "",
    type: "Date Night",
    color: "gold" as CardColor,
    imageUrl: "",
    power: "",
    toughness: "",
  })
  const [recipientEmail, setRecipientEmail] = useState("")
  const [letterBody, setLetterBody] = useState("")

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: form })
    const data = await res.json()
    setUploading(false)
    if (data.url) {
      setCard((c) => ({ ...c, imageUrl: data.url }))
    } else {
      toast.error("Image upload failed")
    }
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      // Resolve recipient email to user id
      const userRes = await fetch(`/api/users/by-email?email=${encodeURIComponent(recipientEmail)}`)
      const userData = await userRes.json()
      if (!userData.id) {
        toast.error("Could not find a user with that email")
        setLoading(false)
        return
      }

      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...card,
          recipientId: userData.id,
          letterBody: letterBody || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Failed to create card")
      } else {
        toast.success("Card sent!")
        router.push("/sent")
      }
    } catch {
      toast.error("Something went wrong")
    }
    setLoading(false)
  }

  const previewCard = {
    id: "preview",
    ...card,
    status: "active" as const,
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create a card</h1>
          <p className="text-zinc-400 text-sm">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-amber-500" : "bg-zinc-700"}`}
          />
        ))}
      </div>

      {/* Step 1: Design */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <MtgCard card={previewCard} className="pointer-events-none" />
            <p className="text-zinc-500 text-xs">Live preview</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Card name</Label>
              <Input
                placeholder="e.g. Candlelit Dinner"
                value={card.title}
                onChange={(e) => setCard({ ...card, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this card grant?"
                value={card.description}
                onChange={(e) => setCard({ ...card, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Flavor text <span className="text-zinc-500">(optional)</span></Label>
              <Input
                placeholder="A poetic note in italics…"
                value={card.flavorText}
                onChange={(e) => setCard({ ...card, flavorText: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={card.type} onValueChange={(v) => v && setCard({ ...card, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={card.color} onValueChange={(v) => setCard({ ...card, color: v as CardColor })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Power <span className="text-zinc-500">(optional)</span></Label>
                <Input placeholder="e.g. 9" value={card.power} onChange={(e) => setCard({ ...card, power: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Toughness <span className="text-zinc-500">(optional)</span></Label>
                <Input placeholder="e.g. 9" value={card.toughness} onChange={(e) => setCard({ ...card, toughness: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Card art <span className="text-zinc-500">(optional)</span></Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-zinc-400">Uploading…</p>}
            </div>
          </div>

          <Button
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
            onClick={() => setStep(1)}
            disabled={!card.title || !card.description}
          >
            Next: Choose recipient <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Recipient */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Recipient email</Label>
            <Input
              type="email"
              placeholder="their@email.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <p className="text-zinc-500 text-xs">They must already have a Collected account.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
              <ArrowLeft className="size-4 mr-2" /> Back
            </Button>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold"
              onClick={() => setStep(2)}
              disabled={!recipientEmail}
            >
              Next: Letter <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Letter */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Personal letter <span className="text-zinc-500">(optional)</span></Label>
            <Textarea
              placeholder="Write something personal to go with this card…"
              value={letterBody}
              onChange={(e) => setLetterBody(e.target.value)}
              rows={8}
              className="font-serif text-base leading-relaxed"
            />
            <p className="text-zinc-500 text-xs">Shown to the recipient alongside their cards.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ArrowLeft className="size-4 mr-2" /> Back
            </Button>
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Sending…" : "Send card"} <Send className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
