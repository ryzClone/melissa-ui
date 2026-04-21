import "./RecentBundles.css";

export default function RecentBundles({ bundles }) {
  const mockData = [
    {
      id: "#B-451",
      restaurant: "Osh markazi",
      customer: "Alisher Nabiyev",
      date: "8-noyabr",
      time: "19:00",
      guests: 4,
      status: "Tasdiqlandi",
    },
    {
      id: "#B-450",
      restaurant: "Samarqand",
      customer: "Firuza Yusupova",
      date: "7-noyabr",
      time: "20:30",
      guests: 2,
      status: "Kutilmoqda",
    },
    {
      id: "#B-449",
      restaurant: "Milliy taomlar",
      customer: "Bobur Ismoilov",
      date: "6-noyabr",
      time: "13:00",
      guests: 6,
      status: "Tasdiqlandi",
    },
  ];

  const data = bundles || mockData;

  const getStatusClass = (status) => {
    switch (status) {
      case "Tasdiqlandi":
        return "dashboard-bundle-status success";
      case "Kutilmoqda":
        return "dashboard-bundle-status warning";
      case "Bekor qilindi":
        return "dashboard-bundle-status danger";
      default:
        return "dashboard-bundle-status";
    }
  };

  return (
    <div className="dashboard-bundles-card">
      <h3 className="dashboard-bundles-title">Oxirgi bandlar</h3>

      <table className="dashboard-bundles-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Restoran</th>
            <th>Mijoz</th>
            <th>Sana</th>
            <th>Vaqt</th>
            <th>Mehmonlar</th>
            <th>Holat</th>
          </tr>
        </thead>

        <tbody>
          {data.map((bundle, index) => (
            <tr key={index}>
              <td>{bundle.id}</td>
              <td>{bundle.restaurant}</td>
              <td>{bundle.customer}</td>
              <td>{bundle.date}</td>
              <td>{bundle.time}</td>
              <td>{bundle.guests}</td>
              <td>
                <span className={getStatusClass(bundle.status)}>
                  {bundle.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}