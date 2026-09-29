import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
  const { activeAdminEmail, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMessage("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setBusy(true);
    const result = await changePassword(newPassword);
    setMessage(result.message);
    if (result.ok) {
      setNewPassword("");
      setConfirmPassword("");
    }
    setBusy(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] tracking-[.22em] uppercase text-[#a77c67] mb-1">Account</p>
        <h1 className="font-display text-3xl sm:text-4xl">Change password</h1>
      </div>

      {message && (
        <div className="mb-5 rounded border border-[#d4b4a7] bg-[#fbf3ef] px-4 py-3 text-sm text-[#4b342d]">
          {message}
        </div>
      )}

      <section className="bg-[#fbf8f4] border border-[#352820]/10 rounded-xl p-4 sm:p-6">
        <div className="mb-5">
          <p className="text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">Signed in as</p>
          <p className="text-lg font-medium text-[#352820] break-all">{activeAdminEmail || "Admin"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#352820] text-white text-[12px] tracking-[.22em] uppercase py-3 rounded-full hover:bg-[#a77c67] transition-colors disabled:opacity-60"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
