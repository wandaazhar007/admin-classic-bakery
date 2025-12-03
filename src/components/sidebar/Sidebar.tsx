// src/components/sidebar/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGaugeHigh,
  faCakeCandles,
  faTags,
  faReceipt,
  faUsers,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./Sidebar.module.scss";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type MenuItem = {
  label: string;
  to: string;
  icon: any;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: faGaugeHigh },
  { label: "Products", to: "/products", icon: faCakeCandles },
  { label: "Categories", to: "/category", icon: faTags },
  { label: "Orders", to: "/orders", icon: faReceipt },
  { label: "Customers", to: "/customer", icon: faUsers },
  { label: "Users", to: "/users", icon: faUserGear },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Close sidebar when ESC is pressed
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
      />

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
        aria-label="Admin menu"
      >
        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={onClose}
            >
              <FontAwesomeIcon icon={item.icon} className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}