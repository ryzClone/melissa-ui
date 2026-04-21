import { FiEdit } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

export default function ProductRow({ product }) {
  const active = product.stock > 0;

  return (
    <tr>
      <td className="checkbox-col">
        <input type="checkbox" />
      </td>

      <td>
        <img src={product.img} className="product-img" />
      </td>

      <td>{product.name}</td>

      <td>{product.sku}</td>

      <td>{product.price.toLocaleString()} so'm</td>

      <td>{product.stock}</td>

      <td>
        <span className={`status ${active ? "active" : "inactive"}`}>
          {active ? "Faol" : "Tugagan"}
        </span>
      </td>

      <td className="actions">
        <FiEdit className="edit-icon" />
        <FiTrash2 className="delete-icon" />
      </td>
    </tr>
  );
}