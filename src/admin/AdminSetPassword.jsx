import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const MIN_LENGTH = 8;

export default function AdminSetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenHash = searchParams.get("token_hash") || "";
  const flow = searchParams.get("flow") === "reset" ? "reset" : "invite";

  const [status, setStatus] = useState(tokenHash ? "verifying" : "invalid"); // verifying | ready | invalid
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const verifyStarted = useRef(false);

  // The emailed link is single-use, so verify it exactly once (React StrictMode runs effects twice in dev).
  useEffect(() => {
    if (!tokenHash || verifyStarted.current) return;
    verifyStarted.current = true;

    (async () => {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
      if (error || !data?.session) {
        setStatus("invalid");
        return;
      }
      setEmail(data.user?.email || "");
      setSessionToken(data.session?.access_token || "");
      setStatus("ready");
      // Remove the one-time token from the address bar.
      window.history.replaceState({}, "", `/admin/set-password?flow=${flow}`);
    })();
  }, [tokenHash, flow]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (password.length < MIN_LENGTH) {
      setMessage(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const token = sessionToken || (await supabase.auth.getSession()).data?.session?.access_token;
      if (!token) {
        setMessage("Your invitation session expired. Please reopen the email link and try again.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/admin/complete-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(json.message || "The password could not be saved.");
        setSaving(false);
        return;
      }

      // Password is saved: end this temporary session and send them to the admin login.
      await supabase.auth.signOut().catch(() => {});
      navigate("/admin", {
        replace: true,
        state: { notice: "Your password has been saved. Please sign in.", email },
      });
    } catch {
      setMessage("Could not reach the server. Please try again.");
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none";
  const labelClass = "block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4eee8] px-5 py-10">
      <div className="w-full max-w-md bg-[#fbf8f4] border border-[#352820]/10 rounded-xl p-6 sm:p-8 shadow-[0_18px_60px_rgba(53,40,32,0.08)]">
        <p className="text-[11px] tracking-[.22em] uppercase text-[#a77c67] mb-2">
          {flow === "reset" ? "Password reset" : "Admin invitation"}
        </p>
        <h1 className="font-display text-3xl text-[#352820] mb-4">
          {flow === "reset" ? "Choose a new password" : "Create your password"}
        </h1>

        {status === "verifying" && <p className="text-sm text-[#352820]/60">Checking your invitation…</p>}

        {status === "invalid" && (
          <div className="space-y-4">
            <p className="text-sm text-[#4b342d] bg-[#fbf3ef] border border-[#d4b4a7] rounded px-3 py-2">
              This link is invalid or has expired. Ask an admin to send you a new invitation, or request a password reset.
            </p>
            <Link to="/admin/reset-password" className="inline-block text-[12px] tracking-[.18em] uppercase text-[#a77c67] hover:text-[#352820]">
              Request a new link
            </Link>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} readOnly className={`${inputClass} bg-[#f4eee8] text-[#352820]/70`} />
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder={`At least ${MIN_LENGTH} characters`}
                autoComplete="new-password"
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>

            {message && <p className="text-sm text-[#4b342d] bg-[#fbf3ef] border border-[#d4b4a7] rounded px-3 py-2">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-2 bg-[#352820] text-white text-[12px] tracking-[.22em] uppercase py-3.5 rounded-full hover:bg-[#a77c67] transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
