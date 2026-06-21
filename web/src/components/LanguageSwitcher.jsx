import { useMemo } from "react";
import { Dropdown, DropdownItem } from "flowbite-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en-GB", label: "English", flag: "🇬🇧" },
  { code: "sv-SE", label: "Svenska", flag: "🇸🇪" },
  { code: "ar-SA", label: "عربي", flag: "🇸🇦" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "de-DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "hi-IN", label: "हिंदी", flag: "🇮🇳" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "pt-PT", label: "Portuguese", flag: "🇵🇹" },
  { code: "ru-RU", label: "Russian", flag: "🇷🇺" },
];

const getSubtag = (code) => code.split("-")[0].toLowerCase();

function LanguageSwitcher({ fullSize }) {
  const { i18n } = useTranslation();

  const orderedLanguages = useMemo(() => {
    const sortedBase = [...LANGUAGES].sort((a, b) => {
      const subtagA = getSubtag(a.code);
      const subtagB = getSubtag(b.code);
      if (subtagA !== subtagB) {
        return subtagA.localeCompare(subtagB);
      }
      return a.code.localeCompare(b.code);
    });

    const userPrefLangs = typeof navigator !== "undefined"
      ? navigator.languages || (navigator.language ? [navigator.language] : [])
      : [];

    const raised = [];
    const remaining = [...sortedBase];

    userPrefLangs.forEach((pref) => {
      const prefSubtag = pref.split("-")[0].toLowerCase();

      const exactIndex = remaining.findIndex(
        (lang) => lang.code.toLowerCase() === pref.toLowerCase()
      );
      if (exactIndex !== -1) {
        raised.push(remaining[exactIndex]);
        remaining.splice(exactIndex, 1);
        return;
      }

      const subtagIndex = remaining.findIndex(
        (lang) => getSubtag(lang.code) === prefSubtag
      );
      if (subtagIndex !== -1) {
        raised.push(remaining[subtagIndex]);
        remaining.splice(subtagIndex, 1);
      }
    });

    return [...raised, ...remaining];
  }, []);

  const currentLang = orderedLanguages.find((lang) => lang.code === i18n.language) || orderedLanguages[0];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Dropdown
      label={fullSize ? `${currentLang.flag} ${currentLang.label}` : currentLang.flag}
      inline={!fullSize}
      color={"alternative"}
      className="max-h-48 overflow-y-auto"
    >
      {orderedLanguages.map(({ code, label, flag }) => (
        <DropdownItem key={code} onClick={() => changeLanguage(code)}>
          {flag} {label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

export default LanguageSwitcher;
