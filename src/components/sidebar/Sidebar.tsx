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

  /**
   * Optional: kalau kamu nanti pakai react-router `useNavigate()`,
   * bisa pass ke sini biar lebih native router.
   */
  onNavigate?: (to: string) => void;
};

type MenuItem = {
  label: string;
  to: string;
  icon: any;
};

export default function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
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
    if (isOpen) closeBtnRef.current?.focus();
  }, [isOpen]);

  const isActive = (to: string) => {
    if (!currentPath) return false;
    return currentPath === to || currentPath.startsWith(`${to}/`);
  };

  const goTo = (to: string) => {
    // 1) close sidebar (mobile)
    onClose?.();

    // 2) update active state instantly
    setCurrentPath(to);

    // 3) navigate without full reload
    if (onNavigate) {
      onNavigate(to);
      return;
    }

    // fallback: SPA navigation via History API
    if (window.location.pathname !== to) {
      window.history.pushState({}, "", to);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
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
            <button
              key={item.to}
              type="button"
              className={`${styles.link} ${isActive(item.to) ? styles.active : ""}`}
              onClick={() => goTo(item.to)}
            >
              <span className={styles.iconWrap} aria-hidden="true">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </button>
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