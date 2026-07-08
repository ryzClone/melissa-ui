export const ADMIN_ROUTE_PREFIX = "/admin";

export const ADMIN_MENU_ITEMS = [
  {
    to: "/admin/news",
    labelKey: "adminNews",
  },
  {
    to: "/admin/messages",
    labelKey: "adminMessages",
  },
];

export function isAdminRoute(pathname = "") {
  return (
    pathname === ADMIN_ROUTE_PREFIX ||
    pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`)
  );
}
