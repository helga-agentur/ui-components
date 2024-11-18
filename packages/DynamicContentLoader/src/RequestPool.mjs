/**
 * Orchestrates fetch requests:
 * - Lets updaters register themselves (through addupdater)
 * - When a new request is made (through loadContent), it
 *     - calls assembleURL on all updaters,
 *     - combines requests to the same URL and makes sure the URL is only called once
 *     - fetches content (through the injected Request class)
 *     - then calls updateResponseStatus on all updaters.
 *
 * Every updater *must* provide two *methods*:
 * - assembleURL: takes { searchParams: URLSearchParams } as a parameter and returns a either
 *   a URL to fetch (string) or null. If null is returned, nothing is being fetched.
 * - updateResponseStatus: called by Request (see signature there, is injected via constructor)
 */
export default class RequestPool {
    /**
     * Contains all actors that handle fetched content.
     * type {{ updateResponseStatus: Function, assembleURL: Function }[]}
     */
    #updaters = [];

    /**
     * Holds the AbortController for the most recent set of requests; is renewed every time
     * a new request is initialized.
     * type {AbortController}
     */
    #latestAbortController = null;

    /**
     * Class that will be instantiated to perform a request; use DI to facilitate testing.
     * type {*}
     */
    #requestClass;

    /**
     * @param {{ fetch: function, addUpdater: function, url: string }} requestObject - Injected
     * to facilitate testing; must be an object that will be instantiated.
     */
    constructor(RequestClass) {
        if (!RequestClass) {
            throw new Error('Missing mandatory argument requestObject');
        }
        ['fetch', 'addUpdater'].forEach((methodName) => {
            // Check on prototype because we are checking a class, not its instance
            if (typeof RequestClass.prototype[methodName] !== 'function') {
                throw new Error(`requestObject is missing mandatory method '${methodName}'`);
            }
        });
        this.#requestClass = RequestClass;
    }

    /**
     * Loads remote content:
     * - Aborts all existing requests
     * - Collects all URLs to fetch (from all updaters by calling their assembleURL function)
     * - Groups requests by their URL (to only call every URL once)
     * - Then executes the requests
     * @param {{ searchParams: URLSearchParams }} requestConfiguration - Configuration that will be
     * passed to the assembleURL function of all updaters. Only supports queryString parameter for
     * now.
     */
    loadContent(requestConfiguration) {
        RequestPool.#validateRequestConfiguration(requestConfiguration);

        // Abort all existing requests to prevent race conditions and save resources.
        if (this.#latestAbortController) {
            const abortReason = 'More recent interaction overrules previous interaction';
            this.#latestAbortController.abort(abortReason);
        }
        this.#latestAbortController = new AbortController();

        // Go through all updaters, collect their URLs; create an instance of Request if the URL
        // doesn't yet exist, else add the updater to the existing corresponding Request instance
        const requests = this.#updaters
            .reduce((previous, updater) => {
                const url = updater.assembleURL(requestConfiguration);
                // A updater might return null if there's nothing to fetch (if the updater e.g.
                // decides that he is not concerned by the change in requestConfig)
                if (url === null) return previous;
                if (typeof url !== 'string') {
                    throw new Error(`Expected URL returned by assembleURL funtion to be a string, got ${url} instead.`);
                }

                const matchingRequest = previous.find((request) => request.url === url);
                if (matchingRequest) {
                    matchingRequest.addUpdater(updater.updateResponseStatus.bind(updater));
                    return previous;
                }

                const request = new this.#requestClass({
                    url,
                    signal: this.#latestAbortController.signal,
                });
                // Test if newly created request instance has an URL property that returns
                // the expected value (this was a cause of a hard-to-debug error in unit tests)
                if (request.url !== url) {
                    throw new Error(`The instantiated request object must provide a property 'url' to combine multiple requests to the same URL within one request; url is ${request.url} instead.`);
                }
                request.addUpdater(updater.updateResponseStatus.bind(updater));
                return [...previous, request];
            }, []);
        requests.forEach((request) => request.fetch());
    }

    /**
     * Checks if we get the requestConfiguration we expect
     * @param {{ searchParams: URLSearchParams }} requestConfiguration
     */
    static #validateRequestConfiguration(requestConfiguration) {
        const validKeys = ['searchParams', 'reset'];
        const invalidKeys = Object.keys(requestConfiguration)
            .filter((item) => !validKeys.includes(item));
        if (invalidKeys.length) {
            console.warn(
                'Keys %s are not supported for requestConfiguration; only %s are supported.',
                invalidKeys.map((key) => `"${key}"`).join(', '),
                validKeys.map((key) => `"${key}"`).join(', '),
            );
        }
        if (
            // Only check type *if* argument is provided
            Object.hasOwn(requestConfiguration, 'searchParams')
            && !(requestConfiguration.searchParams instanceof URLSearchParams)
        ) {
            throw new Error(`Property 'searchParams' passed as requestConfiguration must be an instance of URLSearchParams, is ${requestConfiguration.searchParams} instead.`);
        }
        if (
            Object.hasOwn(requestConfiguration, 'reset')
            && typeof requestConfiguration.reset !== 'boolean'
        ) {
            throw new Error(`Property 'reset' passed as requestConfiguration must be a boolean, is ${requestConfiguration.reset} instead.`);
        }
    }

    /**
     * Adds a updater; for signature, see class description. The updater's
     * - assembleURL method will be called whenever a request is made
     * - updateResponseStatus method will be called after a response is received
     * @param {Ad} updater
     */
    addUpdater(updater) {
        RequestPool.#validateupdater(updater);
        this.#updaters.push(updater);
    }

    /**
     * @param {object} updater - Updater that should be validated
     */
    static #validateupdater(updater) {
        if (typeof updater.updateResponseStatus !== 'function') {
            throw new Error(`updater's 'updateResponseStatus' property must be a function; is ${updater.updateResponseStatus} instead.`);
        }
        if (typeof updater.assembleURL !== 'function') {
            throw new Error(`updater's 'assembleURL' property must be a function; is ${updater.assembleURL} instead.`);
        }
    }
}
