"use client"

import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"
import Image from "next/image"

export type CardColor = "white" | "blue" | "black" | "red" | "green" | "gold" | "colorless"
export type CardStatus = "active" | "proposed" | "scheduled" | "graveyard"

export interface MtgCardData {
  id: string
  title: string
  description: string
  flavorText?: string | null
  type: string
  color: CardColor
  imageUrl?: string | null
  power?: string | null
  toughness?: string | null
  status: CardStatus
  redemptionDate?: Date | string | null
  creator?: { name?: string | null }
  recipient?: { name?: string | null }
}

const colorStyles: Record<CardColor, { border: string; header: string; glow: string; badge: string }> = {
  white:     { border: "border-slate-300",   header: "bg-slate-100",    glow: "hover:shadow-slate-300/60",   badge: "bg-slate-200 text-slate-800" },
  blue:      { border: "border-blue-400",    header: "bg-blue-900",     glow: "hover:shadow-blue-400/60",    badge: "bg-blue-800 text-blue-100" },
  black:     { border: "border-zinc-600",    header: "bg-zinc-900",     glow: "hover:shadow-zinc-500/60",    badge: "bg-zinc-800 text-zinc-100" },
  red:       { border: "border-red-500",     header: "bg-red-900",      glow: "hover:shadow-red-500/60",     badge: "bg-red-800 text-red-100" },
  green:     { border: "border-emerald-500", header: "bg-emerald-900",  glow: "hover:shadow-emerald-500/60", badge: "bg-emerald-800 text-emerald-100" },
  gold:      { border: "border-amber-400",   header: "bg-amber-900",    glow: "hover:shadow-amber-400/60",   badge: "bg-amber-700 text-amber-100" },
  colorless: { border: "border-stone-400",   header: "bg-stone-700",    glow: "hover:shadow-stone-400/60",   badge: "bg-stone-600 text-stone-100" },
}

const statusLabel: Record<CardStatus, string> = {
  active: "In Hand",
  proposed: "Played",
  scheduled: "Scheduled",
  graveyard: "Graveyard",
}

interface MtgCardProps {
  card: MtgCardData
  className?: string
  onClick?: () => void
  isDragging?: boolean
}

export function MtgCard({ card, className, onClick, isDragging }: MtgCardProps) {
  const styles = colorStyles[card.color]

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-64 rounded-xl border-2 overflow-hidden cursor-pointer select-none",
        "bg-zinc-950 text-white",
        "shadow-lg hover:shadow-2xl",
        "transition-all duration-200 hover:scale-105",
        styles.border,
        styles.glow,
        isDragging && "opacity-50 scale-105 rotate-3",
        onClick && "hover:cursor-pointer",
        className,
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between px-3 py-2", styles.header)}>
        <span className="font-bold text-sm truncate pr-2">{card.title}</span>
        <Badge className={cn("text-xs shrink-0", styles.badge)}>
          {card.type}
        </Badge>
      </div>

      {/* Art box */}
      <div className="mx-2 my-1.5 rounded-md overflow-hidden border border-white/10">
        <AspectRatio ratio={4 / 3}>
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={card.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center", styles.header)}>
              <span className="text-4xl opacity-30">✦</span>
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Type line */}
      <div className={cn("mx-2 px-2 py-0.5 text-xs rounded border border-white/10 font-medium", styles.header)}>
        Experience — {card.type}
      </div>

      {/* Text box */}
      <div className="mx-2 my-1.5 bg-stone-900/80 rounded-md border border-white/10 px-3 py-2 min-h-[80px]">
        <p className="text-xs leading-relaxed text-stone-100">{card.description}</p>
        {card.flavorText && (
          <p className="text-xs italic text-stone-400 mt-2 pt-2 border-t border-white/10">
            {card.flavorText}
          </p>
        )}
      </div>

      {/* Footer: stats + status */}
      <div className="flex items-center justify-between px-3 pb-2">
        <Badge variant="outline" className="text-xs text-stone-400 border-stone-600">
          {statusLabel[card.status]}
        </Badge>
        {(card.power || card.toughness) && (
          <div className={cn("text-sm font-bold px-2 py-0.5 rounded border", styles.header, styles.border)}>
            {card.power ?? "?"}/{card.toughness ?? "?"}
          </div>
        )}
      </div>
    </div>
  )
}
