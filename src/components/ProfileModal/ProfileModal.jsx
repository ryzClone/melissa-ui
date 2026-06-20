import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import { attachmentApi } from "@/api/modules/attachmentApi";
import {
  getProfileDisplayName,
  getProfileInitials,
  getStoredUserRole,
  resolveProfileImageUrl,
  useProfile,
} from "@/context/ProfileContext";
import {
  getAttachmentUrl,
  normalizeAttachmentResponse,
} from "@/modules/products/attachmentUtils";
import "./ProfileModal.css";

const GENDER_OPTIONS = [
  { label: "Erkak", value: "MALE" },
  { label: "Ayol", value: "FEMALE" },
];

const emptyForm = {
  name: "",
  surname: "",
  genderType: "",
  attachmentId: 0,
};

export default function ProfileModal() {
  const { success } = useGlobalNotification();
  const {
    profile,
    isModalOpen,
    closeProfileModal,
    updateProfile,
  } = useProfile();

  const [form, setForm] = useState(emptyForm);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const fileInputRef = useRef(null);

  const displayName = useMemo(
    () =>
      `${form.name || ""} ${form.surname || ""}`.trim() ||
      getProfileDisplayName(profile),
    [form.name, form.surname, profile]
  );

  const avatarInitials = useMemo(
    () =>
      getProfileInitials({
        name: form.name || profile?.name,
        surname: form.surname || profile?.surname,
      }),
    [form.name, form.surname, profile]
  );

  const userRole = useMemo(() => getStoredUserRole(), [profile]);

  useEffect(() => {
    if (!isModalOpen || !profile) return;

    setForm({
      name: profile.name || "",
      surname: profile.surname || "",
      genderType: profile.genderType || "",
      attachmentId:
        profile.attachmentId != null ? Number(profile.attachmentId) : 0,
    });
    setPhoneNumber(profile.phoneNumber || "");
    setAvatarPreview(resolveProfileImageUrl(profile.imageUrl));
    setError("");
    setFieldErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isModalOpen, profile]);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (event) => {
      if (event.key === "Escape" && !saving && !uploadingAvatar) {
        closeProfileModal();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen, saving, uploadingAvatar, closeProfileModal]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllar yuklash mumkin");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);

    try {
      setUploadingAvatar(true);
      setError("");

      setAvatarPreview(localPreviewUrl);

      const response = await attachmentApi.upload(file);
      const uploadedAttachment = normalizeAttachmentResponse(response);

      if (!uploadedAttachment.id) {
        setError("Rasm yuklandi, lekin attachment ID qaytarmadi");
        setForm((prev) => ({ ...prev, attachmentId: 0 }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        attachmentId: Number(uploadedAttachment.id),
      }));

      const backendPreview = getAttachmentUrl(uploadedAttachment);
      setAvatarPreview(backendPreview || localPreviewUrl);
    } catch (uploadError) {
      console.error(uploadError);
      setError("Rasm yuklashda xatolik");
      setAvatarPreview(resolveProfileImageUrl(profile?.imageUrl));
      setForm((prev) => ({
        ...prev,
        attachmentId:
          profile?.attachmentId != null ? Number(profile.attachmentId) : 0,
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setForm((prev) => ({ ...prev, attachmentId: null }));
    setAvatarPreview(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Ism majburiy";
    if (!form.surname.trim()) nextErrors.surname = "Familiya majburiy";
    if (!form.genderType) nextErrors.genderType = "Jins majburiy";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        surname: form.surname.trim(),
        genderType: form.genderType,
        attachmentId:
          form.attachmentId == null ? 0 : Number(form.attachmentId) || 0,
      };

      await updateProfile(payload);

      success("Muvaffaqiyatli saqlandi");
      closeProfileModal();
    } catch (saveError) {
      console.error(saveError);
      setError(
        saveError?.response?.data?.errorMessage ||
          saveError?.response?.data?.message ||
          "Profilni saqlashda xatolik"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="profile-modal-overlay"
      onClick={() => {
        if (!saving && !uploadingAvatar) closeProfileModal();
      }}
    >
      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-header">
          <div>
            <div className="profile-modal-kicker">Profil</div>
            <h2 id="profile-modal-title">Profil ma&apos;lumotlari</h2>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={closeProfileModal}
            disabled={saving || uploadingAvatar}
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        <div className="profile-modal-body">
          <div className="profile-modal-hero">
            <div className="profile-modal-hero-avatar">
              {avatarPreview ? (
                <img src={avatarPreview} alt={displayName} />
              ) : (
                <span>{avatarInitials}</span>
              )}
            </div>

            <div className="profile-modal-hero-info">
              <h3>{displayName}</h3>
              <p>{userRole}</p>
            </div>
          </div>

          <div className="profile-modal-avatar-block">
            <div className="profile-modal-avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt={displayName} />
              ) : (
                <span>{avatarInitials}</span>
              )}
            </div>

            <div className="profile-modal-avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="profile-modal-file-input"
                onChange={handleAvatarUpload}
              />

              <button
                type="button"
                className="profile-modal-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar || saving}
              >
                {uploadingAvatar ? "Yuklanmoqda..." : "Rasm tanlash"}
              </button>

              <button
                type="button"
                className="profile-modal-remove-btn"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar || saving}
              >
                O&apos;chirish
              </button>
            </div>
          </div>

          {error && <div className="profile-modal-form-error">{error}</div>}

          <div className="profile-modal-form-grid">
            <div
              className={`profile-modal-form-group ${
                fieldErrors.name ? "has-error" : ""
              }`}
            >
              <label htmlFor="profile-name">Ism</label>
              <input
                id="profile-name"
                type="text"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Ismingiz"
                disabled={saving || uploadingAvatar}
              />
              {fieldErrors.name && (
                <span className="profile-modal-field-error">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div
              className={`profile-modal-form-group ${
                fieldErrors.surname ? "has-error" : ""
              }`}
            >
              <label htmlFor="profile-surname">Familiya</label>
              <input
                id="profile-surname"
                type="text"
                value={form.surname}
                onChange={(event) =>
                  handleChange("surname", event.target.value)
                }
                placeholder="Familiyangiz"
                disabled={saving || uploadingAvatar}
              />
              {fieldErrors.surname && (
                <span className="profile-modal-field-error">
                  {fieldErrors.surname}
                </span>
              )}
            </div>

            <div
              className={`profile-modal-form-group profile-modal-form-full ${
                fieldErrors.genderType ? "has-error" : ""
              }`}
            >
              <label htmlFor="profile-gender">Jins</label>
              <CustomDropdown
                value={form.genderType}
                onChange={(nextValue) => handleChange("genderType", nextValue)}
                options={GENDER_OPTIONS}
                placeholder="Jinsni tanlang"
                disabled={saving || uploadingAvatar}
              />
              {fieldErrors.genderType && (
                <span className="profile-modal-field-error">
                  {fieldErrors.genderType}
                </span>
              )}
            </div>

            <div className="profile-modal-form-group profile-modal-form-full">
              <label htmlFor="profile-phone">Telefon raqam</label>
              <input
                id="profile-phone"
                type="text"
                value={phoneNumber}
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button
            type="button"
            className="profile-modal-cancel-btn"
            onClick={closeProfileModal}
            disabled={saving || uploadingAvatar}
          >
            Bekor qilish
          </button>

          <button
            type="button"
            className="profile-modal-save-btn"
            onClick={handleSave}
            disabled={saving || uploadingAvatar}
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
