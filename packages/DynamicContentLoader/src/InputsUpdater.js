/* global HTMLElement, customElements, CustomEvent */

/**
 * When the filters are reset, all fragments containing input elements should be reset to their
 * original state in order to make all checked checkboxes, input values etc. go away.
 * We cannot rely on an empty searchParam object, because the results might be pre-filtered (and
 * when it is, the pre-filters are the searchParam).
 * There are no unit tests for this class as it is super Drupal-specific.
 */
export default class InputsUpdater extends HTMLElement {
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
                // There's nothing to do once the response arrives
                updateResponseStatus: this.#updateResponseStatus.bind(this),
                getRequestConfig: this.#getRequestConfig.bind(this),
            },
        }));
    }

    #updateResponseStatus(statusUpdate) {
        if (statusUpdate.status !== 'loaded') return;
        let filterData;
        // The server returns a JSON-stringified object with the filter name as key and the
        // original/reset HTML as value.
        try {
            filterData = JSON.parse(statusUpdate.content);
        } catch (error) {
            throw new Error(`Expected filter API endpoint to return stringified JSON, got ${statusUpdate.content} instead`);
        }
        if (typeof filterData !== 'object' || filterData === null) {
            throw new Error(`Expected filter API endpoint to return an object, got ${JSON.stringify(typeof filterData)} instead.`);
        }
        Object.entries(filterData).forEach(([key, value]) => {
            // As per agreement, the selector is a class that starts with .form-item- and then
            // uses the object key with underscores replaced by hyphens.
            this.#replaceContent(`.form-item-${key.replace(/_/g, '-')}`, value);
        });
    }

    /**
     * Replaces the content of the element that matches selector with content
     * @param {string} selector
     * @param {string} content
     */
    #replaceContent(selector, content) {
        const wrapper = this.querySelector(selector);
        if (wrapper === null) {
            console.warn(`Element with selector ${selector} not found within %o; cannot reset its content`, this);
            return;
        }
        wrapper.innerHTML = content;
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

    #getRequestConfig({ searchParams, reset }) {
        // Reset everything. Only do it if a reset is explicitly requested by the user. Why? We
        // could update the DOM at any time, but but dropdowns would be closed, checkboxes would
        // lose focus etc. Let's try to change as little as necessary to hide the fact that
        // things are updated from the user. A reset is necessary, though, if all filters are
        // being reset by the user (by clicking «Reset filters», e.g.); in that case, all values
        // in the inputs must be cleared.
        return { url: reset ? `${this.#getEndpoint()}?${searchParams.toString()}` : null };
    }

    static defineCustomElement() {
        if (!customElements.get('inputs-udpater')) {
            customElements.define('inputs-updater', InputsUpdater);
        }
    }
}
