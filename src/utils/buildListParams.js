/** Merge query params and omit undefined, null, empty strings, and empty arrays. */
export function buildListParams(...sources) {
  const result = {};

  sources.forEach((source) => {
    if (!source || typeof source !== "object") return;

    Object.entries(source).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value === "") return;
      if (Array.isArray(value) && value.length === 0) return;
      result[key] = value;
    });
  });

  return result;
}

/** Axios serializer for repeated array params: categoryIds=1&categoryIds=2 */
export const repeatArrayParamsSerializer = {
  indexes: null,
};
