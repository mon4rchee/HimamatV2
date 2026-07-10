import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    location: v.string(),
    region: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
    isActive: v.boolean(),
    messageCount: v.number(),
    lastMessageAt: v.optional(v.number()),
  }).index("by_username", ["username"]),

  messages: defineTable({
    userId: v.id("users"),
    username: v.string(),
    location: v.string(),
    content: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    isDeleted: v.boolean(),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userId: v.id("users"),
        })
      )
    ),
  })
    .index("by_created", ["createdAt"])
    .index("by_expires", ["expiresAt"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
