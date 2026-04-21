import i18n from "@/core/i18n/i18n";

export default function LanguageSwitcher() {
  return (
    <div>
      <button onClick={() => i18n.changeLanguage("uz")}>UZ</button>
      <button onClick={() => i18n.changeLanguage("ru")}>RU</button>
    </div>
  );
}
