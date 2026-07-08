export const API_ORIGIN = "https://dev-api.mtechdynamics.uz";

export const getAttachmentUrl = (attachment) => {
  if (!attachment) return null;

  // If we got just a number/string id, no URL can be built
  if (typeof attachment === "number" || typeof attachment === "string") {
    if (
      typeof attachment === "string" &&
      (attachment.startsWith("http://") ||
        attachment.startsWith("https://") ||
        attachment.startsWith("/"))
    ) {
      return attachment.startsWith("/")
        ? `${API_ORIGIN}${attachment}`
        : attachment;
    }
    return null;
  }

  const rawPath =
    attachment.url ||
    attachment.path ||
    attachment.filePath ||
    attachment.downloadUrl ||
    attachment.fileUrl ||
    attachment.fullPath ||
    "";

  if (!rawPath) return null;

  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }

  if (rawPath.startsWith("/")) {
    return `${API_ORIGIN}${rawPath}`;
  }

  return `${API_ORIGIN}/${rawPath}`;
};

/**
 * Backend has been observed to return attachment upload responses in many
 * shapes. We try to be lenient and extract { id, name, path } regardless.
 */
export const normalizeAttachmentResponse = (res) => {
  // Raw body can be in res.data (axios) or res itself
  const body = res?.data ?? res;

  // Some APIs nest the actual payload under `data`
  const inner =
    body && typeof body === "object" && body.data !== undefined
      ? body.data
      : body;

  // Case 1: payload is just a number or numeric string → that's the id
  if (typeof inner === "number") {
    return { id: inner, name: "", path: "" };
  }
  if (typeof inner === "string") {
    const asNum = Number(inner);
    if (!Number.isNaN(asNum) && inner.trim() !== "") {
      return { id: asNum, name: "", path: "" };
    }
    return { id: null, name: "", path: inner };
  }

  // Case 2: payload is an object
  const obj = inner && typeof inner === "object" ? inner : {};

  const id =
    obj.id ??
    obj.attachmentId ??
    obj.fileId ??
    body?.id ??
    body?.attachmentId ??
    null;

  const name = obj.name || obj.fileName || obj.originalName || "";

  const path =
    obj.path ||
    obj.url ||
    obj.filePath ||
    obj.downloadUrl ||
    obj.fileUrl ||
    obj.fullPath ||
    "";

  return {
    id: id != null ? id : null,
    name,
    path,
  };
};
