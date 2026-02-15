/**
 * Web component that wraps server-rendered filter value items.
 * Reads filter values from DOM, emits change events on input toggle,
 * and updates expected result counts. Supports both checkbox (multi-select)
 * and radio (single-select) inputs, detected automatically.
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
    #propagateToUrl;

    /** @type {FilterValueItem[]} */
    #items = [];

    /** @type {boolean} */
    #isCollected = false;

    /** @type {boolean} Derived from the first item's input type during collection */
    #selectOneOnly = false;

    /** @type {string|null} Tracks the active value for single-select filters;
     *  needed because browsers don't fire change on the deselected radio. */
    #activeValue = null;

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
        this.#propagateToUrl = readAttribute(this, 'data-propagate-to-url', {
            transform: (value) => value !== null,
        });
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

    disconnectedCallback() {
        this.dispatchEvent(new CustomEvent('unregisterFilterValues', {
            bubbles: true,
            detail: { element: this },
        }));
    }

    /** Lazily collects items and binds input listeners. */
    #ensureCollected() {
        if (this.#isCollected) return;
        this.#isCollected = true;

        const config = {
            idSelector: this.#itemIdSelector,
            valueSelector: this.#itemValueSelector,
            amountSelector: this.#itemAmountSelector,
        };

        const onChange = ({ value, selected }) => {
            this.#handleChange(value, selected);
        };

        this.#items = [...this.querySelectorAll(this.#itemSelector)]
            .map((el) => new FilterValueItem(el, config, onChange));

        this.#selectOneOnly = this.#items.length > 0 && this.#items[0].isRadio;
    }

    /**
     * Handles an input change. When selectOneOnly is true, emits a deselect
     * for the previously checked item before emitting the new selection.
     * @param {string} value
     * @param {boolean} selected
     */
    #handleChange(value, selected) {
        if (this.#selectOneOnly && selected && this.#activeValue !== null && this.#activeValue !== value) {
            this.#dispatch(this.#activeValue, false);
        }

        if (this.#selectOneOnly) {
            this.#activeValue = selected ? value : null;
        }

        this.#dispatch(value, selected);
    }

    /**
     * @param {string} value
     * @param {boolean} selected
     */
    #dispatch(value, selected) {
        this.dispatchEvent(new CustomEvent('facetedSearchFilterChange', {
            bubbles: true,
            detail: { name: this.#filterName, value, selected },
        }));
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
     * Sets input state programmatically (used by orchestrator for URL restore).
     * When selectOneOnly is true, deselects the previously checked item.
     * @param {string} value - The filter value to select
     * @param {boolean} selected
     */
    setChecked(value, selected) {
        this.#ensureCollected();

        if (this.#selectOneOnly) {
            this.#activeValue = selected ? value : null;
        }

        const item = this.#items.find((entry) => entry.value === value);
        if (item) item.setChecked(selected);
    }

    /** @returns {boolean} */
    get propagateToUrl() {
        return this.#propagateToUrl;
    }
}
