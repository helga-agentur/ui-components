/* global customElements, HTMLElement */

import Request from './Request.mjs';
import RequestPool from './RequestPool.mjs';

/**
 * Connects everything when it comes to Facets / dynamic UI filters:
 * - Listens for 'addDynamicContentUpdater' event and registers those
 * - Listens for 'loadDynamicContent' event; once it happens, uses RequestPool to get the fetch
 *   URL from all updaters, fetches the content and distributes it to all updaters 
 *
 * Is basically a custom element around RequestPool.
 */
export default class DynamicContentOrchestrator extends HTMLElement {

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
