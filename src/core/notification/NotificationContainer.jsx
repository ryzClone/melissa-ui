import { useNotification } from "../hooks/useNotification";

export default function NotificationContainer() {
  const { notifications } = useNotification();

  return (
    <div style={{ position: "fixed", top: 20, right: 20 }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            marginBottom: 10,
            padding: "10px 15px",
            background: "#7c3aed",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
