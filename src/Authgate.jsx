import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  function friendlyError(code) {
    const map = {
      "auth/email-already-in-use": "That email already has an account — try signing in instead.",
      "auth/invalid-email": "That email doesn't look right.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/user-not-found": "No account found with that email.",
      "auth/wrong-password": "Wrong password.",
      "auth/invalid-credential": "Email or password is incorrect.",
    };
    return map[code] || "Something went wrong. Try again.";
  }

  // Still checking auth state
  if (user === undefined) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingText}>Loading…</div>
      </div>
    );
  }

  // Logged in — show the app, with a small sign-out control passed down
  if (user) {
    return children(user, () => signOut(auth));
  }

  // Not logged in — show the form
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.eyebrow}>PERSONAL OCEAN SPECIES LOG</div>
        <h1 style={styles.title}>Reef Ledger</h1>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === "signin" ? styles.tabActive : {}) }}
            onClick={() => { setMode("signin"); setError(null); }}
          >
            Sign In
          </button>
          <button
            style={{ ...styles.tab, ...(mode === "signup" ? styles.tabActive : {}) }}
            onClick={() => { setMode("signup"); setError(null); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={styles.field}>
            <span style={styles.label}>Email</span>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input} placeholder="you@example.com"
            />
          </label>
          <label style={styles.field}>
            <span style={styles.label}>Password</span>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input} placeholder="At least 6 characters"
              minLength={6}
            />
          </label>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={busy} style={styles.submitBtn}>
            {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0E2626", color: "#EAE3D2", fontFamily: "sans-serif" },
  loadingText: { fontSize: 14, color: "#8FBFAE" },
  wrap: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0E2626", padding: 20, boxSizing: "border-box" },
  card: { width: "100%", maxWidth: 360, background: "#0A1D1D", border: "1px solid #547368", borderRadius: 16, padding: "28px 24px" },
  eyebrow: { fontFamily: "monospace", fontSize: 10.5, letterSpacing: "0.18em", color: "#8FBFAE", marginBottom: 4, textAlign: "center" },
  title: { fontFamily: "serif", fontSize: 28, fontWeight: 600, margin: "0 0 20px", color: "#EAE3D2", textAlign: "center" },
  tabs: { display: "flex", gap: 8, marginBottom: 20 },
  tab: { flex: 1, padding: "8px 0", background: "transparent", border: "1px solid #547368", borderRadius: 8, color: "#8FBFAE", fontSize: 13, cursor: "pointer" },
  tabActive: { background: "#8FBFAE", color: "#0A1D1D", borderColor: "#8FBFAE" },
  field: { display: "block", marginBottom: 14 },
  label: { display: "block", fontSize: 11, color: "#8FBFAE", marginBottom: 5, fontFamily: "monospace" },
  input: { width: "100%", background: "#0E2626", border: "1px solid #547368", borderRadius: 7, padding: "10px 12px", color: "#EAE3D2", fontSize: 14, boxSizing: "border-box", outline: "none" },
  error: { color: "#E4572E", fontSize: 12.5, marginBottom: 12 },
  submitBtn: { width: "100%", background: "#E4572E", color: "#fff", border: "none", borderRadius: 8, padding: "12px 14px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4 },
};