import { mutation } from "./_generated/server";
import { v } from "convex/values";

const ALLOWED_REACTIONS = ["❤️", "😂", "😮", "😢", "👏", "🔥"];

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (!ALLOWED_REACTIONS.includes(args.emoji)) {
      throw new Error("Invalid reaction.");
    }
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found.");

    const reactions = message.reactions || [];
    const existingIndex = reactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === args.userId
    );

    const updated =
      existingIndex >= 0
        ? reactions.filter((_, i) => i !== existingIndex)
        : [...reactions, { emoji: args.emoji, userId: args.userId }];

    await ctx.db.patch(args.messageId, { reactions: updated });
  },
});
