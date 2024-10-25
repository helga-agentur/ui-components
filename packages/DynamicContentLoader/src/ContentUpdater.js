/* global HTMLElement, customElements, CustomEvent, window */

/**
 * Generic implementation that updates content of the element when dynamic content is loaded. Used
 * e.g. to update the pagination and the main results section.
 * Uses the endpoint from arguments and appends the query string from the request that is made.
 */
export default class ContentUpdater extends HTMLElement {
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
        this.dispatchEvent(new CustomEvent('addDynamicContentHandler', {
            bubbles: true,
            detail: {
                updateResponseStatus: this.#updateResponseStatus.bind(this),
                assembleURL: this.#assembleURL.bind(this),
            },
        }));
    }

    #updateResponseStatus(statusUpdate) {
        if (!['loading', 'loaded', 'failed'].includes(statusUpdate.status)) {
            throw new Error(`Expected statusUpdate.status to be one of 'loading', 'loaded' or 'failed', got ${statusUpdate.status} instead.`);
        }
        let content;
        if (statusUpdate.status === 'loaded') content = statusUpdate.content;
        else if (statusUpdate.status === 'failed') content = `ERROR: Status ${statusUpdate.response.status} – ${statusUpdate.content}`;
        this.#updateDOM(statusUpdate.status, content);
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
            } else {
                elements[key].hidden = (key !== status);
            }
        });
        const activeElement = elements[status];
        if (['failed', 'loaded'].includes(status)) activeElement.innerHTML = content;
        // Make sure the active element is visible but only if it's the main content (we don't want
        // to scroll to the pagination *and* the main content at the same time)
        if (this.dataset.isMainContent) {
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
        const url = `${this.#getEndpointURL()}?${searchParams.toString()}`;
        return url;
    }

    static defineCustomElement() {
        if (!customElements.get('content-udpater')) {
            customElements.define('content-updater', ContentUpdater);
        }
    }
}
