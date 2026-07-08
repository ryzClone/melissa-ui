export const LANGUAGE_STORAGE_KEY = "language";
export const DEFAULT_LANGUAGE = "en";
export const SUPPORTED_LANGUAGES = ["en", "ru", "uz"];

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English (EN)" },
  { code: "ru", label: "Русский (RU)" },
  { code: "uz", label: "O'zbek (UZ)" },
];

export function normalizeLanguageCode(language) {
  const code = String(language || "")
    .split("-")[0]
    .toLowerCase();

  return SUPPORTED_LANGUAGES.includes(code) ? code : DEFAULT_LANGUAGE;
}

export function getStoredLanguage() {
  try {
    return normalizeLanguageCode(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function setStoredLanguage(language) {
  const normalized = normalizeLanguageCode(language);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  return normalized;
}

export function getAcceptLanguageHeader() {
  return getStoredLanguage();
}
