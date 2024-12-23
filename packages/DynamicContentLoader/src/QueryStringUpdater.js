/* global HTMLElement, customElements, history */

/**
 * Updates the current location's query parameters to match the current filters.
 * Allows to ignore certain parameters that may be requested but should not be pushed to the URL.
 * @attribute data-ignore-parameters - Comma-separated list of parameters to *not* forward to the
 * current page's URL.
 */
export default class QueryStringUpdater extends HTMLElement {
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
                getRequestConfig: this.#updateResponseStatus.bind(this),
            },
        }));
    }

    #getSearchParamsToIgnore() {
        return this.dataset.ignoreParameters?.split(/\s*,\s*/) || [];
    }

    #updateResponseStatus({ searchParams }) {
        const clonedParameters = new URLSearchParams(searchParams);
        const ignoredParameters = this.#getSearchParamsToIgnore();
        ignoredParameters.forEach((ignoredParameter) => {
            clonedParameters.delete(ignoredParameter);
        });
        // eslint-disable-next-line no-restricted-globals
        history.pushState(null, '', `?${clonedParameters.toString()}`);
        // Dont' fetch anything
        return { url: null };
    }

    static defineCustomElement() {
        if (!customElements.get('query-string-updater')) {
            customElements.define('query-string-updater', QueryStringUpdater);
        }
    }
}
