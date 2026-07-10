export interface Session {
  userId: string;
  token: string;
  username: string;
  location: string;
}

export function saveSession(session: Session) {
  localStorage.setItem("himamat_session", JSON.stringify(session));
}

export function getSession(): Session | null {
  const raw = localStorage.getItem("himamat_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("himamat_session");
}
