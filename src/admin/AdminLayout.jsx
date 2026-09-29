import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutGrid, Package, Tags, LogOut, ExternalLink, Menu, X, Trash2, ShieldCheck, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const linkClass = ({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? "bg-[#f4e5df] text-[#a77c67]" : "text-[#352820]/70 hover:bg-[#f4eee8]"}`;

  const nav = (
    <>
      <nav className="flex-1 p-3 sm:p-4 space-y-1">
        <NavLink onClick={() => setSidebarOpen(false)} to="/admin/dashboard" end className={linkClass}><LayoutGrid className="w-4 h-4" /> Overview</NavLink>
        <NavLink onClick={() => setSidebarOpen(false)} to="/admin/products" className={linkClass}><Package className="w-4 h-4" /> Products</NavLink>
        <NavLink onClick={() => setSidebarOpen(false)} to="/admin/categories" className={linkClass}><Tags className="w-4 h-4" /> Categories</NavLink>
        <NavLink onClick={() => setSidebarOpen(false)} to="/admin/featured" className={linkClass}><Star className="w-4 h-4" /> Featured</NavLink>
        <NavLink onClick={() => setSidebarOpen(false)} to="/admin/trash" className={linkClass}><Trash2 className="w-4 h-4" /> Trash</NavLink>
        <NavLink onClick={() => setSidebarOpen(false)} to="/admin/users" className={linkClass}><ShieldCheck className="w-4 h-4" /> Admin users</NavLink>
      </nav>
      <div className="p-3 sm:p-4 border-t border-[#352820]/10 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#352820]/70 hover:bg-[#f4eee8]"><ExternalLink className="w-4 h-4" /> View storefront</Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#352820]/70 hover:bg-[#f4eee8]"><LogOut className="w-4 h-4" /> Log out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#f7f3ef] text-[#352820]">
      <aside className="hidden md:flex w-60 lg:w-64 shrink-0 bg-[#fbf8f4] border-r border-[#352820]/10 flex-col">
        <div className="px-6 py-6 border-b border-[#352820]/10">
          <span className="font-display text-2xl tracking-[.13em]">BY.REMIE</span>
          <p className="text-[10px] tracking-[.22em] uppercase text-[#352820]/40 mt-1">Studio</p>
        </div>
        {nav}
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/35" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-[min(82vw,300px)] h-full bg-[#fbf8f4] flex flex-col shadow-xl">
            <div className="px-5 h-[68px] flex items-center justify-between border-b border-[#352820]/10">
              <span className="font-display text-2xl tracking-[.13em]">BY.REMIE</span>
              <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-30 h-[60px] bg-[#fbf8f4] border-b border-[#352820]/10 flex items-center px-4 gap-3">
          <button aria-label="Open sidebar" onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[#f4eee8]"><Menu className="w-5 h-5" /></button>
          <span className="font-display text-xl tracking-[.12em]">BY.REMIE</span>
          <span className="ml-auto text-[10px] tracking-[.18em] uppercase text-[#352820]/45">Studio</span>
        </div>
        <div className="w-full max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
