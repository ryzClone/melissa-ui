import { useState } from "react";
import "../catalog.css";
import "./catalogPage.css";

import CatalogHeader from "../components/CatalogHeader";
import CatalogTabs from "../components/CatalogTabs";

import ProductsTable from "../products/ProductsTable";
import RestaurantsTable from "../restaurants/RestaurantsTable";
import CategoriesGrid from "../categories/CategoriesGrid";
import TagsList from "../tags/TagsList";

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState("products");

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsTable />;
      case "restaurants":
        return <RestaurantsTable />;
      case "categories":
        return <CategoriesGrid />;
      case "tags":
        return <TagsList />;
      default:
        return null;
    }
  };

  return (
    <div className="catalog-page">
      <CatalogHeader />
      <CatalogTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
}