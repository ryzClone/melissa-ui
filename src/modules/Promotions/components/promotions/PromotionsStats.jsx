import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Clock3, Gift, Percent, TrendingUp } from "lucide-react";
import { PROMOTIONS_NAMESPACE } from "@/i18n/namespaces";
import { PROMO_TAB_PROMOTIONS } from "../../constants/promoTabs";
import "./PromotionsStats.css";

export default function PromotionsStats({ activeTab, promotions = [] }) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);

  const promoStats = useMemo(() => {
    if (activeTab === PROMO_TAB_PROMOTIONS) {
      return [
        {
          title: t("stats.totalPromotions"),
          value: promotions.length,
          description: t("stats.totalPromotionsDesc"),
          icon: Gift,
          iconTone: "purple",
        },
        {
          title: t("stats.activePromotions"),
          value: promotions.filter((item) => item.status === "Faol").length,
          description: t("stats.activePromotionsDesc"),
          icon: TrendingUp,
          iconTone: "green",
        },
        {
          title: t("stats.pendingPromotions"),
          value: promotions.filter((item) => item.status === "Kutilmoqda").length,
          description: t("stats.pendingPromotionsDesc"),
          icon: Clock3,
          iconTone: "orange",
        },
      ].filter((item) => item.value !== null && item.value !== undefined);
    }

    return [
      {
        title: t("stats.avgDiscount"),
        value: "12.5%",
        description: null,
        icon: Percent,
        iconTone: "purple",
      },
      {
        title: t("stats.activeCoupons"),
        value: t("stats.countUnit", { count: 42 }),
        description: null,
        icon: Gift,
        iconTone: "green",
      },
      {
        title: t("stats.totalSavings"),
        value: "4.2M UZS",
        description: null,
        icon: TrendingUp,
        iconTone: "blue",
      },
      {
        title: t("stats.expiringSoon"),
        value: t("stats.countUnit", { count: 8 }),
        description: null,
        icon: Clock3,
        iconTone: "orange",
      },
    ].filter((item) => item.value !== null && item.value !== undefined);
  }, [activeTab, promotions, t]);

  return (
    <div className="promo-stats-grid">
      {promoStats.map((item) => {
        const Icon = item.icon;

        return (
          <div className="promo-stat-card" key={item.title}>
            {Icon && (
              <div className={`promo-stat-icon ${item.iconTone || ""}`}>
                <Icon size={18} />
              </div>
            )}

            <div>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              {item.description ? <p>{item.description}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
