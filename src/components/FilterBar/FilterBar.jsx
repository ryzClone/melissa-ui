import "./FilterBar.css";

export function FilterItem({ children, grow = false, auto = false, className = "" }) {
  const itemClass = grow
    ? "filter-item filter-item-grow"
    : auto
      ? "filter-item filter-item-auto"
      : "filter-item";

  return <div className={`${itemClass} ${className}`.trim()}>{children}</div>;
}

export default function FilterBar({ children, className = "" }) {
  return <div className={`filter-bar ${className}`.trim()}>{children}</div>;
}
