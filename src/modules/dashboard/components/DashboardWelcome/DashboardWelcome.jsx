import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/context/ProfileContext";
import { DASHBOARD_NAMESPACE } from "@/i18n/namespaces";
import { normalizeLanguageCode } from "@/i18n/language";
import "./DashboardWelcome.css";

const DATE_LOCALE_MAP = {
  en: "en-US",
  ru: "ru-RU",
  uz: "uz-UZ",
};

function formatTodayDate(language) {
  const locale =
    DATE_LOCALE_MAP[normalizeLanguageCode(language)] || DATE_LOCALE_MAP.en;

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function DashboardWelcome({ userName }) {
  const { t, i18n } = useTranslation(DASHBOARD_NAMESPACE);
  const { displayName } = useProfile();

  const greetingName =
    userName || displayName || t("welcome.defaultUserName");
  const welcomeMessage = t("welcome.message");

  return (
    <section className="dashboard-welcome">
      <div className="dashboard-welcome-content">
        <h1>{t("welcome.title")}</h1>
        <p className="dashboard-welcome-greeting">
          {t("welcome.greeting", {
            name: greetingName,
            message: welcomeMessage,
          })}
        </p>

        <span className="dashboard-welcome-date">
          <CalendarDays size={15} />
          {formatTodayDate(i18n.language)}
        </span>
      </div>

      <div className="dashboard-welcome-glow" aria-hidden="true" />
    </section>
  );
}
