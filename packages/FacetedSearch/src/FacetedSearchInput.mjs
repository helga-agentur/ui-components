/**
 * Web component that wraps a search input element.
 * Emits facetedSearchTermChange on Enter or on input (if live search is enabled).
 * Provides setSearchTerm() for programmatic value setting (URL restore).
 */
import { readAttribute } from '@helga-agency/ui-tools';
import { debounce } from '@helga-agency/ui-tools';

/* global HTMLElement, CustomEvent */

const defaultDebounceDelay = 0;

export default class FacetedSearchInput extends HTMLElement {

    #liveSearch;
    #debounceDelay;

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
            this.dispatchEvent(new CustomEvent('registerSearchInput', {
                bubbles: true,
                detail: { element: this },
            }));
        });
    }

    #emitTerm() {
        this.dispatchEvent(new CustomEvent('facetedSearchTermChange', {
            bubbles: true,
            detail: { term: this.#input.value },
        }));
    }

    /**
     * Sets the input value programmatically (used by orchestrator for URL restore).
     * Does not emit an event.
     * @param {string} term
     */
    setSearchTerm(term) {
        if (this.#input) this.#input.value = term;
    }
}
