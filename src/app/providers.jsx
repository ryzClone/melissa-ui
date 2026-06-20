import { AuthProvider } from "@/core/auth/AuthContext";

import { PartnerProvider } from "@/context/PartnerContext";

import { ProfileProvider } from "@/context/ProfileContext";

import { GlobalNotificationProvider } from "@/components/Notification/GlobalNotificationProvider";

import GlobalToastContainer from "@/components/Notification/GlobalToastContainer";



export default function AppProviders({ children }) {

  return (

    <AuthProvider>

      <PartnerProvider>

        <GlobalNotificationProvider>

          <ProfileProvider>

            {children}

            <GlobalToastContainer />

          </ProfileProvider>

        </GlobalNotificationProvider>

      </PartnerProvider>

    </AuthProvider>

  );

}

