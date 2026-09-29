import { useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { isAdmin, loading, login, error } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const notice = location.state?.notice;

  if (loading) return null;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await login(email, password);
    setBusy(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#f4eee8] px-5 py-10">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-[#fbf8f4] border border-[#352820]/10 rounded-xl p-6 sm:p-8 w-full max-w-md shadow-[0_16px_60px_rgba(53,40,32,0.08)]"
      >
        <div className="w-12 h-12 rounded-full bg-[#f4e5df] flex items-center justify-center mb-6">
          <Lock className="w-5 h-5 text-[#a77c67]" />
        </div>
        <h1 className="font-display text-3xl text-[#352820] mb-1">Admin access</h1>
        <p className="text-sm text-[#352820]/60 mb-6">
          Sign in with your admin email and password.
        </p>

        {notice && (
          <p className="text-sm text-[#3f5b3a] bg-[#eef5ec] border border-[#c5dcc0] rounded px-3 py-2 mb-4">{notice}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none transition-colors"
              placeholder="admin@byremie.com"
              autoComplete="username"
              autoFocus={!location.state?.email}
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus={Boolean(location.state?.email)}
            />
          </div>
        </div>

        {error && <p className="text-xs text-[#a04d42] mt-3">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full mt-6 bg-[#352820] text-white text-[12px] tracking-[.22em] uppercase py-3.5 rounded-full hover:bg-[#a77c67] transition-colors disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Enter dashboard"}
        </button>

        <Link to="/admin/reset-password" className="block text-center mt-4 text-[12px] text-[#352820]/55 hover:text-[#a77c67]">
          Forgot your password?
        </Link>
      </motion.form>
    </div>
  );
}
