/**
 * Web component that receives ordered visible IDs from the orchestrator
 * and updates the DOM accordingly. No data extraction logic.
 */
import { readAttribute } from '@helga-agency/ui-tools';
import { readItemAttribute } from './extractItemData.mjs';

/* global HTMLElement */

export default class FacetedSearchResultUpdater extends HTMLElement {

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
        this.#emptyResultsSelector = readAttribute(this, 'data-empty-results-selector');
        this.#resultsSelector = readAttribute(this, 'data-results-selector');
    }

    connectedCallback() {
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('facetedSearchRegisterResultUpdater', {
                bubbles: true,
                detail: { element: this },
            }));
        });
    }

    disconnectedCallback() {
        this.dispatchEvent(new CustomEvent('facetedSearchUnregisterResultUpdater', {
            bubbles: true,
            detail: { element: this },
        }));
    }

    /** Lazily collects items and builds lookup maps on first access. */
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

        this.#allItems.forEach((el) => {
            const shouldShow = visibleSet.has(this.#reverseMap.get(el));
            // eslint-disable-next-line no-param-reassign
            if (shouldShow && el.hidden) el.hidden = false;
            // eslint-disable-next-line no-param-reassign
            else if (!shouldShow && !el.hidden) el.hidden = true;
        });

        const currentOrder = [...parent.children]
            .filter((el) => !el.hidden)
            .map((el) => this.#reverseMap.get(el));

        const needsReorder = orderedIds.length !== currentOrder.length
            || orderedIds.some((id, index) => id !== currentOrder[index]);

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
     * Only toggles when both selectors are configured.
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
