# Translating BookLogr

BookLogr supports localization to make the application accessible to everyone. We use Crowdin to manage our translations collaboratively, which is our preferred method for contributions. However, we also still support manual translation edits directly in the source repository.

---

## How to Translate

### Using Crowdin
The easiest way to contribute translations is through our Crowdin project. You don't need to touch any code or use Git.
* Standard Translation: Visit the [BookLogr Crowdin Project](https://crowdin.com/project/booklogr), select your target language, and start translating strings directly.
* In-Context Translation (Live Preview): You can also translate strings directly inside the running application interface by visiting [https://translate-live.booklogr.app](https://translate-live.booklogr.app). This allows you to see exactly where and how your translations will appear in context.

### Manual Translation
If you prefer to manage translations locally via Git, language files are located in `web/src/locales`. Each language has its own subfolder named after its respective locale code, made up of an ISO 639-1 language code and an ISO 3166-1 country code (e.g., `en-GB` for English (UK), `sv-SE` for Swedish). Inside, you’ll find a `.json` file containing the translation keys and values.

1. **Locate the Language File**
   - Navigate to `web/src/locales/<locale_code>/<locale_code>.json`
   - For example, English is stored at: `web/src/locales/en-GB/en-GB.json`
2. **Edit the File**
   - Each entry is structured as a key-value pair.
   - **Translate only the value**, not the key.

#### Example: Original English
```json
{
    "reading_status": {
    "read": "Read",
    "currently_reading": "Currently reading",
    "to_be_read": "To be read"
    }
}
```

#### Example: Translated to Swedish
```json
{
  "reading_status": {
    "read": "Läst",
    "currently_reading": "Läser just nu",
    "to_be_read": "Att läsa"
  }
}
```
:::warning
Do **not** change the keys. These are used internally by the application and should not be modified or translated.
:::

To finish your translation contribution, the last thing you should do is commit your changes and open a pull request on the [project's GitHub page](https://github.com/Mozzo1000/booklogr) so they can be merged into the project. That way, your work becomes part of the app’s official language support.

---

## Adding a New Language

This guide walks developers through the process of adding a new language to the BookLogr project.

:::tip
If you are a translator and a language you want to work on is missing, the best way to get it added is to open an [issue](https://github.com/Mozzo1000/booklogr) requesting the new language so we can enable it on Crowdin.
:::

:::warning
Always use `en-GB.json` as the base translation file when adding a new language. This ensures consistency in the translation keys across all languages.
:::
---

### 1. Create the language file
Add a new language folder in `web/src/locales` using its locale code (language + country, e.g., `fr-FR` for French) and copy the English translation as the base:

```bash
mkdir -p web/src/locales/fr-FR
cp web/src/locales/en-GB/en-GB.json web/src/locales/fr-FR/fr-FR.json
```

### 2. Update the Language Switcher Component
To make the new language selectable in the web interface, 
open the file `web/src/components/LanguageSwitcher.jsx` and add a new object to the `LANGUAGES` array. 

For example, to add French (`fr-FR`):
```jsx
const LANGUAGES = [
  { code: "en-GB", label: "English", flag: "🇬🇧" },
  { code: "sv-SE", label: "Svenska", flag: "🇸🇪" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" }
];
```
- `code`: Must match the locale code used for the folder/file in `web/src/locales`.
- `label`: Display name shown in the dropdown menu.
- `flag`: Emoji for the country's flag.

🎉 You can now edit the new language file in `web/src/locales`.
