import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { saveSession } from "../lib/session";
import { PH_LOCATIONS } from "../lib/philippineLocations";

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for insecure iframe environments where crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

const withTimeout = <T,>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

export default function Register() {
  const navigate = useNavigate();
  const registerUser = useMutation(api.users.registerUser);
  const betaSlots = useQuery(api.users.getBetaSlots);

  const [username, setUsername] = useState("");
  const [region, setRegion] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedRegion = PH_LOCATIONS.find((r) => r.region === region);

  const handleRegister = async () => {
    setError("");

    if (!username || !region || !location || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      const result = await withTimeout(
        registerUser({ username, location, region, passwordHash }),
        8000,
        "Connection timed out. Please check your internet connection or Convex database URL."
      );
      saveSession({
        userId: result.userId,
        token: result.token,
        username: result.username,
        location: result.location,
      });
      navigate("/forum");
    } catch (e: any) {
      setError(e.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--accent)" }}>
            Himamat
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Open forum para sa mga Pilipino
          </p>
          {betaSlots && (
            <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              {betaSlots.used}/{betaSlots.total} beta slots used
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. juan_dela_cruz"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Region</label>
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setLocation(""); }}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            >
              <option value="">Select region...</option>
              {PH_LOCATIONS.map((r) => (
                <option key={r.region} value={r.region}>{r.label}</option>
              ))}
            </select>
          </div>

          {selectedRegion && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>City / Province</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                <option value="">Select location...</option>
                {selectedRegion.cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "var(--accent)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Sumali sa Himamat"}
          </button>

          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "var(--accent)" }}>Sign in</a>
          </p>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Messages auto-delete after 1 hour. 🕐<br />
          Be kind. Maging mabait.
        </p>
      </div>
    </div>
  );
}
