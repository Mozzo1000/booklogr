import { Dropdown, DropdownItem } from 'flowbite-react'; 
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const languages = [
        {code: "en", label: "English", flag: "🇬🇧"},
        {code: "sv", label: "Svenska", flag: "🇸🇪"}
    ]

    const currentLang = languages.find(lang => lang.code === i18n.language)?.flag || '🌐';

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    }

    return (
        <Dropdown label={currentLang} inline>
            {languages.map(({ code, label, flag }) => (
                <DropdownItem key={code} onClick={() => changeLanguage(code)}>
                    {flag} {label}
                </DropdownItem>
            ))}
        </Dropdown>
    )
}

export default LanguageSwitcher