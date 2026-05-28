import { useMemo } from "react";
import { Clock3, Gift, Percent, TrendingUp } from "lucide-react";
import "./PromotionsStats.css";

const buildPromotionStats = (promotions = []) =>
  [
    {
      title: "Jami aksiyalar",
      value: promotions.length,
      description: "Barcha aksiyalar",
      icon: Gift,
      iconTone: "purple",
    },
    {
      title: "Faol aksiyalar",
      value: promotions.filter((item) => item.status === "Faol").length,
      description: "Hozir faol",
      icon: TrendingUp,
      iconTone: "green",
    },
    {
      title: "Kutilmoqda",
      value: promotions.filter((item) => item.status === "Kutilmoqda").length,
      description: "Hali boshlanmagan",
      icon: Clock3,
      iconTone: "orange",
    },
  ].filter((item) => item.value !== null && item.value !== undefined);

const buildPromoCodeStats = () =>
  [
    {
      title: "O‘rtacha chegirma",
      value: "12.5%",
      description: null,
      icon: Percent,
      iconTone: "purple",
    },
    {
      title: "Faol kuponlar",
      value: "42 ta",
      description: null,
      icon: Gift,
      iconTone: "green",
    },
    {
      title: "Jami tejoy",
      value: "4.2M UZS",
      description: null,
      icon: TrendingUp,
      iconTone: "blue",
    },
    {
      title: "Tugayotgan",
      value: "8 ta",
      description: null,
      icon: Clock3,
      iconTone: "orange",
    },
  ].filter((item) => item.value !== null && item.value !== undefined);

export default function PromotionsStats({ activeTab, promotions = [] }) {
  const promoStats = useMemo(() => {
    if (activeTab === "Aksiyalar") {
      return buildPromotionStats(promotions);
    }

    return buildPromoCodeStats();
  }, [activeTab, promotions]);

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
