export default function CategoryCard({ name }) {
  return (
    <div className="category-card">
      {name}
      <span className="edit">✏️</span>
    </div>
  );
}