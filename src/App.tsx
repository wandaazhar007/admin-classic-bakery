// src/App.tsx
import { Outlet } from "react-router-dom";
// import Navbar from "./components/navbar/Navbar";
// import Footer from "./components/footer/Footer";
// import Sidebar from "./components/sidebar/Sidebar";
import "../styles/_globals.scss";
// import { useState } from "react";

export default function App() {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  // const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* <Navbar onToggleSidebar={toggleSidebar} /> */}

      <div className="app-shell">
        {/* <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} /> */}

        <main className="app-content" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* <Footer /> */}
    </div>
  );
}