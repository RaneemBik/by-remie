import { useCallback, useEffect, useState } from "react";
import { UserPlus, ShieldOff, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminUsers() {
  const { activeAdminEmail, isSuperAdmin, listAdmins, inviteAdmin, updateAdminRole, removeAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result = await listAdmins();
    if (result.ok) setAdmins(result.users);
    else setMessage(result.message);
  }, [listAdmins]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await inviteAdmin(email, inviteRole);
    setMessage(result.message);
    if (result.ok) {
      setEmail("");
      setInviteRole("admin");
    }
    setBusy(false);
    load();
  };

  const handleResend = async (target) => {
    const result = await inviteAdmin(target, "admin");
    setMessage(result.message);
    load();
  };

  const handleRoleChange = async (target, role) => {
    const result = await updateAdminRole(target, role);
    setMessage(result.message);
    load();
  };

  const handleRemove = async (target) => {
    if (!window.confirm(`Remove admin access for ${target}?`)) return;
    const result = await removeAdmin(target);
    setMessage(result.message);
    load();
  };

  const formatDate = (value) => {
    if (!value) return "Not yet";
    return new Date(value).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-[11px] tracking-[.22em] uppercase text-[#a77c67] mb-1">Access</p>
          <h1 className="font-display text-3xl sm:text-4xl">Admin users</h1>
        </div>
      </div>

      {message && (
        <div className="mb-5 rounded border border-[#d4b4a7] bg-[#fbf3ef] px-4 py-3 text-sm text-[#4b342d]">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-[#fbf8f4] border border-[#352820]/10 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-[#a77c67]" />
            <h2 className="font-display text-2xl">Invite admin</h2>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">
                Admin email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none"
                placeholder="newadmin@email.com"
              />
            </div>

            {isSuperAdmin && (
              <div>
                <label className="block text-[11px] tracking-[.22em] uppercase text-[#352820]/50 mb-2">
                  Access level
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full border border-[#352820]/15 rounded-lg px-4 py-3 bg-white focus:border-[#a77c67] outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#352820] text-white text-[12px] tracking-[.22em] uppercase py-3 rounded-full hover:bg-[#a77c67] transition-colors disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send invite"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#352820]/10">
            <p className="text-sm text-[#352820]/60">
              The invited admin receives an email with a secure, one-time link to set their own password. After saving it they are taken to the admin login.
            </p>
            <p className="text-xs text-[#352820]/55 mt-3">
              Until they set a password and sign in, they cannot open the dashboard.
            </p>
          </div>
        </section>

        <section className="bg-[#fbf8f4] border border-[#352820]/10 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Eye className="w-4 h-4 text-[#a77c67]" />
            <h2 className="font-display text-2xl">Admins</h2>
          </div>

          <div className="space-y-3">
            {admins.length === 0 && <p className="text-sm text-[#352820]/55">No admins yet.</p>}
            {admins.map((admin) => {
              const isSelf = activeAdminEmail && admin.email.toLowerCase() === activeAdminEmail.toLowerCase();
              const pending = admin.status !== "active";
              const isSuper = (admin.role || "admin") === "super_admin";
              const canEditRole = isSuperAdmin && !isSelf;
              return (
                <div key={admin.email} className="border border-[#352820]/10 rounded-lg p-3 sm:p-4 bg-white/80">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-[#352820] break-all">{admin.email}</p>
                      <p className="text-xs text-[#352820]/55 mt-1">
                        {pending ? `Invited ${formatDate(admin.invitedAt)} — waiting for password` : `Last sign-in: ${formatDate(admin.lastSignInAt)}`}
                      </p>
                      {pending && (
                        <p className="text-[10px] tracking-[.18em] uppercase text-[#b8862f] mt-2">Pending invitation</p>
                      )}
                      {isSelf && <p className="text-[10px] tracking-[.18em] uppercase text-[#a77c67] mt-2">Current admin</p>}
                      <p className="text-[10px] tracking-[.18em] uppercase text-[#352820]/60 mt-2">
                        {isSuper ? "Super admin" : "Admin"}
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                      {pending && (
                        <button
                          type="button"
                          onClick={() => handleResend(admin.email)}
                          className="w-full text-left text-[#a77c67] text-[11px] tracking-[.18em] uppercase hover:text-[#352820] sm:w-auto sm:text-right"
                        >
                          Resend
                        </button>
                      )}

                      {canEditRole && (
                        <select
                          value={admin.role || "admin"}
                          onChange={(e) => handleRoleChange(admin.email, e.target.value)}
                          className="w-full border border-[#352820]/15 rounded px-2 py-2 bg-white outline-none text-[10px] tracking-[.14em] uppercase sm:w-auto"
                          aria-label={`Change role for ${admin.email}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super admin</option>
                        </select>
                      )}

                      {!isSelf && !isSuper && (
                        <button
                          type="button"
                          onClick={() => handleRemove(admin.email)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded border border-[#a04d42]/20 bg-[#fff6f4] px-3 py-2 text-[#a04d42] text-[11px] tracking-[.18em] uppercase hover:text-[#7c372f] sm:w-auto sm:justify-end"
                          aria-label={`Remove ${admin.email}`}
                        >
                          <ShieldOff className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
