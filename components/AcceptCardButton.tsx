"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AcceptCardButton({ cardId }: { cardId: string }) {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function accept() {
    if (!date) return
    setLoading(true)
    const res = await fetch(`/api/cards/${cardId}/accept`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redemptionDate: date.toISOString() }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success("Card accepted! Date set.")
      setOpen(false)
      router.refresh()
    } else {
      toast.error("Failed to accept card")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold",
          "bg-amber-500 hover:bg-amber-400 text-black transition-colors",
        )}
      >
        <CalendarIcon className="size-4" />
        {date ? `Accept for ${format(date, "MMM d, yyyy")}` : "Accept & set date"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
        />
        <div className="p-3 border-t border-zinc-700">
          <Button
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
            onClick={accept}
            disabled={!date || loading}
          >
            {loading ? "Accepting…" : "Confirm"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
