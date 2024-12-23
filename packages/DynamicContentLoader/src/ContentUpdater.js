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
        this.dispatchEvent(new CustomEvent('addDynamicContentUpdater', {
            bubbles: true,
            detail: {
                updateResponseStatus: this.#updateResponseStatus.bind(this),
                getRequestConfig: this.#getRequestConfig.bind(this),
            },
        }));
    }

    #updateResponseStatus({ status, content, response, data }) {
        if (!['loading', 'loaded', 'failed'].includes(status)) {
            throw new Error(`Expected statusUpdate.status to be one of 'loading', 'loaded' or 'failed', got ${status} instead.`);
        }
        let finalContent;
        if (status === 'loaded') finalContent = content;
        else if (status === 'failed') finalContent = `ERROR: Status ${response.status} – ${content}`;
        this.#updateDOM(status, finalContent, data);
    }

    #isMainContent() {
        return this.hasAttribute('data-is-main-content');
    }

    /**
     * Takes care of all DOM updates
     * @param {string} status - valid values are 'loading', 'loaded' and 'failed'
     * @param {string?} content - HTML content to set; empty when status is 'loading'
     */
    #updateDOM(status, content, data) {
        const elements = {
            loading: this.querySelector('[data-loading]'),
            failed: this.querySelector('[data-error]'),
            loaded: this.querySelector('[data-content]'),
        };
        // Validate elements and update their visibility
        Object.keys(elements).forEach((key) => {
            if (!elements[key]) {
                throw (new Error(`Make sure that the ContentUpdater has three children with the following data attributes: data-loading, data-error and data-content; missing element to display status "${status}".`));
            }
            // Hide all elements that don't match the current status, *except* if the status is
            // loading and the action is 'paginateAppend': In that case, the loading indicator
            // should be displayed below the regular content.
            const forceShow = status === 'loading' && data?.action === 'paginateAppend';
            elements[key].hidden = (key !== status && !forceShow);
        });
        const activeElement = elements[status];
        // Only append content if the user paginates accordingly *and* it's the main content block.
        // In all other cases, replace the content – except when the status is 'loading'.
        const appendContentOnLoad = (data?.action === 'paginateAppend' && this.#isMainContent());
        const appendContent = status === 'loaded' && appendContentOnLoad;
        const replaceContent = (status === 'failed') || (status === 'loaded' && !appendContent);
        if (replaceContent) activeElement.innerHTML = content;
        else if (appendContent) activeElement.insertAdjacentHTML('beforeend', content);
        this.dispatchEvent(new CustomEvent('contentUpdate', {
            bubbles: true,
            detail: {
                status,
            },
        }));
        // Make sure the active element is visible but *only* if it's the main content (we don't
        // want to scroll to the pagination *and* the main content at the same time).
        // Only scroll if a user paginated and new page is not appended, but replaced. Don't scroll
        // when the user changes filters.
        if (this.#isMainContent() && data?.action === 'paginateReplace') {
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

    #getRequestConfig({ searchParams, action }) {
        return {
            url: `${this.#getEndpointURL()}?${searchParams.toString()}`,
            // Pass action to the request so that we can handle the data according to the event
            // that initiated the request once we get it.
            data: { action },
        };
    }

    static defineCustomElement() {
        if (!customElements.get('content-udpater')) {
            customElements.define('content-updater', ContentUpdater);
        }
    }
}
