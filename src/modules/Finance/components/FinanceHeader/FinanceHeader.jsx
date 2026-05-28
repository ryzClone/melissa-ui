import { useState } from "react";
import { CalendarDays, ChevronDown, CirclePlus, Download, X } from "lucide-react";
import "./FinanceHeader.css";

const periods = ["Bugun", "Oxirgi 7 kun", "Oxirgi 30 kun", "Bu oy", "Bu yil"];

export default function FinanceHeader({ onPeriodChange, onReportCreate }) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Oxirgi 7 kun");
  const [reportOpen, setReportOpen] = useState(false);

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setPeriodOpen(false);
    onPeriodChange?.(period);
  };

  const handleCreateReport = () => {
    setReportOpen(false);
    onReportCreate?.({
      period: selectedPeriod,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <div className="finance-header">
        <div>
          <h1>Moliyaviy</h1>
          <p>To‘lovlar, hisoblar va muvofiqlashtirish</p>
        </div>

        <div className="finance-header-actions">
          <div className="finance-period-wrap">
            <button
              type="button"
              className={`finance-period-btn ${periodOpen ? "active" : ""}`}
              onClick={() => setPeriodOpen((prev) => !prev)}
            >
              <CalendarDays size={15} />
              {selectedPeriod}
              <ChevronDown size={14} className={periodOpen ? "rotate" : ""} />
            </button>

            {periodOpen && (
              <div className="finance-period-menu">
                {periods.map((period) => (
                  <button
                    key={period}
                    type="button"
                    className={selectedPeriod === period ? "selected" : ""}
                    onClick={() => handlePeriodSelect(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="finance-report-btn"
            onClick={() => setReportOpen(true)}
          >
            <CirclePlus size={15} />
            Hisobot yaratish
          </button>
        </div>
      </div>

      {reportOpen && (
        <div className="finance-report-overlay" onClick={() => setReportOpen(false)}>
          <div className="finance-report-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="finance-report-close"
              onClick={() => setReportOpen(false)}
            >
              <X size={16} />
            </button>

            <div className="finance-report-kicker">HISOBOT</div>
            <h2>Moliyaviy hisobot yaratish</h2>
            <p>Tanlangan davr bo‘yicha hisobot tayyorlanadi.</p>

            <div className="finance-report-box">
              <span>Davr</span>
              <strong>{selectedPeriod}</strong>
            </div>

            <div className="finance-report-footer">
              <button type="button" className="finance-report-cancel" onClick={() => setReportOpen(false)}>
                Bekor qilish
              </button>

              <button type="button" className="finance-report-submit" onClick={handleCreateReport}>
                <Download size={15} />
                Yaratish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}