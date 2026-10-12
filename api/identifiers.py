"""External edition identifiers; internal book IDs remain independent."""
import re

from api.isbn import isbn_lookup_values


OL_EDITION_RE = re.compile(r"^OL[0-9]+M$", re.IGNORECASE)


def normalize_olid(value):
    if not isinstance(value, str) or not OL_EDITION_RE.fullmatch(value.strip()):
        raise ValueError("Open Library ID must be an edition ID such as OL62524517M.")
    return value.strip().upper()


def book_identifier_filter(model, identifier):
    if identifier.strip().upper().startswith("OL"):
        return model.openlibrary_id == identifier.strip().upper()
    return model.isbn.in_(isbn_lookup_values(identifier))
