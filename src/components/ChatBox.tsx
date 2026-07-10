import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const REACTIONS = ["❤️", "😂", "😮", "😢", "👏", "🔥"];

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function groupReactions(reactions: { emoji: string; userId: string }[]) {
  return reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

interface Props {
  key?: React.Key;
  message: any;
  currentUserId: string;
  currentUserToken: string;
}

export default function ChatBox({ message, currentUserId }: Props) {
  const [showReactions, setShowReactions] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleReaction = useMutation(api.reactions.toggleReaction);

  const isOwn = message.userId === currentUserId;
  const grouped = groupReactions(message.reactions || []);

  const handlePointerDown = () => {
    longPressTimer.current = setTimeout(() => setShowReactions(true), 500);
  };
  const handlePointerUp = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleReact = async (emoji: string) => {
    setShowReactions(false);
    await toggleReaction({
      messageId: message._id,
      emoji,
      userId: currentUserId as any,
    });
  };

  return (
    <div className={`relative flex flex-col mb-3 ${isOwn ? "items-end" : "items-start"}`}>
      {/* Meta */}
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="text-xs font-semibold" style={{ color: "var(--text-username)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {message.username}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
          {message.location}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatTime(message.createdAt)}
        </span>
      </div>

      {/* Bubble */}
      <div
        className="max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed cursor-pointer"
        style={{
          background: isOwn ? "var(--accent)" : "var(--surface)",
          color: "var(--text-primary)",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {message.content}
      </div>

      {/* Reaction counts */}
      {Object.keys(grouped).length > 0 && (
        <div className="flex gap-1 mt-1 px-1 flex-wrap">
          {Object.entries(grouped).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            >
              {emoji} <span style={{ color: "var(--text-muted)" }}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reaction Picker */}
      <AnimatePresence>
        {showReactions && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowReactions(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute z-50 flex gap-2 px-3 py-2 rounded-2xl"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                bottom: "110%",
                left: isOwn ? "auto" : "0",
                right: isOwn ? "0" : "auto",
              }}
            >
              {REACTIONS.map((emoji, i) => (
                <motion.button
                  key={emoji}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-xl"
                  onClick={() => handleReact(emoji)}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
