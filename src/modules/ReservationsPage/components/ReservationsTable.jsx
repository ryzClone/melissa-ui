import { useMemo } from "react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge from "@/components/StatusBadge/StatusBadge";

function getReservationStatusVariant(status) {
  switch (status) {
    case "Confirmed":
      return "success";
    case "Pending":
      return "warning";
    case "Cancelled":
      return "inactive";
    default:
      return "pending";
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
          <StatusBadge
            variant={getReservationStatusVariant(row.status)}
            label={row.status || "—"}
          />
        ),
      },
      {
        key: "note",
        title: "Izoh",
        className: "description-cell",
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
