import { useState } from "react";
import { Plus, Download } from "lucide-react";
import UsersTableSection from "../components/UsersTableSection";
import RolesPermissionsSection from "../components/RolesPermissionsSection";
import AddUserModal from "../components/AddUserModal";
import "../UsersPage.css";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  return (
    <div className="users-page">
      <div className="users-page-top">
        <div>
          <h1>Foydalanuvchilar</h1>
          <p>Foydalanuvchilar va ruxsatlarni boshqarish</p>
        </div>

        <div className="users-page-actions">
          {activeTab === "roles" && (
            <button className="users-ghost-btn" type="button">
              <Download size={16} />
              <span>Yuklab olish</span>
            </button>
          )}

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
              {activeTab === "users" ? "Yangi foydalanuvchi" : "Yangi rol"}
            </span>
          </button>
        </div>
      </div>

      <div className="users-page-tabs">
        <button
          type="button"
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Foydalanuvchilar
        </button>

        <button
          type="button"
          className={activeTab === "roles" ? "active" : ""}
          onClick={() => setActiveTab("roles")}
        >
          Rollar va ruxsatlar
        </button>
      </div>

      <div className="users-page-content">
        {activeTab === "users" ? (
          <UsersTableSection />
        ) : (
          <RolesPermissionsSection />
        )}
      </div>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
      />
    </div>
  );
}