/* global customElements, CustomEvent, window, HTMLElement */

/**
 * Element that listens to clicks and dispatches a loadDynamicContent event (which will be handled
 * by the DynamicContentOrchestrator).
 */
export default class LinkListener extends HTMLElement {
    connectedCallback() {
        this.#addClickListener();
    }

    #addClickListener() {
        this.addEventListener('click', this.#handleClick.bind(this));
    }

    #isResetButton() {
        return this.hasAttribute('data-reset');
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
                    reset: this.#isResetButton(),
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
