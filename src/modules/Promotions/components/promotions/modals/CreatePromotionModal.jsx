import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import "./PromotionModals.css";
import { merchantPromoApi } from "../../../../../api/modules/merchantPromoApi";

const initialForm = {
  name: "",
  type: "Foiz (%)",
  value: "",
  startDate: "",
  endDate: "",
  description: "",
  active: true,
  productId: "",
  productName: "",
};

const months = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

const parseDate = (value) => {
  if (!value) return null;

  const [day, month, year] = value.split(".").map(Number);
  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day);
};

const parsePercentValue = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 3);
  if (!digits) return "";

  const num = Number(digits);
  if (num > 100) return "100";
  if (num < 1) return "1";

  return String(num);
};

const getProductName = (product = {}) =>
  product.name || product.productName || "";

const getProductId = (product = {}) => product.id ?? product.productId;

const dedupeProducts = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const id = getProductId(item);

    if (id == null) return true;

    const key = String(id);
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const parseProductList = (res) => {
  if (Array.isArray(res)) return dedupeProducts(res);

  const list =
    res?.data?.content ||
    res?.data?.data ||
    (Array.isArray(res?.data) ? res.data : null) ||
    res?.content ||
    [];

  return dedupeProducts(Array.isArray(list) ? list : []);
};

const getProducts = async () => {
  const res = await merchantPromoApi.getMerchentPromoList();
  return parseProductList(res);
};

function CustomDatePicker({
  label,
  value,
  pickerName,
  activePicker,
  onOpen,
  onClose,
  onChange,
}) {
  const today = new Date();
  const selectedDate = parseDate(value);

  const [monthOpen, setMonthOpen] = useState(false);
const [yearOpen, setYearOpen] = useState(false);

  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() || today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() || today.getMonth()
  );

  const isOpen = activePicker === pickerName;

  useEffect(() => {
    if (!isOpen) return;

    const currentDate = parseDate(value);

    if (currentDate) {
      setViewYear(currentDate.getFullYear());
      setViewMonth(currentDate.getMonth());
    }
  }, [isOpen, value]);

  const days = (() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const result = [];

    for (let i = 0; i < startDay; i++) {
      result.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      result.push(new Date(viewYear, viewMonth, day));
    }

    return result;
  })();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (date) => {
    onChange(formatDate(date));
    onClose();
  };

  return (
    <div className="promo-date-wrap">
      <label>{label}</label>

      <button
        type="button"
        className={`promo-date-input ${isOpen ? "active" : ""}`}
        onClick={() => onOpen(pickerName)}
      >
        <CalendarDays size={14} />
        <span>{value || "Muddat tanlang"}</span>
      </button>

      {isOpen && (
        <div className="promo-calendar-backdrop" onClick={onClose}>
          <div
            className="promo-calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="promo-calendar-header">
              <strong>{label}</strong>

              <button type="button" onClick={onClose}>
                <X size={15} />
              </button>
            </div>

            <div className="promo-calendar-control">
              <button type="button" onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>

              <div className="promo-calendar-selects">
  
  {/* MONTH */}
  <div className="promo-custom-dd">
    <button
      type="button"
      className="promo-dd-btn"
      onClick={() => {
        setMonthOpen((prev) => !prev);
        setYearOpen(false);
      }}
    >
      {months[viewMonth]}
    </button>

    {monthOpen && (
      <div className="promo-dd-list">
        {months.map((m, i) => (
          <button
            key={`${pickerName}-month-${i}`}
            className={`promo-dd-item ${i === viewMonth ? "active" : ""}`}
            onClick={() => {
              setViewMonth(i);
              setMonthOpen(false);
            }}
          >
            {m}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* YEAR */}
  <div className="promo-custom-dd">
    <button
      type="button"
      className="promo-dd-btn"
      onClick={() => {
        setYearOpen((prev) => !prev);
        setMonthOpen(false);
      }}
    >
      {viewYear}
    </button>

    {yearOpen && (
      <div className="promo-dd-list promo-dd-list-scroll">
        {Array.from({ length: 20 }).map((_, i) => {
          const year = 2020 + i;
          return (
            <button
              key={`${pickerName}-year-${year}`}
              className={`promo-dd-item ${year === viewYear ? "active" : ""}`}
              onClick={() => {
                setViewYear(year);
                setYearOpen(false);
              }}
            >
              {year}
            </button>
          );
        })}
      </div>
    )}
  </div>
</div>

              <button type="button" onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="promo-calendar-weekdays">
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="promo-calendar-days">
              {days.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} />;

                const dateValue = formatDate(date);
                const isSelected = value === dateValue;
                const isToday = formatDate(today) === dateValue;

                return (
                  <button
                    key={dateValue}
                    type="button"
                    className={`${isSelected ? "selected" : ""} ${
                      isToday ? "today" : ""
                    }`}
                    onClick={() => handleSelectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePromotionModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  const [form, setForm] = useState(initialForm);
  const [activePicker, setActivePicker] = useState(null);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const productSearchRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const [startDate = "", endDate = ""] = editData.period
        ? editData.period.split(" — ")
        : ["", ""];

      setForm({
        name: editData.name || "",
        type: "Foiz (%)",
        value: parsePercentValue(editData.value),
        startDate,
        endDate,
        description: editData.description || "",
        active: editData.status === "Faol",
        productId: editData.productId ?? "",
        productName: editData.productName ?? "",
      });
      setProductSearch(editData.productName || "");
      setSelectedProduct(null);
    } else {
      setForm(initialForm);
      setProductSearch("");
      setSelectedProduct(null);
    }

    setProductDropdownOpen(false);
    setActivePicker(null);

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const list = await getProducts();
        setProducts(list);
      } catch (error) {
        console.error("Merchant product list error:", error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [open, editData]);

  useEffect(() => {
    if (!open || productsLoading || !products.length) return;

    const targetId = editData?.productId ?? form.productId;
    if (!targetId) return;

    if (selectedProduct && String(selectedProduct.id) === String(targetId)) {
      return;
    }

    const found = products.find(
      (item) => String(getProductId(item)) === String(targetId)
    );

    if (found) {
      const name = getProductName(found);
      setSelectedProduct(found);
      setProductSearch(name);
      setForm((prev) => ({
        ...prev,
        productId: found.id,
        productName: name,
      }));
      return;
    }

    if (editData?.productName) {
      setProductSearch(editData.productName);
    }
  }, [open, products, productsLoading, editData, form.productId, selectedProduct]);

  useEffect(() => {
    if (!productDropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target)
      ) {
        setProductDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productDropdownOpen]);

  const filteredProducts = useMemo(
    () =>
      products.filter((item) =>
        getProductName(item)
          .toLowerCase()
          .includes(productSearch.trim().toLowerCase())
      ),
    [products, productSearch]
  );

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectProduct = (product) => {
    const name = getProductName(product);

    setSelectedProduct(product);
    setProductSearch(name);
    setForm((prev) => ({
      ...prev,
      productId: getProductId(product),
      productName: name,
    }));
    setProductDropdownOpen(false);
  };

  const handleProductSearchChange = (value) => {
    setProductSearch(value);
    setProductDropdownOpen(true);

    if (
      selectedProduct &&
      value.trim() !== getProductName(selectedProduct).trim()
    ) {
      setSelectedProduct(null);
      setForm((prev) => ({
        ...prev,
        productId: "",
        productName: "",
      }));
    }
  };

  const handleSubmit = () => {
    const percentValue = parsePercentValue(form.value) || "1";

    onSave?.({
      name: form.name,
      type: "Foiz",
      value: `${percentValue}%`,
      period: `${form.startDate} — ${form.endDate}`,
      status: form.active ? "Faol" : "Kutilmoqda",
      description: form.description,
      productId: form.productId,
      productName: form.productName,
    });
  };

  return (
    <div className="promo-modal-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="promo-modal-close" type="button" onClick={onClose}>
          <X size={16} />
        </button>

        <div className="promo-modal-top-label">AKSIYALAR</div>

        <h2>{editData ? "Aksiyani tahrirlash" : "Yangi aksiya"}</h2>
        <p>
          {editData
            ? "Aksiya ma’lumotlarini o‘zgartiring"
            : "Yangi aksiya yarating"}
        </p>

        <div
          className={`promo-form-group ${
            productDropdownOpen ? "promo-dropdown-open" : ""
          }`}
        >
          <label>Mahsulot</label>

          <div className="product-search-wrapper" ref={productSearchRef}>
            <input
              type="text"
              className="product-search-input"
              placeholder="Mahsulot qidirish..."
              value={productSearch}
              onFocus={() => setProductDropdownOpen(true)}
              onChange={(e) => handleProductSearchChange(e.target.value)}
            />

            {productDropdownOpen && (
              <div className="product-search-dropdown">
                {productsLoading && (
                  <div className="product-search-empty">Yuklanmoqda...</div>
                )}

                {!productsLoading && filteredProducts.length === 0 && (
                  <div className="product-search-empty">Mahsulot topilmadi</div>
                )}

                {!productsLoading &&
                  filteredProducts.map((item, index) => (
                    <button
                      key={`${getProductId(item) ?? "product"}-${index}`}
                      type="button"
                      className={`product-search-item ${
                        String(form.productId) === String(getProductId(item))
                          ? "selected"
                          : ""
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectProduct(item)}
                    >
                      <strong>{getProductName(item)}</strong>
                      {/* {item.id != null && <span>ID: {item.id}</span>} */}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Asosiy ma’lumotlar</div>

          <div className="promo-form-group">
            <label>Aksiya nomi</label>
            <input
              type="text"
              placeholder="Masalan: Kuzgi chegirma"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="promo-form-grid two">
            <div className="promo-form-group">
              <label>Turi</label>
              <input
                type="text"
                value={form.type}
                readOnly
                tabIndex={-1}
                className="promo-readonly-input"
              />
            </div>

            <div className="promo-form-group">
              <label>Qiymat (%)</label>
              <div className="promo-percent-input-wrap">
                <input
                  type="text"
                  inputMode="numeric"
                  className="promo-percent-input"
                  placeholder="Masalan: 20"
                  value={form.value}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").slice(0, 3);

                    if (value === "") {
                      handleChange("value", "");
                      return;
                    }

                    const numberValue = Number(value);

                    if (numberValue > 100) value = "100";
                    if (numberValue < 1) value = "1";

                    handleChange("value", value);
                  }}
                />
                <span className="promo-percent-symbol">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Amal qilish muddati</div>

          <div className="promo-form-grid two">
            <CustomDatePicker
              label="Boshlanish"
              value={form.startDate}
              pickerName="startDate"
              activePicker={activePicker}
              onOpen={setActivePicker}
              onClose={() => setActivePicker(null)}
              onChange={(value) => handleChange("startDate", value)}
            />

            <CustomDatePicker
              label="Tugashi"
              value={form.endDate}
              pickerName="endDate"
              activePicker={activePicker}
              onOpen={setActivePicker}
              onClose={() => setActivePicker(null)}
              onChange={(value) => handleChange("endDate", value)}
            />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Qo‘shimcha</div>

          <div className="promo-form-group">
            <label>Izoh</label>
            <textarea
              rows="4"
              placeholder="Aksiya haqida qisqacha izoh"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="promo-form-toggle">
            <div>
              <strong>Darhol faollashtirish</strong>
              <span>Aksiya yaratilgandan so‘ng darhol ishlaydi</span>
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

          <button
            type="button"
            className="promo-submit-btn"
            onClick={handleSubmit}
          >
            {editData ? "Saqlash" : "Aksiya yaratish"}
          </button>
        </div>
      </div>
    </div>
  );
}