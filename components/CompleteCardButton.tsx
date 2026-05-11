"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckCircle } from "lucide-react"

export function CompleteCardButton({ cardId }: { cardId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function complete() {
    setLoading(true)
    const res = await fetch(`/api/cards/${cardId}/complete`, { method: "PATCH" })
    setLoading(false)
    if (res.ok) {
      toast.success("Card completed! Add memories to remember the moment.")
      router.refresh()
    } else {
      toast.error("Failed to complete card")
    }
  }

  return (
    <Button
      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
      onClick={complete}
      disabled={loading}
    >
      <CheckCircle className="size-4 mr-2" />
      {loading ? "Completing…" : "Mark as complete"}
    </Button>
  )
}
