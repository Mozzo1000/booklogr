import { Dropdown, DropdownItem } from "flowbite-react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher({ fullSize }) {
  const { i18n } = useTranslation();
  const languages = [
    { code: "en-GB", label: "English", flag: "🇬🇧" },
    { code: "sv-SE", label: "Svenska", flag: "🇸🇪" },
    { code: "ar-SA", label: "عربي", flag: "🇸🇦" },
    { code: "zh-CN", label: "中文", flag: "🇨🇳" },
    { code: "de-DE", label: "Deutsch", flag: "🇩🇪" },
    { code: "hi-IN", label: "हिंदी", flag: "🇮🇳" },
    { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  ];

const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];

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
      {languages.map(({ code, label, flag }) => (
        <DropdownItem key={code} onClick={() => changeLanguage(code)}>
          {flag} {label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

export default LanguageSwitcher;
