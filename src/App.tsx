// // import { Route, Routes, Navigate, Link } from "react-router-dom";
// // import { ProtectedRoute } from "./components/ProtectedRoute";
// // import LoginPage from "./pages/LoginPage";
// // import ProductsPage from "./pages/ProductsPage";

// // export default function App() {
// //   return (
// //     <Routes>
// //       <Route path="/login" element={<LoginPage />} />
// //       <Route
// //         path="/products"
// //         element={
// //           <ProtectedRoute>
// //             <ProductsPage />
// //           </ProtectedRoute>
// //         }
// //       />
// //       <Route path="/" element={<Navigate to="/products" replace />} />
// //       <Route
// //         path="*"
// //         element={
// //           <div style={{ padding: "2rem" }}>
// //             <p>Not found.</p>
// //             <Link to="/products">Go to products</Link>
// //           </div>
// //         }
// //       />
// //     </Routes>
// //   );
// // }


// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import Navbar from "./components/navbar/Navbar";
// import Footer from "./components/footer/Footer";

// // Pages
// // import DashboardPage from "./pages/dashboard/DashboardPage";
// // import ProductPage from "./pages/products/ProductPage";
// // import CategoryPage from "./pages/category/CategoryPage";
// // import UserPage from "./pages/users/UserPage";
// // import OrderPage from "./pages/orders/OrderPage";
// // import CustomerPage from "./pages/customer/CustomerPage";
// // import LoginPage from "./pages/login/LoginPage";

// function Layout({ children }: { children: React.ReactNode }) {
//   const location = useLocation();

//   // Hide Navbar + Footer on login page
//   const hideChrome = location.pathname.startsWith("/login");

//   return (
//     <div className="app-shell">
//       {!hideChrome && <Navbar />}

//       <main className="app-main">{children}</main>

//       {!hideChrome && <Footer />}
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <Layout>
//       <Routes>
//         {/* Public */}
//         {/* <Route path="/login" element={<LoginPage />} /> */}

//         {/* Default */}
//         <Route path="/" element={<Navigate to="/dashboard" replace />} />

//         {/* Admin pages */}
//         {/* <Route path="/dashboard" element={<DashboardPage />} />
//         <Route path="/products" element={<ProductPage />} />
//         <Route path="/categories" element={<CategoryPage />} />
//         <Route path="/users" element={<UserPage />} />
//         <Route path="/orders" element={<OrderPage />} />
//         <Route path="/customers" element={<CustomerPage />} /> */}

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </Layout>
//   );
// }


// src/App.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Sidebar from "./components/sidebar/Sidebar";
import "../styles/_globals.scss";
import { useState } from "react";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-layout">
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="app-shell">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <main className="app-content" id="main-content">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}