import "./components.css";

export default function CatalogTabs({ activeTab, setActiveTab }) {
  return (
    <div className="catalog-tabs">
      <button
        className={activeTab === "products" ? "tab active" : "tab"}
        onClick={() => setActiveTab("products")}
      >
        Mahsulotlar
      </button>

      <button
        className={activeTab === "restaurants" ? "tab active" : "tab"}
        onClick={() => setActiveTab("restaurants")}
      >
        Restoranlar
      </button>

      <button
        className={activeTab === "categories" ? "tab active" : "tab"}
        onClick={() => setActiveTab("categories")}
      >
        Kategoriyalar
      </button>

      <button
        className={activeTab === "tags" ? "tab active" : "tab"}
        onClick={() => setActiveTab("tags")}
      >
        Teglar
      </button>
    </div>
  );
}