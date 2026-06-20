function decodeJwtPart(part) {
  if (!part || typeof part !== "string") return null;

  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function decodeJwtToken(token) {
  if (!token || typeof token !== "string") return null;

  const [headerPart, payloadPart, signaturePart] = token.split(".");

  return {
    header: decodeJwtPart(headerPart),
    payload: decodeJwtPart(payloadPart),
    hasSignature: Boolean(signaturePart),
  };
}

export function logAuthTokenDebug(token, context = "Auth") {
  if (!import.meta.env.DEV || !token) return;

  const decoded = decodeJwtToken(token);

  console.group(`[${context}] JWT token`);
  console.log("Raw token:", token);
  console.log("Header:", decoded?.header ?? "decode qilib bo'lmadi");
  console.log("Payload:", decoded?.payload ?? "decode qilib bo'lmadi");

  if (decoded?.payload && typeof decoded.payload === "object") {
    console.table(decoded.payload);
  }

  console.groupEnd();
}
