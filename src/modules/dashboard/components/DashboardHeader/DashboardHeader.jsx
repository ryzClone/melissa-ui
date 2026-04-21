import "./DashboardHeader.css";
import { Download, ShoppingBasket } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="dashboard-top">
      <div className="dashboard-top-left">
        <h1>Bosh sahifa</h1>
        <p>Bugungi ko‘rsatkichlar va statistikalar bilan tanishing</p>
      </div>

      <div className="dashboard-top-actions">
        <button className="dashboard-top-btn dashboard-top-btn-secondary">
          <Download size={16} />
          <span>Hisobot yuklash</span>
        </button>

        <button className="dashboard-top-btn dashboard-top-btn-primary">
          <ShoppingBasket size={16} />
          <span>Yangi buyurtma</span>
        </button>
      </div>
    </div>
  );
}