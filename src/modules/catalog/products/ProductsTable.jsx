import { useMemo, useState } from "react";
import "./products.css";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import EditProductModal from "./Modals/EditProductModal";
import DeleteProductModal from "./Modals/DeleteProductModal";

export default function ProductsTable() {
  const [data, setData] = useState([
    {
      id: 1,
      name: "Palov",
      sku: "PLV-001",
      price: "35 000 so'm",
      stock: 45,
      status: "active",
      statusText: "Faol",
      img: "https://i.imgur.com/0umadnY.jpg",
    },
    {
      id: 2,
      name: "Lag'mon",
      sku: "LGM-002",
      price: "30 000 so'm",
      stock: 40,
      status: "active",
      statusText: "Faol",
      img: "https://i.imgur.com/0umadnY.jpg",
    },
    {
      id: 3,
      name: "Manti",
      sku: "MNT-003",
      price: "25 000 so'm",
      stock: 32,
      status: "active",
      statusText: "Faol",
      img: "https://i.imgur.com/0umadnY.jpg",
    },
    {
      id: 4,
      name: "Sho'rva",
      sku: "SRV-004",
      price: "15 000 so'm",
      stock: 18,
      status: "active",
      statusText: "Faol",
      img: "https://i.imgur.com/0umadnY.jpg",
    },
    {
      id: 5,
      name: "Somsa",
      sku: "SMS-005",
      price: "5 000 so'm",
      stock: 0,
      status: "inactive",
      statusText: "Tugagan",
      img: "https://i.imgur.com/0umadnY.jpg",
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      [item.name, item.sku, item.price, item.statusText]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const allSelected =
    filteredData.length > 0 &&
    filteredData.every((item) => selectedIds.includes(item.id));

  const isChecked = (id) => selectedIds.includes(id);

  const handleSelectAll = () => {
    if (allSelected) {
      const filteredIds = filteredData.map((item) => item.id);
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredData.map((item) => item.id);
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSaveEdit = (updatedProduct) => {
    setData((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );
    setEditingProduct(null);
  };

  const handleDelete = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    setDeletingProduct(null);
  };

  return (
    <div className="products-wrapper">
      <div className="search-card">
        <div className="product-search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search"
            placeholder="Mahsulot qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        <table className="products-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Rasm</th>
              <th>Nom</th>
              <th>SKU</th>
              <th>Narx</th>
              <th>Zaxira</th>
              <th>Holat</th>
              <th>Harakatlar</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((p) => (
              <tr key={p.id}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={isChecked(p.id)}
                    onChange={() => handleSelectOne(p.id)}
                  />
                </td>

                <td>
                  <img src={p.img} alt={p.name} className="product-img" />
                </td>

                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>

                <td>
                  <span className={`status ${p.status}`}>{p.statusText}</span>
                </td>

                <td>
                  <div className="actions">
                    <FiEdit
                      className="edit-icon"
                      onClick={() => setEditingProduct(p)}
                    />
                    <FiTrash2
                      className="delete-icon"
                      onClick={() => setDeletingProduct(p)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-row">
                  Mahsulot topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEdit}
      />

      <DeleteProductModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => handleDelete(deletingProduct.id)}
      />
    </div>
  );
}