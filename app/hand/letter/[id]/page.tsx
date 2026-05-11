import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import { db } from "@/lib/db"
import { giftLetters, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect("/auth/signin")

  const { id } = await params

  const [letter] = await db
    .select({
      id: giftLetters.id,
      body: giftLetters.body,
      createdAt: giftLetters.createdAt,
      recipientId: giftLetters.recipientId,
      creatorName: users.name,
    })
    .from(giftLetters)
    .leftJoin(users, eq(giftLetters.creatorId, users.id))
    .where(eq(giftLetters.id, id))

  if (!letter || letter.recipientId !== session.user.id) redirect("/hand")

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-8 space-y-6">
      <Link href="/hand" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}>
        <ArrowLeft className="size-4 mr-1" /> Back
      </Link>

      {/* Letter paper */}
      <div className="bg-amber-50 text-zinc-900 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="border-b border-amber-900" style={{ marginTop: i === 0 ? 64 : undefined, height: 32 }} />
          ))}
        </div>

        <div className="relative space-y-1">
          <p className="font-serif text-sm text-zinc-500">
            {new Date(letter.createdAt!).toLocaleDateString("en-US", { dateStyle: "long" })}
          </p>
          {letter.creatorName && (
            <p className="font-serif text-sm text-zinc-500">From {letter.creatorName}</p>
          )}
        </div>

        <div className="relative">
          <p className="font-serif text-base leading-8 whitespace-pre-wrap">{letter.body}</p>
        </div>

        <div className="relative pt-4 border-t border-amber-200">
          <p className="font-serif text-sm text-zinc-500 italic">
            With love, {letter.creatorName ?? "your person"}
          </p>
        </div>
      </div>
    </div>
  )
}
