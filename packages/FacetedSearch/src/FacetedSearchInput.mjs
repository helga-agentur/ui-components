/**
 * Web component that wraps a search input element.
 * Emits facetedSearchTermChange on Enter or on input (if live search is enabled).
 * Provides setSearchTerm() for programmatic value setting by the orchestrator.
 */
import { readAttribute, debounce } from '@helga-agency/ui-tools';

/* global HTMLElement, window */

const defaultDebounceDelay = 0;

export default class FacetedSearchInput extends HTMLElement {

    #liveSearch;
    #debounceDelay;
    #propagateToUrl;

    /** @type {HTMLInputElement|null} */
    #input = null;

    constructor() {
        super();
        this.#liveSearch = readAttribute(this, 'data-live-search', {
            transform: (value) => value !== null,
        });
        this.#debounceDelay = readAttribute(this, 'data-debounce', {
            transform: (value) => (value !== null ? parseInt(value, 10) : defaultDebounceDelay),
        });
        this.#propagateToUrl = readAttribute(this, 'data-propagate-to-url', {
            transform: (value) => value !== null,
        });
    }

    connectedCallback() {
        this.#input = this.querySelector('input');
        if (!this.#input) return;

        if (this.#liveSearch) {
            const debouncedEmit = debounce(
                () => this.#emitTerm(),
                this.#debounceDelay,
            );
            this.#input.addEventListener('input', debouncedEmit);
        } else {
            this.#input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.#emitTerm();
                }
            });
        }

        /* Delay registration so the parent orchestrator has time to set up
           its listeners, even if this component's JS loads first. */
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('facetedSearchRegisterSearchInput', {
                bubbles: true,
                detail: { element: this },
            }));
        });
    }

    disconnectedCallback() {
        this.dispatchEvent(new CustomEvent('facetedSearchUnregisterSearchInput', {
            bubbles: true,
            detail: { element: this },
        }));
    }

    #emitTerm() {
        this.dispatchEvent(new CustomEvent('facetedSearchTermChange', {
            bubbles: true,
            detail: { term: this.#input.value },
        }));
    }

    /**
     * Sets the input value programmatically without emitting an event.
     * @param {string} term
     */
    setSearchTerm(term) {
        if (this.#input) this.#input.value = term;
    }

    /** @returns {boolean} */
    get propagateToUrl() {
        return this.#propagateToUrl;
    }

    static defineElement() {
        if (!window.customElements.get('faceted-search-input')) {
            window.customElements.define('faceted-search-input', FacetedSearchInput);
        }
    }
}
