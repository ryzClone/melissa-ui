import "./tags.css";

export default function TagsList() {
  const tags = ["Issiq", "Vegetarian", "Halol", "Achchiq", "Shirin"];

  return (
    <div className="tags-container">
      {tags.map((t, i) => (
        <span key={i} className="tag">
          {t}
        </span>
      ))}
    </div>
  );
}