/**
 * Core business logic for faceted search: holds state, runs itemsjs for filtering
 * and MiniSearch (or a remote endpoint) for full-text search, computes expected
 * result counts per filter value. Pure class, no DOM.
 *
 * Full-text search is local via MiniSearch by default, or remote when fetchSearchIds
 * is injected — setSearchTerm then awaits it and drops responses superseded by a
 * newer search term.
 */
import itemsjs from 'itemsjs';
import MiniSearch from 'minisearch';

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

    /** @type {Function|null} injected async (term, signal) => Promise<string[]> */
    #fetchSearchIds;

    /** @type {string[]|null} IDs from the most recently resolved fetchSearchIds call */
    #searchedIds = null;

    /** @type {AbortController|null} controller for the in-flight fetchSearchIds call */
    #pendingSearchController = null;

    /** @type {Function[]} */
    #changeListeners = [];

    /**
     * @param {object} options
     * @param {object[]} options.items - [{ id, filterFields: {}, searchFields: {} }]
     * @param {object[]} options.filterConfigs - [{ name }] — filter names to register
     * @param {object[]} options.searchConfigs - [{ field, boost }] — MiniSearch fields with boost
     *     (ignored when fetchSearchIds is set)
     * @param {boolean} options.fuzzy - Enable fuzzy matching in MiniSearch (ignored when
     *     fetchSearchIds is set)
     * @param {boolean} options.orderByRelevance - Order by search relevance when searching
     * @param {Function|null} options.fetchSearchIds - Async (term, signal) => Promise<string[]>,
     *     delegates full-text search to this instead of MiniSearch when provided
     */
    constructor({
        items,
        filterConfigs = [],
        searchConfigs = [],
        fuzzy = false,
        orderByRelevance = false,
        fetchSearchIds = null,
    }) {
        this.#items = items;
        this.#fuzzy = fuzzy;
        this.#orderByRelevance = orderByRelevance;
        this.#originalOrder = items.map((item) => item.id);
        this.#filterFieldNames = filterConfigs.map((config) => config.name);
        this.#searchConfigs = searchConfigs;
        this.#fetchSearchIds = fetchSearchIds;

        this.#buildFilterEngine();
        if (!this.#fetchSearchIds) this.#buildSearchEngine();
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
     * Returns search result IDs ordered by relevance, or null if no search is active.
     * In remote mode, returns the last resolved fetchSearchIds result (see setSearchTerm).
     * @returns {string[]|null}
     */
    #getSearchedIds() {
        if (!this.#searchTerm) return null;
        if (this.#fetchSearchIds) return this.#searchedIds;
        if (!this.#searchEngine) return null;

        const boostConfig = {};
        this.#searchConfigs.forEach((config) => {
            if (config.boost) boostConfig[config.field] = config.boost;
        });

        // prefix: true so that partial input matches longer tokens (e.g. "ab" → "abstract")
        const options = { prefix: true };
        if (this.#fuzzy) options.fuzzy = 0.2;
        if (Object.keys(boostConfig).length > 0) options.boost = boostConfig;

        const results = this.#searchEngine.search(this.#searchTerm, options);
        return results.map((result) => result.id);
    }

    /**
     * Builds a query object that itemsjs can execute. Merges the active
     * filter state with pre-computed MiniSearch IDs so that itemsjs
     * handles faceted filtering while MiniSearch handles full-text search.
     * @param {string[]|null} searchedIds - Pre-computed MiniSearch result
     *     IDs, or null when no search is active
     * @returns {object} itemsjs-compatible search query
     */
    #buildQuery(searchedIds) {
        const query = { per_page: 100000 };

        const filters = {};
        Object.entries(this.#activeFilters).forEach(([name, values]) => {
            if (values.length > 0) filters[name] = values;
        });
        if (Object.keys(filters).length > 0) query.filters = filters;

        if (searchedIds !== null) query.ids = searchedIds;

        return query;
    }

    /**
     * Runs the combined query and returns the full itemsjs result
     * (items + aggregations).
     * @returns {object|null} itemsjs search result, or null when
     *     nothing is active
     */
    #runQuery() {
        const searchedIds = this.#getSearchedIds();
        const hasActiveFilters = Object.values(this.#activeFilters)
            .some((values) => values.length > 0);

        if (searchedIds === null && !hasActiveFilters) return null;

        const query = this.#buildQuery(searchedIds);
        return this.#filterEngine.search(query);
    }

    /**
     * Returns ordered visible IDs from the current state.
     * @returns {string[]}
     */
    #computeVisibleIds() {
        const result = this.#runQuery();
        if (!result) return this.#originalOrder;

        const resultIds = result.data.items.map((item) => item.id);

        // When searching with relevance ordering, preserve MiniSearch's order
        const searchedIds = this.#getSearchedIds();
        if (searchedIds !== null && this.#orderByRelevance) {
            const resultSet = new Set(resultIds);
            return searchedIds.filter((id) => resultSet.has(id));
        }

        return resultIds;
    }

    /** @param {string} term */
    setSearchTerm(term) {
        this.#searchTerm = term;
        if (this.#fetchSearchIds) {
            this.#fetchAndApplySearchedIds(term);
            return;
        }
        this.#notifyChange();
    }

    /**
     * Fetches search result IDs via fetchSearchIds and applies them once resolved.
     * Aborts the previous in-flight request and drops responses that are no longer
     * the latest, so a slow, superseded request can't overwrite a newer one.
     * @param {string} term
     */
    async #fetchAndApplySearchedIds(term) {
        if (this.#pendingSearchController) this.#pendingSearchController.abort();

        if (!term) {
            this.#pendingSearchController = null;
            this.#searchedIds = null;
            this.#notifyChange();
            return;
        }

        const controller = new AbortController();
        this.#pendingSearchController = controller;

        try {
            const ids = await this.#fetchSearchIds(term, controller.signal);
            if (this.#pendingSearchController !== controller) return;
            this.#pendingSearchController = null;
            this.#searchedIds = ids;
            this.#notifyChange();
        } catch (error) {
            if (this.#pendingSearchController !== controller) return;
            this.#pendingSearchController = null;
            // Log rather than throw (this is detached from setSearchTerm's caller) and
            // keep prior results visible instead of clearing them.
            console.error('FacetedSearchModel: fetchSearchIds failed.', error);
        }
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
            this.#activeFilters[name] = this.#activeFilters[name]
                .filter((active) => active !== value);
        }
        this.#notifyChange();
    }

    #notifyChange() {
        this.#changeListeners.forEach((cb) => cb());
    }

    /** @param {Function} callback */
    onChange(callback) {
        this.#changeListeners.push(callback);
    }

    /**
     * Returns visible item IDs after applying all active filters and search.
     * @returns {string[]}
     */
    getVisibleIds() {
        return this.#computeVisibleIds();
    }

    /**
     * Returns expected result counts for each value in a given filter,
     * using itemsjs aggregation buckets.
     * @param {string} filterName
     * @param {Array<{ id: string, value: string }>} filterValues
     * @returns {{ [valueId: string]: number }}
     */
    getExpectedResults(filterName, filterValues) {
        const result = this.#runQuery();
        const aggregations = result
            ? result.data.aggregations
            : this.#filterEngine.search({ per_page: 0 })
                .data.aggregations;

        const buckets = aggregations[filterName]?.buckets || [];
        const bucketMap = new Map(
            buckets.map((bucket) => [bucket.key, bucket.doc_count]),
        );

        const counts = {};
        filterValues.forEach(({ id, value }) => {
            counts[id] = bucketMap.get(value) || 0;
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
