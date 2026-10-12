import test from 'node:test';
import assert from 'node:assert/strict';
import { createExportPoller } from './exportPolling.js';

const httpError = status => ({ response: { status } });

function harness(results) {
    const state = { polls: 0, loading: true, errors: [], successes: 0, files: null };
    const poller = createExportPoller({
        getTask: async () => {
            const result = results[state.polls++];
            if (result instanceof Error || result?.response) throw result;
            return { data: result };
        },
        getFiles: async () => ({ data: ['export.csv'] }),
        onFiles: files => { state.files = files; },
        onSuccess: () => { state.loading = false; state.successes += 1; },
        onFailure: message => { state.loading = false; state.errors.push(message); },
    });
    return { poller, state };
}

for (const status of [401, 403, 404]) {
    test(`HTTP ${status} stops polling immediately and reports one error`, async () => {
        const { poller, state } = harness([httpError(status)]);
        await poller.poll();
        await poller.poll();
        assert.equal(state.polls, 1);
        assert.equal(state.loading, false);
        assert.equal(state.errors.length, 1);
        assert.match(state.errors[0], new RegExp(`HTTP ${status}`));
        assert.equal(state.successes, 0);
    });
}

test('repeated HTTP 500 errors allow two retries then stop with one notification', async () => {
    const { poller, state } = harness([httpError(500), httpError(500), httpError(500)]);
    for (let attempt = 0; attempt < 2; attempt += 1) {
        await poller.poll();
        assert.equal(state.loading, true);
        assert.deepEqual(state.errors, []);
    }
    await poller.poll();
    await poller.poll();
    assert.equal(state.polls, 3);
    assert.equal(state.loading, false);
    assert.equal(state.errors.length, 1);
    assert.match(state.errors[0], /HTTP 500/);
});

test('temporary network failure recovers without an error notification', async () => {
    const { poller, state } = harness([new Error('Network Error'), { status: 'success' }]);
    await poller.poll();
    assert.equal(state.loading, true);
    assert.deepEqual(state.errors, []);
    await poller.poll();
    await poller.poll();
    assert.equal(state.polls, 2);
    assert.equal(state.loading, false);
    assert.equal(state.successes, 1);
    assert.deepEqual(state.files, ['export.csv']);
    assert.deepEqual(state.errors, []);
});

test('a new export after polling failure has a fresh retry budget and succeeds', async () => {
    const previous = harness([httpError(500), httpError(500), httpError(500)]);
    for (let attempt = 0; attempt < 3; attempt += 1) await previous.poller.poll();
    assert.equal(previous.state.errors.length, 1);
    const next = harness([httpError(500), new Error('Network Error'), { status: 'success' }]);
    await next.poller.poll();
    await next.poller.poll();
    assert.equal(next.state.loading, true);
    await next.poller.poll();
    assert.equal(next.state.loading, false);
    assert.equal(next.state.successes, 1);
    assert.deepEqual(next.state.errors, []);
});

test('explicit task failure keeps its diagnostic and stops polling', async () => {
    const { poller, state } = harness([{ status: 'failed', error_message: 'Task execution failed.' }]);
    await poller.poll();
    await poller.poll();
    assert.equal(state.polls, 1);
    assert.equal(state.loading, false);
    assert.deepEqual(state.errors, ['Task execution failed.']);
    assert.equal(state.successes, 0);
});

test('a healthy pending response resets consecutive failures', async () => {
    const { poller, state } = harness([
        httpError(500), httpError(500), { status: 'started' },
        httpError(500), httpError(500), { status: 'success' },
    ]);
    for (let attempt = 0; attempt < 6; attempt += 1) await poller.poll();
    assert.equal(state.successes, 1);
    assert.deepEqual(state.errors, []);
});

test('stopping a request ignores its pending response and prevents overlapping polls', async () => {
    let resolve;
    let calls = 0;
    const poller = createExportPoller({
        getTask: () => { calls += 1; return new Promise(done => { resolve = done; }); },
        getFiles: () => assert.fail('stopped request fetched files'),
        onFiles: () => assert.fail('stopped request updated files'),
        onSuccess: () => assert.fail('stopped request reported success'),
        onFailure: () => assert.fail('stopped request reported failure'),
    });
    const pending = poller.poll();
    await poller.poll();
    assert.equal(calls, 1);
    poller.stop();
    resolve({ data: { status: 'success' } });
    await pending;
    await poller.poll();
    assert.equal(calls, 1);
});
