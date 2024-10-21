/* global customElements, CustomEvent, window */

/**
 * 
 */
export default class LinkHandler extends HTMLElement {
    connectedCallback() {
        this.#addClickListener();
    }

    #addClickListener() {
        this.addEventListener('click', this.#handleClick.bind(this));
    }

    #handleClick(event) {
        console.log('do load', event.target.href, event.target);
        // If a span is nested within an a, the click target will be the span, not the a; get
        // the closest parent that contains a href attribute.
        const closestHref = event.target.closest('[href]');
        // Clicked element is not a link: Ignore it.
        if (closestHref === null) return false;
        // Make sure to only prevent the event's default handlers if the user clicked a href.
        event.preventDefault();
        const { search: queryString } = new URL(closestHref.href, window.location.origin);
        console.log('qs', queryString);
        this.dispatchEvent(new CustomEvent('loadContent', {
            bubbles: true,
            detail: {
                requestConfiguration: {
                    queryString,
                    // TODO! Would help with infinite scrolling.
                    mode: 'append',
                },
            },
        }));
        console.log('load event dispatched');
        return true;
    }

    static defineCustomElement() {
        if (!customElements.get('link-handler')) {
            customElements.define('link-handler', LinkHandler);
        }
    }
}

