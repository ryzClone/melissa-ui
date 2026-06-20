import { useCallback, useRef } from "react";

/** Prevent stale API responses from overwriting newer results. */
export function useLatestRequest() {
  const requestIdRef = useRef(0);

  const beginRequest = useCallback(() => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  }, []);

  const isLatestRequest = useCallback(
    (requestId) => requestIdRef.current === requestId,
    []
  );

  return { beginRequest, isLatestRequest };
}
