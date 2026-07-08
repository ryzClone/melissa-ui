import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enLogin from "@/locales/en/login.json";
import ruLogin from "@/locales/ru/login.json";
import uzLogin from "@/locales/uz/login.json";
import enSidebar from "@/locales/en/sidebar.json";
import ruSidebar from "@/locales/ru/sidebar.json";
import uzSidebar from "@/locales/uz/sidebar.json";
import enDashboard from "@/locales/en/dashboard.json";
import ruDashboard from "@/locales/ru/dashboard.json";
import uzDashboard from "@/locales/uz/dashboard.json";
import enBranches from "@/locales/en/branches.json";
import ruBranches from "@/locales/ru/branches.json";
import uzBranches from "@/locales/uz/branches.json";
import enUsers from "@/locales/en/users.json";
import ruUsers from "@/locales/ru/users.json";
import uzUsers from "@/locales/uz/users.json";
import enNotifications from "@/locales/en/notifications.json";
import ruNotifications from "@/locales/ru/notifications.json";
import uzNotifications from "@/locales/uz/notifications.json";
import enPromotions from "@/locales/en/promotions.json";
import ruPromotions from "@/locales/ru/promotions.json";
import uzPromotions from "@/locales/uz/promotions.json";
import enCatalog from "@/locales/en/catalog.json";
import ruCatalog from "@/locales/ru/catalog.json";
import uzCatalog from "@/locales/uz/catalog.json";
import enOrders from "@/locales/en/orders.json";
import ruOrders from "@/locales/ru/orders.json";
import uzOrders from "@/locales/uz/orders.json";
import enProfile from "@/locales/en/profile.json";
import ruProfile from "@/locales/ru/profile.json";
import uzProfile from "@/locales/uz/profile.json";

import {
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  normalizeLanguageCode,
  setStoredLanguage,
} from "./language";
import {
  I18N_NAMESPACES,
  LOGIN_NAMESPACE,
  SIDEBAR_NAMESPACE,
  DASHBOARD_NAMESPACE,
  BRANCHES_NAMESPACE,
  USERS_NAMESPACE,
  NOTIFICATIONS_NAMESPACE,
  PROMOTIONS_NAMESPACE,
  CATALOG_NAMESPACE,
  ORDERS_NAMESPACE,
  PROFILE_NAMESPACE,
} from "./namespaces";

export {
  LOGIN_NAMESPACE,
  SIDEBAR_NAMESPACE,
  DASHBOARD_NAMESPACE,
  BRANCHES_NAMESPACE,
  USERS_NAMESPACE,
  NOTIFICATIONS_NAMESPACE,
  PROMOTIONS_NAMESPACE,
  CATALOG_NAMESPACE,
  ORDERS_NAMESPACE,
  PROFILE_NAMESPACE,
  I18N_NAMESPACES,
};

const resources = {
  en: {
    [LOGIN_NAMESPACE]: enLogin,
    [SIDEBAR_NAMESPACE]: enSidebar,
    [DASHBOARD_NAMESPACE]: enDashboard,
    [BRANCHES_NAMESPACE]: enBranches,
    [USERS_NAMESPACE]: enUsers,
    [NOTIFICATIONS_NAMESPACE]: enNotifications,
    [PROMOTIONS_NAMESPACE]: enPromotions,
    [CATALOG_NAMESPACE]: enCatalog,
    [ORDERS_NAMESPACE]: enOrders,
    [PROFILE_NAMESPACE]: enProfile,
  },
  ru: {
    [LOGIN_NAMESPACE]: ruLogin,
    [SIDEBAR_NAMESPACE]: ruSidebar,
    [DASHBOARD_NAMESPACE]: ruDashboard,
    [BRANCHES_NAMESPACE]: ruBranches,
    [USERS_NAMESPACE]: ruUsers,
    [NOTIFICATIONS_NAMESPACE]: ruNotifications,
    [PROMOTIONS_NAMESPACE]: ruPromotions,
    [CATALOG_NAMESPACE]: ruCatalog,
    [ORDERS_NAMESPACE]: ruOrders,
    [PROFILE_NAMESPACE]: ruProfile,
  },
  uz: {
    [LOGIN_NAMESPACE]: uzLogin,
    [SIDEBAR_NAMESPACE]: uzSidebar,
    [DASHBOARD_NAMESPACE]: uzDashboard,
    [BRANCHES_NAMESPACE]: uzBranches,
    [USERS_NAMESPACE]: uzUsers,
    [NOTIFICATIONS_NAMESPACE]: uzNotifications,
    [PROMOTIONS_NAMESPACE]: uzPromotions,
    [CATALOG_NAMESPACE]: uzCatalog,
    [ORDERS_NAMESPACE]: uzOrders,
    [PROFILE_NAMESPACE]: uzProfile,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ["en", "ru", "uz"],
  ns: I18N_NAMESPACES,
  defaultNS: LOGIN_NAMESPACE,
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
    bindI18n: "languageChanged loaded",
  },
});

i18n.on("languageChanged", (language) => {
  setStoredLanguage(normalizeLanguageCode(language));
});

export default i18n;
