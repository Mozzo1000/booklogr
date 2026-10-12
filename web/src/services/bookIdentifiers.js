export const isOpenLibraryId = (value) => /^OL\d+M$/i.test(value ?? '');

export const identifierLabel = (value) => isOpenLibraryId(value) ? 'Open Library ID' : 'ISBN';

export const coverUrl = (value, size = 'M') =>
    `https://covers.openlibrary.org/b/${isOpenLibraryId(value) ? 'olid' : 'isbn'}/${encodeURIComponent(value ?? '')}-${size}.jpg?default=false`;

export const editionIdentifier = (edition) =>
    edition.isbn_13?.[0] || edition.isbn_10?.[0] || edition.key?.split('/').pop();

export const identifierPayload = (value) =>
    isOpenLibraryId(value) ? { openlibrary_id: value.trim().toUpperCase() } : { isbn: value };
