import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
    LIBRARY_TABS, DEFAULT_VISIBLE_TABS, getLibraryNavigation,
    saveLibraryNavigation, resolveLibraryTab,
} from './libraryNavigation.js';

beforeEach(() => {
    const values = new Map();
    globalThis.localStorage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
    };
});

test('hiding the default chooses and persists the first visible tab', () => {
    saveLibraryNavigation('All', { ...DEFAULT_VISIBLE_TABS, all: true });
    const next = saveLibraryNavigation('All', DEFAULT_VISIBLE_TABS);
    assert.equal(next.defaultView, 'Currently reading');
    assert.equal(localStorage.getItem('library_default_view'), next.defaultView);
    assert.deepEqual(JSON.parse(localStorage.getItem('library_visible_tabs')), next.visibleTabs);
});

test('hiding another tab preserves the default', () => {
    const next = saveLibraryNavigation('Read', { ...DEFAULT_VISIBLE_TABS, toBeRead: false });
    assert.equal(next.defaultView, 'Read');
});

test('fallback follows display order rather than object property order', () => {
    const next = saveLibraryNavigation('Currently reading', {
        ...DEFAULT_VISIBLE_TABS, currentlyReading: false,
    });
    assert.equal(next.defaultView, 'To be read');
});

test('loading repairs a previously saved hidden default', () => {
    localStorage.setItem('library_default_view', 'All');
    localStorage.setItem('library_visible_tabs', JSON.stringify(DEFAULT_VISIBLE_TABS));
    assert.equal(getLibraryNavigation().defaultView, 'Currently reading');
    assert.equal(localStorage.getItem('library_default_view'), 'Currently reading');
});

test('all-hidden preferences restore a visible default', () => {
    const hidden = Object.fromEntries(LIBRARY_TABS.map(tab => [tab.key, false]));
    localStorage.setItem('library_visible_tabs', JSON.stringify(hidden));
    const next = getLibraryNavigation();
    assert.equal(next.defaultView, 'Currently reading');
    assert.equal(next.visibleTabs.currentlyReading, true);
    assert.equal(LIBRARY_TABS.filter(tab => next.visibleTabs[tab.key]).length, 1);
});

test('missing or malformed preferences use defaults', () => {
    assert.deepEqual(getLibraryNavigation().visibleTabs, DEFAULT_VISIBLE_TABS);
    localStorage.setItem('library_visible_tabs', '{invalid');
    assert.deepEqual(getLibraryNavigation().visibleTabs, DEFAULT_VISIBLE_TABS);
});

test('visible hashes win; hidden, invalid, and absent hashes use the visible default', () => {
    assert.equal(resolveLibraryTab('#tab-3', 'Currently reading', DEFAULT_VISIBLE_TABS), 3);
    for (const hash of ['#tab-0', '#tab-99', '#invalid', '']) {
        assert.equal(resolveLibraryTab(hash, 'Read', DEFAULT_VISIBLE_TABS), 3);
    }
    assert.equal(resolveLibraryTab('#tab-0', 'All', DEFAULT_VISIBLE_TABS), 1);
});

test('reset restores both default and visibility', () => {
    saveLibraryNavigation('All', { ...DEFAULT_VISIBLE_TABS, all: true, completed: false });
    assert.deepEqual(saveLibraryNavigation('Currently reading', DEFAULT_VISIBLE_TABS), {
        defaultView: 'Currently reading', visibleTabs: DEFAULT_VISIBLE_TABS,
    });
});
