import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  handler: async (ctx) => {
    const now = Date.now();
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_created")
      .order("desc")
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .take(50);
    return messages.reverse();
  },
});

export const sendMessage = mutation({
  args: {
    content: v.string(),
    userId: v.id("users"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Session expired. Please log in again.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user || !user.isActive) throw new Error("User not found.");

    // Rate limit
    if (user.lastMessageAt && Date.now() - user.lastMessageAt < 2000) {
      throw new Error("Sending too fast. Please slow down.");
    }

    const content = args.content.trim();
    if (!content || content.length > 300) {
      throw new Error("Message must be 1–300 characters.");
    }

    const now = Date.now();
    await ctx.db.insert("messages", {
      userId: args.userId,
      username: user.username,
      location: user.location,
      content,
      createdAt: now,
      expiresAt: now + 3_600_000, // 1 hour
      isDeleted: false,
      reactions: [],
    });

    await ctx.db.patch(args.userId, {
      lastMessageAt: now,
      messageCount: (user.messageCount || 0) + 1,
    });

    // Schedule cleanup
    await ctx.scheduler.runAfter(3_660_000, "messages:deleteExpiredMessages", {});
  },
});

export const deleteExpiredMessages = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("messages")
      .withIndex("by_expires")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .take(100);
    await Promise.all(expired.map((m) => ctx.db.patch(m._id, { isDeleted: true })));
  },
});
