export default function ReservationsTable({ data }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status-badge success";
      case "Pending":
        return "status-badge warning";
      case "Cancelled":
        return "status-badge danger";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="reservations-table-container">
      <table className="reservations-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Restoran</th>
            <th>Mijoz</th>
            <th>Sana</th>
            <th>Vaqt</th>
            <th>Mehmonlar</th>
            <th>Holat</th>
            <th>Izoh</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.restaurant}</td>
              <td>{item.customer}</td>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>{item.guests}</td>
              <td>
                <span className={getStatusClass(item.status)}>
                  {item.status}
                </span>
              </td>
              <td>{item.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}