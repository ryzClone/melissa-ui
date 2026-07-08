import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import { ORDERS_NAMESPACE } from "@/i18n/namespaces";
import {
  formatSom,
  getOrderBranchName,
  getOrderCustomerName,
  getOrderDateTimeLabel,
  getOrderItems,
  getOrderNumber,
  getOrderPhone,
  getOrderStatus,
  getOrderStatusVariant,
  getOrderTotalAmount,
  getProductQuantity,
  getStatusBadge,
} from "./OrderMockData";

export default function OrderHistoryList({
  orders = [],
  onOpenDetails,
  loading = false,
}) {
  const { t } = useTranslation(ORDERS_NAMESPACE);

  const columns = useMemo(
    () => [
      {
        key: "orderNumber",
        title: t("table.orderNumber"),
        render: (row) => getOrderNumber(row),
      },
      {
        key: "customer",
        title: t("table.customer"),
        className: "name-cell",
        render: (row) => getOrderCustomerName(row),
      },
      {
        key: "phone",
        title: t("table.phone"),
        render: (row) => getOrderPhone(row),
      },
      {
        key: "branch",
        title: t("table.branch"),
        className: "address-cell",
        render: (row) => getOrderBranchName(row),
      },
      {
        key: "items",
        title: t("table.products"),
        render: (row) => {
          const itemsCount = getOrderItems(row).reduce(
            (sum, item) => sum + getProductQuantity(item),
            0
          );
          return t("table.itemsCount", { count: itemsCount });
        },
      },
      {
        key: "total",
        title: t("table.totalPrice"),
        render: (row) => formatSom(getOrderTotalAmount(row)),
      },
      {
        key: "status",
        title: t("table.status"),
        render: (row) => {
          const status = getOrderStatus(row);
          const badge = getStatusBadge(status);

          return (
            <StatusBadge
              variant={getOrderStatusVariant(status)}
              label={badge.labelKey ? t(badge.labelKey) : badge.fallback}
            />
          );
        },
      },
      {
        key: "time",
        title: t("table.createdAt"),
        render: (row) => getOrderDateTimeLabel(row),
      },
    ],
    [t]
  );

  const actions = useMemo(
    () => [
      {
        label: t("buttons.view"),
        icon: <Eye size={16} />,
        variant: "view",
        onClick: (row) => onOpenDetails?.(row),
      },
    ],
    [onOpenDetails, t]
  );

  const paginationLabels = useMemo(
    () => ({
      total: (count) => t("pagination.total", { count }),
      perPage: t("pagination.rowsPerPage"),
      previous: t("pagination.previous"),
      next: t("pagination.next"),
      actions: t("table.actions"),
    }),
    [t]
  );

  return (
    <GlobalTable
      className="global-table--flat orders-history-table"
      columns={columns}
      data={orders}
      loading={loading}
      loadingText={t("states.loading")}
      emptyText={t("states.historyEmpty")}
      paginationLabels={paginationLabels}
      rowKey={(row, index) => row?.id ?? row?.orderId ?? `history-${index}`}
      actions={actions}
      pagination={{ client: true }}
      onRowClick={(row) => onOpenDetails?.(row)}
    />
  );
}
