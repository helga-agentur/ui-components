/**
 * Orchestrator web component for faceted search. Manages child registration,
 * enforces constraints, creates the model from child data, delegates updates
 * between model and children, and restores state from URL hash.
 */
import { readAttribute } from '@helga-agency/ui-tools';
import FacetedSearchModel from './FacetedSearchModel.mjs';
import { readHash, writeHashKey, removeHashKey } from './hashSync.mjs';

/* global HTMLElement, window */

export default class FacetedSearch extends HTMLElement {

    /** @type {object|null} FacetedSearchInput component */
    #searchComponent = null;

    /** @type {object[]} FacetedSearchFilterValues components */
    #filterComponents = [];

    /** @type {object|null} FacetedSearchResultReader component */
    #readerComponent = null;

    /** @type {object[]} Updater components (e.g. result-updater, results-amount) */
    #updaterComponents = [];

    /** @type {FacetedSearchModel|null} */
    #model = null;

    /** @type {boolean} */
    #fuzzy;

    /** @type {boolean} */
    #orderByRelevance;

    /** @type {string|null} URL of a remote GET search endpoint, replacing local MiniSearch */
    #searchGetEndpoint;

    /** @type {string} name of the query parameter the search term is sent as */
    #searchGetParam;

    /** @type {string} most recent search term, to drop stale remote resolutions */
    #latestSearchTerm = '';

    /** @type {boolean} whether the last remote search request failed */
    #searchError = false;

    constructor() {
        super();
        this.#fuzzy = readAttribute(this, 'data-fuzzy-search', {
            transform: (value) => value !== null,
        });
        this.#orderByRelevance = readAttribute(this, 'data-order-by-relevance', {
            transform: (value) => value !== null,
        });
        this.#searchGetEndpoint = readAttribute(this, 'data-search-get-endpoint');
        this.#searchGetParam = readAttribute(this, 'data-search-get-param', {
            transform: (value) => value || 'q',
        });
    }

    connectedCallback() {
        this.#listenForRegistration('facetedSearchRegisterSearchInput', this.#registerSearchInput);
        this.#listenForRegistration(
            'facetedSearchRegisterFilterValues',
            this.#registerFilterValues,
        );
        this.#listenForRegistration('facetedSearchRegisterResultReader', this.#registerReader);
        this.#listenForRegistration('facetedSearchRegisterResultUpdater', this.#registerUpdater);

        this.addEventListener('facetedSearchTermChange', (ev) => {
            this.#handleSearchTermChange(ev.detail.term);
        });
        this.addEventListener('facetedSearchFilterChange', (ev) => {
            const { name, value, selected } = ev.detail;
            this.#handleFilterChange(name, value, selected);
        });
    }

    /**
     * Registers a listener for a child registration event,
     * extracting the component reference from `detail.element`.
     * @param {string} eventName
     * @param {Function} handler
     */
    #listenForRegistration(eventName, handler) {
        this.addEventListener(eventName, (ev) => {
            handler.call(this, ev.detail?.element);
        });
    }

    /**
     * Listens for an unregister event directly on the child element.
     * This avoids relying on event bubbling, which fails in
     * disconnectedCallback because the element is already detached.
     * Falls back to a bubbling listener on this orchestrator when
     * the component is not a real DOM element (e.g. in unit tests).
     * @param {HTMLElement} component
     * @param {string} eventName
     * @param {Function} handler
     */
    #listenForUnregister(component, eventName, handler) {
        const target = typeof component.addEventListener === 'function'
            ? component
            : this;
        target.addEventListener(eventName, (ev) => {
            handler.call(this, ev.detail?.element);
        });
    }

    /** @param {object} component */
    #registerSearchInput(component) {
        if (!component) throw new Error('FacetedSearch: registerSearchInput requires detail.element.');
        if (this.#searchComponent) {
            console.warn('FacetedSearch: Multiple search inputs registered. Only the latest will be used.');
        }
        this.#searchComponent = component;
        this.#listenForUnregister(
            component,
            'facetedSearchUnregisterSearchInput',
            this.#unregisterSearchInput,
        );
        this.#buildModel();
    }

    /** @param {object} component */
    #unregisterSearchInput(component) {
        if (this.#searchComponent === component) {
            this.#searchComponent = null;
        }
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
        this.#listenForUnregister(
            component,
            'facetedSearchUnregisterFilterValues',
            this.#unregisterFilterValues,
        );
        this.#buildModel();
    }

    /** @param {object} component */
    #unregisterFilterValues(component) {
        this.#filterComponents = this.#filterComponents
            .filter((existing) => existing !== component);
        this.#buildModel();
    }

    /** @param {object} component */
    #registerReader(component) {
        if (!component) throw new Error('FacetedSearch: registerResultReader requires detail.element.');
        this.#readerComponent = component;
        this.#listenForUnregister(
            component,
            'facetedSearchUnregisterResultReader',
            this.#unregisterReader,
        );
        this.#buildModel();
    }

    /** @param {object} component */
    #unregisterReader(component) {
        if (this.#readerComponent === component) {
            this.#readerComponent = null;
            this.#model = null;
        }
    }

    /** @param {object} component */
    #registerUpdater(component) {
        if (!component) throw new Error('FacetedSearch: registerResultUpdater requires detail.element.');
        this.#updaterComponents.push(component);
        this.#listenForUnregister(
            component,
            'facetedSearchUnregisterResultUpdater',
            this.#unregisterUpdater,
        );
        this.#updateChildren();
    }

    /** @param {object} component */
    #unregisterUpdater(component) {
        this.#updaterComponents = this.#updaterComponents
            .filter((existing) => existing !== component);
    }

    /**
     * (Re)builds the model from the currently registered components.
     * Called after every child registration; requires the reader to be
     * present, search input and filters are optional. Rebuilds the model
     * each time so that late-registering components are included.
     */
    #buildModel() {
        if (!this.#readerComponent) return;

        this.#searchError = false;

        const items = this.#readerComponent.getItemData();

        // Derive filter and search configs from the collected item data
        const filterConfigs = this.#filterComponents.map(
            (component) => ({ name: component.getFilterData().name }),
        );
        const searchConfigs = this.#readerComponent.getSearchConfigs();

        this.#model = new FacetedSearchModel({
            items,
            filterConfigs,
            searchConfigs,
            fuzzy: this.#fuzzy,
            orderByRelevance: this.#orderByRelevance,
            fetchSearchIds: this.#searchGetEndpoint
                ? (term, signal) => this.#fetchSearchIds(term, signal)
                : null,
        });

        // Restore state before attaching the change listener to avoid
        // redundant #updateChildren calls for each restored value.
        this.#restoreFromHash();
        this.#model.onChange(() => this.#updateChildren());
        this.#updateChildren();
    }

    /**
     * Queries data-search-get-endpoint for matching item IDs, expects { ids: string[] }.
     * @param {string} term
     * @param {AbortSignal} signal
     * @returns {Promise<string[]>}
     */
    async #fetchSearchIds(term, signal) {
        const params = new URLSearchParams({ [this.#searchGetParam]: term });
        const url = `${this.#searchGetEndpoint}?${params}`;
        const response = await fetch(url, { signal });
        if (!response.ok) {
            throw new Error(`FacetedSearch: search endpoint ${url} responded with status ${response.status}.`);
        }
        const { ids } = await response.json();
        return ids;
    }

    /** @param {string} term */
    #handleSearchTermChange(term) {
        if (!this.#model) return;
        this.#applySearchTerm(term);
        if (this.#searchComponent?.propagateToUrl) {
            this.#writeHash('search', term ? [term] : []);
        }
    }

    /**
     * Sets the term on the model. In remote mode, reacts once the returned
     * promise settles: flags searchError and re-renders. Fire-and-forget.
     * Drops resolutions superseded by a newer term.
     * @param {string} term
     */
    #applySearchTerm(term) {
        this.#latestSearchTerm = term;
        const pending = this.#model.setSearchTerm(term);
        if (!pending) return;

        pending
            .then(() => { this.#searchError = false; })
            .catch((error) => {
                this.#searchError = true;
                console.error('FacetedSearch: search endpoint request failed.', error);
            })
            .finally(() => {
                if (this.#latestSearchTerm === term) this.#updateChildren();
            });
    }

    /**
     * @param {string} name
     * @param {string} value
     * @param {boolean} selected
     */
    #handleFilterChange(name, value, selected) {
        if (!this.#model) return;
        this.#model.setFilter(name, value, selected);
        const component = this.#filterComponents.find(
            (filter) => filter.getFilterData().name === name,
        );
        if (component?.propagateToUrl) {
            this.#writeHash(name, this.#model.activeFilters[name] || []);
        }
    }

    /**
     * Writes a key/values pair to the URL hash.
     * Removes the key when values are empty.
     * @param {string} key
     * @param {string[]} values
     */
    #writeHash(key, values) {
        const current = window.location.hash;
        const updated = values.length > 0
            ? writeHashKey(current, key, values)
            : removeHashKey(current, key);
        if (updated) {
            window.location.hash = updated;
        } else {
            // Setting location.hash = '' leaves a trailing # in the URL.
            // pushState removes it entirely.
            window.history.pushState(null, '', window.location.pathname + window.location.search);
        }
    }

    /** Pushes current model state to all child components. */
    #updateChildren() {
        if (!this.#model) return;

        const visibleIds = this.#model.getVisibleIds();
        this.#updaterComponents.forEach((component) => {
            component.updateResults(visibleIds, {
                searchTerm: this.#model.searchTerm,
                activeFilters: this.#model.activeFilters,
                searchError: this.#searchError,
            });
        });

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
        const hashData = readHash(
            typeof window !== 'undefined' ? window.location.hash : '',
        );

        if (hashData.search) {
            const term = hashData.search[0];
            this.#applySearchTerm(term);
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

    static defineElement() {
        if (!window.customElements.get('faceted-search')) {
            window.customElements.define('faceted-search', FacetedSearch);
        }
    }
}
