import { useCallback, useEffect, useMemo, useState } from "react";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { useAuth } from "@/core/hooks/useAuth";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import { useLatestRequest } from "@/hooks/useLatestRequest";
import {
  useScopedPartnerParams,
  PARTNER_SELECT_MESSAGE,
} from "@/hooks/useScopedPartnerParams";
import "../dashboard.css";

import DashboardHeader from "../components/DashboardHeader/DashboardHeader";
import StatsGrid from "../components/StatsGrid/StatsGrid";
import RevenueChart from "../components/RevenueChart/RevenueChart";
import CategoryChart from "../components/CategoryChart/CategoryChart";
import RecentOrders from "../components/RecentOrders/RecentOrders";
import { dashboardApi } from "../api/dashboardApi";
import {
  getDefaultDashboardData,
  normalizeDashboardResponse,
} from "../utils/dashboardDataUtils";
import { getTodayDateRange } from "../utils/dashboardDateUtils";

export default function DashboardPage() {
  const { isSuperAdmin } = useAuth();
  const { canFetch, getOrganizationParams, partnerId } =
    useScopedPartnerParams();
  const { success, error: notifyError } = useGlobalNotification();
  const { beginRequest, isLatestRequest } = useLatestRequest();
  const [dateRange, setDateRange] = useState(getTodayDateRange);
  const [dashboardData, setDashboardData] = useState(getDefaultDashboardData);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const organizationId = useMemo(() => {
    if (!isSuperAdmin || !partnerId) return null;
    const id = Number(partnerId);
    return Number.isFinite(id) ? id : null;
  }, [isSuperAdmin, partnerId]);

  const buildDashboardParams = useCallback(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) {
      return null;
    }

    if (isSuperAdmin) {
      if (!canFetch || organizationId == null) {
        return null;
      }

      return getOrganizationParams(dateRange);
    }

    return dateRange;
  }, [
    canFetch,
    dateRange,
    getOrganizationParams,
    isSuperAdmin,
    organizationId,
  ]);

  const loadDashboard = useCallback(async () => {
    const params = buildDashboardParams();

    if (!params) {
      setDashboardData(getDefaultDashboardData());
      return;
    }

    const requestId = beginRequest();

    try {
      const response = await dashboardApi.getDashboard(params);
      if (!isLatestRequest(requestId)) return;
      setDashboardData(normalizeDashboardResponse(response));
    } catch (err) {
      if (!isLatestRequest(requestId)) return;
      console.error("Dashboard fetch error:", err);
      setDashboardData(getDefaultDashboardData());
    }
  }, [buildDashboardParams, beginRequest, isLatestRequest]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleDownloadReport = useCallback(async () => {
    const params = buildDashboardParams();

    if (!params) {
      if (isSuperAdmin && !canFetch) {
        notifyError(PARTNER_SELECT_MESSAGE);
        return;
      }

      notifyError("Hisobot uchun sana oralig‘ini tanlang");
      return;
    }

    try {
      setDownloadingReport(true);
      await dashboardApi.downloadReport(params);
      success("Hisobot yuklab olindi");
    } catch (err) {
      console.error("Dashboard report download error:", err);
      notifyError("Hisobotni yuklab bo‘lmadi");
    } finally {
      setDownloadingReport(false);
    }
  }, [
    buildDashboardParams,
    canFetch,
    isSuperAdmin,
    notifyError,
    success,
  ]);

  return (
    <PageWrapper>
      <div className="dashboard-page">
        <DashboardHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onDownloadReport={handleDownloadReport}
          downloadingReport={downloadingReport}
        />

        <StatsGrid stats={dashboardData.stats} />

        <div className="dashboard-main-grid">
          <RevenueChart />
          <CategoryChart
            branches={dashboardData.branches}
            topBranch={dashboardData.topBranch}
          />
        </div>

        <RecentOrders orders={dashboardData.recentOrders} />
      </div>
    </PageWrapper>
  );
}
