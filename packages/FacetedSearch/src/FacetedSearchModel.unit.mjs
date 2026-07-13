import test from 'ava';
import FacetedSearchModel from './FacetedSearchModel.mjs';

/* global globalThis */

/**
 * Creates a model with a standard test dataset.
 * Items: 4 products with category and color filter fields, plus searchable name/description.
 */
const createTestModel = (options = {}) => {
    const items = [
        {
            id: '1',
            filterFields: { category: ['shoes'], color: ['red'] },
            searchFields: { name: 'Red Running Shoe', description: 'A fast red shoe for runners' },
        },
        {
            id: '2',
            filterFields: { category: ['shoes'], color: ['blue'] },
            searchFields: { name: 'Blue Walking Shoe', description: 'A comfortable blue shoe' },
        },
        {
            id: '3',
            filterFields: { category: ['hats'], color: ['red'] },
            searchFields: { name: 'Red Baseball Hat', description: 'A sporty red hat' },
        },
        {
            id: '4',
            filterFields: { category: ['hats'], color: ['green'] },
            searchFields: { name: 'Green Bucket Hat', description: 'A trendy green hat' },
        },
    ];

    return new FacetedSearchModel({
        items,
        filterConfigs: [{ name: 'category' }, { name: 'color' }],
        searchConfigs: [{ field: 'name', boost: 2 }, { field: 'description' }],
        fuzzy: options.fuzzy || false,
        orderByRelevance: options.orderByRelevance || false,
    });
};

const filterValues = {
    category: [{ id: 'cat-shoes', value: 'shoes' }, { id: 'cat-hats', value: 'hats' }],
    color: [
        { id: 'col-red', value: 'red' },
        { id: 'col-blue', value: 'blue' },
        { id: 'col-green', value: 'green' },
    ],
};

// Basic visibility

test('returns all items when no filters or search active', (t) => {
    const model = createTestModel();
    t.deepEqual(model.getVisibleIds(), ['1', '2', '3', '4']);
});

// Filter logic

test('filters with single filter OR logic', (t) => {
    const model = createTestModel();
    model.setFilter('color', 'red', true);
    model.setFilter('color', 'blue', true);
    const ids = model.getVisibleIds();
    // OR within color: red OR blue → items 1, 2, 3
    t.true(ids.includes('1'));
    t.true(ids.includes('2'));
    t.true(ids.includes('3'));
    t.false(ids.includes('4'));
});

test('combines multiple filters with AND logic', (t) => {
    const model = createTestModel();
    model.setFilter('category', 'shoes', true);
    model.setFilter('color', 'red', true);
    // AND across filters: category=shoes AND color=red → only item 1
    t.deepEqual(model.getVisibleIds(), ['1']);
});

test('deselecting a filter value removes it', (t) => {
    const model = createTestModel();
    model.setFilter('color', 'red', true);
    model.setFilter('color', 'blue', true);
    model.setFilter('color', 'red', false);
    const ids = model.getVisibleIds();
    t.true(ids.includes('2'));
    t.false(ids.includes('3'));
});

// Search

test('searches with MiniSearch', (t) => {
    const model = createTestModel();
    model.setSearchTerm('running');
    const ids = model.getVisibleIds();
    t.deepEqual(ids, ['1']);
});

test('intersects search results with filter results', (t) => {
    const model = createTestModel();
    model.setFilter('category', 'hats', true);
    model.setSearchTerm('red');
    // Filter: hats → 3, 4. Search: red → 1, 3. Intersection: 3
    t.deepEqual(model.getVisibleIds(), ['3']);
});

test('orders by relevance when search active', (t) => {
    const model = createTestModel({ orderByRelevance: true });
    model.setSearchTerm('hat');
    const ids = model.getVisibleIds();
    // MiniSearch determines order; all hat items should appear
    t.true(ids.includes('3'));
    t.true(ids.includes('4'));
    // Items 1, 2 should not match 'hat'
    t.false(ids.includes('1'));
    t.false(ids.includes('2'));
});

test('restores DOM order when search cleared', (t) => {
    const model = createTestModel({ orderByRelevance: true });
    model.setSearchTerm('hat');
    model.setSearchTerm('');
    t.deepEqual(model.getVisibleIds(), ['1', '2', '3', '4']);
});

// Expected results

test('computes expected results per filter value', (t) => {
    const model = createTestModel();
    const counts = model.getExpectedResults('color', filterValues.color);
    // No filters active: toggling red → 2 items (1,3), blue → 1 (2), green → 1 (4)
    t.is(counts['col-red'], 2);
    t.is(counts['col-blue'], 1);
    t.is(counts['col-green'], 1);
});

test('computes expected results with active cross-filter', (t) => {
    const model = createTestModel();
    model.setFilter('category', 'shoes', true);
    // With category=shoes: red → 1 (item 1), blue → 1 (item 2), green → 0
    const counts = model.getExpectedResults('color', filterValues.color);
    t.is(counts['col-red'], 1);
    t.is(counts['col-blue'], 1);
    t.is(counts['col-green'], 0);
});

test('returns aggregation count for active values within same filter', (t) => {
    const model = createTestModel();
    model.setFilter('color', 'red', true);
    model.setFilter('color', 'blue', true);
    // OR logic within a filter: red=2, blue=1 match; green=1 would add
    const counts = model.getExpectedResults('color', filterValues.color);
    t.is(counts['col-red'], 2);
    t.is(counts['col-blue'], 1);
    t.is(counts['col-green'], 1);
});

// Fuzzy search

test('handles fuzzy search', (t) => {
    const model = createTestModel({ fuzzy: true });
    model.setSearchTerm('runing');
    const ids = model.getVisibleIds();
    // Fuzzy should match 'running' → item 1
    t.true(ids.includes('1'));
});

// Empty dataset

test('handles empty dataset', (t) => {
    const model = new FacetedSearchModel({
        items: [],
        filterConfigs: [{ name: 'category' }],
        searchConfigs: [{ field: 'name' }],
    });
    t.deepEqual(model.getVisibleIds(), []);
});

// Multi-value fields

test('handles multi-value fields with separator', (t) => {
    const items = [
        { id: '1', filterFields: { tags: ['sport', 'outdoor'] }, searchFields: {} },
        { id: '2', filterFields: { tags: ['indoor', 'casual'] }, searchFields: {} },
        { id: '3', filterFields: { tags: ['sport', 'casual'] }, searchFields: {} },
    ];
    const model = new FacetedSearchModel({
        items,
        filterConfigs: [{ name: 'tags' }],
        searchConfigs: [],
    });
    model.setFilter('tags', 'sport', true);
    const ids = model.getVisibleIds();
    t.true(ids.includes('1'));
    t.false(ids.includes('2'));
    t.true(ids.includes('3'));
});

// Events

test('emits change on setSearchTerm', (t) => {
    const model = createTestModel();
    let emitted = 0;
    model.onChange(() => { emitted += 1; });
    model.setSearchTerm('test');
    t.is(emitted, 1);
});

test('emits change on setFilter', (t) => {
    const model = createTestModel();
    let emitted = 0;
    model.onChange(() => { emitted += 1; });
    model.setFilter('color', 'red', true);
    t.is(emitted, 1);
});

// State accessors

test('activeFilters returns current state', (t) => {
    const model = createTestModel();
    model.setFilter('color', 'red', true);
    model.setFilter('category', 'shoes', true);
    t.deepEqual(model.activeFilters, { color: ['red'], category: ['shoes'] });
});

test('searchTerm returns current term', (t) => {
    const model = createTestModel();
    model.setSearchTerm('hello');
    t.is(model.searchTerm, 'hello');
});

// Search without filter configs

test('works with only search configs', (t) => {
    const items = [
        { id: '1', filterFields: {}, searchFields: { name: 'Alpha' } },
        { id: '2', filterFields: {}, searchFields: { name: 'Beta' } },
    ];
    const model = new FacetedSearchModel({
        items,
        filterConfigs: [],
        searchConfigs: [{ field: 'name' }],
    });
    model.setSearchTerm('Alpha');
    t.deepEqual(model.getVisibleIds(), ['1']);
});

// Remote search (fetchSearchIds)

/** Creates a promise plus its resolve function, for manual resolution in tests. */
const createDeferred = () => {
    let resolve;
    const promise = new Promise((res) => { resolve = res; });
    return { promise, resolve };
};

/**
 * Replaces global fetch for the duration of a test. Endpoint tests must run
 * .serial since they share this global — restore() undoes it.
 * @param {Function} handler - (url) => Response-like { ok, status, json }
 * @returns {Function} restore
 */
const mockFetch = (handler) => {
    const original = globalThis.fetch;
    globalThis.fetch = handler;
    return () => { globalThis.fetch = original; };
};

/** @param {string} url */
const termFromUrl = (url) => new URLSearchParams(url.split('?')[1]).get('q');

const createEndpointTestModel = (options = {}) => {
    const items = [
        { id: '1', filterFields: { category: ['shoes'] }, searchFields: {} },
        { id: '2', filterFields: { category: ['hats'] }, searchFields: {} },
        { id: '3', filterFields: { category: ['hats'] }, searchFields: {} },
    ];
    return new FacetedSearchModel({
        items,
        filterConfigs: [{ name: 'category' }],
        searchConfigs: [],
        searchGetEndpoint: '/api/search',
        ...options,
    });
};

// These tests stub the shared global fetch, so they must run .serial.

test.serial('uses searchGetEndpoint instead of MiniSearch when provided', async (t) => {
    const calls = [];
    const restore = mockFetch(async (url) => {
        calls.push(url);
        return { ok: true, json: async () => ({ ids: ['2', '3'] }) };
    });
    const model = createEndpointTestModel();
    await model.setSearchTerm('hat');
    restore();

    t.deepEqual(calls, ['/api/search?q=hat']);
    t.deepEqual(model.getVisibleIds(), ['2', '3']);
});

test.serial('does not update visible ids until the endpoint resolves', async (t) => {
    const deferred = createDeferred();
    const restore = mockFetch(() => deferred.promise);
    const model = createEndpointTestModel();

    const pending = model.setSearchTerm('hat');
    // Still unresolved: falls back to original order (no cached result yet)
    t.deepEqual(model.getVisibleIds(), ['1', '2', '3']);

    deferred.resolve({ ok: true, json: async () => ({ ids: ['2', '3'] }) });
    await pending;
    restore();
    t.deepEqual(model.getVisibleIds(), ['2', '3']);
});

test.serial('resolving the remote search does not trigger onChange itself', async (t) => {
    const deferred = createDeferred();
    const restore = mockFetch(() => deferred.promise);
    const model = createEndpointTestModel();
    let emitted = 0;
    model.onChange(() => { emitted += 1; });

    const pending = model.setSearchTerm('hat');
    t.is(emitted, 0);

    deferred.resolve({ ok: true, json: async () => ({ ids: ['2'] }) });
    await pending;
    restore();
    // Resolving the fetch doesn't notify - the caller re-renders after awaiting.
    t.is(emitted, 0);
});

test.serial('drops a stale response when a newer search term resolves first', async (t) => {
    const deferred = {};
    const restore = mockFetch((url) => new Promise((resolve) => {
        deferred[termFromUrl(url)] = resolve;
    }));
    const model = createEndpointTestModel();

    const pendingA = model.setSearchTerm('a');
    const pendingB = model.setSearchTerm('b');

    // 'b' resolves first even though 'a' was requested first.
    deferred.b({ ok: true, json: async () => ({ ids: ['2'] }) });
    await pendingB;
    deferred.a({ ok: true, json: async () => ({ ids: ['3'] }) });
    await pendingA;
    restore();

    t.deepEqual(model.getVisibleIds(), ['2']);
});

test.serial('rethrows genuine failures from the endpoint', async (t) => {
    const restore = mockFetch(async () => ({ ok: false, status: 500 }));
    const model = createEndpointTestModel();
    const error = await t.throwsAsync(() => model.setSearchTerm('hat'));
    restore();
    t.regex(error.message, /responded with status 500/);
});

test.serial('clearing the search term while a request is in flight resets synchronously', async (t) => {
    const deferred = createDeferred();
    const restore = mockFetch(() => deferred.promise);
    const model = createEndpointTestModel();

    const pending = model.setSearchTerm('hat');
    model.setSearchTerm('');
    t.deepEqual(model.getVisibleIds(), ['1', '2', '3']);

    // A late resolution of the abandoned request must not resurrect stale results.
    deferred.resolve({ ok: true, json: async () => ({ ids: ['2'] }) });
    await pending;
    restore();
    t.deepEqual(model.getVisibleIds(), ['1', '2', '3']);
});

test.serial('combines remote search results with active filters', async (t) => {
    const restore = mockFetch(async () => ({ ok: true, json: async () => ({ ids: ['1', '2'] }) }));
    const model = createEndpointTestModel();
    model.setFilter('category', 'hats', true);
    await model.setSearchTerm('x');
    restore();

    // Search: 1, 2. Filter: hats → 2, 3. Intersection: 2
    t.deepEqual(model.getVisibleIds(), ['2']);
});

test.serial('orderByRelevance preserves the endpoint order in remote mode', async (t) => {
    const restore = mockFetch(async () => ({ ok: true, json: async () => ({ ids: ['3', '1'] }) }));
    const model = createEndpointTestModel({ orderByRelevance: true });
    await model.setSearchTerm('x');
    restore();

    t.deepEqual(model.getVisibleIds(), ['3', '1']);
});

// Filters without search configs

test('works with only filter configs', (t) => {
    const items = [
        { id: '1', filterFields: { type: ['a'] }, searchFields: {} },
        { id: '2', filterFields: { type: ['b'] }, searchFields: {} },
    ];
    const model = new FacetedSearchModel({
        items,
        filterConfigs: [{ name: 'type' }],
        searchConfigs: [],
    });
    model.setFilter('type', 'a', true);
    t.deepEqual(model.getVisibleIds(), ['1']);
});
