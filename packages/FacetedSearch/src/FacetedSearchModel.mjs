/**
 * Core business logic for faceted search: holds state, runs combined queries
 * (itemsjs for filtering, MiniSearch for full-text search), computes expected
 * result counts per filter value. Pure class, no DOM.
 *
 * Integration follows the recommended pattern from itemsjs docs:
 * MiniSearch handles full-text search and returns matching IDs;
 * itemsjs receives those IDs via its `ids` parameter and handles
 * faceted filtering + aggregation on that subset.
 */
import itemsjs from 'itemsjs';
import MiniSearch from 'minisearch';
import canEmitEvents from '../../../src/shared/canEmitEvents.mjs';

export default class FacetedSearchModel {

    /** @type {{ [filterName: string]: string[] }} */
    #activeFilters = {};

    /** @type {string} */
    #searchTerm = '';

    /** @type {object} itemsjs instance for faceted filtering */
    #filterEngine;

    /** @type {MiniSearch} MiniSearch instance for full-text search */
    #searchEngine;

    /** @type {string[]} original item IDs in DOM order */
    #originalOrder;

    /** @type {boolean} */
    #orderByRelevance;

    /** @type {boolean} */
    #fuzzy;

    /** @type {object[]} raw items */
    #items;

    /** @type {string[]} filter field names used in itemsjs */
    #filterFieldNames;

    /** @type {object[]} search field configs with boost */
    #searchConfigs;

    /**
     * @param {object} options
     * @param {object[]} options.items - [{ id, filterFields: {}, searchFields: {} }]
     * @param {object[]} options.filterConfigs - [{ name }] — filter names to register
     * @param {object[]} options.searchConfigs - [{ field, boost }] — search fields with boost
     * @param {boolean} options.fuzzy - Enable fuzzy matching in MiniSearch
     * @param {boolean} options.orderByRelevance - Order by MiniSearch relevance when searching
     */
    constructor({ items, filterConfigs = [], searchConfigs = [], fuzzy = false, orderByRelevance = false }) {
        Object.assign(this, canEmitEvents());

        this.#items = items;
        this.#fuzzy = fuzzy;
        this.#orderByRelevance = orderByRelevance;
        this.#originalOrder = items.map((item) => item.id);
        this.#filterFieldNames = filterConfigs.map((config) => config.name);
        this.#searchConfigs = searchConfigs;

        this.#buildFilterEngine();
        this.#buildSearchEngine();
    }

    #buildFilterEngine() {
        const flatItems = this.#items.map((item) => ({
            id: item.id,
            ...item.filterFields,
        }));

        const aggregations = {};
        this.#filterFieldNames.forEach((name) => {
            // conjunction: false → OR logic within a single filter (spec requirement)
            aggregations[name] = { title: name, size: 10000, conjunction: false };
        });

        this.#filterEngine = itemsjs(flatItems, {
            native_search_enabled: false,
            custom_id_field: 'id',
            aggregations,
        });
    }

    #buildSearchEngine() {
        const searchFieldNames = this.#searchConfigs.map((config) => config.field);
        if (searchFieldNames.length === 0) {
            this.#searchEngine = null;
            return;
        }

        this.#searchEngine = new MiniSearch({
            fields: searchFieldNames,
            idField: 'id',
        });

        const searchDocs = this.#items.map((item) => ({
            id: item.id,
            ...item.searchFields,
        }));

        this.#searchEngine.addAll(searchDocs);
    }

    /**
     * Returns MiniSearch result IDs ordered by relevance, or null if no search is active.
     * @returns {string[]|null}
     */
    #getSearchedIds() {
        if (!this.#searchTerm || !this.#searchEngine) return null;

        const boostConfig = {};
        this.#searchConfigs.forEach((config) => {
            if (config.boost) boostConfig[config.field] = config.boost;
        });

        const options = {};
        if (this.#fuzzy) options.fuzzy = 0.2;
        if (Object.keys(boostConfig).length > 0) options.boost = boostConfig;

        const results = this.#searchEngine.search(this.#searchTerm, options);
        return results.map((result) => result.id);
    }

    /**
     * Builds the query object for itemsjs, combining active filters with
     * MiniSearch IDs (if a search term is active).
     * @param {{ [filterName: string]: string[] }} [filterOverrides] - Optional filter state override
     * @returns {object} itemsjs search query
     */
    #buildQuery(filterOverrides) {
        const activeFilters = filterOverrides || this.#activeFilters;
        const query = { per_page: 100000 };

        const filters = {};
        Object.entries(activeFilters).forEach(([name, values]) => {
            if (values.length > 0) filters[name] = values;
        });
        if (Object.keys(filters).length > 0) query.filters = filters;

        const searchedIds = this.#getSearchedIds();
        if (searchedIds !== null) query.ids = searchedIds;

        return query;
    }

    /**
     * Runs the combined query and returns ordered visible IDs.
     * @param {{ [filterName: string]: string[] }} [filterOverrides] - Optional filter state override
     * @returns {string[]}
     */
    #computeVisibleIds(filterOverrides) {
        const searchedIds = this.#getSearchedIds();
        const hasActiveFilters = Object.values(filterOverrides || this.#activeFilters)
            .some((values) => values.length > 0);

        // No search, no filters → all items in original order
        if (searchedIds === null && !hasActiveFilters) return this.#originalOrder;

        const query = this.#buildQuery(filterOverrides);
        const result = this.#filterEngine.search(query);
        const resultIds = result.data.items.map((item) => item.id);

        // When searching with relevance ordering, preserve MiniSearch's order
        if (searchedIds !== null && this.#orderByRelevance) {
            const resultSet = new Set(resultIds);
            return searchedIds.filter((id) => resultSet.has(id));
        }

        return resultIds;
    }

    /** @param {string} term */
    setSearchTerm(term) {
        this.#searchTerm = term;
        this.emit('change');
    }

    /**
     * Toggles a filter value on or off.
     * @param {string} name - Filter name
     * @param {string} value - Filter value
     * @param {boolean} selected - Whether the value is selected
     */
    setFilter(name, value, selected) {
        if (!this.#activeFilters[name]) this.#activeFilters[name] = [];
        if (selected) {
            if (!this.#activeFilters[name].includes(value)) {
                this.#activeFilters[name].push(value);
            }
        } else {
            this.#activeFilters[name] = this.#activeFilters[name].filter((v) => v !== value);
        }
        this.emit('change');
    }

    /**
     * Returns visible item IDs after applying all active filters and search.
     * @returns {string[]}
     */
    getVisibleIds() {
        return this.#computeVisibleIds();
    }

    /**
     * Computes expected result counts for each value in a given filter.
     * For each value, temporarily adds it to the filter state and counts results.
     * @param {string} filterName
     * @param {Array<{ id: string, value: string }>} filterValues - All values of this filter
     * @returns {{ [valueId: string]: number }}
     */
    getExpectedResults(filterName, filterValues) {
        const counts = {};
        const currentFilterState = this.#activeFilters[filterName] || [];

        filterValues.forEach(({ id, value }) => {
            const isActive = currentFilterState.includes(value);

            if (isActive) {
                counts[id] = this.#computeVisibleIds().length;
            } else {
                // Build a temporary filter state with this value added
                const tempFilters = { ...this.#activeFilters };
                tempFilters[filterName] = [...currentFilterState, value];
                counts[id] = this.#computeVisibleIds(tempFilters).length;
            }
        });

        return counts;
    }

    /** @returns {{ [name: string]: string[] }} */
    get activeFilters() {
        return { ...this.#activeFilters };
    }

    /** @returns {string} */
    get searchTerm() {
        return this.#searchTerm;
    }
}
