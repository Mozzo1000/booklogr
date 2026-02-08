# utils
This folder contains utility script files that are meant to aid in the development of `booklogr`

## **compare-locale.sh — JSON Localization Key Checker**
This script scans a nested folder structure for JSON localization files, extracts all keys recursively, compares them across all files, and reports which keys are missing in each file.  
It helps keep localization files consistent across languages and prevents missing translations from slipping through.
The script does **not** modify any files; it only reports differences.

---

## **Requirements**

- **bash**
- **jq** (command‑line JSON processor)

Install `jq` if needed:

```bash
sudo apt install jq
```

---

## **Usage**

```bash
./compare-locale.sh <path-to-locales>
```

If no path is provided, the script defaults to the current directory.

---

## **Example Output**

```
user@computer:~/Code/booklogr$ ./utils/compare-locale.sh web/src/locales/
Found 4 JSON files.

Total unique keys across all files: 189

Checking: web/src/locales/ar/ar.json
  Missing keys:
    - book.isbn
    - book.cover
    - actions.replace_cover

Checking: web/src/locales/en/en.json
  OK — no missing keys

Checking: web/src/locales/sv/sv.json
  Missing keys:
    - book.missing_info.total_pages_placeholder
    - book.missing_info.title
    - book.isbn
    - book.cover
    - actions.replace_cover
    - book.missing_info.author_placeholder
    - book.unknown_author
    - forms.skip
    - book.missing_info.description

Checking: web/src/locales/zh-CN/zh-CN.json
  Missing keys:
    - book.isbn
    - book.cover
    - actions.replace_cover
```

---