import "./restaurants.css";
import RestaurantRow from "./RestaurantRow";

export default function RestaurantsTable() {
  const data = [
    { name: "Osh markazi", cat: "Milliy", rating: 4.8, orders: 1234, status: "Faol" },
    { name: "Samarqand", cat: "Milliy", rating: 4.9, orders: 987, status: "Faol" },
    { name: "Buxoro", cat: "Milliy", rating: 4.7, orders: 546, status: "Faol" },
    { name: "Milliy taomlar", cat: "Milliy", rating: 4.6, orders: 127, status: "Faol" },
  ];

  return (
    <div className="restaurants-card">
      <table className="restaurants-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Kategoriya</th>
            <th>Reyting</th>
            <th>Buyurtmalar</th>
            <th>Holat</th>
            <th>Harakatlar</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, i) => (
            <RestaurantRow key={i} r={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}