import "./components.css";

export default function CatalogHeader() {
  return (
    <div className="catalog-header">
      <div className="catalog-header-body-left">
        <h1>Katalog</h1>
        <p>Mahsulotlar va restoranlarni boshqarish</p>
      </div>

      <button className="add-btn">+ Yangi mahsulot</button>
    </div>
  );
}