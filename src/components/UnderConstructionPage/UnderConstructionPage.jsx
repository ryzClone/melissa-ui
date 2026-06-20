import { Settings, Construction } from "lucide-react";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import "./UnderConstructionPage.css";

export default function UnderConstructionPage({
  icon: Icon = Settings,
  badgeIcon: BadgeIcon = Construction,
  title = "Bo‘lim ishlab chiqilmoqda",
  text = "Hozirda ishlar olib borilmoqda",
  subtext = "Ushbu bo‘lim tez orada ishga tushiriladi",
  showProgress = true,
}) {
  return (
    <PageWrapper>
      <div className="under-construction-page">
        <div className="under-construction-card">
        <div className="under-construction-icon-wrap">
          <div className="under-construction-icon-glow" />
          <Icon size={56} className="under-construction-icon-main" />
          {BadgeIcon && (
            <BadgeIcon size={22} className="under-construction-icon-badge" />
          )}
        </div>

        <h1 className="under-construction-title">{title}</h1>
        <p className="under-construction-text">{text}</p>
        {subtext && (
          <p className="under-construction-subtext">{subtext}</p>
        )}

        {showProgress && (
          <div className="under-construction-progress">
            <div className="under-construction-progress-bar" />
          </div>
        )}
        </div>
      </div>
    </PageWrapper>
  );
}
