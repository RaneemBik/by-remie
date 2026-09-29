import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

async function api(path, { method = "GET", body } = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, ...json };
}

/** A signed-in Supabase user is only an admin if they have an ACTIVE row in admin_users
 *  (a row becomes active only after the invitee has set a password). */
async function fetchActiveAdmin(userId) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("email, status, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data || data.status !== "active") return null;
  return { ...data, role: data.role || "admin" };
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [activeAdminEmail, setActiveAdminEmail] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    const admin = user ? await fetchActiveAdmin(user.id) : null;
    setIsAdmin(Boolean(admin));
    setIsSuperAdmin(Boolean(admin && admin.role === "super_admin"));
    setActiveAdminEmail(admin?.email || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Don't call supabase inside this callback directly (can deadlock) — defer it.
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setTimeout(refresh, 0);
    });

    // If an admin is removed while their tab is open, lock them out when they come back.
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      setError("Enter your admin email and password.");
      return false;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError || !data?.user) {
      setError("That email or password isn't valid.");
      return false;
    }

    const admin = await fetchActiveAdmin(data.user.id);
    if (!admin) {
      await supabase.auth.signOut();
      setError("That email or password isn't valid.");
      return false;
    }

    setIsAdmin(true);
    setIsSuperAdmin(admin.role === "super_admin");
    setActiveAdminEmail(admin.email);
    setError("");
    return true;
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore — local state is cleared below either way
    }
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setActiveAdminEmail("");
    setError("");
    return true;
  }, []);

  // --- Admin management (all writes happen on the server) ---
  const listAdmins = useCallback(async () => {
    const result = await api("/api/admin/users");
    return result.ok ? { ok: true, users: result.users } : { ok: false, message: result.message || "Could not load admins." };
  }, []);

  const inviteAdmin = useCallback(async (email, role = "admin") => {
    const result = await api("/api/admin/invite", { method: "POST", body: { email, role } });
    return { ok: result.ok, message: result.message || (result.ok ? "Invitation sent." : "The invitation could not be sent.") };
  }, []);

  const updateAdminRole = useCallback(async (email, role) => {
    const result = await api("/api/admin/users/role", { method: "PATCH", body: { email, role } });
    return { ok: result.ok, message: result.message || (result.ok ? "Role updated." : "Could not change the role.") };
  }, []);

  const removeAdmin = useCallback(async (email) => {
    const result = await api("/api/admin/users", { method: "DELETE", body: { email } });
    return { ok: result.ok, message: result.message || (result.ok ? "Admin removed." : "Could not remove admin.") };
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { ok: false, message: "Enter a valid email address." };
    }
    const result = await api("/api/admin/forgot-password", { method: "POST", body: { email: normalizedEmail } });
    return { ok: result.ok, message: result.message || "If that email belongs to an admin, a link has been sent." };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAdmin,
        activeAdminEmail,
        isSuperAdmin,
        error,
        setError,
        login,
        logout,
        listAdmins,
        inviteAdmin,
        updateAdminRole,
        removeAdmin,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
