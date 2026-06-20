import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/core/hooks/useAuth";
import { AUTH_SESSION_CLEARED_EVENT } from "@/utils/authSession";
import { profileApi, extractProfileData } from "@/api/modules/profileApi";
import ProfileModal from "@/components/ProfileModal/ProfileModal";

const API_ORIGIN = "https://dev-api.mtechdynamics.uz";

export const ProfileContext = createContext(null);

export function resolveProfileImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  const trimmed = imageUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return trimmed.startsWith("/")
    ? `${API_ORIGIN}${trimmed}`
    : `${API_ORIGIN}/${trimmed}`;
}

export function getProfileInitials(profile) {
  const first = profile?.name?.[0] || "";
  const last = profile?.surname?.[0] || "";
  const initials = `${first}${last}`.toUpperCase();

  if (initials) return initials;

  try {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const username = savedUser?.username || "";
    return username.slice(0, 2).toUpperCase() || "U";
  } catch {
    return "U";
  }
}

export function getStoredUserRole() {
  try {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    return (
      savedUser?.role ||
      savedUser?.roleName ||
      savedUser?.roles?.[0]?.name ||
      "ADMINISTRATOR"
    );
  } catch {
    return "ADMINISTRATOR";
  }
}

export function getProfileDisplayName(profile) {
  const fullName = `${profile?.name || ""} ${profile?.surname || ""}`.trim();
  if (fullName) return fullName;

  try {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    return savedUser?.username || "Foydalanuvchi";
  } catch {
    return "Foydalanuvchi";
  }
}

export function ProfileProvider({ children }) {
  const { user, isSuperAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetProfileState = useCallback(() => {
    setProfile(null);
    setLoading(false);
    setIsModalOpen(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user || isSuperAdmin) {
      resetProfileState();
      return null;
    }

    try {
      setLoading(true);
      setProfile(null);
      const response = await profileApi.getMe();
      const data = extractProfileData(response);
      setProfile(data);
      return data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, resetProfileState]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const handleSessionCleared = () => {
      resetProfileState();
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    return () => {
      window.removeEventListener(
        AUTH_SESSION_CLEARED_EVENT,
        handleSessionCleared
      );
    };
  }, [resetProfileState]);

  const updateProfile = useCallback(
    async (payload) => {
      await profileApi.update(payload);
      return fetchProfile();
    },
    [fetchProfile]
  );

  const openProfileModal = useCallback(() => setIsModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsModalOpen(false), []);

  const value = useMemo(
    () => ({
      profile,
      loading,
      fetchProfile,
      updateProfile,
      isModalOpen,
      openProfileModal,
      closeProfileModal,
      displayName: isSuperAdmin
        ? user?.username || "Super Admin"
        : getProfileDisplayName(profile),
      userRole: isSuperAdmin ? "SUPER ADMIN" : getStoredUserRole(),
      avatarUrl: resolveProfileImageUrl(profile?.imageUrl),
      avatarInitials: getProfileInitials(profile),
      isSuperAdmin,
    }),
    [
      profile,
      loading,
      fetchProfile,
      updateProfile,
      isModalOpen,
      openProfileModal,
      closeProfileModal,
      isSuperAdmin,
      user,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
      {user && !isSuperAdmin ? <ProfileModal /> : null}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return context;
}
