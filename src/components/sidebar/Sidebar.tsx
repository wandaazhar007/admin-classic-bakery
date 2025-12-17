import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Sidebar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faBoxOpen,
  faTags,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type SidebarProps = {
  isOpen: boolean; // mobile open/close state
  onClose?: () => void;
};

type MenuItem = {
  label: string;
  to: string;
  icon: any;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems: MenuItem[] = useMemo(
    () => [
      { label: "Dashboard", to: "/dashboard", icon: faGauge },
      { label: "Produk", to: "/produk", icon: faBoxOpen },
      { label: "Kategori", to: "/kategori", icon: faTags },
      { label: "Pengguna", to: "/user", icon: faUsers },
    ],
    []
  );

  const [currentPath, setCurrentPath] = useState<string>("");

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const readPath = () => setCurrentPath(window.location.pathname || "");
    readPath();

    const onPopState = () => readPath();
    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // small accessibility improvement on mobile
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  const isActive = (to: string) => {
    if (!currentPath) return false;
    return currentPath === to || currentPath.startsWith(`${to}/`);
  };

  const handleLinkClick = () => {
    // close sidebar after clicking a link on mobile
    onClose?.();
  };

  return (
    <aside className={styles.sidebar} aria-label="Sidebar navigation">
      <button
        type="button"
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}
        onClick={onClose}
        aria-label="Close sidebar"
      />

      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <img
              className={styles.logo}
              src="/images/logo-classic-bakery-cake.png"
              alt="Classic Bakery logo"
              loading="eager"
            />
            <div className={styles.brandText}>
              <div className={styles.brandTitle}>CLASSIC BAKERY</div>
              <div className={styles.brandSub}>Admin Panel</div>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Main menu">
          {menuItems.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={`${styles.link} ${isActive(item.to) ? styles.active : ""}`}
              onClick={handleLinkClick}
            >
              <span className={styles.iconWrap} aria-hidden="true">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.footerNote}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.noteText}>Fast & clean admin experience</span>
        </div>
      </div>
    </aside>
  );
}