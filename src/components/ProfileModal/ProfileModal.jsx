import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Trash2, X } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { attachmentApi } from "@/api/modules/attachmentApi";
import {
  getProfileDisplayName,
  getProfileInitials,
  getStoredUserRole,
  resolveProfileImageUrl,
  useProfile,
} from "@/context/ProfileContext";
import { PROFILE_NAMESPACE } from "@/i18n/namespaces";
import {
  getAttachmentUrl,
  normalizeAttachmentResponse,
} from "@/modules/products/attachmentUtils";
import "./ProfileModal.css";

const GENDER_VALUES = ["MALE", "FEMALE"];

const emptyForm = {
  name: "",
  surname: "",
  genderType: "",
  attachmentId: 0,
};

export default function ProfileModal() {
  const { t } = useTranslation(PROFILE_NAMESPACE);
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

  const genderOptions = useMemo(
    () =>
      GENDER_VALUES.map((value) => ({
        value,
        label:
          value === "MALE" ? t("gender.male") : t("gender.female"),
      })),
    [t]
  );

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
      setError("validation.imageOnly");
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
        setError("validation.attachmentIdMissing");
        setForm((prev) => ({ ...prev, attachmentId: 0 }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        attachmentId: Number(uploadedAttachment.id),
      }));

      const backendPreview = getAttachmentUrl(uploadedAttachment);
      setAvatarPreview(backendPreview || localPreviewUrl);
    } catch {
      setError("validation.imageUploadError");
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

    if (!form.name.trim()) nextErrors.name = "validation.required";
    if (!form.surname.trim()) nextErrors.surname = "validation.required";
    if (!form.genderType) nextErrors.genderType = "validation.required";

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

      closeProfileModal();
    } catch {
      setError("toast.updateError");
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
          <div className="profile-modal-header-text">
            <p className="profile-modal-kicker">{t("kicker")}</p>
            <h2 id="profile-modal-title">{t("title")}</h2>
            <p className="profile-modal-subtitle">{t("subtitle")}</p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={closeProfileModal}
            disabled={saving || uploadingAvatar}
            aria-label={t("buttons.close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="profile-modal-body">
          <section className="profile-modal-avatar-section">
            <div className="profile-modal-avatar-ring">
              <div className="profile-modal-avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={displayName} />
                ) : (
                  <span>{avatarInitials}</span>
                )}
              </div>
            </div>

            <div className="profile-modal-avatar-meta">
              <h3>{displayName}</h3>
              <p>{userRole}</p>
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
                <Camera size={15} />
                {uploadingAvatar
                  ? t("states.loading")
                  : avatarPreview
                    ? t("buttons.changeImage")
                    : t("buttons.uploadImage")}
              </button>

              <button
                type="button"
                className="profile-modal-remove-btn"
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar || saving}
              >
                <Trash2 size={15} />
                {t("buttons.removeImage")}
              </button>
            </div>
          </section>

          {error && (
            <div className="profile-modal-form-error">{t(error)}</div>
          )}

          <div className="profile-modal-form-grid">
            <div
              className={`profile-modal-form-group ${
                fieldErrors.name ? "has-error" : ""
              }`}
            >
              <label htmlFor="profile-name">{t("form.name")}</label>
              <input
                id="profile-name"
                type="text"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder={t("placeholders.name")}
                disabled={saving || uploadingAvatar}
              />
              {fieldErrors.name && (
                <span className="profile-modal-field-error">
                  {t(fieldErrors.name)}
                </span>
              )}
            </div>

            <div
              className={`profile-modal-form-group ${
                fieldErrors.surname ? "has-error" : ""
              }`}
            >
              <label htmlFor="profile-surname">{t("form.surname")}</label>
              <input
                id="profile-surname"
                type="text"
                value={form.surname}
                onChange={(event) =>
                  handleChange("surname", event.target.value)
                }
                placeholder={t("placeholders.surname")}
                disabled={saving || uploadingAvatar}
              />
              {fieldErrors.surname && (
                <span className="profile-modal-field-error">
                  {t(fieldErrors.surname)}
                </span>
              )}
            </div>

            <div
              className={`profile-modal-form-group profile-modal-form-full ${
                fieldErrors.genderType ? "has-error" : ""
              }`}
            >
              <label htmlFor="profile-gender">{t("form.gender")}</label>
              <CustomDropdown
                className="profile-modal-dropdown"
                value={form.genderType}
                onChange={(nextValue) => handleChange("genderType", nextValue)}
                options={genderOptions}
                placeholder={t("placeholders.gender")}
                disabled={saving || uploadingAvatar}
              />
              {fieldErrors.genderType && (
                <span className="profile-modal-field-error">
                  {t(fieldErrors.genderType)}
                </span>
              )}
            </div>

            <div className="profile-modal-form-group profile-modal-form-full">
              <label htmlFor="profile-phone">{t("form.phoneNumber")}</label>
              <input
                id="profile-phone"
                type="text"
                value={phoneNumber}
                readOnly
                disabled
                className="profile-modal-input-disabled"
                placeholder={t("placeholders.phoneNumber")}
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
            {t("buttons.cancel")}
          </button>

          <button
            type="button"
            className="profile-modal-save-btn"
            onClick={handleSave}
            disabled={saving || uploadingAvatar}
          >
            {saving ? t("states.saving") : t("buttons.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
