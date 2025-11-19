import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createAPIUrl } from '../../src/services/api.utils.js';

describe('api.utils', () => {
  test('createAPIUrl should construct correct URL with plain endpoint', () => {
    const getAPIUrl = createAPIUrl('https://api.example.com');
    const result = getAPIUrl('/books');
    assert.strictEqual(result, 'https://api.example.com/books');
  });

  test('createAPIUrl should handle trailing slash in API endpoint', () => {
    const getAPIUrl = createAPIUrl('https://api.example.com/');
    const result = getAPIUrl('/books');
    assert.strictEqual(result, 'https://api.example.com/books');
  });

  test('createAPIUrl should handle endpoint without leading slash', () => {
    const getAPIUrl = createAPIUrl('https://api.example.com');
    const result = getAPIUrl('books');
    assert.strictEqual(result, 'https://api.example.com/books');
  });

  test('createAPIUrl should handle absolute endpoint paths', () => {
    const getAPIUrl = createAPIUrl('https://api.example.com/v1/');
    const result = getAPIUrl('/books/123');
    assert.strictEqual(result, 'https://api.example.com/books/123');
  });

  test('createAPIUrl should handle relative endpoint paths', () => {
    const getAPIUrl = createAPIUrl('https://api.example.com/api/v2/');
    const result = getAPIUrl('users/profile');
    assert.strictEqual(result, 'https://api.example.com/api/users/profile');
  });
});