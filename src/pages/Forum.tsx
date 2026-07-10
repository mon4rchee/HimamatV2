import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, clearSession } from "../lib/session";
import ChatBox from "../components/ChatBox";
import ChatInput from "../components/ChatInput";
import { LogOut } from "lucide-react";

export default function Forum() {
  const navigate = useNavigate();
  const session = getSession();
  const messages = useQuery(api.messages.getMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  if (!session) return null;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--accent)" }}>
            Himamat
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Messages disappear after 1 hour
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold" style={{ color: "var(--text-username)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {session.username}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{session.location}</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 chat-scroll">
        {messages === undefined && (
          <p className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
            Loading...
          </p>
        )}
        {messages?.length === 0 && (
          <p className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
            Walang mensahe pa. Maging una. 👋
          </p>
        )}
        {messages?.map((msg) => (
          <ChatBox
            key={msg._id}
            message={msg}
            currentUserId={session.userId}
            currentUserToken={session.token}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput userId={session.userId} token={session.token} />
    </div>
  );
}
