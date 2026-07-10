import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { containsProfanity } from "../lib/profanityFilter";
import { Send } from "lucide-react";

interface Props {
  userId: string;
  token: string;
}

export default function ChatInput({ userId, token }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.length > 300) { setError("Max 300 characters."); return; }
    if (containsProfanity(trimmed)) { setError("Message contains inappropriate language."); return; }

    setLoading(true);
    setError("");
    try {
      await sendMessage({ content: trimmed, userId: userId as any, token });
      setValue("");
    } catch (e: any) {
      setError(e.message || "Failed to send.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
      {error && <p className="text-xs mb-2" style={{ color: "var(--danger)" }}>{error}</p>}
      <div className="flex items-end gap-2 rounded-xl p-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <textarea
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Mag-usap tayo... (max 300)"
          rows={1}
          maxLength={300}
          className="flex-1 bg-transparent resize-none outline-none text-sm"
          style={{ color: "var(--text-primary)", maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !value.trim()}
          className="p-2 rounded-lg transition-all"
          style={{ background: value.trim() ? "var(--accent)" : "var(--surface)", color: "var(--text-primary)", opacity: loading ? 0.6 : 1 }}
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)" }}>{value.length}/300</p>
    </div>
  );
}
