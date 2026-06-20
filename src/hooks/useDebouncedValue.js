import { useEffect, useState } from "react";

/** Debounce a value — default 3s for search inputs. */
export function useDebouncedValue(value, delay = 3000) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
