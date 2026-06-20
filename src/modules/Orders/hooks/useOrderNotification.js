import { useContext } from "react";
import { OrderNotificationContext } from "@/modules/Orders/components/OrderNotification/OrderNotificationProvider";

export function useOrderNotification() {
  const context = useContext(OrderNotificationContext);

  if (!context) {
    throw new Error(
      "useOrderNotification must be used within OrderNotificationProvider"
    );
  }

  return context;
}

export default useOrderNotification;
