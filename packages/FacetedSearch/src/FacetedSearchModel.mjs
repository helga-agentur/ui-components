/**
 * Core business logic for faceted search: state, itemsjs filtering, MiniSearch
 * or remote-endpoint full-text search, expected result counts.
 *
 * setSearchTerm is fire-and-forget even in remote mode: onChange fires once
 * the lookup settles, searchError reflects the outcome. Stale/superseded
 * requests are dropped silently.
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

    /** @type {string|null} URL of a remote GET search endpoint, replacing local MiniSearch */
    #searchGetEndpoint;

    /** @type {string} name of the query parameter the search term is sent as */
    #searchGetParam;

    /** @type {string[]|null} IDs from the most recently resolved endpoint call */
    #searchedIds = null;

    /** @type {boolean} whether the last endpoint call failed */
    #searchError = false;

    /** @type {AbortController|null} controller for the in-flight endpoint call */
    #pendingSearchController = null;

    /** @type {Function[]} */
    #changeListeners = [];

    /**
     * @param {object} options
     * @param {object[]} options.items - [{ id, filterFields: {}, searchFields: {} }]
     * @param {object[]} options.filterConfigs - [{ name }] — filter names to register
     * @param {object[]} options.searchConfigs - [{ field, boost }] — MiniSearch fields with boost
     *     (ignored when searchGetEndpoint is set)
     * @param {boolean} options.fuzzy - Enable fuzzy matching in MiniSearch (ignored when
     *     searchGetEndpoint is set)
     * @param {boolean} options.orderByRelevance - Order by search relevance when searching
     * @param {string|null} options.searchGetEndpoint - URL of a remote search endpoint; sends
     *     `GET <searchGetEndpoint>?<searchGetParam>=<term>`, expects { ids: string[] }, and
     *     replaces MiniSearch when set
     * @param {string} options.searchGetParam - Query param name for the search term
     */
    constructor({
        items,
        filterConfigs = [],
        searchConfigs = [],
        fuzzy = false,
        orderByRelevance = false,
        searchGetEndpoint = null,
        searchGetParam = 'q',
    }) {
        this.#items = items;
        this.#fuzzy = fuzzy;
        this.#orderByRelevance = orderByRelevance;
        this.#originalOrder = items.map((item) => item.id);
        this.#filterFieldNames = filterConfigs.map((config) => config.name);
        this.#searchConfigs = searchConfigs;
        this.#searchGetEndpoint = searchGetEndpoint;
        this.#searchGetParam = searchGetParam;

        this.#buildFilterEngine();
        if (!this.#searchGetEndpoint) this.#buildSearchEngine();
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
     * In remote mode, returns the last resolved endpoint result (see
     * fetchAndApplySearchedIds).
     * @returns {string[]|null}
     */
    #getSearchedIds() {
        if (!this.#searchTerm) return null;
        if (this.#searchGetEndpoint) return this.#searchedIds;
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

    /**
     * Fire-and-forget in both modes. Returned promise never rejects; it's
     * only there for callers that want to await settling (e.g. tests).
     * @param {string} term
     * @returns {Promise<void>|undefined}
     */
    setSearchTerm(term) {
        this.#searchTerm = term;
        if (!this.#searchGetEndpoint) {
            this.#notifyChange();
            return undefined;
        }
        return this.#fetchAndApplySearchedIds(term);
    }

    /**
     * Runs the endpoint lookup, aborting any prior in-flight one. Notifies
     * on settle; superseded/stale responses are dropped silently.
     * @param {string} term
     */
    async #fetchAndApplySearchedIds(term) {
        if (this.#pendingSearchController) this.#pendingSearchController.abort();

        if (!term) {
            this.#pendingSearchController = null;
            this.#searchedIds = null;
            this.#searchError = false;
            this.#notifyChange();
            return;
        }

        const controller = new AbortController();
        this.#pendingSearchController = controller;

        try {
            const ids = await this.#callEndpoint(term, controller.signal);
            if (this.#pendingSearchController !== controller) return;
            this.#pendingSearchController = null;
            this.#searchedIds = ids;
            this.#searchError = false;
        } catch (error) {
            if (this.#pendingSearchController !== controller) return;
            this.#pendingSearchController = null;
            this.#searchedIds = [];
            this.#searchError = true;
            console.error('FacetedSearchModel: search endpoint request failed.', error);
        }
        this.#notifyChange();
    }

    /**
     * Queries searchGetEndpoint for matching item IDs, expects { ids: string[] }.
     * @param {string} term
     * @param {AbortSignal} signal
     * @returns {Promise<string[]>}
     */
    async #callEndpoint(term, signal) {
        const params = new URLSearchParams({ [this.#searchGetParam]: term });
        const url = `${this.#searchGetEndpoint}?${params}`;
        const response = await fetch(url, { signal });
        if (!response.ok) {
            throw new Error(`FacetedSearchModel: search endpoint ${url} responded with status ${response.status}.`);
        }
        const { ids } = await response.json();
        return ids;
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

    /** @returns {boolean} whether the last endpoint call failed */
    get searchError() {
        return this.#searchError;
    }
}
