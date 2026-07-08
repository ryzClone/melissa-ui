export function formatHistoryDate(date) {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDefaultHistoryDateRange() {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    fromDate: formatHistoryDate(from),
    toDate: formatHistoryDate(today),
  };
}

/** History API: fromDate and toDate must be within the same calendar month. */
export function isValidHistoryDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) return false;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return false;
  if (to < from) return false;

  return (
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth()
  );
}

export function normalizeHistoryDateRange(fromDate, toDate) {
  if (!fromDate) return getDefaultHistoryDateRange();

  const from = new Date(fromDate);
  if (Number.isNaN(from.getTime())) return getDefaultHistoryDateRange();

  let to = toDate ? new Date(toDate) : new Date();
  if (Number.isNaN(to.getTime())) {
    to = new Date();
  }

  const endOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0);
  const today = new Date();
  const maxAllowedTo = endOfMonth < today ? endOfMonth : today;

  if (
    to < from ||
    from.getFullYear() !== to.getFullYear() ||
    from.getMonth() !== to.getMonth()
  ) {
    to = maxAllowedTo;
  }

  if (to > maxAllowedTo) {
    to = maxAllowedTo;
  }

  return {
    fromDate: formatHistoryDate(from),
    toDate: formatHistoryDate(to),
  };
}

/** GET /merchant-order/history -> { data: Order[], errorMessage } */
export function extractHistoryOrders(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res)) return res;
  return [];
}
