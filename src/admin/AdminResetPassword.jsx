import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Requests a reset email. The emailed link opens /admin/set-password (see AdminSetPassword).
export default function AdminResetPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await requestPasswordReset(email);
    setMessage(result.message);
    setSent(result.ok);
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4eee8] px-5 py-10">
      <div className="w-full max-w-md bg-[#fbf8f4] border border-[#352820]/10 rounded-xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(53,40,32,0.08)]">
        <p className="text-[11px] tracking-[.22em] uppercase text-[#a77c67] mb-2">Admin access</p>
        <h1 className="font-display text-3xl text-[#352820] mb-4">Reset password</h1>

        {!sent && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none"
                placeholder="admin@byremie.com"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#352820] text-white text-[12px] tracking-[.22em] uppercase py-3.5 rounded-full hover:bg-[#a77c67] transition-colors disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-[#4b342d] bg-[#fbf3ef] border border-[#d4b4a7] rounded px-3 py-2">{message}</p>}

        <Link to="/admin" className="inline-block mt-5 text-[12px] tracking-[.18em] uppercase text-[#a77c67] hover:text-[#352820]">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
