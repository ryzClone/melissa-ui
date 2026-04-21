export default function ReservationsCalendar({ data }) {
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div className="reservations-calendar">
      {Object.keys(grouped).map((date) => (
        <div key={date} className="calendar-section">
          <h3 className="calendar-date">{date}</h3>

          {grouped[date].map((item) => (
            <div key={item.id} className="reservation-card">
              <div className="reservation-time">{item.time}</div>
              <div className="reservation-info">
                <p>{item.restaurant} – {item.customer}</p>
                <span>{item.guests} guests</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}