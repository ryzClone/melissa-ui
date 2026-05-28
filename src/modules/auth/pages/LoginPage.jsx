import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/core/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../auth.css";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError("");

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setError(t("login.required", "Username va parol kiritilishi shart"));
      return;
    }

    try {
      setSubmitting(true);

      const result = await login(username, password);

      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(
          result.message || t("login.error", "Login qilishda xatolik yuz berdi")
        );
      }
    } catch (err) {
      setError(t("login.error", "Login qilishda xatolik yuz berdi"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">{t("login.title", "Login")}</h2>
        <p className="login-subtitle">
          {t("login.subtitle", "Enter your username and password to log in")}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">
              {t("login.username", "Username")}
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={t("login.usernamePlaceholder", "Enter username")}
              autoComplete="username"
              disabled={submitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              {t("login.password", "Password")}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("login.passwordPlaceholder", "Enter password")}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={submitting}>
            {submitting
              ? t("login.loading", "Kirish...")
              : t("login.button", "Login")}
          </button>
        </form>
      </div>
    </div>
  );
}