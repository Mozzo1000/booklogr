import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverUrl, editionIdentifier, identifierPayload, identifierLabel } from './bookIdentifiers.js';

test('ISBNless edition links and covers use the edition ID', () => {
    const id = editionIdentifier({ key: '/books/OL62524517M' });
    assert.equal(id, 'OL62524517M');
    assert.equal(identifierLabel(id), 'Open Library ID');
    assert.match(coverUrl(id), /\/b\/olid\/OL62524517M-M.jpg/);
    assert.deepEqual(identifierPayload(id), { openlibrary_id: id });
});

test('ISBNs remain ISBNs, including ISBN-10 ending in X', () => {
    assert.equal(editionIdentifier({ isbn_10: ['080442957X'], key: '/books/OL1M' }), '080442957X');
    assert.deepEqual(identifierPayload('080442957X'), { isbn: '080442957X' });
    assert.match(coverUrl('080442957X', 'S'), /\/b\/isbn\/080442957X-S.jpg/);
});
