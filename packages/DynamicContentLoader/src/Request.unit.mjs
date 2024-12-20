import test from 'ava';
import Request from './Request.mjs';

const createFetchMock = ({ isOk = true, response = '' } = {}) => {
    const requestedURLs = [];
    return {
        fetch: (url) => {
            requestedURLs.push(url);
            return new Promise((resolve) => {
                resolve({ ok: isOk, text: () => response });
            });
        },
        requestedURLs,
    };
};

test('throws on invalid arguments', (t) => {
    t.throws(() => new Request(), { message: /Parameter url/ });
    t.throws(() => new Request({ url: 5 }), { message: /Parameter url.*is 5 instead/ });
    t.throws(() => new Request({ url: 'test' }), { message: /Parameter signal/ });
});

test('throws on invalid updater', (t) => {
    const request = new Request({ url: '/test', signal: new AbortController().signal });
    t.throws(() => request.addUpdater(5), { message: /Parameter updater.*is 5 instead/ });
});

test('calls url', async (t) => {
    const originalFetch = global.fetch;
    const { fetch, requestedURLs } = createFetchMock();
    global.fetch = fetch;
    const request = new Request({ url: '/test', signal: new AbortController().signal });
    await request.fetch();
    t.is(request.url, '/test');
    t.deepEqual(requestedURLs, ['/test']);
    global.fetch = originalFetch;
});

test('handles fails', async (t) => {
    const updaterArguments = [];
    const updater = (status) => updaterArguments.push(status);
    const originalFetch = global.fetch;
    const { fetch } = createFetchMock({ isOk: false, response: ':-(' });
    global.fetch = fetch;
    const request = new Request({ url: '/test', signal: new AbortController().signal });
    request.addUpdater(updater);
    // Add updater twice to check if all are called
    request.addUpdater(updater);
    await request.fetch();
    t.is(updaterArguments.length, 4);
    // Loading
    t.is(updaterArguments[0].status, 'loading');
    t.is(updaterArguments[0].url, '/test');
    t.deepEqual(updaterArguments[0], updaterArguments[1]);
    t.is(updaterArguments[2].status, 'failed');
    t.is(updaterArguments[2].content, ':-(');
    t.is(updaterArguments[2].response.ok, false);
    t.deepEqual(updaterArguments[2], updaterArguments[3]);
    global.fetch = originalFetch;
});

test('handles success', async (t) => {
    const updaterArguments = [];
    const updater = (status) => updaterArguments.push(status);
    const originalFetch = global.fetch;
    const { fetch } = createFetchMock({ response: ':-D' });
    global.fetch = fetch;
    const request = new Request({ url: '/test', signal: new AbortController().signal });
    request.addUpdater(updater);
    // Add updater twice to check if all are called
    request.addUpdater(updater);
    await request.fetch();
    t.is(updaterArguments.length, 4);
    // Loading
    t.is(updaterArguments[0].status, 'loading');
    t.is(updaterArguments[0].url, '/test');
    t.deepEqual(updaterArguments[0], updaterArguments[1]);
    t.is(updaterArguments[2].status, 'loaded');
    t.is(updaterArguments[2].content, ':-D');
    t.is(updaterArguments[2].response.ok, true);
    t.deepEqual(updaterArguments[2], updaterArguments[3]);
    global.fetch = originalFetch;
});

test('calls updaters with correct data', async (t) => {
    const updaterArguments = [];
    const updater1 = (status) => updaterArguments.push({ source: 'updater1', status });
    const updater2 = (status) => updaterArguments.push({ source: 'updater2', status });
    const originalFetch = global.fetch;
    const { fetch } = createFetchMock({ response: ':-D' });
    global.fetch = fetch;
    const request = new Request({ url: '/test', signal: new AbortController().signal });
    request.addUpdater(updater2, 'test2');
    request.addUpdater(updater1, 'test1');
    await request.fetch();
    // 0 and 1 were 'loading'; 2 and 3 are 'loaded'
    t.is(updaterArguments[2].source, 'updater2');
    t.is(updaterArguments[2].status.data, 'test2');
    t.is(updaterArguments[3].source, 'updater1');
    t.is(updaterArguments[3].status.data, 'test1');
    global.fetch = originalFetch;
});
