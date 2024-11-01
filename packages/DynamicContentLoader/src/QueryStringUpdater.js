/* global HTMLElement, customElements, CustomEvent, history */

/**
 * Updates the current location's query parameters to match the current filters.
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
