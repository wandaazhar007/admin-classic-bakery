import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Footer from "./components/footer/Footer";

import ProductsPage from "./pages/ProductsPage";
import ProductCreatePage from "./pages/ProductCreatePage";
import LoginPage from "./pages/LoginPage";

import { useAuth } from "./context/AuthContext";

type PageInfo = {
  title: string;
  path: string;
};

export default function App() {
  const { user, loading, logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [path, setPath] = useState<string>("");

  const pages: PageInfo[] = useMemo(
    () => [
      { title: "Dashboard", path: "/dashboard" },
      { title: "Produk", path: "/produk" },
      { title: "Kategori", path: "/kategori" },
      { title: "Pengguna", path: "/user" },
    ],
    []
  );

  const navigate = (to: string, mode: "push" | "replace" = "push") => {
    if (mode === "replace") window.history.replaceState({}, "", to);
    else window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    const readPath = () => setPath(window.location.pathname || "/dashboard");
    readPath();

    const onPopState = () => readPath();
    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Guard: before login, user cannot access other pages
  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (path !== "/login") navigate("/login", "replace");
      setIsSidebarOpen(false);
      return;
    }

    // after login: if still on /login, bring to dashboard
    if (user && path === "/login") {
      navigate("/dashboard", "replace");
    }
  }, [user, loading, path]);

  const currentTitle =
    pages.find((p) => path === p.path || path.startsWith(`${p.path}/`))?.title ??
    "Welcome";

  const renderContent = () => {
    if (path === "/produk") return <ProductsPage onNavigate={navigate} />;
    if (path === "/produk/tambah")
      return <ProductCreatePage onNavigate={navigate} />;

    if (path === "/dashboard") {
      return (
        <div className="card">
          <div className="cardHeader">
            <div style={{ fontSize: "1.8rem", fontWeight: 900 }}>Dashboard</div>
            <div className="muted" style={{ marginTop: "0.4rem" }}>
              Path: {path}
            </div>
          </div>
          <div className="cardBody">
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              Dashboard placeholder ✅
            </div>
          </div>
        </div>
      );
    }

    if (path === "/kategori") {
      return (
        <div className="card">
          <div className="cardHeader">
            <div style={{ fontSize: "1.8rem", fontWeight: 900 }}>Kategori</div>
            <div className="muted" style={{ marginTop: "0.4rem" }}>
              Path: {path}
            </div>
          </div>
          <div className="cardBody">
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              Kategori placeholder ✅
            </div>
          </div>
        </div>
      );
    }

    if (path === "/user") {
      return (
        <div className="card">
          <div className="cardHeader">
            <div style={{ fontSize: "1.8rem", fontWeight: 900 }}>Pengguna</div>
            <div className="muted" style={{ marginTop: "0.4rem" }}>
              Path: {path}
            </div>
          </div>
          <div className="cardBody">
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              Pengguna placeholder ✅
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card">
        <div className="cardHeader">
          <div style={{ fontSize: "1.8rem", fontWeight: 900 }}>{currentTitle}</div>
          <div className="muted" style={{ marginTop: "0.4rem" }}>
            Path tidak dikenali: {path}
          </div>
        </div>
        <div className="cardBody">
          <button
            type="button"
            style={{
              height: "4.4rem",
              padding: "0 1.4rem",
              borderRadius: "1.2rem",
              border: "0.1rem solid rgba(180,147,255,0.55)",
              background: "rgba(226,214,255,0.9)",
              fontWeight: 900,
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard")}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  };

  // Full-screen loading (wait for Firebase auth state)
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          fontWeight: 900,
        }}
      >
        Loading...
      </div>
    );
  }

  // Not logged in: only show login page
  if (!user) {
    return <LoginPage onSuccess={() => navigate("/dashboard", "replace")} />;
  }

  // Logged in: show full layout
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        userLabel="Admin"
        onLogoutClick={async () => {
          await logout();
          navigate("/login", "replace");
        }}
        onProfileClick={() => {
          // eslint-disable-next-line no-alert
          alert("Profile clicked.");
        }}
        onSettingsClick={() => {
          // eslint-disable-next-line no-alert
          alert("Settings clicked.");
        }}
      />

      <div style={{ flex: 1 }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "1.6rem",
              paddingTop: "1.6rem",
              paddingBottom: "1.6rem",
            }}
          >
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main style={{ flex: 1, minWidth: 0 }}>{renderContent()}</main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}