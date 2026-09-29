import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f4eee8] text-sm text-[#352820]/60">Checking access…</div>;
  }
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}
