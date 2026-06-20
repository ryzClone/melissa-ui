import { useNavigate } from "react-router-dom";
import { Download, ShoppingBasket } from "lucide-react";
import { useAuth } from "@/core/hooks/useAuth";
import { usePartner } from "@/context/PartnerContext";
import DashboardDateRangePicker from "../DashboardDateRangePicker/DashboardDateRangePicker";
import "./DashboardHeader.css";

export default function DashboardHeader({
  dateRange,
  onDateRangeChange,
  onDownloadReport,
  downloadingReport = false,
}) {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { hasPartnerSelected } = usePartner();

  const canDownloadReport =
    Boolean(dateRange?.startDate && dateRange?.endDate) &&
    (!isSuperAdmin || hasPartnerSelected);

  return (
    <div className="dashboard-top">
      <div className="dashboard-top-left">
        <h1>Bosh sahifa</h1>
        <p>Bugungi ko‘rsatkichlar va statistikalar bilan tanishing</p>
      </div>

      <div className="dashboard-top-actions">
        <DashboardDateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
        />

        <button
          type="button"
          className="dashboard-top-btn dashboard-top-btn-secondary"
          onClick={onDownloadReport}
          disabled={downloadingReport || !canDownloadReport}
        >
          <Download size={16} />
          <span>{downloadingReport ? "Yuklanmoqda..." : "Hisobot yuklash"}</span>
        </button>

        <button
          type="button"
          className="dashboard-top-btn dashboard-top-btn-primary"
          onClick={() => navigate("/orders")}
        >
          <ShoppingBasket size={16} />
          <span>Yangi buyurtma</span>
        </button>
      </div>
    </div>
  );
}
