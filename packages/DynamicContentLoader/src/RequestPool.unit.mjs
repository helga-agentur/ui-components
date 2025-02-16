/* eslint max-classes-per-file: ["error", 20] */

import test from 'ava';
import RequestPool from './RequestPool.mjs';

const createRequestObject = () => class {
    // eslint-disable-next-line class-methods-use-this
    fetch() {}
    // eslint-disable-next-line class-methods-use-this
    addUpdater() {}
};

test('throws on wrong initialization', (t) => {
    t.throws(() => new RequestPool(), { message: /Missing mandatory argument requestObject/ });
    t.throws(() => new RequestPool(class {}), { message: /mandatory method 'fetch'/ });
    t.throws(() => new RequestPool(class { fetch() {} }), { message: /mandatory method 'addUpdater'/ });
    t.notThrows(() => new RequestPool(createRequestObject()));
});

test('throws when loadContent is called with invalid request configuration', (t) => {
    const pool = new RequestPool(createRequestObject());
    t.throws(() => pool.loadContent({ searchParams: 5 }), { message: /Property 'searchParams'.*is 5 instead/ });
    t.throws(() => pool.loadContent({ searchParams: new URLSearchParams(), reset: 3 }), { message: /Property 'reset'.*is 3 instead/ });
});

test('throws when addUpdater is called with an invalid handler', (t) => {
    const pool = new RequestPool(createRequestObject());
    t.throws(() => pool.addUpdater({}), { message: /'updateResponseStatus' property.*is undefined instead/ });
    t.throws(() => pool.addUpdater({ updateResponseStatus: 6 }), { message: /'updateResponseStatus' property.*is 6 instead/ });
    t.throws(() => pool.addUpdater({ updateResponseStatus: () => {}, getRequestConfig: 5 }), { message: /'getRequestConfig' property.*is 5 instead/ });
});

test(
    'calls all added handlers\' getRequestConfig method, fetches data, distributes it',
    async (t) => {
        // What URLs are fetched?
        const fetchURLs = [];
        // How many times is the fetch() function on any of the Requests called (combined together)?
        let fetchRequestCount = 0;
        // What are the responses returned to updateResponseStatus?
        const responses = [];
        // What are the signals passed to all instances of Request?
        const signals = [];
        // How many instances of Request are created?
        let requestInitializedCount = 0;
        // What are the parameters passed to getRequestConfig?
        const getRequestConfigParams = [];

        // A mock request class that we'll inject into RequestPool; use Request usually.
        class Request {
            url;
            handlers = [];

            constructor({ url, signal } = {}) {
                requestInitializedCount += 1;
                fetchURLs.push(url);
                signals.push(signal);
                this.url = url;
            }

            addUpdater(handler) {
                this.handlers.push(handler);
            }

            fetch() {
                fetchRequestCount += 1;
                this.handlers.forEach((handler) => handler(`response-${this.url}`));
            }
        }

        const pool = new RequestPool(Request);

        const createHandler = (url) => ({
            getRequestConfig: (...args) => {
                getRequestConfigParams.push(...args);
                return { url };
            },
            updateResponseStatus: (...args) => {
                responses.push({ url, response: args });
            },
        });

        // getRequestConfig returns null
        pool.addUpdater(createHandler('url1'));
        pool.addUpdater(createHandler(null));
        pool.addUpdater(createHandler('url2'));
        pool.addUpdater(createHandler('url1'));

        // Invoke all handlers (by loading content on RequestPool)
        const queryParams = new URLSearchParams('a=b&c=d');
        pool.loadContent({ searchParams: queryParams, reset: true, someInvalidParam: 3 });

        // Check if getRequestConfig was called with the correct arguments; 4 handlers have an
        // getRequestConfig function
        t.is(getRequestConfigParams.length, 4);
        const expectedParams = { searchParams: queryParams, reset: true, someInvalidParam: 3 };
        getRequestConfigParams.forEach((param) => t.deepEqual(param, expectedParams));

        // Check if URLs returned by all handler's getRequestConfig method are fetched; duplicates
        // (in ourcase 'url1' are excluded)
        t.deepEqual(fetchURLs, ['url1', 'url2']);

        // 2 URLs are the same; threfore only 2 request classes should have been in instantiazed
        t.is(requestInitializedCount, 2);

        // Check if all requests were made
        t.is(fetchRequestCount, 2);

        await new Promise((resolve) => { setTimeout(resolve); });

        // Check if updateResponseStatus was called correctly
        t.is(responses.length, 3);
        t.deepEqual(responses[0], { url: 'url1', response: ['response-url1'] });
        t.deepEqual(responses[1], { url: 'url1', response: ['response-url1'] });
        t.deepEqual(responses[2], { url: 'url2', response: ['response-url2'] });

        // All signals are instances of AbortSignal
        t.is(signals.every((signal) => signal instanceof AbortSignal), true);
    },
);

test('previous requests are aborted', (t) => {
    const signals = [];

    // A mock request class that we'll inject into RequestPool; use Request usually.
    class Request {
        url;
        handlers = [];

        constructor({ url, signal } = {}) {
            signals.push(signal);
            this.url = url;
        }

        // eslint-disable-next-line class-methods-use-this
        addUpdater() {}

        // eslint-disable-next-line class-methods-use-this
        fetch() {}
    }

    const pool = new RequestPool(Request);

    pool.addUpdater({
        getRequestConfig: () => ({ url: 'url1' }),
        updateResponseStatus: () => {},
    });

    pool.loadContent({ searchParams: new URLSearchParams('a=b') });
    pool.loadContent({ searchParams: new URLSearchParams('a=b') });

    t.is(signals.length, 2);
    t.is(signals[0].aborted, true);
    t.is(signals[1].aborted, false);
});

test('forwards data to request', async (t) => {
    const handlers = [];
    class Request {
        url;

        constructor({ url }) {
            this.url = url;
        }

        // eslint-disable-next-line class-methods-use-this
        addUpdater(updater, data) {
            handlers.push({ updater, data });
        }

        // eslint-disable-next-line class-methods-use-this
        fetch(url) {
            this.url = url;
        }
    }

    const pool = new RequestPool(Request);

    pool.addUpdater({
        getRequestConfig: () => ({ url: 'url1', data: 'test1' }),
        updateResponseStatus: () => {},
    });

    pool.addUpdater({
        getRequestConfig: () => ({ url: 'url2', data: 'test2' }),
        updateResponseStatus: () => {},
    });

    pool.loadContent({ searchParams: new URLSearchParams('a=b') });

    t.is(handlers[0].data, 'test1');
    t.is(handlers[1].data, 'test2');
});
