import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faUser,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Navbar.module.scss";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout(); // should clear auth + redirect to /login in your AuthContext
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const handleProfile = () => {
    console.log("Profile clicked");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Left: Logo + Title */}
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

        {/* Right: Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleSettings}
          >
            <FontAwesomeIcon icon={faGear} className={styles.icon} />
            <span className={styles.actionLabel}>Settings</span>
          </button>

          <button
            type="button"
            className={styles.actionButton}
            onClick={handleProfile}
          >
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            <span className={styles.actionLabel}>Profile</span>
          </button>

          <button
            type="button"
            className={`${styles.actionButton} ${styles.logout}`}
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} className={styles.icon} />
            <span className={styles.actionLabel}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}