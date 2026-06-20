const inflightRequests = new Map();

function stableSerialize(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${key}:${stableSerialize(value[key])}`)
    .join(",")}}`;
}

export function buildHttpRequestKey(method, url, params) {
  const normalizedMethod = String(method || "GET").toUpperCase();
  const normalizedUrl = String(url || "");
  return `${normalizedMethod}:${normalizedUrl}:${stableSerialize(params ?? {})}`;
}

/** Share one in-flight promise for identical concurrent requests. */
export async function dedupeRequest(key, fetcher) {
  if (!key) {
    return fetcher();
  }

  const existing = inflightRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = Promise.resolve()
    .then(fetcher)
    .finally(() => {
      if (inflightRequests.get(key) === promise) {
        inflightRequests.delete(key);
      }
    });

  inflightRequests.set(key, promise);
  return promise;
}

export function clearDedupeRequest(key) {
  if (key) {
    inflightRequests.delete(key);
  }
}

export function clearAllDedupeRequests() {
  inflightRequests.clear();
}
