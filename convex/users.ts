import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_USERS = 100;

export const registerUser = mutation({
  args: {
    username: v.string(),
    location: v.string(),
    region: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Beta cap
    const allUsers = await ctx.db.query("users").collect();
    if (allUsers.length >= MAX_USERS) {
      throw new Error("Beta is full. Join the waitlist!");
    }

    // Validate username
    const username = args.username.trim();
    if (username.length < 3 || username.length > 20) {
      throw new Error("Username must be 3–20 characters.");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error("Letters, numbers, and underscores only.");
    }

    // Check uniqueness
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (existing) throw new Error("Username already taken.");

    // Insert user
    const userId = await ctx.db.insert("users", {
      username,
      location: args.location,
      region: args.region,
      passwordHash: args.passwordHash,
      createdAt: Date.now(),
      isActive: true,
      messageCount: 0,
    });

    // Create session
    const token = crypto.randomUUID();
    await ctx.db.insert("sessions", {
      userId,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return { userId, token, username, location: args.location };
  },
});

export const loginUser = mutation({
  args: {
    username: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user || user.passwordHash !== args.passwordHash) {
      throw new Error("Invalid username or password.");
    }
    if (!user.isActive) throw new Error("This account has been suspended.");

    const token = crypto.randomUUID();
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return { userId: user._id, token, username: user.username, location: user.location };
  },
});

export const getBetaSlots = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return { used: users.length, total: MAX_USERS };
  },
});
