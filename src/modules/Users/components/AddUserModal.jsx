import { useEffect, useRef, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import { useScopedPartnerParams, PARTNER_SELECT_MESSAGE } from "@/hooks/useScopedPartnerParams";
import { useSuperAdminOrganizationBranches } from "@/hooks/useSuperAdminOrganizationBranches";
import { useUsersApi } from "@/hooks/useUsersApi";
import { useAuth } from "@/core/hooks/useAuth";
import { usePartner } from "@/context/PartnerContext";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { performLogout } from "@/utils/performLogout";
import { redirectToLogin } from "@/utils/authSession";
import "./AddUserModal.css";
import { organizationRoleApi } from "../../../api/modules/organizationRoleApi";

const formatUzPhone = (value) => {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }

  digits = digits.slice(0, 9);

  let result = "+998";

  if (digits.length > 0) result += " " + digits.slice(0, 2);
  if (digits.length > 2) result += " " + digits.slice(2, 5);
  if (digits.length > 5) result += " " + digits.slice(5, 7);
  if (digits.length > 7) result += " " + digits.slice(7, 9);

  return result;
};

const initialForm = {
  username: "",
  password: "",
  name: "",
  surname: "",
  phoneNumber: "+998",
  roleIds: [],
  branchId: "",
  attachmentId: null,
};

export default function AddUserModal({ isOpen, onClose, onRefresh }) {
  const { success } = useGlobalNotification();
  const { isSuperAdmin } = useAuth();
  const { partnerId } = usePartner();
  const usersApi = useUsersApi();
  const { canFetch, getParams, getOrganizationParams } = useScopedPartnerParams();
  const { branches, branchesLoading } = useSuperAdminOrganizationBranches();
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadRoles = async () => {
      if (!canFetch) {
        setRoleOptions([]);
        return;
      }

      try {
        setRolesLoading(true);
        setRolesError("");

        const roleScopeParams = isSuperAdmin
          ? getOrganizationParams()
          : getParams();

        const res = await organizationRoleApi.getList({
          page: 0,
          size: 100,
          sort: ["id,desc"],
          ...roleScopeParams,
        });
        const payload = res?.data || res;
        const list =
          payload?.data?.content ||
          payload?.content ||
          payload?.data ||
          payload ||
          [];

        if (cancelled) return;

        setRoleOptions(
          (Array.isArray(list) ? list : []).map((role) => ({
            id: role.id,
            roleId: role.roleId,
            name: role.roleName || role.name || `Role #${role.id}`,
          }))
        );
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setRolesError(err?.message || "Rollarni yuklashda xatolik");
        setRoleOptions([]);
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    };

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    canFetch,
    getParams,
    getOrganizationParams,
    isSuperAdmin,
    partnerId,
  ]);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setError("");
      setAvatarPreview(null);
      setRoleDropdownOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isSuperAdmin) return;
    setFormData((prev) => ({ ...prev, branchId: "" }));
  }, [isOpen, isSuperAdmin, partnerId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading && !uploadingAvatar) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, loading, uploadingAvatar]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
    };

    if (roleDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roleDropdownOpen]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (error) setError("");
  };

  const handlePhoneChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumber: formatUzPhone(e.target.value),
    }));

    if (error) setError("");
  };

  const getPayloadPhoneNumber = () => {
    let digits = formData.phoneNumber.replace(/\D/g, "");

    if (digits.startsWith("998")) {
      digits = digits.slice(3);
    }

    return digits.slice(0, 9);
  };

  const handleClose = () => {
    if (loading || uploadingAvatar) return;
    onClose();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllar yuklash mumkin");
      setFormData((prev) => ({
        ...prev,
        attachmentId: null,
      }));
      setAvatarPreview(null);
      return;
    }
  
    try {
      setUploadingAvatar(true);
      setError("");
  
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
  
      const res = await fetch("https://api.mtechdynamics.uz/api/attachments/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || localStorage.getItem("accessToken")}`,
        },
        body: uploadFormData,
      });
  
      if (res.status === 401) {
        setError("Token vaqti tugadi");
        performLogout();
        redirectToLogin();
        return;
      }
  
      if (!res.ok) {
        throw new Error("Upload failed");
      }
  
      const json = await res.json();
      const data = json?.data || json;
  
      const attachmentId = data?.id || data?.attachmentId;
  
      if (!attachmentId) {
        throw new Error("Attachment ID yo‘q");
      }
  
      setFormData((prev) => ({
        ...prev,
        attachmentId: Number(attachmentId),
      }));
  
      setAvatarPreview(data?.url || URL.createObjectURL(file));
    } catch (err) {
      console.error(err);
  
      setError("Rasm yuklashda xatolik");
  
      setFormData((prev) => ({
        ...prev,
        attachmentId: null,
      }));
  
      setAvatarPreview(null);
  
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);

    setFormData((prev) => ({
      ...prev,
      attachmentId: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (error) setError("");
  };

  const handleSelectAvatarClick = () => {
    if (!loading && !uploadingAvatar) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canFetch) {
      setError(PARTNER_SELECT_MESSAGE);
      return;
    }

    if (!formData.username.trim()) {
      setError("Username kiriting");
      return;
    }

    if (!formData.password.trim()) {
      setError("Parol kiriting");
      return;
    }

    if (!formData.name.trim()) {
      setError("Ism kiriting");
      return;
    }

    if (!formData.surname.trim()) {
      setError("Familiya kiriting");
      return;
    }

    const phoneForPayload = getPayloadPhoneNumber();

    if (phoneForPayload.length !== 9) {
      setError("Telefon raqamni to‘liq kiriting");
      return;
    }

    if (!formData.roleIds.length) {
      setError("Rol tanlang");
      return;
    }

    if (isSuperAdmin && !formData.branchId) {
      setError("Filial tanlang");
      return;
    }

    const payload = {
      username: formData.username.trim(),
      password: formData.password.trim(),
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      phoneNumber: phoneForPayload,
      roleIds: formData.roleIds.map(Number),
      attachmentId:
        formData.attachmentId !== null && formData.attachmentId !== ""
          ? Number(formData.attachmentId)
          : null,
    };

    if (isSuperAdmin && formData.branchId) {
      payload.branchId = Number(formData.branchId);
    }

    // Agar backend null ni ham qabul qilmasa, yuqoridagi attachmentId ni olib tashlab,
    // shuni ishlating:
    // if (payload.attachmentId === null) delete payload.attachmentId;

    try {
      setLoading(true);
      setError("");

      await usersApi.create(payload, getParams());

      success("Muvaffaqiyatli yaratildi");
      setFormData(initialForm);
      setAvatarPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (typeof onRefresh === "function") {
        await onRefresh();
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roleOptions.find(
    (role) => role.id === formData.roleIds[0]
  );

  const isBusy = loading || uploadingAvatar;

  return (
    <div className="users-modal-overlay" onClick={handleClose}>
      <div className="users-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="users-modal-close"
          type="button"
          onClick={handleClose}
          disabled={isBusy}
        >
          <X size={18} />
        </button>

        <div className="users-modal-header">
          <h2>Yangi foydalanuvchi</h2>
          <p>Tizimga yangi foydalanuvchi qo‘shing</p>
        </div>

        <form className="users-modal-form" onSubmit={handleSubmit}>
          {error && <div className="users-form-error">{error}</div>}

          <div className="users-form-grid two">
            <div className="users-form-group">
              <label>Username *</label>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={isBusy}
                required
              />
            </div>

            <div className="users-form-group">
              <label>Parol *</label>
              <input
                type="password"
                placeholder="Parol"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={isBusy}
                required
              />
            </div>
          </div>

          <div className="users-form-grid two">
            <div className="users-form-group">
              <label>Ism *</label>
              <input
                type="text"
                placeholder="Ism"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isBusy}
                required
              />
            </div>

            <div className="users-form-group">
              <label>Familiya *</label>
              <input
                type="text"
                placeholder="Familiya"
                value={formData.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
                disabled={isBusy}
                required
              />
            </div>
          </div>

          <div className="users-form-grid two">
            <div className="users-form-group">
              <label>Telefon raqam *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="+998 99 123 45 67"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                disabled={isBusy}
                required
                maxLength={17}
              />
            </div>

            <div className="users-form-group">
              <label>Rol *</label>

              <div className="users-custom-select" ref={dropdownRef}>
                <button
                  type="button"
                  className={`users-custom-select-trigger${
                    roleDropdownOpen ? " open" : ""
                  }`}
                  onClick={() => setRoleDropdownOpen((prev) => !prev)}
                  disabled={isBusy || rolesLoading}
                >
                  <span>
                    {rolesLoading
                      ? "Loading..."
                      : selectedRole?.name || "Rol tanlang"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {roleDropdownOpen && (
                  <div className="users-custom-select-menu">
                    {rolesLoading && (
                      <div className="users-custom-select-option" aria-disabled>
                        Loading...
                      </div>
                    )}

                    {!rolesLoading && roleOptions.length === 0 && (
                      <div className="users-custom-select-option" aria-disabled>
                        Roles not found
                      </div>
                    )}

                    {!rolesLoading &&
                      roleOptions.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          className={`users-custom-select-option${
                            formData.roleIds[0] === role.id ? " active" : ""
                          }`}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              roleIds: [role.id],
                            }));
                            setRoleDropdownOpen(false);
                            if (error) setError("");
                          }}
                        >
                          {role.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {rolesError && (
                <div className="users-form-error" style={{ marginTop: 6 }}>
                  {rolesError}
                </div>
              )}
            </div>
          </div>

          {isSuperAdmin && (
            <div className="users-form-grid one">
              <div className="users-form-group">
                <label>Filial *</label>
                <CustomDropdown
                  value={formData.branchId}
                  onChange={(value) => handleChange("branchId", value)}
                  disabled={isBusy || branchesLoading || !canFetch}
                  placeholder={
                    !canFetch
                      ? "Avval partner tanlang"
                      : branchesLoading
                        ? "Yuklanmoqda..."
                        : branches.length === 0
                          ? "Filiallar topilmadi"
                          : "Filial tanlang"
                  }
                  options={branches.map((branch) => ({
                    label: branch.name || branch.title || "Filial",
                    value: String(branch.id),
                  }))}
                  menuPortal
                />
              </div>
            </div>
          )}

          <div className="users-form-grid one">
            <div className="users-form-group">
              <label>Profil rasmi</label>

              <div className="users-avatar-upload-card">
                <div className="users-avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <div className="users-avatar-placeholder">
                      <span>Rasm yo‘q</span>
                    </div>
                  )}
                </div>

                <div className="users-avatar-info">
                  <h4>Profil rasmi</h4>
                  <p>
                    PNG, JPG yoki WEBP formatda rasm yuklang. Yuklanmasa
                    attachmentId null bo‘lib ketadi.
                  </p>

                  <div className="users-avatar-actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleAvatarUpload}
                      disabled={isBusy}
                    />

                    <button
                      type="button"
                      className="users-avatar-upload-btn"
                      onClick={handleSelectAvatarClick}
                      disabled={isBusy}
                    >
                      {uploadingAvatar
                        ? "Yuklanmoqda..."
                        : avatarPreview
                        ? "Rasmni almashtirish"
                        : "Rasm tanlash"}
                    </button>

                    {avatarPreview && (
                      <button
                        type="button"
                        className="users-avatar-remove-btn"
                        onClick={handleRemoveAvatar}
                        disabled={isBusy}
                      >
                        O‘chirish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="users-modal-footer">
            <button
              type="button"
              className="users-cancel-btn"
              onClick={handleClose}
              disabled={isBusy}
            >
              Bekor qilish
            </button>

            <button type="submit" className="users-submit-btn" disabled={isBusy}>
              {loading ? "Yaratilmoqda..." : "Foydalanuvchi yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}