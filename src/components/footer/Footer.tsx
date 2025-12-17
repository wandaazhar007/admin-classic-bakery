import styles from "./Footer.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span>Build with </span>
          <span className={styles.heart} aria-hidden="true">
            <FontAwesomeIcon icon={faHeart} />
          </span>
          <span> by </span>
          <a
            className={styles.author}
            href="https://wandaazhar.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wanda Azhar
          </a>
          <span> in Twin Falls, ID. USA</span>
        </div>

        <div className={styles.right}>© 2025 Classic Bakery. All rights reserved.</div>
      </div>
    </footer>
  );
}