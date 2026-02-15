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
     * Extracts structured data from a single result item DOM element.
     * @param {HTMLElement} item
     * @param {object} config
     * @param {string} config.itemIdSelector - Attribute selector for the item's ID
     * @param {object[]} config.filterProperties - [{ fieldIDSelector, filterName, valueSeparator }]
     * @param {object[]} config.searchProperties - [{ fieldIDSelector }]
     * @returns {{ id: string|null, filterFields: object, searchFields: object }}
     */
    const extractItemData = (item, { itemIdSelector, filterProperties, searchProperties }) => {
        const id = readItemAttribute(item, itemIdSelector);

        const filterFields = {};
        filterProperties.forEach(({ fieldIDSelector, filterName, valueSeparator }) => {
            const rawValue = readItemAttribute(item, fieldIDSelector);
            if (!rawValue) {
                filterFields[filterName] = [];
                return;
            }
            filterFields[filterName] = valueSeparator
                ? rawValue.split(valueSeparator).map((part) => part.trim()).filter(Boolean)
                : [rawValue];
        });

        const searchFields = {};
        searchProperties.forEach(({ fieldIDSelector }) => {
            const fieldName = extractAttributeName(fieldIDSelector);
            const rawValue = readItemAttribute(item, fieldIDSelector);
            searchFields[fieldName] = rawValue || '';
        });

        return { id, filterFields, searchFields };
    };

    /**
     * Web component that reads server-rendered result items from the DOM and
     * provides structured data to the orchestrator. No visibility logic.
     */

    /* global HTMLElement, CustomEvent */

    class FacetedSearchResultReader extends HTMLElement {

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
    }

    /* global window */
    if (!window.customElements.get('faceted-search-result-reader')) {
        window.customElements.define('faceted-search-result-reader', FacetedSearchResultReader);
    }

})();
