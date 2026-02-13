/**
 * Web component that wraps server-rendered result items.
 * Reads item data from the DOM for indexing and provides updateVisibility()
 * to show/hide/reorder items based on faceted search results.
 */
import { readAttribute } from '@helga-agency/ui-tools';
import { extractItemData, readItemAttribute } from './extractItemData.mjs';

/* global HTMLElement, CustomEvent */

export default class FacetedSearchResultItems extends HTMLElement {

    /** @type {HTMLElement[]} all item elements in original DOM order */
    #allItems = [];

    /** @type {Map<string, HTMLElement>} id → item element */
    #itemMap = new Map();

    /** @type {Map<HTMLElement, string>} item element → id */
    #reverseMap = new Map();

    /** @type {boolean} */
    #isCollected = false;

    #itemSelector;
    #itemIdSelector;
    #filterProperties;
    #searchProperties;
    #emptyResultsSelector;
    #resultsSelector;

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
        this.#emptyResultsSelector = readAttribute(this, 'data-empty-results-selector');
        this.#resultsSelector = readAttribute(this, 'data-results-selector');
    }

    connectedCallback() {
        /* Delay registration so the parent orchestrator has time to set up
           its listeners, even if this component's JS loads first. */
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('registerResultItems', {
                bubbles: true,
                detail: { element: this },
            }));
        });
    }

    /**
     * Lazily collects items from the DOM on first access.
     * Deferred because children may not be available in connectedCallback.
     */
    #ensureCollected() {
        if (this.#isCollected) return;
        this.#isCollected = true;

        this.#allItems = [...this.querySelectorAll(this.#itemSelector)];
        this.#allItems.forEach((item) => {
            const id = readItemAttribute(item, this.#itemIdSelector);
            if (id) {
                this.#itemMap.set(id, item);
                this.#reverseMap.set(item, id);
            }
        });
    }

    /**
     * Returns item data for building search/filter indexes.
     * Called by the orchestrator during initialization.
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

    /**
     * Shows/hides items and reorders DOM nodes to match the given ID order.
     * Minimizes DOM mutations: only toggles display when it changes, only
     * reorders when the visible sequence actually differs.
     * @param {string[]} orderedIds
     */
    updateVisibility(orderedIds) {
        this.#ensureCollected();

        const parent = this.#allItems[0]?.parentNode;
        if (!parent) return;

        const visibleSet = new Set(orderedIds);

        // Only toggle hidden on items whose visibility actually changes
        this.#allItems.forEach((item) => {
            const shouldShow = visibleSet.has(this.#reverseMap.get(item));
            if (shouldShow && item.hidden) item.hidden = false;
            else if (!shouldShow && !item.hidden) item.hidden = true;
        });

        // Only reorder if the current DOM order of visible items differs
        const currentOrder = [...parent.children]
            .filter((el) => !el.hidden)
            .map((el) => this.#reverseMap.get(el));

        const needsReorder = orderedIds.length !== currentOrder.length
            || orderedIds.some((id, i) => id !== currentOrder[i]);

        if (needsReorder) {
            orderedIds.forEach((id) => {
                const item = this.#itemMap.get(id);
                if (item) parent.appendChild(item);
            });
        }

        this.#toggleEmptyState(orderedIds.length > 0);
    }

    /**
     * Shows or hides the "no results" message and the results wrapper.
     * Only toggles when both selectors are configured; with just one,
     * we could not reliably revert to the original state.
     * @param {boolean} hasResults
     */
    #toggleEmptyState(hasResults) {
        if (!this.#emptyResultsSelector || !this.#resultsSelector) return;

        const emptyEl = this.querySelector(this.#emptyResultsSelector);
        const resultsEl = this.querySelector(this.#resultsSelector);
        if (emptyEl) emptyEl.hidden = hasResults;
        if (resultsEl) resultsEl.hidden = !hasResults;
    }
}
