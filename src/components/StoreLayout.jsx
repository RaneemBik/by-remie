import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useStore } from "../context/StoreContext";

export default function StoreLayout() {
  const { loadError } = useStore();
  return (
    <div className="min-h-screen flex flex-col font-body">
      <Navbar />
      {loadError && (
        <div className="bg-[#fbf3ef] border-b border-[#d4b4a7] text-center text-sm text-[#4b342d] px-4 py-2">
          We couldn't load the catalog right now. Please refresh in a moment.
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
