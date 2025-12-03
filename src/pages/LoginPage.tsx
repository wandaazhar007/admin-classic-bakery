import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/products");
    } catch (err) {
      console.error(err);
      setError("Login gagal. Pastikan email & password benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-page">
      <div className="card">
        <h1>Classic Bakery Admin</h1>
        <p>Masuk sebagai admin untuk mengelola produk.</p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}