import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServerOff } from "lucide-react";
import {
  checkServerHealth,
  restorePathAfterServerRecovery,
} from "@/utils/serverAvailability";
import "./ServerUnavailablePage.css";

export default function ServerUnavailablePage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const redirectedRef = useRef(false);

  const tryRestoreConnection = useCallback(async () => {
    if (checking || redirectedRef.current) return;

    setChecking(true);

    try {
      const isAvailable = await checkServerHealth();
      if (!isAvailable || redirectedRef.current) return;

      redirectedRef.current = true;
      restorePathAfterServerRecovery(navigate);
    } finally {
      setChecking(false);
    }
  }, [checking, navigate]);

  return (
    <div className="server-unavailable-page">
      <div className="server-unavailable-card">
        <div className="server-unavailable-icon-wrap">
          <ServerOff size={64} />
        </div>
        <h1>Server bilan aloqa yo&apos;q</h1>
        <p>
          Biroz kuting yoki server ishlamayotgan bo&apos;lsa adminlarga murojaat
          qiling.
        </p>
        <button
          type="button"
          className="server-unavailable-btn"
          onClick={tryRestoreConnection}
          disabled={checking || redirectedRef.current}
        >
          {checking ? "Tekshirilmoqda..." : "Qayta tekshirish"}
        </button>
      </div>
    </div>
  );
}
