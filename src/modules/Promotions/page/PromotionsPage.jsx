import { useState } from "react";
import {
  Plus,
  Download,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Percent,
  Gift,
  TrendingUp,
  Clock3,
  Ticket,
} from "lucide-react";
import "../PromotionsPage.css";

const promoTabs = ["Aksiyalar", "Promokod"];

const акцииMock = [
  {
    id: "#12846",
    type: "Foiz",
    name: "Kuzgi chegirma",
    value: "20%",
    period: "01.11.2025 — 30.11.2025",
    status: "Faol",
  },
  {
    id: "#12847",
    type: "Qiymat",
    name: "Yangi mijoz",
    value: "50 000 so'm",
    period: "15.10.2025 — 31.12.2025",
    status: "Faol",
  },
  {
    id: "#12848",
    type: "Foiz",
    name: "Juma aksiyasi",
    value: "15%",
    period: "07.11.2025 — 14.11.2025",
    status: "Kutilmoqda",
  },
  {
    id: "#12849",
    type: "Qiymat",
    name: "Tug‘ilgan kun",
    value: "30 000 so'm",
    period: "01.01.2025 — 31.12.2025",
    status: "Faol",
  },
];

const promoCodeMock = [
  {
    id: "#PC-001",
    code: "WELCOME10",
    type: "Foiz",
    value: "10%",
    period: "07.11.2025 14:28",
    used: 10,
    limit: 50,
    status: "Faol",
  },
  {
    id: "#PC-002",
    code: "MELISSA50",
    type: "Qiymat",
    value: "50 000",
    period: "01.11.2025 — 30.11.2025",
    used: 23,
    limit: 100,
    status: "Faol",
  },
  {
    id: "#PC-003",
    code: "FRIDAY15",
    type: "Foiz",
    value: "15%",
    period: "14.11.2025 18:00",
    used: 0,
    limit: 200,
    status: "Kutilmoqda",
  },
  {
    id: "#PC-004",
    code: "VIP2025",
    type: "Qiymat",
    value: "100 000",
    period: "01.01.2025 — 31.12.2025",
    used: 5,
    limit: 20,
    status: "Faol",
  },
  {
    id: "#PC-005",
    code: "OLDPROMO",
    type: "Foiz",
    value: "5%",
    period: "01.09.2025 — 30.09.2025",
    used: 47,
    limit: 50,
    status: "Tugagan",
  },
];

function StatusBadge({ status }) {
  return (
    <span
      className={`promo-status-badge ${
        status === "Faol"
          ? "active"
          : status === "Kutilmoqda"
          ? "pending"
          : "ended"
      }`}
    >
      {status}
    </span>
  );
}

function UsageBar({ used, limit }) {
  const percent = Math.min((used / limit) * 100, 100);

  return (
    <div className="usage-wrap">
      <span className="usage-text">
        {used}/{limit}
      </span>
      <div className="usage-bar">
        <div
          className={`usage-fill ${percent > 90 ? "danger" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function PromoCodeModal({ open, onClose }) {
  const [form, setForm] = useState({
    codeName: "",
    code: "WELCOME10",
    type: "Foiz (%)",
    value: "10",
    startDate: "24.05.2024",
    endDate: "",
    usageLimit: "100",
    minOrder: "50000",
    perUserLimit: "1",
    category: "Fastfud menyu",
    active: true,
  });

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="promo-modal-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="promo-modal-close" type="button" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="promo-modal-top-label">AKSIYALAR</div>
        <h2>Yangi promokod</h2>
        <p>Yangi chegirma kodi yarating</p>

        <div className="promo-preview-card">
          <div className="promo-preview-label">PREVIEW</div>
          <div className="promo-preview-code">{form.code}</div>
          <div className="promo-preview-text">{form.value}% chegirma</div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Asosiy ma’lumotlar</div>

          <div className="promo-form-group">
            <label>Promokod nomi</label>
            <input
              type="text"
              placeholder="Masalan: Yangi mijozlar uchun"
              value={form.codeName}
              onChange={(e) => handleChange("codeName", e.target.value)}
            />
          </div>

          <div className="promo-form-grid two">
            <div className="promo-form-group">
              <label>Kod</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
              />
            </div>

            <div className="promo-form-group">
              <label>&nbsp;</label>
              <button type="button" className="promo-generate-btn">
                Tasodifiy
              </button>
            </div>
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Chegirma turi</div>

          <div className="promo-form-grid two">
            <div className="promo-form-group">
              <label>Turi</label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option>Foiz (%)</option>
                <option>Qiymat (UZS)</option>
              </select>
            </div>

            <div className="promo-form-group">
              <label>Qiymat</label>
              <input
                type="text"
                value={form.value}
                onChange={(e) => handleChange("value", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Amal qilish muddati</div>

          <div className="promo-form-grid two">
            <div className="promo-form-group">
              <label>Boshlanish</label>
              <input
                type="text"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>

            <div className="promo-form-group">
              <label>Tugashi</label>
              <input
                type="text"
                placeholder="Muddat tanlang"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Foydalanish shartlari</div>

          <div className="promo-form-group">
            <label>Umumiy foydalanish soni</label>
            <input
              type="text"
              value={form.usageLimit}
              onChange={(e) => handleChange("usageLimit", e.target.value)}
            />
          </div>

          <div className="promo-form-group">
            <label>Minimal buyurtma miqdori</label>
            <input
              type="text"
              value={form.minOrder}
              onChange={(e) => handleChange("minOrder", e.target.value)}
            />
          </div>

          <div className="promo-form-group">
            <label>Bir mijoz uchun limit</label>
            <input
              type="text"
              value={form.perUserLimit}
              onChange={(e) => handleChange("perUserLimit", e.target.value)}
            />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Qo‘llanilish doirasi</div>

          <div className="promo-form-group">
            <label>Filiallar</label>
            <div className="promo-tags-input">
              <span className="promo-chip purple">MaksWay</span>
              <span className="promo-chip blue">Chopar</span>
              <span className="promo-chip dark">Tanlash</span>
            </div>
          </div>

          <div className="promo-form-group">
            <label>Kategoriya</label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option>Fastfud menyu</option>
              <option>Ichimliklar</option>
              <option>Desertlar</option>
            </select>
          </div>

          <div className="promo-form-toggle">
            <div>
              <strong>Darhol faollashtirish</strong>
              <span>Promokod yaratilgandan so‘ng darhol ishlaydi</span>
            </div>

            <label className="promo-switch">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange("active", e.target.checked)}
              />
              <span className="promo-slider" />
            </label>
          </div>
        </div>

        <div className="promo-modal-footer">
          <button type="button" className="promo-cancel-btn" onClick={onClose}>
            Bekor qilish
          </button>
          <button type="button" className="promo-submit-btn">
            Promokod yaratish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState("Aksiyalar");
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="promo-page">
        <div className="promo-topbar">
          <div>
            <h1>Aksiyalar</h1>
            <p>Kuponlar va chegirmalarni boshqarish</p>
          </div>

          <div className="promo-topbar-actions">
            {activeTab === "Aksiyalar" && (
              <button type="button" className="promo-outline-btn">
                <Download size={16} />
                <span>Yuklab olish</span>
              </button>
            )}

            <button
              type="button"
              className="promo-primary-btn"
              onClick={() => setOpenModal(true)}
            >
              <Plus size={16} />
              <span>
                {activeTab === "Aksiyalar" ? "Yangi aksiya" : "Yangi promokod"}
              </span>
            </button>
          </div>
        </div>

        <div className="promo-tabs">
          {promoTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`promo-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="promo-table-card">
          <div className="promo-table-header">
            <h3>
              {activeTab === "Aksiyalar"
                ? "Aksiyalar ro‘yxati"
                : "Promokodlar ro‘yxati"}
            </h3>

            <div className="promo-table-tools">
              {activeTab === "Promokod" && (
                <div className="promo-search-box">
                  <Search size={15} />
                  <input type="text" placeholder="Qidiruv..." />
                </div>
              )}

              <button type="button" className="promo-icon-btn">
                <Download size={15} />
              </button>
            </div>
          </div>

          {activeTab === "Aksiyalar" ? (
            <table className="promo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Turi</th>
                  <th>Nomi</th>
                  <th>Qiymat</th>
                  <th>Muddati</th>
                  <th>Holat</th>
                  <th>Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {акцииMock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.type}</td>
                    <td className="promo-strong">{item.name}</td>
                    <td className="promo-value">{item.value}</td>
                    <td className="promo-muted">{item.period}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <div className="promo-actions">
                        <button type="button" className="promo-action-btn">
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="promo-action-btn danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="promo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kod</th>
                  <th>Turi</th>
                  <th>Qiymat</th>
                  <th>Muddati</th>
                  <th>Ishlatilgan</th>
                  <th>Holat</th>
                  <th>Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {promoCodeMock.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <span className="promo-code-badge">{item.code}</span>
                    </td>
                    <td>{item.type}</td>
                    <td className="promo-value">{item.value}</td>
                    <td className="promo-muted">{item.period}</td>
                    <td>
                      <UsageBar used={item.used} limit={item.limit} />
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <div className="promo-actions">
                        <button type="button" className="promo-action-btn">
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="promo-action-btn danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="promo-table-footer">
            <span>
              {activeTab === "Aksiyalar"
                ? "Ko‘rsatilmoqda 4 dan 24 ta yozuv"
                : "Jami 124 ta promokoddan 1–5 gacha ko‘rsatilmoqda"}
            </span>

            <div className="promo-pagination">
              <button type="button">
                <ChevronLeft size={14} />
              </button>
              <button type="button" className="active">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="promo-stats-grid">
          {activeTab === "Aksiyalar" ? (
            <>
              <div className="promo-stat-card">
                <div className="promo-stat-icon purple">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span>Eng mashhur aksiya</span>
                  <h4>Kuzgi chegirma</h4>
                  <p>+12.5% foydalanuvchi darajasi</p>
                </div>
              </div>

              <div className="promo-stat-card">
                <div className="promo-stat-icon orange">
                  <Gift size={18} />
                </div>
                <div>
                  <span>Jami tejab qolindi</span>
                  <h4>4,250,000 UZS</h4>
                  <p>Oxirgi 30 kun ichida</p>
                </div>
              </div>

              <div className="promo-stat-card">
                <div className="promo-stat-icon blue">
                  <Ticket size={18} />
                </div>
                <div>
                  <span>Aktiv kuponlar</span>
                  <h4>18 ta faol</h4>
                  <p>Barcha filiallar bo‘yicha</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="promo-stat-card">
                <div className="promo-stat-icon purple">
                  <Percent size={18} />
                </div>
                <div>
                  <span>O‘rtacha chegirma</span>
                  <h4>12.5%</h4>
                </div>
              </div>

              <div className="promo-stat-card">
                <div className="promo-stat-icon green">
                  <Gift size={18} />
                </div>
                <div>
                  <span>Faol kuponlar</span>
                  <h4>42 ta</h4>
                </div>
              </div>

              <div className="promo-stat-card">
                <div className="promo-stat-icon blue">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span>Jami tejoy</span>
                  <h4>4.2M UZS</h4>
                </div>
              </div>

              <div className="promo-stat-card">
                <div className="promo-stat-icon orange">
                  <Clock3 size={18} />
                </div>
                <div>
                  <span>Tugayotgan</span>
                  <h4>8 ta</h4>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PromoCodeModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
}