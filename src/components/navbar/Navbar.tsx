import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Navbar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronDown,
  faGear,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

type NavbarProps = {
  onToggleSidebar?: () => void;
  // onProfileClick?: () => void;
  // onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onBrandClick?: () => void;
  userLabel?: string; // optional (e.g., "Admin")
};

export default function Navbar({
  onToggleSidebar,
  // onProfileClick,
  // onSettingsClick,
  onLogoutClick,
  onBrandClick,
  userLabel,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownBtnRef = useRef<HTMLButtonElement | null>(null);

  const actions = useMemo(
    () => [
      {
        key: "profile",
        label: "Profile",
        icon: faUser,
        // onClick: onProfileClick,
      },
      {
        key: "settings",
        label: "Settings",
        icon: faGear,
        // onClick: onSettingsClick,
      },
      {
        key: "logout",
        label: "Logout",
        icon: faRightFromBracket,
        onClick: onLogoutClick,
        danger: true,
      },
    ],
    [onLogoutClick]
  );

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!isDropdownOpen) return;
      const target = e.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        dropdownBtnRef.current &&
        !dropdownBtnRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDropdownOpen) return;
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        dropdownBtnRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleAction = (cb?: () => void) => {
    setIsDropdownOpen(false);
    cb?.();
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={onToggleSidebar}
            aria-label="Open sidebar menu"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <button
            type="button"
            className={styles.brand}
            onClick={onBrandClick}
            aria-label="Classic Bakery"
          >
            <img
              className={styles.logo}
              src="/images/logo-classic-bakery-cake.png"
              alt="Classic Bakery logo"
              loading="eager"
            />
            <div className={styles.brandText}>
              <div className={styles.title}>CLASSIC BAKERY</div>
              {userLabel ? (
                <div className={styles.subtitle}>{userLabel}</div>
              ) : null}
            </div>
          </button>
        </div>

        <div className={styles.right}>
          {/* Desktop actions */}
          <div className={styles.actions}>
            {actions.map((a) => (
              <button
                key={a.key}
                type="button"
                className={`${styles.iconButton} ${a.danger ? styles.danger : ""}`}
                onClick={() => a.onClick?.()}
                aria-label={a.label}
                title={a.label}
              >
                <FontAwesomeIcon icon={a.icon} />
              </button>
            ))}
          </div>

          {/* Mobile dropdown */}
          <div className={styles.mobileActions}>
            <button
              ref={dropdownBtnRef}
              type="button"
              className={styles.dropdownButton}
              onClick={() => setIsDropdownOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              aria-label="Open profile menu"
            >
              <span className={styles.dropdownIcon}>
                <FontAwesomeIcon icon={faUser} />
              </span>
              <span className={styles.dropdownChevron}>
                <FontAwesomeIcon icon={faChevronDown} />
              </span>
            </button>

            {isDropdownOpen ? (
              <div ref={dropdownRef} className={styles.dropdownMenu} role="menu">
                {actions.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    className={`${styles.dropdownItem} ${a.danger ? styles.dropdownDanger : ""
                      }`}
                    onClick={() => handleAction(a.onClick)}
                    role="menuitem"
                  >
                    <span className={styles.dropdownItemIcon}>
                      <FontAwesomeIcon icon={a.icon} />
                    </span>
                    <span className={styles.dropdownItemText}>{a.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}