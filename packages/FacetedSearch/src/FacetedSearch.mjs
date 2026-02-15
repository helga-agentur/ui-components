/**
 * Orchestrator web component for faceted search. Manages child registration,
 * enforces constraints, creates the model from child data, delegates updates
 * between model and children, and restores state from URL hash.
 */
import { readAttribute } from '@helga-agency/ui-tools';
import FacetedSearchModel from './FacetedSearchModel.mjs';
import { readHash } from './hashSync.mjs';

/* global HTMLElement */

export default class FacetedSearch extends HTMLElement {

    /** @type {object|null} FacetedSearchInput component */
    #searchComponent = null;

    /** @type {object[]} FacetedSearchFilterValues components */
    #filterComponents = [];

    /** @type {object|null} FacetedSearchResultItems component */
    #resultItemsComponent = null;

    /** @type {FacetedSearchModel|null} */
    #model = null;

    /** @type {boolean} */
    #fuzzy;

    /** @type {boolean} */
    #orderByRelevance;

    constructor() {
        super();
        this.#fuzzy = readAttribute(this, 'data-fuzzy-search', {
            transform: (value) => value !== null,
        });
        this.#orderByRelevance = readAttribute(this, 'data-order-by-relevance', {
            transform: (value) => value !== null,
        });
    }

    connectedCallback() {
        this.addEventListener('registerSearchInput', (ev) => {
            this.#registerSearchInput(ev.detail?.element);
        });
        this.addEventListener('registerFilterValues', (ev) => {
            this.#registerFilterValues(ev.detail?.element);
        });
        this.addEventListener('registerResultItems', (ev) => {
            this.#registerResultItems(ev.detail?.element);
        });
        this.addEventListener('facetedSearchTermChange', (ev) => {
            this.#handleSearchTermChange(ev.detail.term);
        });
        this.addEventListener('facetedSearchFilterChange', (ev) => {
            const { name, value, selected } = ev.detail;
            this.#handleFilterChange(name, value, selected);
        });
    }

    /** @param {object} component */
    #registerSearchInput(component) {
        if (!component) throw new Error('FacetedSearch: registerSearchInput requires detail.element.');
        this.#searchComponent = component;
        this.#buildModel();
    }

    /** @param {object} component */
    #registerFilterValues(component) {
        if (!component) throw new Error('FacetedSearch: registerFilterValues requires detail.element.');
        const data = component.getFilterData();
        const duplicate = this.#filterComponents.find(
            (existing) => existing.getFilterData().name === data.name,
        );
        if (duplicate) {
            throw new Error(`FacetedSearch: Duplicate filter name "${data.name}".`);
        }
        this.#filterComponents.push(component);
        this.#buildModel();
    }

    /** @param {object} component */
    #registerResultItems(component) {
        if (!component) throw new Error('FacetedSearch: registerResultItems requires detail.element.');
        this.#resultItemsComponent = component;
        this.#buildModel();
    }

    /**
     * (Re)builds the model from the currently registered components.
     * Called after every child registration; requires result-items to be
     * present, search input and filters are optional. Rebuilds the model
     * each time so that late-registering components are included.
     */
    #buildModel() {
        if (!this.#resultItemsComponent) return;

        const items = this.#resultItemsComponent.getItemData();

        // Derive filter and search configs from the collected item data
        const filterConfigs = this.#filterComponents.map(
            (component) => ({ name: component.getFilterData().name }),
        );
        const searchConfigs = items.length > 0
            ? Object.keys(items[0].searchFields).map((field) => ({ field }))
            : [];

        this.#model = new FacetedSearchModel({
            items,
            filterConfigs,
            searchConfigs,
            fuzzy: this.#fuzzy,
            orderByRelevance: this.#orderByRelevance,
        });

        this.#model.on('change', () => this.#updateChildren());

        // Restore any state encoded in the URL hash before rendering
        this.#restoreFromHash();
        this.#updateChildren();
    }

    /** @param {string} term */
    #handleSearchTermChange(term) {
        if (!this.#model) return;
        this.#model.setSearchTerm(term);
    }

    /**
     * @param {string} name
     * @param {string} value
     * @param {boolean} selected
     */
    #handleFilterChange(name, value, selected) {
        if (!this.#model) return;
        this.#model.setFilter(name, value, selected);
    }

    /** Pushes current model state to all child components. */
    #updateChildren() {
        const visibleIds = this.#model.getVisibleIds();
        this.#resultItemsComponent.updateVisibility(visibleIds);

        this.#filterComponents.forEach((component) => {
            const filterData = component.getFilterData();
            const counts = this.#model.getExpectedResults(
                filterData.name,
                filterData.values,
            );
            component.updateExpectedResults(counts);
        });
    }

    /** Restores state from the current URL hash. */
    #restoreFromHash() {
        const hashData = readHash(typeof location !== 'undefined' ? location.hash : '');

        if (hashData.search) {
            const term = hashData.search[0];
            this.#model.setSearchTerm(term);
            if (this.#searchComponent) this.#searchComponent.setSearchTerm(term);
        }

        this.#filterComponents.forEach((component) => {
            const filterData = component.getFilterData();
            const values = hashData[filterData.name];
            if (!values) return;
            values.forEach((value) => {
                component.setChecked(value, true);
                this.#model.setFilter(filterData.name, value, true);
            });
        });
    }
}
