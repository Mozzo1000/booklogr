from api.isbn import isbn_lookup_values, isbn10_to_isbn13, isbn13_to_isbn10


def test_isbn10_to_isbn13():
    assert isbn10_to_isbn13("1781335028") == "9781781335024"


def test_isbn13_to_isbn10():
    assert isbn13_to_isbn10("9781781335024") == "1781335028"


def test_isbn13_to_isbn10_only_converts_978_prefixes():
    assert isbn13_to_isbn10("9791234567896") is None


def test_invalid_checksums_are_not_converted():
    assert isbn10_to_isbn13("1781335020") is None
    assert isbn13_to_isbn10("9781781335020") is None


def test_lookup_values_include_original_cleaned_and_equivalent():
    assert isbn_lookup_values("978-1-78133-502-4") == [
        "978-1-78133-502-4",
        "9781781335024",
        "1781335028",
    ]
