import { pgTable, pgEnum, text, timestamp, boolean } from "drizzle-orm/pg-core"

export const cardStatusEnum = pgEnum("card_status", [
  "active",
  "proposed",
  "scheduled",
  "graveyard",
])

export const cardColorEnum = pgEnum("card_color", [
  "white",
  "blue",
  "black",
  "red",
  "green",
  "gold",
  "colorless",
])

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  emailVerified: boolean("email_verified"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const giftLetters = pgTable("gift_letters", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  flavorText: text("flavor_text"),
  type: text("type").notNull(),
  color: cardColorEnum("color").default("colorless").notNull(),
  imageUrl: text("image_url"),
  power: text("power"),
  toughness: text("toughness"),
  status: cardStatusEnum("status").default("active").notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id),
  letterId: text("letter_id").references(() => giftLetters.id),
  playNote: text("play_note"),
  redemptionDate: timestamp("redemption_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  redeemedAt: timestamp("redeemed_at"),
})

export const memories = pgTable("memories", {
  id: text("id").primaryKey(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
