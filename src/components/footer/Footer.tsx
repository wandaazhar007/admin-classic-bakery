import styles from "./Footer.module.scss";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.left}>
          © {year} Classic Bakery. All rights reserved.
        </p>
        <p className={styles.right}>
          Built with <span className={styles.heart}>❤️</span> by{" "}
          <span className={styles.name}>Wanda Azhar</span> in Twin Falls, ID, USA
        </p>
      </div>
    </footer>
  );
}

export default Footer;