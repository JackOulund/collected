"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message ?? "Sign up failed")
    } else {
      router.push("/hand")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-zinc-400 text-sm">Start gifting experiences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-amber-400 hover:text-amber-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
