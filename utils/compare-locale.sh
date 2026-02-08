#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${1:-.}"

# Find all JSON files
mapfile -t FILES < <(find "$ROOT_DIR" -type f -name "*.json" | sort)

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "No JSON files found."
    exit 1
fi

echo "Found ${#FILES[@]} JSON files."
echo

# Extract all keys from a JSON file (recursively)
extract_keys() {
    jq -r '
        paths(scalars) 
        | map(tostring) 
        | join(".")
    ' "$1" | sort -u
}

# Build a global set of all keys
declare -A GLOBAL_KEYS=()

for file in "${FILES[@]}"; do
    while IFS= read -r key; do
        GLOBAL_KEYS["$key"]=1
    done < <(extract_keys "$file")
done

echo "Total unique keys across all files: ${#GLOBAL_KEYS[@]}"
echo

# Check each file for missing keys
for file in "${FILES[@]}"; do
    echo "Checking: $file"

    declare -A FILE_KEYS=()
    while IFS= read -r key; do
        FILE_KEYS["$key"]=1
    done < <(extract_keys "$file")

    missing=()
    for key in "${!GLOBAL_KEYS[@]}"; do
        if [[ -z "${FILE_KEYS[$key]+x}" ]]; then
            missing+=("$key")
        fi
    done

    if (( ${#missing[@]} > 0 )); then
        echo "  Missing keys:"
        for m in "${missing[@]}"; do
            echo "    - $m"
        done
    else
        echo "  OK — no missing keys"
    fi

    echo
done
