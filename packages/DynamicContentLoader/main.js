(function (exports) {
    'use strict';

    /**
     * Represents a XHR that can be canceled at any time, abstracts some response handling and has
     * multiple handlers it might update. Is used by RequestPool to abstract some of its
     * logic (it might call multiple endpoints that each may have multiple handlers).
     * Calls the provided handlers with the following signatures:
     * - loading: { status: 'loading', url: String }
     * - loaded: { status: 'loaded', response: Response, content: String }
     * - failed: { status: 'failed', response: Response, content: String }
     */
    class Request {
        #handlers = [];
        #signal;
        #url;

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
         * Adds a handler that will be called with updates for the request.
         * @param {function} handler
         */
        addUpdater(handler) {
            if (typeof handler !== 'function') {
                throw new Error(`Parameter handler must be a function, is ${handler} instead.`);
            }
            this.#handlers.push(handler);
        }

        /**
         * Calls all handlers with the data provided.
         * @param {*} data
         */
        #callAllHandlers(data) {
            this.#handlers.forEach((handler) => handler(data));
        }

        /**
         * Fetches the url provided and calls all handlers with updates once they arrive.
         */
        async fetch() {
            this.#callAllHandlers({ status: 'loading', url: this.#url });
            const response = await fetch(this.#url, { signal: this.#signal });
            const content = await response.text();
            const handlerData = {
                response,
                content,
                status: response.ok ? 'loaded' : 'failed',
            };
            this.#callAllHandlers(handlerData);
        }
    }

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
    class RequestPool {
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
            const invalidKeys = Object.keys(requestConfiguration)
                .filter((item) => item !== 'searchParams');
            if (invalidKeys.length) {
                console.warn(
                    'Keys %s are not supported for requestConfiguration; only \'searchParams\' is supported.',
                    invalidKeys.join(', '),
                );
            }
            if (
                // Only check type *if* argument is provided
                Object.hasOwn(requestConfiguration, 'searchParams')
                && !(requestConfiguration.searchParams instanceof URLSearchParams)
            ) {
                throw new Error(`Property 'searchParams' passed as requestConfiguration must be an instance of URLSearchParams, is ${requestConfiguration.searchParams} instead.`);
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

    /* global customElements, HTMLElement */


    /**
     * Connects everything when it comes to Facets / dynamic UI filters:
     * - Listens for 'addDynamicContentUpdater' event and registers those
     * - Listens for 'loadDynamicContent' event; once it happens, uses RequestPool to get the fetch
     *   URL from all updaters, fetches the content and distributes it to all updaters 
     *
     * Is basically a custom element around RequestPool.
     */
    class DynamicContentOrchestrator extends HTMLElement {

        /**
         * Instance of RequestPool that orchestrates all fetch calls
         * type {RequestPool}
         */
        #requestPool;

        constructor() {
            super();
            this.#requestPool = new RequestPool(Request);
        }

        connectedCallback() {
            this.#setupLoadDynamicContentListener();
            this.#setupaddDynamicContentUpdaterListener();
        }

        #setupLoadDynamicContentListener() {
            this.addEventListener('loadDynamicContent', this.#loadContent.bind(this));
        }

        /**
         * @param {{ detail: { requestConfiguration: { searchParams: URLSearchParams } }}} param
         */
        #loadContent({ detail: { requestConfiguration } } = {}) {
            // Argument checking is done in RequestPool
            this.#requestPool.loadContent(requestConfiguration);
        }

        #setupaddDynamicContentUpdaterListener() {
            this.addEventListener('addDynamicContentUpdater', this.#addUpdater.bind(this));
        }

        #addUpdater({ detail: updater }) {
            this.#requestPool.addUpdater(updater);
        }

        static defineCustomElement() {
            if (!customElements.get('dynamic-content-orchestrator')) {
                customElements.define('dynamic-content-orchestrator', DynamicContentOrchestrator);
            }
        }
    }

    /* global customElements, CustomEvent, window, HTMLElement */

    /**
     * Element that listens to clicks and dispatches a loadDynamicContent event (which will be handled
     * by the DynamicContentOrchestrator).
     */
    class LinkListener extends HTMLElement {
        connectedCallback() {
            this.#addClickListener();
        }

        #addClickListener() {
            this.addEventListener('click', this.#handleClick.bind(this));
        }

        #handleClick(event) {
            // If this element is nested within an a, the click target will be the element, not the a;
            // get the closest parent that contains a href attribute.
            const closestHref = event.target.closest('[href]');
            // Clicked element is not a link: Ignore it.
            if (closestHref === null) return;
            // Make sure to only prevent the event's default handlers if the user clicked a href.
            event.preventDefault();
            const { search } = new URL(closestHref.href, window.location.origin);
            const searchParams = new URLSearchParams(search);
            this.dispatchEvent(new CustomEvent('loadDynamicContent', {
                bubbles: true,
                detail: {
                    requestConfiguration: {
                        searchParams,
                        // TODO! Would help with infinite scrolling.
                        mode: 'append',
                    },
                },
            }));
        }

        static defineCustomElement() {
            if (!customElements.get('link-listener')) {
                customElements.define('link-listener', LinkListener);
            }
        }
    }

    /* global HTMLElement, customElements, CustomEvent, window */

    /**
     * Generic implementation that updates content of the element when dynamic content is loaded. Used
     * e.g. to update the pagination and the main results section.
     * Uses the endpoint from arguments and appends the query string from the request that is made.
     */
    class ContentUpdater extends HTMLElement {
        connectedCallback() {
            this.#emitAddEvent();
        }

        /**
         * Element registers itself at the surrounding DynamicContentOrchestrator that orchestrates API
         * calls.
         */
        async #emitAddEvent() {
            // Make sure the event is only fired after surrounding DynamicContentLoader is ready,
            // even the script that defines it is loaded after this one.
            await new Promise((resolve) => { setTimeout(resolve); });
            this.dispatchEvent(new CustomEvent('addDynamicContentUpdater', {
                bubbles: true,
                detail: {
                    updateResponseStatus: this.#updateResponseStatus.bind(this),
                    assembleURL: this.#assembleURL.bind(this),
                },
            }));
        }

        #updateResponseStatus({ status, content, response }) {
            if (!['loading', 'loaded', 'failed'].includes(status)) {
                throw new Error(`Expected statusUpdate.status to be one of 'loading', 'loaded' or 'failed', got ${status} instead.`);
            }
            let finalContent;
            if (status === 'loaded') finalContent = content;
            else if (status === 'failed') finalContent = `ERROR: Status ${response.status} – ${content}`;
            this.#updateDOM(status, finalContent);
        }

        /**
         * Takes care of all DOM updates
         * @param {string} status - valid values are 'loading', 'loaded' and 'failed'
         * @param {string?} content - HTML content to set; empty when status is 'loading'
         */
        #updateDOM(status, content) {
            const elements = {
                loading: this.querySelector('[data-loading]'),
                failed: this.querySelector('[data-error]'),
                loaded: this.querySelector('[data-content]'),
            };
            Object.keys(elements).forEach((key) => {
                if (!elements[key]) {
                    throw (new Error(`Make sure that the ContentUpdater has three children with the following data attributes: data-loading, data-error and data-content; missing element to display status "${status}".`));
                }
                elements[key].hidden = (key !== status);
            });
            const activeElement = elements[status];
            if (['failed', 'loaded'].includes(status)) activeElement.innerHTML = content;
            // Make sure the active element is visible but only if it's the main content (we don't want
            // to scroll to the pagination *and* the main content at the same time)
            if (this.hasAttribute('data-is-main-content')) {
                // Use `scrollTop` instead of `scrollIntoView` because `scrollIntoView` only makes sure
                // that the element is visible, but not that it's at the top of the viewport. If the
                // pagination is below the the main content and a user changes the page, 
                // `scrollIntoView` might not scroll at all if the main content is visible; in that
                // case, we want to scroll the the main content's top, though.
                const scrollTop = window.scrollY + activeElement.getBoundingClientRect().top;
                window.scrollTo({ top: scrollTop, behavior: 'smooth' });
            }
        }

        #getEndpointURL() {
            // Get endpoint URL on every call to support modifications after the element was
            // initialized or added to the DOM.
            const endpointURL = this.dataset.endpointUrl;
            if (endpointURL === undefined) {
                throw new Error(`Mandatory attribute data-endpoint-url is missing, value ${endpointURL} is not permitted. Use data-endpoint-url="" for an empty URL.`);
            }
            return endpointURL;
        }

        #assembleURL({ searchParams }) {
            return `${this.#getEndpointURL()}?${searchParams.toString()}`;
        }

        static defineCustomElement() {
            if (!customElements.get('content-udpater')) {
                customElements.define('content-updater', ContentUpdater);
            }
        }
    }

    /* global FormData, HTMLElement, customElements, CustomEvent */

    /**
     * Custom element that dispatches a loadDynamicContent event when a filter changes (checkboxes,
     * inputs etc.). Needs DynamicContentOrchestrator to work in conjunction with other elements.
     */
    class FilterChangeListener extends HTMLElement {
        connectedCallback() {
            this.#addChangeListener();
        }

        #addChangeListener() {
            this.addEventListener('change', this.#handleChange.bind(this));
            // TODO: Get from attribute
            // Make sure we dont't fire on change *and* on input
            // this.addEventListener('input', this.#handleChange.bind(this));
        }

        #handleChange() {
            const form = this.querySelector('form');
            if (!form) {
                throw new Error('Missing child form element in FilterChangeListener.');
            }
            const formData = new FormData(form);
            // Only add form elements to the searchParams if they are not empty. If we use empty params
            // as well, Drupal gets bitchy.
            const cleanFormData = new FormData();
            [...formData.entries()].forEach(([key, value]) => {
                if (value) cleanFormData.append(key, value);
            });
            this.dispatchEvent(new CustomEvent('loadDynamicContent', {
                bubbles: true,
                detail: {
                    requestConfiguration: {
                        searchParams: new URLSearchParams(cleanFormData),
                    },
                },
            }));
        }

        static defineCustomElement() {
            if (!customElements.get('filter-change-listener')) {
                customElements.define('filter-change-listener', FilterChangeListener);
            }
        }
    }

    /* global HTMLElement, customElements, CustomEvent, history */

    /**
     * Updates the current location's query parameters to match the current filters.
     */
    class QueryStringUpdater extends HTMLElement {
        connectedCallback() {
            this.#emitAddUpdaterEvent();
        }

        /**
         * Element registers itself at the surrounding DynamicContentLoader that orchestrates API
         * calls.
         */
        async #emitAddUpdaterEvent() {
            // Make sure the event is only fired *after* surrounding DynamicContentLoader is ready,
            // even the script that defines it is loaded after this one.
            await new Promise((resolve) => { setTimeout(resolve); });
            this.dispatchEvent(new CustomEvent('addDynamicContentUpdater', {
                bubbles: true,
                detail: {
                    updateResponseStatus: () => {},
                    assembleURL: QueryStringUpdater.#updateResponseStatus,
                },
            }));
        }

        static #updateResponseStatus({ searchParams }) {
            // eslint-disable-next-line no-restricted-globals
            history.pushState(null, '', `?${searchParams.toString()}`);
            // Dont' fetch anything
            return null;
        }

        static defineCustomElement() {
            if (!customElements.get('query-string-updater')) {
                customElements.define('query-string-updater', QueryStringUpdater);
            }
        }
    }

    /* global HTMLElement, customElements, CustomEvent, requestAnimationFrame */

    /**
     * Updates the facet (expected amount of results) on checkboxes provided by Drupal.
     * Needs DynamicContentOrchestrator to work in conjunction with other elements.
     */
    class FacetsUpdater extends HTMLElement {
        connectedCallback() {
            this.#emitAddEvent();
        }

        /**
         * Element registers itself at the surrounding DynamicContentLoader that orchestrates API
         * calls.
         */
        async #emitAddEvent() {
            // Make sure the event is only fired after surrounding DynamicContentLoader is ready,
            // even the script that defines it is loaded after this one.
            await new Promise((resolve) => { setTimeout(resolve); });
            this.dispatchEvent(new CustomEvent('addDynamicContentUpdater', {
                bubbles: true,
                detail: {
                    updateResponseStatus: this.#updateResponseStatus.bind(this),
                    assembleURL: this.#assembleURL.bind(this),
                },
            }));
        }

        #updateResponseStatus(statusUpdate) {
            if (statusUpdate.status !== 'loaded') return;
            const facetData = JSON.parse(statusUpdate.content);
            /* Answer comes in the form of:
             * {
             *   "field_job_location": [
             *     {
             *         "termId": "30",
             *         "isSelected": false,
             *         "matches": 2,
             *         "title": "Basel",
             *         "computedTitle": "Basel (2)"
             *     },
             *   ],
             * }
             */
            Object.entries(facetData).forEach(([facetName, facets]) => {
                facets.forEach((facetData) => this.#updateFacet(facetName, facetData));
            });
        }

        /**
         * Updates the label's content; code is very, very Drupal-specific
         */
        #updateFacet(facetName, facetData) {
            const selector = `.js-form-item-${facetName.replaceAll('_', '-')}-${facetData.termId}`;
            const formElement = this.querySelector(selector);
            if (!formElement) {
                // This can and will happen (e.g. if only facets with more than 0 results in the
                // unfiltered state are rendered initially): log and ignore it
                console.warn(
                    'Form element with selector %s not found for facet %o with name %o; can\'t update it.',
                    selector,
                    facetData,
                    facetName,
                );
                return;
            }
            const label = formElement.querySelector('.input-label-element');
            requestAnimationFrame(() => {
                formElement.toggleAttribute('data-empty-results', facetData.matches === 0);
                label.textContent = facetData.computedTitle;
            });
        }

        #getEndpoint() {
            // Read at runtime to catch updates if they happen after initialization or after the
            // element was added to the DOM.
            const { endpointUrl } = this.dataset;
            if (endpointUrl === undefined) {
                throw new Error(`Mandatory attribute data-endpoint-url is missing, value ${endpointUrl} is not permitted. Use data-endpoint-url="" for an empty URL.`);
            }
            return endpointUrl;
        }

        #assembleURL({ searchParams }) {
            const url = `${this.#getEndpoint()}?${searchParams.toString()}`;
            return url;
        }

        static defineCustomElement() {
            if (!customElements.get('facets-updater')) {
                customElements.define('facets-updater', FacetsUpdater);
            }
        }
    }

    exports.ContentUpdater = ContentUpdater;
    exports.DynamicContentOrchestrator = DynamicContentOrchestrator;
    exports.FacetsUpdater = FacetsUpdater;
    exports.FilterChangeListener = FilterChangeListener;
    exports.LinkListener = LinkListener;
    exports.QueryStringUpdater = QueryStringUpdater;

    return exports;

})({});
