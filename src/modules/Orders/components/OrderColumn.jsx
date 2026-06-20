import OrderCard from "./OrderCard";

export default function OrderColumn({
  label,
  accent = "purple",
  orders = [],
  now,
  readOnly = false,
  onOpenDetails,
  onAction,
}) {
  return (
    <section className={`orders-column accent-${accent}`}>
      <header className="orders-column-header">
        <div className="orders-column-title">
          <span className="orders-column-dot" />
          <h3>{label}</h3>
          <span className="orders-column-count">{orders.length}</span>
        </div>
      </header>

      <div className="orders-column-body">
        {orders.length === 0 ? (
          <div className="orders-column-empty">Buyurtma yo'q</div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              now={now}
              readOnly={readOnly}
              onOpenDetails={onOpenDetails}
              onAction={onAction}
            />
          ))
        )}
      </div>
    </section>
  );
}
