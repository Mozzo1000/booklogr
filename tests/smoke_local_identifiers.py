"""Live browser smoke test. Requires Playwright and a single-user installation.

Usage: python tests/smoke_local_identifiers.py http://books
Adds the Weinersmith book if absent and leaves it in the To be read list.
"""
import json
import sys
from playwright.sync_api import sync_playwright, expect

expect.set_options(timeout=30000)

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://books').rstrip('/')
OLID = 'OL62524517M'
TITLE = 'Science: Abridged Beyond the Point of Usefulness'

with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, locale='en-GB')
    context.add_init_script('''
        localStorage.setItem('last_sorted', JSON.stringify({value: 'created_on'}));
        localStorage.setItem('last_ordered', 'desc');
    ''')
    page = context.new_page()
    page.set_default_timeout(60000)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    metadata = context.request.get(f'{BASE}/v1/books/{OLID}', timeout=90000)
    assert metadata.ok, metadata.text()
    book = metadata.json()
    assert book['title'] == TITLE and book['isbn'] is None
    before = context.request.get(f'{BASE}/v1/books').json()['meta']['total_items']
    print('PASS: live OLID metadata lookup without ISBN', flush=True)

    page.goto(f'{BASE}/books/{OLID}')
    expect(page.get_by_role('heading', name=TITLE, exact=True, level=2)).to_be_visible()
    expect(page.get_by_text('Open Library ID', exact=True)).to_be_visible()
    expect(page.get_by_role('link', name='Open Library', exact=True)).to_have_attribute(
        'href', f'https://openlibrary.org/books/{OLID}')
    expect(page.locator(f'img[src*="/b/olid/{OLID}"], img[src*="fallback-cover"]').first).to_be_visible()
    print('PASS: book details and cover fallback render', flush=True)

    if not book['in_library']:
        page.goto(f'{BASE}/library')
        page.get_by_role('button', name='Add book', exact=True).click()
        dialog = page.get_by_role('dialog').filter(has=page.locator('#identifier-type'))
        dialog.locator('#identifier-type').select_option('openlibrary_id')
        expect(dialog.locator('#isbn')).to_have_attribute('type', 'text')
        dialog.locator('#isbn').fill(OLID)
        dialog.locator('#title').fill(TITLE)
        dialog.locator('#author').fill('Zach Weinersmith')
        with page.expect_response(lambda response: response.request.method == 'POST'
                                  and response.url.endswith('/v1/books')) as saved:
            dialog.get_by_role('button', name='Save', exact=True).click()
        assert saved.value.status == 200, saved.value.text()
        expect(dialog).to_be_hidden()
        print('PASS: manual entry saves an OLID-only book and closes', flush=True)

    stored = context.request.get(f'{BASE}/v1/books/{OLID}').json()
    assert stored['in_library'] and stored['isbn'] is None and stored['openlibrary_id'] == OLID
    book_id = stored['library_data']['id']
    assert context.request.get(f'{BASE}/v1/books/{OLID}/status').json()['id'] == book_id
    count = context.request.get(f'{BASE}/v1/books').json()['meta']['total_items']
    assert count == before + (0 if book['in_library'] else 1)

    page.goto(f'{BASE}/library')
    page.get_by_role('tab', name='To be read', exact=True).click()
    entry = page.get_by_role('link', name=TITLE, exact=True)
    expect(entry).to_be_visible()
    expect(entry).to_have_attribute('href', f'/books/{OLID}')
    entry.click()
    expect(page).to_have_url(f'{BASE}/books/{OLID}')
    expect(page.get_by_role('heading', name=TITLE, exact=True, level=2)).to_be_visible()
    expect(page.get_by_text('Zach Weinersmith', exact=False)).to_be_visible()
    print('PASS: saved library link opens the book', flush=True)

    page.keyboard.press('Control+k')
    dialog = page.get_by_role('dialog').filter(has=page.locator('#search'))
    dialog.locator('#search').fill(OLID)
    search_result = dialog.get_by_role('link').filter(has_text=TITLE)
    expect(search_result).to_be_visible()
    expect(dialog.get_by_text('In your library', exact=False)).to_be_visible()
    search_result.click()
    expect(dialog).to_be_hidden()
    expect(page.get_by_role('heading', name=TITLE, exact=True, level=2)).to_be_visible()
    print('PASS: search by OLID returns the saved book and navigates', flush=True)

    duplicate = context.request.post(f'{BASE}/v1/books', data={
        'title': TITLE, 'openlibrary_id': OLID})
    assert duplicate.status == 409
    invalid = context.request.post(f'{BASE}/v1/books', data={
        'title': TITLE, 'openlibrary_id': 'OL45960737W'})
    assert invalid.status == 422
    print('PASS: duplicate edition and work ID rejected', flush=True)
    assert not errors, errors
    page.screenshot(path='/tmp/booklogr-weinersmith.png', full_page=True)
    print(json.dumps({'book_id': book_id, 'identifier': OLID, 'library_books': count,
                      'browser_errors': errors, 'screenshot': '/tmp/booklogr-weinersmith.png'}), flush=True)
    browser.close()
