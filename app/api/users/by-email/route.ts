import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { requireSession } from "@/lib/session"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    await requireSession()
    const email = req.nextUrl.searchParams.get("email")
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    return NextResponse.json(user)
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
