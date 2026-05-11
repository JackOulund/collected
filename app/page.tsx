import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { MtgCard } from "@/components/MtgCard"
import { cn } from "@/lib/utils"

const demoCards = [
  {
    id: "1",
    title: "Candlelit Dinner",
    description: "A night to remember — your choice of restaurant, my treat.",
    flavorText: "Some moments are worth a thousand words.",
    type: "Date Night",
    color: "red" as const,
    imageUrl: null,
    power: "∞",
    toughness: "∞",
    status: "active" as const,
  },
  {
    id: "2",
    title: "Lazy Sunday",
    description: "Breakfast in bed, movies, and zero responsibilities.",
    flavorText: "The best adventures are the ones without a plan.",
    type: "Treat",
    color: "green" as const,
    imageUrl: null,
    power: "5",
    toughness: "7",
    status: "active" as const,
  },
  {
    id: "3",
    title: "Surprise Getaway",
    description: "Pack a bag — I'll handle everything else.",
    flavorText: "Trust is the most powerful spell.",
    type: "Adventure",
    color: "gold" as const,
    imageUrl: null,
    power: "9",
    toughness: "9",
    status: "active" as const,
  },
]

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-8 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="space-y-4 max-w-2xl">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase">
            Gift cards, reimagined
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Give experiences,
            <br />
            <span className="text-amber-400">not things.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Create beautiful MTG-style gift cards for the people you love.
            Each card is a promise — a dinner, an adventure, a moment together.
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/auth/signup"
            className={cn(buttonVariants({ size: "lg" }), "bg-amber-500 hover:bg-amber-400 text-black font-bold")}
          >
            Start gifting
          </Link>
          <Link href="/auth/signin" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Demo cards */}
      <section className="py-20 px-6">
        <h2 className="text-center text-2xl font-bold mb-12 text-zinc-300">
          Every experience, a card
        </h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {demoCards.map((card, i) => (
            <div
              key={card.id}
              className="transition-transform"
              style={{ transform: `rotate(${(i - 1) * 4}deg)` }}
            >
              <MtgCard card={card} />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-zinc-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-12 text-zinc-300">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create a card", desc: "Design an MTG-style card for any experience — a dinner, a massage, a surprise trip." },
              { step: "02", title: "Send it", desc: "Send it to someone you love, with an optional personal letter." },
              { step: "03", title: "Play it", desc: "When they're ready, they play the card. You set a date. Together you make it happen." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="space-y-3">
                <span className="text-amber-400 text-4xl font-black">{step}</span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-16 px-6 text-center border-t border-zinc-800">
        <p className="text-zinc-500 text-sm">Built with love. Free to use.</p>
      </section>
    </main>
  )
}
