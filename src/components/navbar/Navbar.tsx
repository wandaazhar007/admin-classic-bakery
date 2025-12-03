import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUser,
  faGear,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Navbar.module.scss";
import { useAuth } from "../../context/AuthContext";

type NavbarProps = {
  onToggleSidebar?: () => void;
};

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Left: hamburger (mobile) + logo + title */}
        <div className={styles.left}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={faBars} className={styles.menuIcon} />
          </button>

          <div className={styles.brand}>
            <div className={styles.logoWrapper}>
              <img
                src="/images/logo-classic-bakery-cake.png"
                alt="Classic Bakery"
                className={styles.logo}
              />
            </div>
            <span className={styles.title}>Classic Bakery</span>
          </div>
        </div>

        {/* Right: actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => console.log("Settings clicked")}
          >
            <FontAwesomeIcon icon={faGear} className={styles.icon} />
            <span className={styles.actionLabel}>Settings</span>
          </button>

          <button
            type="button"
            className={styles.actionButton}
            onClick={() => console.log("Profile clicked")}
          >
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            <span className={styles.actionLabel}>Profile</span>
          </button>

          <button
            type="button"
            className={`${styles.actionButton} ${styles.logout}`}
            onClick={handleLogout}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className={styles.icon}
            />
            <span className={styles.actionLabel}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}