import { useOrderNotification } from "@/modules/Orders/hooks/useOrderNotification";
import OrderAlert from "./OrderAlert";

export default function OrderNotificationContainer() {
  const { alerts, removeOrderAlert } = useOrderNotification();

  return (
    <div className="order-alert-container">
      {alerts.map((alert) => (
        <OrderAlert key={alert.id} alert={alert} onClose={removeOrderAlert} />
      ))}
    </div>
  );
}
