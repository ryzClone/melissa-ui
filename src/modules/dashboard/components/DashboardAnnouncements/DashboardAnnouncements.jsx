import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { DASHBOARD_NAMESPACE } from "@/i18n/namespaces";
import { MOCK_ANNOUNCEMENTS } from "../../utils/dashboardHomeData";
import DashboardNewsDetailModal from "./DashboardNewsDetailModal";
import {
  stripCarouselMeta,
  useInfiniteScrollCarousel,
} from "./useInfiniteScrollCarousel";
import "./DashboardAnnouncements.css";

export { MOCK_ANNOUNCEMENTS };

function NewsCard({ item, onOpenDetails, readMoreLabel }) {
  return (
    <article className="dashboard-news-card">
      <div className="dashboard-news-image-wrap">
        <img
          src={item.image}
          alt=""
          className="dashboard-news-image"
          loading="lazy"
          draggable={false}
        />
        <span className={`dashboard-news-badge tone-${item.tone || "info"}`}>
          {item.status}
        </span>
      </div>

      <div className="dashboard-news-body">
        <h3>{item.title}</h3>
        <p>{item.shortDescription}</p>

        <div className="dashboard-news-footer">
          <span>{item.date}</span>
          <button
            type="button"
            className="dashboard-news-link"
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetails(item);
            }}
          >
            {readMoreLabel}
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function DashboardAnnouncements({
  items = MOCK_ANNOUNCEMENTS,
}) {
  const { t } = useTranslation(DASHBOARD_NAMESPACE);
  const [selectedNews, setSelectedNews] = useState(null);

  const {
    scrollRef,
    trackRef,
    extendedItems,
    handleScroll,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    wasDragged,
  } = useInfiniteScrollCarousel(items, {
    autoplayInterval: 5000,
    autoplayPaused: Boolean(selectedNews),
  });

  const openNewsModal = useCallback((item) => {
    setSelectedNews(stripCarouselMeta(item));
  }, []);

  const closeNewsModal = useCallback(() => {
    setSelectedNews(null);
  }, []);

  const handleCardClick = useCallback(
    (item) => {
      if (wasDragged()) return;
      openNewsModal(item);
    },
    [openNewsModal, wasDragged]
  );

  if (!items.length) {
    return null;
  }

  const readMoreLabel = t("news.readMore");

  return (
    <>
      <section className="dashboard-news-section">
        <header className="dashboard-news-header">
          <span className="dashboard-news-header-icon">
            <Megaphone size={18} />
          </span>
          <div>
            <h2>{t("news.title")}</h2>
            <p>{t("news.subtitle")}</p>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="dashboard-news-scroll"
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div ref={trackRef} className="dashboard-news-track">
            {extendedItems.map((item) => (
              <div
                key={item._carouselKey}
                className="dashboard-news-card-wrap"
                onClick={() => handleCardClick(item)}
              >
                <NewsCard
                  item={item}
                  onOpenDetails={openNewsModal}
                  readMoreLabel={readMoreLabel}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <DashboardNewsDetailModal news={selectedNews} onClose={closeNewsModal} />
    </>
  );
}
