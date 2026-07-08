import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/core/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import LanguageDropdown from "@/components/LanguageDropdown/LanguageDropdown";
import { LOGIN_NAMESPACE } from "@/i18n";
import "../auth.css";

export default function LoginPage() {
  const { t } = useTranslation(LOGIN_NAMESPACE);
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

    if (!username) {
      setError(t("usernameRequired"));
      return;
    }

    if (!password) {
      setError(t("passwordRequired"));
      return;
    }

    try {
      setSubmitting(true);

      const result = await login(username, password);

      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <LanguageDropdown variant="fixed" />

      <div className="login-wrapper">
        <div className="login-card">
        <h2 className="login-title">{t("title")}</h2>
        <p className="login-subtitle">{t("subtitle")}</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">{t("username")}</label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={t("usernamePlaceholder")}
              autoComplete="username"
              disabled={submitting}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">{t("password")}</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={submitting}>
            {submitting ? t("loading") : t("button")}
          </button>
        </form>
        </div>
      </div>
    </>
  );
}
