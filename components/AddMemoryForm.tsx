"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ImagePlus } from "lucide-react"

export function AddMemoryForm({ cardId }: { cardId: string }) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

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
      setImageUrl(data.url)
      toast.success("Image uploaded")
    } else {
      toast.error("Upload failed")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() && !imageUrl) return
    setSubmitting(true)
    const res = await fetch(`/api/cards/${cardId}/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, imageUrl }),
    })
    setSubmitting(false)
    if (res.ok) {
      setNote("")
      setImageUrl("")
      toast.success("Memory saved!")
      router.refresh()
    } else {
      toast.error("Failed to save memory")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
      <h3 className="font-semibold text-sm text-zinc-300">Add a memory</h3>

      <div className="space-y-2">
        <Label>Photo <span className="text-zinc-500">(optional)</span></Label>
        <Label
          htmlFor="memory-image"
          className="flex items-center gap-2 border-2 border-dashed border-zinc-700 rounded-lg p-3 cursor-pointer hover:border-zinc-500 transition-colors"
        >
          <ImagePlus className="size-4 text-zinc-400" />
          <span className="text-sm text-zinc-400">
            {uploading ? "Uploading…" : imageUrl ? "Photo added ✓" : "Choose a photo"}
          </span>
        </Label>
        <Input
          id="memory-image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={uploading}
        />
      </div>

      <div className="space-y-2">
        <Label>Note <span className="text-zinc-500">(optional)</span></Label>
        <Textarea
          placeholder="How was it? What will you remember?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
        disabled={submitting || uploading || (!note.trim() && !imageUrl)}
      >
        {submitting ? "Saving…" : "Save memory"}
      </Button>
    </form>
  )
}
