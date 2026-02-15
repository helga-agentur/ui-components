(function () {
    'use strict';

    /**
     * Reads, transforms and validates an attribute from an HTML element.
     */
    var readAttribute = (
        element,
        attributeName,
        {
            transform = (value) => value,
            validate = () => true,
            expectation = '(expectation not provided)',
        } = {},
    ) => {
        const value = element.getAttribute(attributeName);
        const transformedValue = transform(value);
        if (!validate(transformedValue)) {
            throw new Error(`Expected attribute ${attributeName} of element ${element.outerHTML} to be ${expectation}; got ${transformedValue} instead (${value} before the transform function was applied).`);
        }
        return transformedValue;
    };

    /**
     * Extracts filter and search field data from a single result item element.
     * Pure function, no side effects.
     */

    /**
     * Extracts the attribute name from a selector like '[data-id]'.
     * @param {string} selector
     * @returns {string}
     */
    const extractAttributeName = (selector) => {
        const match = selector.match(/\[([^\]]+)\]/);
        return match ? match[1] : selector;
    };

    /**
     * Reads an attribute value from an element. If the element itself matches
     * the attribute selector, reads from it directly; otherwise queries a child.
     * @param {HTMLElement} element
     * @param {string} selector - Attribute selector like '[data-id]'
     * @returns {string|null}
     */
    const readItemAttribute = (element, selector) => {
        const attributeName = extractAttributeName(selector);
        if (element.matches(selector)) return element.getAttribute(attributeName);
        const child = element.querySelector(selector);
        return child ? child.getAttribute(attributeName) : null;
    };

    /**
     * Represents a single filter value item. Caches DOM references on construction,
     * binds checkbox listener, and exposes methods for updating count, toggling
     * empty class, and setting checkbox state.
     * Not a web component — instantiated by FacetedSearchFilterValues.
     */

    class FilterValueItem {

        /** @type {HTMLElement} */
        #element;

        /** @type {string} */
        #id;

        /** @type {string} */
        #value;

        /** @type {HTMLInputElement|null} */
        #checkbox;

        /** @type {HTMLElement|null} */
        #countElement;

        /**
         * @param {HTMLElement} element - The filter value DOM element
         * @param {object} config
         * @param {string} config.idSelector - Attribute selector for the item's ID
         * @param {string} config.valueSelector - Attribute selector for the item's value
         * @param {string|null} config.amountSelector - Selector for the count element
         * @param {(detail: { value: string, selected: boolean }) => void} onChange
         */
        constructor(element, { idSelector, valueSelector, amountSelector }, onChange) {
            this.#element = element;
            this.#id = readItemAttribute(element, idSelector);
            this.#value = readItemAttribute(element, valueSelector);
            this.#checkbox = element.querySelector('input[type="checkbox"]');
            this.#countElement = amountSelector
                ? element.querySelector(amountSelector)
                : null;

            if (this.#checkbox) {
                this.#checkbox.addEventListener('change', () => {
                    onChange({ value: this.#value, selected: this.#checkbox.checked });
                });
            }
        }

        get id() { return this.#id; }
        get value() { return this.#value; }
        get element() { return this.#element; }

        /**
         * Updates the displayed count and toggles the empty-result class.
         * @param {number} count
         * @param {string|null} emptyClass - CSS class to apply when count is 0
         */
        updateCount(count, emptyClass) {
            if (this.#countElement) this.#countElement.textContent = String(count);
            if (emptyClass) this.#element.classList.toggle(emptyClass, count === 0);
        }

        /** @param {boolean} selected */
        setChecked(selected) {
            if (this.#checkbox) this.#checkbox.checked = selected;
        }
    }

    /**
     * Web component that wraps server-rendered filter value items.
     * Reads filter values from DOM, emits change events on checkbox toggle,
     * and updates expected result counts.
     */

    /* global HTMLElement, CustomEvent */

    class FacetedSearchFilterValues extends HTMLElement {

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

        /** @returns {boolean} */
        get propagateToUrl() {
            return this.#propagateToUrl;
        }
    }

    /* global window */
    if (!window.customElements.get('faceted-search-filter-values')) {
        window.customElements.define('faceted-search-filter-values', FacetedSearchFilterValues);
    }

})();
