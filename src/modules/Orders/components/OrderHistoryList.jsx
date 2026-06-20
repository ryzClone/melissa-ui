import { useMemo } from "react";
import { Eye } from "lucide-react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
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
  const columns = useMemo(
    () => [
      {
        key: "orderNumber",
        title: "Buyurtma",
        render: (row) => getOrderNumber(row),
      },
      {
        key: "customer",
        title: "Mijoz",
        className: "name-cell",
        render: (row) => getOrderCustomerName(row),
      },
      {
        key: "phone",
        title: "Telefon",
        render: (row) => getOrderPhone(row),
      },
      {
        key: "branch",
        title: "Filial",
        className: "address-cell",
        render: (row) => getOrderBranchName(row),
      },
      {
        key: "items",
        title: "Mahsulot",
        render: (row) => {
          const itemsCount = getOrderItems(row).reduce(
            (sum, item) => sum + getProductQuantity(item),
            0
          );
          return `${itemsCount} ta`;
        },
      },
      {
        key: "total",
        title: "Summa",
        render: (row) => formatSom(getOrderTotalAmount(row)),
      },
      {
        key: "status",
        title: "Holat",
        render: (row) => {
          const status = getOrderStatus(row);
          const badge = getStatusBadge(status);

          return (
            <StatusBadge
              variant={getOrderStatusVariant(status)}
              label={badge.label}
            />
          );
        },
      },
      {
        key: "time",
        title: "Vaqt",
        render: (row) => getOrderDateTimeLabel(row),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "Ko'rish",
        icon: <Eye size={16} />,
        variant: "view",
        onClick: (row) => onOpenDetails?.(row),
      },
    ],
    [onOpenDetails]
  );

  return (
    <GlobalTable
      className="global-table--flat orders-history-table"
      columns={columns}
      data={orders}
      loading={loading}
      emptyText="Tarixda buyurtmalar yo'q"
      rowKey={(row, index) => row?.id ?? row?.orderId ?? `history-${index}`}
      actions={actions}
      pagination={{ client: true }}
      onRowClick={(row) => onOpenDetails?.(row)}
    />
  );
}
