# Adding a new language

This guide walks developers through the process of adding a new language to the BookLogr project.

:::tip
If you are a translator and would like to contribute a new language to the project. Reach by opening an [issue](https://github.com/mozzo1000/booklogr) and requesting a new language to be added.
:::

:::warning
Always use `en.json` as the base translation file when adding a new language. This ensures consistency in the translation keys across all languages.
:::
---

## 1. Create the language file
Add a new language folder in `web/src/locales` using the language code (e.g. `fr` for French) and copy the English translation as the base:

```bash
mkdir -p web/src/locales/fr
cp web/src/locales/en/en.json web/src/locales/fr/fr.json
```

## 2. Update `i18n.jsx`
1. Open the file `web/src/i18n.jsx` and import the new language translation file.
2. Add it to the `resources` object so it is included in the `react-i18next` configuration.

For example, if you're adding French (`fr`):

```jsx
import en from "./locales/en/en.json";
import sv from "./locales/sv/sv.json";
import fr from "./locales/fr/fr.json";

const resources = {
  en: { translation: en },
  sv: { translation: sv },
  fr: { translation: fr }
};
```

## 3. Update the Language Switcher Component
To make the new language selectable in the web interface, 
open the file `web/src/components/LanguageSwitcher.jsx`  and add a new object to the `languages` array. 

For example, to add French (`fr`):
```jsx
const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" }
];
```
- `code`: Must match the language code used in `i18n.jsx`.
- `label`: Display name shown in the dropdown menu.
- `flag`: Emoji for the country's flag.

🎉 You can now edit the new language file in `web/src/locales`.