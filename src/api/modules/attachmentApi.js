import apiClient from "../apiClient";

const UPLOAD_URL = "/catalog/api/v1/attachment/upload";

export const attachmentApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post(UPLOAD_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      meta: {
        skipSuccessNotification: true,
      },
    });
  },
};

export const extractAttachmentId = (res) =>
  res?.data?.data?.id ??
  res?.data?.id ??
  res?.data?.attachmentId ??
  res?.id ??
  res?.attachmentId ??
  null;
