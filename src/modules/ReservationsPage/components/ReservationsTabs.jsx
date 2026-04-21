export default function ReservationsTabs({ activeView, setActiveView }) {
  return (
    <div className="reservations-tabs">
      <button
        className={`tab-button ${activeView === "table" ? "active" : ""}`}
        onClick={() => setActiveView("table")}
      >
        Jadval
      </button>

      <button
        className={`tab-button ${activeView === "calendar" ? "active" : ""}`}
        onClick={() => setActiveView("calendar")}
      >
        Kalendar
      </button>
    </div>
  );
}