import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Orders from "@/pages/Orders";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Dashboard from "@/pages/admin/Dashboard";
import ManageProducts from "@/pages/admin/ManageProducts";
import ManageOrders from "@/pages/admin/ManageOrders";
import ManageUsers from "@/pages/admin/ManageUsers";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public store layout */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Route>

      {/* Admin layout — auth + role check in Step 7/16 */}
      <Route
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="admin" element={<Dashboard />} />
        <Route path="admin/products" element={<ManageProducts />} />
        <Route path="admin/orders" element={<ManageOrders />} />
        <Route path="admin/users" element={<ManageUsers />} />
      </Route>
    </Routes>
  );
}
