import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { useAuth } from "@/core/hooks/useAuth";
import { USERS_NAMESPACE } from "@/i18n/namespaces";
import UsersTableSection from "../components/UsersTableSection";
import RolesPermissionsSection from "@/modules/RolePermissions/components/RolesPermissionsSection";
import AddUserModal from "../components/AddUserModal";
import "../UsersPage.css";

export default function UsersPage() {
  const { t } = useTranslation(USERS_NAMESPACE);
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [usersRefreshToken, setUsersRefreshToken] = useState(0);

  const showCreateButton =
    activeTab === "roles" || (activeTab === "users" && !isSuperAdmin);

  return (
    <PageWrapper>
      <div className="users-page">
      <div className="users-page-top">
        <div>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>

        <div className="users-page-actions">
          {activeTab === "roles" && (
            <button className="users-ghost-btn" type="button">
              <Download size={16} />
              <span>{t("buttons.download")}</span>
            </button>
          )}

          {showCreateButton && (
            <button
              className="users-primary-btn"
              type="button"
              onClick={() => {
                if (activeTab === "users") {
                  setIsAddUserOpen(true);
                }
              }}
            >
              <Plus size={16} />
              <span>
                {activeTab === "users"
                  ? t("buttons.addUser")
                  : t("buttons.addRole")}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="users-page-tabs">
        <button
          type="button"
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          {t("tabs.users")}
        </button>

        <button
          type="button"
          className={activeTab === "roles" ? "active" : ""}
          onClick={() => setActiveTab("roles")}
        >
          {t("tabs.roles")}
        </button>
      </div>

      <div className="users-page-content">
        {activeTab === "users" ? (
          <UsersTableSection refreshToken={usersRefreshToken} />
        ) : (
          <RolesPermissionsSection />
        )}
      </div>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onRefresh={() => setUsersRefreshToken((value) => value + 1)}
      />
      </div>
    </PageWrapper>
  );
}
