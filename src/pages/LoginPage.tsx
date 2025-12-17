import { useMemo, useState } from "react";
import styles from "./LoginPage.module.scss";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faRightToBracket,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type LoginPageProps = {
  onSuccess: () => void;
};

type FormValues = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function isEmailValid(email: string) {
  // simple safe regex for UI validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const { login } = useAuth();

  const [values, setValues] = useState<FormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPass, setShowPass] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const canSubmit = useMemo(() => {
    return values.email.trim().length > 0 && values.password.length > 0;
  }, [values.email, values.password]);

  const setField = <K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setSubmitError("");
  };

  const validate = () => {
    const next: FormErrors = {};
    const email = values.email.trim();

    if (!email) next.email = "Email wajib diisi.";
    else if (!isEmailValid(email)) next.email = "Format email tidak valid.";

    if (!values.password) next.password = "Password wajib diisi.";
    else if (values.password.length < 6)
      next.password = "Password minimal 6 karakter.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      onSuccess();
    } catch (e: any) {
      const msg =
        e?.code === "auth/invalid-credential"
          ? "Email atau password salah."
          : e?.message || "Gagal login. Coba lagi.";
      setSubmitError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img
          className={styles.logo}
          src="/images/logo-classic-bakery-circle.png"
          alt="Classic Bakery logo"
          loading="eager"
        />

        <div className={styles.title}>Admin Login</div>
        <div className={styles.subtitle}>
          Masuk untuk mengelola produk dan konten Classic Bakery.
        </div>

        {submitError ? (
          <div className={styles.alertError} role="alert">
            <span className={styles.alertIcon} aria-hidden="true">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </span>
            <span>{submitError}</span>
          </div>
        ) : null}

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div
              className={`${styles.inputWrap} ${errors.email ? styles.inputWrapError : ""
                }`}
            >
              <span className={styles.inputIcon} aria-hidden="true">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
                className={styles.input}
                placeholder="admin@classicbakery.com"
                autoComplete="email"
                inputMode="email"
              />
            </div>
            {errors.email ? (
              <div className={styles.errorText}>{errors.email}</div>
            ) : null}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div
              className={`${styles.inputWrap} ${errors.password ? styles.inputWrapError : ""
                }`}
            >
              <span className={styles.inputIcon} aria-hidden="true">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                value={values.password}
                onChange={(e) => setField("password", e.target.value)}
                className={styles.input}
                type={showPass ? "text" : "password"}
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
                title={showPass ? "Hide" : "Show"}
              >
                <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password ? (
              <div className={styles.errorText}>{errors.password}</div>
            ) : null}
          </div>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={submit}
            disabled={!canSubmit || submitting}
          >
            <span className={styles.submitIcon} aria-hidden="true">
              <FontAwesomeIcon icon={faRightToBracket} />
            </span>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </div>

        <div className={styles.footerNote}>
          © 2025 Classic Bakery. Admin access only.
        </div>
      </div>
    </div>
  );
}