import { useEffect, useRef, useState } from "react";
import { X, Camera, Plus, ChevronDown, Trash2 } from "lucide-react";
import "./AddUserModal.css";

export default function AddUserModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phoneCode: "+998",
    phone: "",
    email: "",
    password: "",
    role: "Admin",
    active: true,
    avatar: null,
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);

  const roles = ["Admin", "Moderator", "Operator", "Tahlilchi"];

  useEffect(() => {
    if (!isOpen) {
      setShowRoleDropdown(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Faqat rasm yuklash mumkin");
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      avatar: file,
    }));
    setAvatarPreview(previewUrl);

    // input reset qilinadi, shu rasmni qayta tanlash ham mumkin bo'ladi
    e.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setFormData((prev) => ({
      ...prev,
      avatar: null,
    }));
    setAvatarPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("firstName", formData.firstName);
    submitData.append("lastName", formData.lastName);
    submitData.append("username", formData.username);
    submitData.append("phoneCode", formData.phoneCode);
    submitData.append("phone", formData.phone);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("role", formData.role);
    submitData.append("active", formData.active);

    if (formData.avatar) {
      submitData.append("avatar", formData.avatar);
    }

    console.log("Yangi foydalanuvchi:", formData);
    onClose();
  };

  return (
    <div className="users-modal-overlay" onClick={onClose}>
      <div className="users-modal" onClick={(e) => e.stopPropagation()}>
        <button className="users-modal-close" type="button" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="users-modal-header">
          <h2>Yangi foydalanuvchi</h2>
          <p>Tizimga yangi foydalanuvchi qo‘shing</p>
        </div>

        <form className="users-modal-form" onSubmit={handleSubmit}>
          <div className="users-modal-avatar-wrap">
            <div className="users-modal-avatar">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="users-modal-avatar-img"
                />
              ) : (
                <Camera size={18} />
              )}
            </div>

            <button
              type="button"
              className="users-modal-avatar-add"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={12} />
            </button>

            {avatarPreview && (
              <button
                type="button"
                className="users-modal-avatar-remove"
                onClick={handleRemoveAvatar}
              >
                <Trash2 size={12} />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="users-form-section-title">Shaxsiy ma’lumotlar</div>

          <div className="users-form-grid two">
            <div className="users-form-group">
              <label>Ism *</label>
              <input
                type="text"
                placeholder="Kiriting"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>

            <div className="users-form-group">
              <label>Familiya *</label>
              <input
                type="text"
                placeholder="Kiriting"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="users-form-section-title">Kirish ma’lumotlar</div>

          <div className="users-form-grid one">
            <div className="users-form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="@ foydalanuvchi_nomi"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>
          </div>

          <div className="users-form-grid two">
            <div className="users-form-group">
              <label>Telefon</label>
              <div className="users-phone-input">
                <div className="users-phone-code">{formData.phoneCode}</div>
                <input
                  type="text"
                  placeholder="90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="users-form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="users-form-grid one">
            <div className="users-form-group">
              <div className="users-password-top">
                <label>Parol</label>
                <span>Kuchli</span>
              </div>

              <input
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <div className="users-password-line" />
            </div>
          </div>

          <div className="users-form-section-title">Rol va holat</div>

          <div className="users-form-grid two users-form-bottom-grid">
            <div className="users-form-group">
              <label>Rol</label>

              <div className="users-role-select-wrap">
                <button
                  type="button"
                  className="users-role-select"
                  onClick={() => setShowRoleDropdown((prev) => !prev)}
                >
                  <span>{formData.role}</span>
                  <ChevronDown size={16} />
                </button>

                {showRoleDropdown && (
                  <div className="users-role-dropdown">
                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        className={`users-role-option ${
                          formData.role === role ? "active" : ""
                        }`}
                        onClick={() => {
                          handleChange("role", role);
                          setShowRoleDropdown(false);
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="users-form-group">
              <label>Holat</label>

              <div className="users-status-toggle-row">
                <label className="users-status-switch">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleChange("active", e.target.checked)}
                  />
                  <span className="users-status-slider" />
                </label>

                <span className="users-status-text">
                  {formData.active ? "Faol" : "Nofaol"}
                </span>
              </div>
            </div>
          </div>

          <div className="users-modal-footer">
            <button type="button" className="users-cancel-btn" onClick={onClose}>
              Bekor qilish
            </button>

            <button type="submit" className="users-submit-btn">
              Foydalanuvchi yaratish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}