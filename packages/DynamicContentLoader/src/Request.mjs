/**
 * Represents a XHR that can be canceled at any time, abstracts some response handling and has
 * multiple handlers it might update. Is used by RequestPool to abstract some of its
 * logic (it might call multiple endpoints that each may have multiple handlers).
 * Calls the provided handlers with the following signatures:
 * - loading: { status: 'loading', url: String }
 * - loaded: { status: 'loaded', response: Response, content: String }
 * - failed: { status: 'failed', response: Response, content: String }
 */
export default class {
    #updaters = [];
    #signal;
    #url;

    /**
     * An updater can return data when getRequestConfig is called. This data will be temporarily
     * stored and passed to the updater once updateResponseStatus is called. This allows us to
     * persist data across a request response cycle, e.g. to *append* data (instead of replace it)
     * when a user paginates (and does not filter, where data should be replaced).
     * @type {Map<object, any>} - key is the updater's function that handles the data, value is
     * the data it returns when getRequestConfig is called.
     */
    #data = new Map();

    /**
     * @param {*} params
     * @param {string} params.url - The URL to fetch.
     * @param {AbortSignal} params.signal - The signal that is used to abort the fetch.
     */
    constructor({ url, signal } = {}) {
        if (!url || typeof url !== 'string') {
            throw new Error(`Parameter url must be a non-empty String, is ${url} instead.`);
        }
        this.#url = url;
        if (!signal || !(signal instanceof AbortSignal)) {
            throw new Error(`Parameter signal must be an instance of AbortSignal, is ${signal} instead.`);
        }
        this.#signal = signal;
    }

    /**
     * Public getter for this.#url.
     * @returns {string} The URL to fetch.
     */
    get url() {
        return this.#url;
    }

    /**
     * Adds a updater that will be called with updates for the request.
     * @param {function} updater
     * @param {any} data - Data that was returned by an updater and will be passed to it when
     * data is distributed.
     */
    addUpdater(updater, data) {
        if (typeof updater !== 'function') {
            throw new Error(`Parameter updater must be a function, is ${updater} instead.`);
        }
        this.#updaters.push(updater);
        this.#data.set(updater, data);
    }

    /**
     * Calls all updaters with the data provided.
     * @param {*} data
     */
    #callAllUpdaters(data) {
        this.#updaters.forEach((updater) => {
            updater({ ...data, data: this.#data.get(updater) });
        });
    }

    /**
     * Fetches the url provided and calls all updaters with updates once they arrive.
     */
    async fetch() {
        this.#callAllUpdaters({ status: 'loading', url: this.#url });
        const response = await fetch(this.#url, { signal: this.#signal });
        const content = await response.text();
        const updaterData = {
            response,
            content,
            status: response.ok ? 'loaded' : 'failed',
        };
        this.#callAllUpdaters(updaterData);
    }
}
