import { useCallback, useEffect, useState } from "react";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import FilterBar, { FilterItem } from "@/components/FilterBar/FilterBar";
import PagePartnerFilter from "@/components/PagePartnerFilter/PagePartnerFilter";
import { useScopedPartnerParams, PARTNER_SELECT_MESSAGE } from "@/hooks/useScopedPartnerParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLatestRequest } from "@/hooks/useLatestRequest";
import { useAuth } from "@/core/hooks/useAuth";
import "../PromotionsPage.css";
import { discountApi } from "../../../api/modules/discountApi";
import { merchantDiscountApi } from "../../../api/modules/merchantDiscountApi";
import { adminMerchantPromoApi } from "../../../api/modules/adminMerchantPromoApi";
import { parsePromoList, promoApi } from "../../../api/modules/promoApi";

import PromotionsHeader from "../components/promotions/PromotionsHeader";
import PromotionsTabs from "../components/promotions/PromotionsTabs";
import PromotionsTable from "../components/promotions/tables/PromotionsTable";
import PromoCodesTable from "../components/promotions/tables/PromoCodesTable";
import PromotionsStats from "../components/promotions/PromotionsStats";
import CreatePromotionModal from "../components/promotions/modals/CreatePromotionModal";
import CreatePromoCodeModal from "../components/promotions/modals/CreatePromoCodeModal";
import ViewDiscountModal from "../components/promotions/modals/ViewDiscountModal";
import ViewPromoModal from "../components/promotions/modals/ViewPromoModal";

const promoTabs = ["Aksiyalar", "Promokod"];

export default function PromotionsPage() {
  const { success } = useGlobalNotification();
  const [activeTab, setActiveTab] = useState("Aksiyalar");
  const [promotions, setPromotions] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [loadingPromoCodes, setLoadingPromoCodes] = useState(false);

  const [openPromotionModal, setOpenPromotionModal] = useState(false);
  const [openPromoCodeModal, setOpenPromoCodeModal] = useState(false);
  const [openViewDiscountModal, setOpenViewDiscountModal] = useState(false);
  const [openViewPromoModal, setOpenViewPromoModal] = useState(false);

  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [viewDiscount, setViewDiscount] = useState(null);
  const [viewPromo, setViewPromo] = useState(null);
  const { isSuperAdmin } = useAuth();
  const { canFetch, getParams, getOrganizationParams } = useScopedPartnerParams();
  const { beginRequest, isLatestRequest } = useLatestRequest();
  const [promoSearch, setPromoSearch] = useState("");
  const debouncedPromoSearch = useDebouncedValue(promoSearch, 3000);

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
    code: item?.code || item?.promoCode || "—",
    discount: resolveDisplayValue(item),
    value: resolveDisplayValue(item),
    startDate: fromApiDate(item?.startDate || ""),
    endDate: fromApiDate(item?.endDate || ""),
    period: `${fromApiDate(item?.startDate || "")} — ${fromApiDate(item?.endDate || "")}`,
    status: item?.active ? "Faol" : "Nofaol",
    active: Boolean(item?.active),
    productId: item?.productId,
    productName: item?.productName || item?.product?.name || "",
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
    if (!canFetch) {
      setPromotions([]);
      return;
    }

    const requestId = beginRequest();
    setLoadingDiscounts(true);

    try {
      const response = isSuperAdmin
        ? await merchantDiscountApi.getList(getOrganizationParams())
        : await discountApi.getDiscounts(getParams());

      if (!isLatestRequest(requestId)) return;

      const content = response?.data?.content || response?.content || [];
      const mapped = Array.isArray(content)
        ? content.map(mapDiscountToPromotionRow)
        : [];
      setPromotions(mapped);
    } catch (error) {
      if (!isLatestRequest(requestId)) return;
      console.error("Discount list fetch failed:", error);
      setPromotions([]);
    } finally {
      if (isLatestRequest(requestId)) {
        setLoadingDiscounts(false);
      }
    }
  }, [canFetch, getParams, getOrganizationParams, isSuperAdmin, beginRequest, isLatestRequest]);

  const loadPromos = useCallback(async () => {
    if (!canFetch) {
      setPromoCodes([]);
      return;
    }

    const requestId = beginRequest();
    setLoadingPromoCodes(true);

    try {
      const listParams = isSuperAdmin
        ? getOrganizationParams({
            search: debouncedPromoSearch.trim() || undefined,
          })
        : getParams({ search: debouncedPromoSearch.trim() || undefined });

      const res = isSuperAdmin
        ? await adminMerchantPromoApi.getList(listParams)
        : await promoApi.getPromos(listParams);

      if (!isLatestRequest(requestId)) return;

      setPromoCodes(parsePromoList(res));
    } catch (error) {
      if (!isLatestRequest(requestId)) return;
      console.error("Promo list fetch failed:", error);
      setPromoCodes([]);
    } finally {
      if (isLatestRequest(requestId)) {
        setLoadingPromoCodes(false);
      }
    }
  }, [
    canFetch,
    getParams,
    getOrganizationParams,
    isSuperAdmin,
    debouncedPromoSearch,
    beginRequest,
    isLatestRequest,
  ]);

  useEffect(() => {
    if (activeTab !== "Aksiyalar") return;
    loadDiscounts();
  }, [activeTab, loadDiscounts]);

  useEffect(() => {
    if (activeTab !== "Promokod") return;
    loadPromos();
  }, [activeTab, loadPromos]);

  const handleOpenCreate = () => {
    if (isSuperAdmin) return;

    if (activeTab === "Aksiyalar") {
      setSelectedPromotion(null);
      setOpenPromotionModal(true);
    } else {
      setSelectedPromoCode(null);
      setOpenPromoCodeModal(true);
    }
  };

  const handleEditPromotion = (item) => {
    if (isSuperAdmin) return;

    const [startDate = "", endDate = ""] = (item?.period || "").split(" — ");
    setSelectedPromotion({
      ...item,
      value: String(item?.value ?? "").replace("%", "").replace(" so'm", ""),
      period: `${fromApiDate(startDate)} — ${fromApiDate(endDate)}`,
    });
    setOpenPromotionModal(true);
  };

  const handleViewPromotion = (item) => {
    if (!isSuperAdmin || !item) return;

    setViewDiscount(item);
    setOpenViewDiscountModal(true);
  };

  const handleCloseViewDiscountModal = () => {
    setViewDiscount(null);
    setOpenViewDiscountModal(false);
  };

  const handleEditPromoCode = (item) => {
    if (isSuperAdmin) return;

    setSelectedPromoCode(item);
    setOpenPromoCodeModal(true);
  };

  const handleViewPromoCode = (item) => {
    if (!isSuperAdmin || !item) return;

    setViewPromo(item);
    setOpenViewPromoModal(true);
  };

  const handleCloseViewPromoModal = () => {
    setViewPromo(null);
    setOpenViewPromoModal(false);
  };

  const handleDeletePromotion = async (id) => {
    if (isSuperAdmin) return;

    try {
      await discountApi.deleteDiscount(id);
      await loadDiscounts();
      success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Discount delete failed:", error);
    }
  };

  const handleDeletePromoCode = async (id) => {
    if (isSuperAdmin) return;

    try {
      await promoApi.deletePromo(id);
      await loadPromos();
      success("Muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Merchant promo delete failed:", error);
    }
  };

  const handleSavePromotion = async (data) => {
    if (isSuperAdmin) return;

    const payload = buildDiscountPayload(data);
    try {
      if (selectedPromotion?.id !== undefined && selectedPromotion?.id !== null) {
        await discountApi.updateDiscount(selectedPromotion.id, payload);
        success("Muvaffaqiyatli yangilandi");
      } else {
        await discountApi.createDiscount(payload);
        success("Muvaffaqiyatli yaratildi");
      }
      await loadDiscounts();
      setSelectedPromotion(null);
      setOpenPromotionModal(false);
    } catch (error) {
      console.error("Discount save failed:", error);
    }
  };

  const handleSavePromoCode = async (data) => {
    if (isSuperAdmin) return;

    try {
      if (selectedPromoCode?.id !== undefined && selectedPromoCode?.id !== null) {
        await promoApi.updatePromo(selectedPromoCode.id, data);
        success("Muvaffaqiyatli yangilandi");
      } else {
        await promoApi.createPromo(data);
        success("Muvaffaqiyatli yaratildi");
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
    <PageWrapper>
      <div className="promo-page">
        <PromotionsHeader
          activeTab={activeTab}
          onCreateClick={handleOpenCreate}
          readOnly={isSuperAdmin}
        />

        <PromotionsTabs
          tabs={promoTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {isSuperAdmin && (
          <FilterBar>
            <FilterItem>
              <PagePartnerFilter partnerLabel="Tashkilot" />
            </FilterItem>
          </FilterBar>
        )}

        {activeTab === "Aksiyalar" ? (
            <PromotionsTable
              items={promotions}
              loading={loadingDiscounts}
              onView={handleViewPromotion}
              onEdit={handleEditPromotion}
              onDelete={handleDeletePromotion}
              readOnly={isSuperAdmin}
              emptyText={canFetch ? "Ma'lumot topilmadi" : PARTNER_SELECT_MESSAGE}
            />
        ) : (
            <PromoCodesTable
              items={promoCodes}
              loading={loadingPromoCodes}
              onView={handleViewPromoCode}
              onEdit={handleEditPromoCode}
              onDelete={handleDeletePromoCode}
              readOnly={isSuperAdmin}
              emptyText={canFetch ? "Ma'lumot topilmadi" : PARTNER_SELECT_MESSAGE}
              searchValue={promoSearch}
              onSearchChange={setPromoSearch}
            />
        )}

        <PromotionsStats activeTab={activeTab} promotions={promotions} />
      </div>

      <CreatePromotionModal
        open={openPromotionModal}
        editData={selectedPromotion}
        onClose={handleClosePromotionModal}
        onSave={handleSavePromotion}
        getParams={getParams}
      />

      <CreatePromoCodeModal
        open={openPromoCodeModal}
        editData={selectedPromoCode}
        onClose={handleClosePromoCodeModal}
        onSave={handleSavePromoCode}
      />

      <ViewDiscountModal
        open={openViewDiscountModal}
        discount={viewDiscount}
        onClose={handleCloseViewDiscountModal}
      />

      <ViewPromoModal
        open={openViewPromoModal}
        promo={viewPromo}
        onClose={handleCloseViewPromoModal}
      />
    </PageWrapper>
  );
}