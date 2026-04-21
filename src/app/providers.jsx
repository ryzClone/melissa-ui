import { AuthProvider } from "@/core/auth/AuthContext";
import { NotificationProvider } from "@/core/notification/NotificationContext";
import NotificationContainer from "@/core/notification/NotificationContainer";

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <NotificationContainer />
      </NotificationProvider>
    </AuthProvider>
  );
}
