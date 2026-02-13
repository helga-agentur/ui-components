/**
 * Web component that wraps server-rendered filter value items.
 * Reads filter values from DOM, emits change events on checkbox toggle,
 * and updates expected result counts.
 */
import { readAttribute } from '@helga-agency/ui-tools';
import FilterValueItem from './FilterValueItem.mjs';

/* global HTMLElement, CustomEvent */

export default class FacetedSearchFilterValues extends HTMLElement {

    #filterName;
    #itemSelector;
    #itemValueSelector;
    #itemIdSelector;
    #leadsToEmptyResultClass;
    #itemAmountSelector;

    /** @type {FilterValueItem[]} */
    #items = [];

    /** @type {boolean} */
    #isCollected = false;

    constructor() {
        super();
        this.#filterName = readAttribute(this, 'data-filter-name', {
            validate: (value) => !!value,
            expectation: 'a non-empty filter name',
        });
        this.#itemSelector = readAttribute(this, 'data-item-selector', {
            validate: (value) => !!value,
            expectation: 'a non-empty selector string',
        });
        this.#itemValueSelector = readAttribute(this, 'data-item-value-selector', {
            validate: (value) => !!value,
            expectation: 'a non-empty attribute selector string',
        });
        this.#itemIdSelector = readAttribute(this, 'data-item-id-selector', {
            validate: (value) => !!value,
            expectation: 'a non-empty attribute selector string',
        });
        this.#leadsToEmptyResultClass = readAttribute(
            this,
            'data-leads-to-empty-result-class',
        );
        this.#itemAmountSelector = readAttribute(
            this,
            'data-item-amount-selector',
        );
    }

    connectedCallback() {
        /* Delay registration so the parent orchestrator has time to set up
           its listeners, even if this component's JS loads first. */
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('registerFilterValues', {
                bubbles: true,
                detail: { element: this },
            }));
        });
    }

    /** Lazily collects items and binds checkbox listeners. */
    #ensureCollected() {
        if (this.#isCollected) return;
        this.#isCollected = true;

        const config = {
            idSelector: this.#itemIdSelector,
            valueSelector: this.#itemValueSelector,
            amountSelector: this.#itemAmountSelector,
        };

        const onChange = ({ value, selected }) => {
            this.dispatchEvent(new CustomEvent('facetedSearchFilterChange', {
                bubbles: true,
                detail: { name: this.#filterName, value, selected },
            }));
        };

        this.#items = [...this.querySelectorAll(this.#itemSelector)]
            .map((el) => new FilterValueItem(el, config, onChange));
    }

    /**
     * Returns filter metadata for the orchestrator.
     * @returns {{ name: string, values: Array<{ id: string, value: string }> }}
     */
    getFilterData() {
        this.#ensureCollected();
        const values = this.#items
            .filter((item) => item.id && item.value)
            .map((item) => ({ id: item.id, value: item.value }));
        return { name: this.#filterName, values };
    }

    /**
     * Updates displayed counts and applies empty-result class.
     * @param {{ [valueId: string]: number }} counts
     */
    updateExpectedResults(counts) {
        this.#ensureCollected();
        this.#items.forEach((item) => {
            if (!(item.id in counts)) return;
            item.updateCount(counts[item.id], this.#leadsToEmptyResultClass);
        });
    }

    /**
     * Sets checkbox state programmatically (used by orchestrator for URL restore).
     * @param {string} value - The filter value to select
     * @param {boolean} selected
     */
    setChecked(value, selected) {
        this.#ensureCollected();
        const item = this.#items.find((entry) => entry.value === value);
        if (item) item.setChecked(selected);
    }
}
