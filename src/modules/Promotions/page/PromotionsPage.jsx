import { useCallback, useEffect, useState } from "react";
import "../PromotionsPage.css";
import { discountApi } from "../../../api/modules/discountApi";
import { merchantPromoApi } from "../../../api/modules/merchantPromoApi";
import { parsePromoList, promoApi } from "../../../api/modules/promoApi";

import PromotionsHeader from "../components/promotions/PromotionsHeader";
import PromotionsTabs from "../components/promotions/PromotionsTabs";
import PromotionsTable from "../components/promotions/tables/PromotionsTable";
import PromoCodesTable from "../components/promotions/tables/PromoCodesTable";
import PromotionsStats from "../components/promotions/PromotionsStats";
import CreatePromotionModal from "../components/promotions/modals/CreatePromotionModal";
import CreatePromoCodeModal from "../components/promotions/modals/CreatePromoCodeModal";

const promoTabs = ["Aksiyalar", "Promokod"];

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState("Aksiyalar");
  const [promotions, setPromotions] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);

  const [openPromotionModal, setOpenPromotionModal] = useState(false);
  const [openPromoCodeModal, setOpenPromoCodeModal] = useState(false);

  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);

  const toApiDate = (value = "") => {
    if (!value) return "";
    if (value.includes("-")) return value;
    const [day, month, year] = value.split(".");
    if (!day || !month || !year) return value;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const fromApiDate = (value = "") => {
    if (!value) return "";
    if (value.includes(".")) return value;
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}.${month}.${year}`;
  };

  const resolveDisplayValue = (item = {}) => {
    if (item.value !== undefined && item.value !== null) return item.value;
    if (item.percentageValue !== undefined && item.percentageValue !== null) {
      return `${item.percentageValue}%`;
    }
    if (item.fixedAmount !== undefined && item.fixedAmount !== null) {
      return `${item.fixedAmount}`;
    }
    return 0;
  };

  const mapDiscountToPromotionRow = (item) => ({
    id: item?.id,
    type: item?.type === "PERCENTAGE" ? "Foiz" : "Qiymat",
    name: item?.name || "",
    value: resolveDisplayValue(item),
    period: `${item?.startDate || ""} — ${item?.endDate || ""}`,
    status: item?.active ? "Faol" : "Nofaol",
    raw: item,
  });

  const buildDiscountPayload = (formData = {}) => {
    const [periodStart = "", periodEnd = ""] = (formData.period || "").split(" — ");
    const startDate = formData.startDate || periodStart;
    const endDate = formData.endDate || periodEnd;

    return {
      productId: Number(formData.productId) || 0,
      name: formData.name || "",
      value: Number(String(formData.value ?? "").replace(/[^\d.-]/g, "")) || 0,
      startDate: toApiDate(startDate),
      endDate: toApiDate(endDate),
      active: Boolean(
        typeof formData.active === "boolean"
          ? formData.active
          : formData.status === "Faol"
      ),
    };
  };

  const loadDiscounts = useCallback(async () => {
    setLoadingDiscounts(true);
    try {
      const response = await discountApi.getDiscounts();
      const content = response?.data?.content || response?.content || [];
      const mapped = Array.isArray(content)
        ? content.map(mapDiscountToPromotionRow)
        : [];
      setPromotions(mapped);
    } catch (error) {
      console.error("Discount list fetch failed:", error);
      setPromotions([]);
    } finally {
      setLoadingDiscounts(false);
    }
  }, []);

  const loadPromos = useCallback(async () => {
    setLoadingPromoCodes(true);
    try {
      const res = await promoApi.getPromos();
      setPromoCodes(parsePromoList(res));
    } catch (error) {
      console.error("Promo list fetch failed:", error);
      setPromoCodes([]);
    } finally {
      setLoadingPromoCodes(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "Aksiyalar") {
      loadDiscounts();
    } else if (activeTab === "Promokod") {
      loadPromos();
    }
  }, [activeTab, loadDiscounts, loadPromos]);

  const handleOpenCreate = () => {
    if (activeTab === "Aksiyalar") {
      setSelectedPromotion(null);
      setOpenPromotionModal(true);
    } else {
      setSelectedPromoCode(null);
      setOpenPromoCodeModal(true);
    }
  };

  const handleEditPromotion = (item) => {
    const [startDate = "", endDate = ""] = (item?.period || "").split(" — ");
    setSelectedPromotion({
      ...item,
      value: String(item?.value ?? "").replace("%", "").replace(" so'm", ""),
      period: `${fromApiDate(startDate)} — ${fromApiDate(endDate)}`,
    });
    setOpenPromotionModal(true);
  };

  const handleEditPromoCode = (item) => {
    setSelectedPromoCode(item);
    setOpenPromoCodeModal(true);
  };

  const handleDeletePromotion = async (id) => {
    try {
      await discountApi.deleteDiscount(id);
      await loadDiscounts();
    } catch (error) {
      console.error("Discount delete failed:", error);
    }
  };

  const handleDeletePromoCode = async (id) => {
    try {
      await promoApi.deletePromo(id);
      await loadPromos();
    } catch (error) {
      console.error("Merchant promo delete failed:", error);
    }
  };

  const handleSavePromotion = async (data) => {
    const payload = buildDiscountPayload(data);
    try {
      if (selectedPromotion?.id !== undefined && selectedPromotion?.id !== null) {
        await discountApi.updateDiscount(selectedPromotion.id, payload);
      } else {
        await discountApi.createDiscount(payload);
      }
      await loadDiscounts();
      setSelectedPromotion(null);
      setOpenPromotionModal(false);
    } catch (error) {
      console.error("Discount save failed:", error);
    }
  };

  const handleSavePromoCode = async (data) => {
    try {
      if (selectedPromoCode?.id !== undefined && selectedPromoCode?.id !== null) {
        await promoApi.updatePromo(selectedPromoCode.id, data);
      } else {
        await promoApi.createPromo(data);
      }
      await loadPromos();
      setSelectedPromoCode(null);
      setOpenPromoCodeModal(false);
    } catch (error) {
      console.error("Merchant promo save failed:", error);
    }
  };

  const handleClosePromotionModal = () => {
    setSelectedPromotion(null);
    setOpenPromotionModal(false);
  };

  const handleClosePromoCodeModal = () => {
    setSelectedPromoCode(null);
    setOpenPromoCodeModal(false);
  };

  return (
    <>
      <div className="promo-page">
        <PromotionsHeader
          activeTab={activeTab}
          onCreateClick={handleOpenCreate}
        />

        <PromotionsTabs
          tabs={promoTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === "Aksiyalar" ? (
          loadingDiscounts ? (
            <div className="promo-loading">Yuklanmoqda...</div>
          ) : (
            <PromotionsTable
              items={promotions}
              onEdit={handleEditPromotion}
              onDelete={handleDeletePromotion}
            />
          )
        ) : (
          loadingPromoCodes ? (
            <div className="promo-loading">Yuklanmoqda...</div>
          ) : (
            <PromoCodesTable
              items={promoCodes}
              onEdit={handleEditPromoCode}
              onDelete={handleDeletePromoCode}
            />
          )
        )}

        <PromotionsStats activeTab={activeTab} promotions={promotions} />
      </div>

      <CreatePromotionModal
        open={openPromotionModal}
        editData={selectedPromotion}
        onClose={handleClosePromotionModal}
        onSave={handleSavePromotion}
      />

      <CreatePromoCodeModal
        open={openPromoCodeModal}
        editData={selectedPromoCode}
        onClose={handleClosePromoCodeModal}
        onSave={handleSavePromoCode}
      />
    </>
  );
}