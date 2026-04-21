import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

export default function RestaurantRow({ r }) {
  return (
    <tr>
      <td>{r.name}</td>
      <td>{r.cat}</td>

      <td>
        <div className="rating-box">
          <FaStar className="star-icon" />
          <span>{r.rating}</span>
        </div>
      </td>

      <td>{r.orders}</td>

      <td>
        <span className="status-badge">{r.status}</span>
      </td>

      <td>
        <div className="action-box">
          <button className="action-btn edit-btn" type="button">
            <FiEdit2 />
          </button>
          <button className="action-btn delete-btn" type="button">
            <FiTrash2 />
          </button>
        </div>
      </td>
    </tr>
  );
}