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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(form.username, form.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
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
            <label>{t("login.username", "Username")}</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={t("login.usernamePlaceholder", "Enter username")}
            />
          </div>

          <div className="input-group">
            <label>{t("login.password", "Password")}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("login.passwordPlaceholder", "Enter password")}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit">
            {t("login.button", "Login")}
          </button>
        </form>
      </div>
    </div>
  );
}