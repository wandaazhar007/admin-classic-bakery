import { Route, Routes, Navigate, Link } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ProductsPage from "./pages/ProductsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route
        path="*"
        element={
          <div style={{ padding: "2rem" }}>
            <p>Not found.</p>
            <Link to="/products">Go to products</Link>
          </div>
        }
      />
    </Routes>
  );
}