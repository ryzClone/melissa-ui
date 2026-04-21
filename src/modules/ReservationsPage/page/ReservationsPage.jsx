import { useState } from "react";
import ReservationsHeader from "../components/ReservationsHeader";
import ReservationsTabs from "../components/ReservationsTabs";
import ReservationsTable from "../components/ReservationsTable";
import ReservationsCalendar from "../components/ReservationsCalendar";
import "../reservations.css";

export default function ReservationsPage() {
  const [activeView, setActiveView] = useState("table");

  const reservations = [
    {
      id: "#R-451",
      restaurant: "Osh Markazi",
      customer: "Alisher Nabiyev",
      date: "8-Nov",
      time: "19:00",
      guests: 4,
      status: "Confirmed",
      note: "Window seat",
    },
    {
      id: "#R-450",
      restaurant: "Samarqand",
      customer: "Feruza Yusupova",
      date: "7-Nov",
      time: "20:30",
      guests: 2,
      status: "Pending",
      note: "-",
    },
    {
      id: "#R-446",
      restaurant: "Samarqand",
      customer: "Nodira Azizova",
      date: "7-Nov",
      time: "19:00",
      guests: 2,
      status: "Cancelled",
      note: "-",
    },
  ];

  return (
    <div className="reservations-page">
      <ReservationsHeader />
      <ReservationsTabs activeView={activeView} setActiveView={setActiveView} />

      {activeView === "table" ? (
        <ReservationsTable data={reservations} />
      ) : (
        <ReservationsCalendar data={reservations} />
      )}

      
    </div>
  );
}