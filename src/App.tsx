import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";

type PageInfo = {
  title: string;
  path: string;
};

export default function App() {
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

  useEffect(() => {
    const readPath = () => setPath(window.location.pathname || "/");
    readPath();

    const onPopState = () => readPath();
    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    // If user changes to desktop size while sidebar open, keep it safe by closing overlay state
    const onResize = () => {
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const currentTitle =
    pages.find((p) => p.path === path || path.startsWith(`${p.path}/`))?.title ??
    "Welcome";

  return (
    <div>
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        userLabel="Admin"
        onLogoutClick={() => {
          // placeholder: connect to AuthContext later
          // eslint-disable-next-line no-alert
          alert("Logout clicked (wire to AuthContext later).");
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

      {/* This container aligns sidebar left edge with navbar inner container */}
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

          <main style={{ flex: 1, minWidth: 0 }}>
            <div className="card">
              <div className="cardHeader">
                <div style={{ fontSize: "1.8rem", fontWeight: 900 }}>
                  {currentTitle}
                </div>
                <div className="muted" style={{ marginTop: "0.4rem" }}>
                  Current path: {path || "/"}
                </div>
              </div>

              <div className="cardBody">
                <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                  Layout sudah aktif ✅
                </div>
                <p className="muted" style={{ marginTop: "0.8rem" }}>
                  Navbar + Sidebar sudah muncul. Di mobile, klik hamburger untuk
                  membuka sidebar, klik overlay / tombol X / Escape untuk menutup.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}