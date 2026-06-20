/** Merge query params and omit undefined, null, and empty strings. */
export function buildListParams(...sources) {
  const result = {};

  sources.forEach((source) => {
    if (!source || typeof source !== "object") return;

    Object.entries(source).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value === "") return;
      result[key] = value;
    });
  });

  return result;
}
