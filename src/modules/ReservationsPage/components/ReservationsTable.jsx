import { useMemo } from "react";
import GlobalTable from "@/components/ui/GlobalTable/GlobalTable";

function getStatusClass(status) {
  switch (status) {
    case "Confirmed":
      return "status-active";
    case "Pending":
      return "status-pending";
    case "Cancelled":
      return "status-inactive";
    default:
      return "status-pending";
  }
}

export default function ReservationsTable({ data = [] }) {
  const columns = useMemo(
    () => [
      {
        key: "id",
        title: "ID",
        render: (row) => row.id || "—",
      },
      {
        key: "restaurant",
        title: "Restoran",
        render: (row) => row.restaurant || "—",
      },
      {
        key: "customer",
        title: "Mijoz",
        render: (row) => row.customer || "—",
      },
      {
        key: "date",
        title: "Sana",
        render: (row) => row.date || "—",
      },
      {
        key: "time",
        title: "Vaqt",
        render: (row) => row.time || "—",
      },
      {
        key: "guests",
        title: "Mehmonlar",
        render: (row) => row.guests ?? "—",
      },
      {
        key: "status",
        title: "Holat",
        render: (row) => (
          <span className={getStatusClass(row.status)}>{row.status || "—"}</span>
        ),
      },
      {
        key: "note",
        title: "Izoh",
        render: (row) => row.note || "—",
      },
    ],
    []
  );

  return (
    <div className="reservations-table-container">
      <GlobalTable
        columns={columns}
        data={data}
        emptyText="Ma'lumot topilmadi"
        rowKey="id"
      />
    </div>
  );
}
