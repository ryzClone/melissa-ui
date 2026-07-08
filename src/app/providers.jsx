import { AuthProvider } from "@/core/auth/AuthContext";
import { PartnerProvider } from "@/context/PartnerContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { GlobalNotificationProvider } from "@/components/Notification/GlobalNotificationProvider";
import ToastViewport from "@/components/Notification/ToastViewport";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

export default function AppProviders({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <GlobalNotificationProvider>
        <ToastViewport />
        <AuthProvider>
          <PartnerProvider>
            <ProfileProvider>{children}</ProfileProvider>
          </PartnerProvider>
        </AuthProvider>
      </GlobalNotificationProvider>
    </I18nextProvider>
  );
}
