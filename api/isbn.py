import re


ISBN_CLEAN_RE = re.compile(r"[^0-9Xx]")


def _clean_isbn(isbn):
    return ISBN_CLEAN_RE.sub("", isbn or "").upper()


def _isbn13_check_digit(first_twelve_digits):
    total = 0
    for index, digit in enumerate(first_twelve_digits):
        weight = 1 if index % 2 == 0 else 3
        total += int(digit) * weight
    return str((10 - (total % 10)) % 10)


def _isbn10_check_digit(first_nine_digits):
    total = sum(int(digit) * (10 - index) for index, digit in enumerate(first_nine_digits))
    check_value = (11 - (total % 11)) % 11
    if check_value == 10:
        return "X"
    return str(check_value)


def isbn10_to_isbn13(isbn10):
    cleaned = _clean_isbn(isbn10)
    if len(cleaned) != 10 or not cleaned[:9].isdigit():
        return None
    if _isbn10_check_digit(cleaned[:9]) != cleaned[-1]:
        return None

    stem = f"978{cleaned[:9]}"
    return f"{stem}{_isbn13_check_digit(stem)}"


def isbn13_to_isbn10(isbn13):
    cleaned = _clean_isbn(isbn13)
    if len(cleaned) != 13 or not cleaned.isdigit() or not cleaned.startswith("978"):
        return None
    if _isbn13_check_digit(cleaned[:12]) != cleaned[-1]:
        return None

    stem = cleaned[3:12]
    return f"{stem}{_isbn10_check_digit(stem)}"


def isbn_from_query(text):
    cleaned = _clean_isbn(text)
    if len(cleaned) == 13 and _isbn13_check_digit(cleaned[:12]) == cleaned[-1]:
        return cleaned
    if len(cleaned) == 10:
        return isbn10_to_isbn13(cleaned) or cleaned
    return None


def isbn_lookup_values(isbn):
    values = []

    def add(value):
        if value and value not in values:
            values.append(value)

    add(isbn)
    cleaned = _clean_isbn(isbn)
    add(cleaned)

    if len(cleaned) == 10:
        add(isbn10_to_isbn13(cleaned))
    elif len(cleaned) == 13:
        add(isbn13_to_isbn10(cleaned))

    return values
