import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/core/hooks/useAuth";
import { AUTH_SESSION_CLEARED_EVENT, getStoredAccessToken } from "@/utils/authSession";
import { organizationBranchApi } from "@/api/modules/organizationBranchApi";
import { normalizeOrganizationList } from "@/components/OrganizationDropdown/OrganizationDropdown";

const PARTNER_STORAGE_KEY = "selectedPartnerId";

/** Session-scoped cache — survives route changes and StrictMode remounts. */
let partnersSessionCache = null;
let partnersSessionLoaded = false;
let partnersFetchPromise = null;

function clearPartnersSessionCache() {
  partnersSessionCache = null;
  partnersSessionLoaded = false;
  partnersFetchPromise = null;
}

export const PartnerContext = createContext(null);

function normalizePartnerList(response) {
  return normalizeOrganizationList(response);
}

function readStoredPartnerId() {
  if (typeof window === "undefined") return "";
  if (!getStoredAccessToken()) return "";
  return sessionStorage.getItem(PARTNER_STORAGE_KEY) || "";
}

export function PartnerProvider({ children }) {
  const { isSuperAdmin, user } = useAuth();
  const [partners, setPartners] = useState(() =>
    partnersSessionLoaded && Array.isArray(partnersSessionCache)
      ? partnersSessionCache
      : []
  );
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersLoaded, setPartnersLoaded] = useState(partnersSessionLoaded);
  const [partnerId, setPartnerIdState] = useState(readStoredPartnerId);

  const resetPartnerState = useCallback(() => {
    setPartnerIdState("");
    setPartners([]);
    setPartnersLoading(false);
    setPartnersLoaded(false);
    clearPartnersSessionCache();

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(PARTNER_STORAGE_KEY);
    }
  }, []);

  const setPartnerId = useCallback((nextPartnerId) => {
    const value = nextPartnerId ? String(nextPartnerId) : "";
    setPartnerIdState(value);

    if (typeof window !== "undefined") {
      if (value) {
        sessionStorage.setItem(PARTNER_STORAGE_KEY, value);
      } else {
        sessionStorage.removeItem(PARTNER_STORAGE_KEY);
      }
    }
  }, []);

  const fetchPartners = useCallback(async ({ force = false } = {}) => {
    if (!isSuperAdmin) {
      setPartners([]);
      setPartnersLoaded(false);
      clearPartnersSessionCache();
      return [];
    }

    if (!force) {
      if (partnersFetchPromise) {
        const list = await partnersFetchPromise;
        setPartners(Array.isArray(list) ? list : []);
        setPartnersLoaded(true);
        return list;
      }

      if (partnersSessionLoaded) {
        const cached = Array.isArray(partnersSessionCache)
          ? partnersSessionCache
          : [];
        setPartners(cached);
        setPartnersLoaded(true);
        return cached;
      }
    }

    const promise = (async () => {
      try {
        setPartnersLoading(true);
        const response = await organizationBranchApi.getByOrg();
        const list = normalizePartnerList(response);
        const normalized = Array.isArray(list) ? list : [];
        partnersSessionCache = normalized;
        partnersSessionLoaded = true;
        setPartners(normalized);
        setPartnersLoaded(true);
        return normalized;
      } catch (error) {
        console.error("Partner list fetch error:", error);
        setPartners([]);
        return [];
      } finally {
        setPartnersLoading(false);
        partnersFetchPromise = null;
      }
    })();

    partnersFetchPromise = promise;
    return promise;
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!user) {
      resetPartnerState();
      return;
    }

    if (isSuperAdmin) {
      fetchPartners();
      return;
    }

    resetPartnerState();
  }, [user, isSuperAdmin, fetchPartners, resetPartnerState]);

  useEffect(() => {
    const handleSessionCleared = () => {
      resetPartnerState();
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    return () => {
      window.removeEventListener(
        AUTH_SESSION_CLEARED_EVENT,
        handleSessionCleared
      );
    };
  }, [resetPartnerState]);

  const value = useMemo(
    () => ({
      partners,
      partnersLoading,
      partnersLoaded,
      partnerId,
      setPartnerId,
      hasPartnerSelected: Boolean(partnerId),
      fetchPartners,
    }),
    [
      partners,
      partnersLoading,
      partnersLoaded,
      partnerId,
      setPartnerId,
      fetchPartners,
    ]
  );

  return (
    <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>
  );
}

export function usePartner() {
  const context = useContext(PartnerContext);

  if (!context) {
    throw new Error("usePartner must be used within PartnerProvider");
  }

  return context;
}
