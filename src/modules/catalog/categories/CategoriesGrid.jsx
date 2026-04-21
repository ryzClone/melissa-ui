import "./categories.css";
import CategoryCard from "./CategoryCard";

export default function CategoriesGrid() {
  const cats = [
    "Milliy taomlar",
    "Ichimliklar",
    "Shirinliklar",
    "Salatlar",
    "Sho'rvalar",
    "Kebablar"
  ];

  return (
    <div className="categories-grid">
      {cats.map((c, i) => (
        <CategoryCard key={i} name={c} />
      ))}
    </div>
  );
}