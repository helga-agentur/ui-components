/**
 * Web component that reads server-rendered result items from the DOM and
 * provides structured data to the orchestrator. No visibility logic.
 */
import { readAttribute } from '@helga-agency/ui-tools';
import { extractItemData } from './extractItemData.mjs';

/* global HTMLElement, window */

export default class FacetedSearchResultReader extends HTMLElement {

    /** @type {HTMLElement[]} all item elements in original DOM order */
    #allItems = [];

    /** @type {boolean} */
    #isCollected = false;

    #itemSelector;
    #itemIdSelector;
    #filterProperties;
    #searchProperties;

    constructor() {
        super();
        this.#itemSelector = readAttribute(this, 'data-item-selector', {
            validate: (value) => !!value,
            expectation: 'a non-empty selector string',
        });
        this.#itemIdSelector = readAttribute(this, 'data-item-id-selector', {
            validate: (value) => !!value,
            expectation: 'a non-empty attribute selector string',
        });
        this.#filterProperties = readAttribute(this, 'data-filter-properties', {
            transform: (value) => (value ? JSON.parse(value) : []),
        });
        this.#searchProperties = readAttribute(this, 'data-search-properties', {
            transform: (value) => (value ? JSON.parse(value) : []),
        });
    }

    connectedCallback() {
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('facetedSearchRegisterResultReader', {
                bubbles: true,
                detail: { element: this },
            }));
        });
    }

    disconnectedCallback() {
        this.dispatchEvent(new CustomEvent('facetedSearchUnregisterResultReader', {
            bubbles: true,
            detail: { element: this },
        }));
    }

    /** Lazily collects items from the DOM on first access. */
    #ensureCollected() {
        if (this.#isCollected) return;
        this.#isCollected = true;
        this.#allItems = [...this.querySelectorAll(this.#itemSelector)];
    }

    /**
     * Returns item data for building search/filter indexes.
     * @returns {Array<{ id: string, filterFields: object, searchFields: object }>}
     */
    getItemData() {
        this.#ensureCollected();
        const config = {
            itemIdSelector: this.#itemIdSelector,
            filterProperties: this.#filterProperties,
            searchProperties: this.#searchProperties,
        };
        return this.#allItems
            .map((item) => extractItemData(item, config))
            .filter((item) => item.id);
    }

    static defineElement() {
        if (!window.customElements.get('faceted-search-result-reader')) {
            window.customElements.define('faceted-search-result-reader', FacetedSearchResultReader);
        }
    }
}
