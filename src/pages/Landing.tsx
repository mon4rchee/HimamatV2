import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--accent)" }}>
          Himamat
        </h1>
        <p className="text-base mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          An ephemeral open forum for Filipinos. <br />
          Messages wait, speak, and pass on after an hour.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link
            to="/register"
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "var(--accent)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Sumali sa Himamat
          </Link>
          <Link
            to="/login"
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Pumasok
          </Link>
        </div>
      </div>
    </div>
  );
}
