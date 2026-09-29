import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import { AuthProvider } from "./context/AuthContext";

import StoreLayout from "./components/StoreLayout";
import Home from "./pages/Home";
import ShopAll from "./pages/ShopAll";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminHero from "./admin/AdminHero";
import AdminProducts from "./admin/AdminProducts";
import AdminCategories from "./admin/AdminCategories";
import AdminFeatured from "./admin/AdminFeatured";
import AdminTrash from "./admin/AdminTrash";
import AdminUsers from "./admin/AdminUsers";
import AdminSetPassword from "./admin/AdminSetPassword";
import AdminResetPassword from "./admin/AdminResetPassword";
import ProtectedRoute from "./admin/ProtectedRoute";

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopAll />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Route>

            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/set-password" element={<AdminSetPassword />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="hero" element={<AdminHero />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="featured" element={<AdminFeatured />} />
              <Route path="trash" element={<AdminTrash />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </StoreProvider>
  );
}
