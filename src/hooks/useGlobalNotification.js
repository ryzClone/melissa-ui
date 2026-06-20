import { useContext } from "react";
import { GlobalNotificationContext } from "@/components/Notification/GlobalNotificationProvider";

const noopNotificationApi = {
  showNotification: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
  removeNotification: () => {},
};

export function useGlobalNotification() {
  const context = useContext(GlobalNotificationContext);

  if (!context) {
    return noopNotificationApi;
  }

  return context;
}

export default useGlobalNotification;
