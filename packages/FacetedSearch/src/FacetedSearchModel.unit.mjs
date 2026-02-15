import test from 'ava';
import FacetedSearchModel from './FacetedSearchModel.mjs';

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
    // With category=shoes: toggling red → 1 (item 1), blue → 1 (item 2), green → 0
    const counts = model.getExpectedResults('color', filterValues.color);
    t.is(counts['col-red'], 1);
    t.is(counts['col-blue'], 1);
    t.is(counts['col-green'], 0);
});

test('computes expected results for active values within same filter', (t) => {
    const model = createTestModel();
    model.setFilter('color', 'red', true);
    model.setFilter('color', 'blue', true);
    // color=red,blue active → visible items: 1 (red shoe), 2 (blue shoe), 3 (red hat)
    // Removing red → only blue remains → 1 item (item 2)
    // Removing blue → only red remains → 2 items (items 1, 3)
    // Adding green → red,blue,green → 4 items
    const counts = model.getExpectedResults('color', filterValues.color);
    t.is(counts['col-red'], 1);
    t.is(counts['col-blue'], 2);
    t.is(counts['col-green'], 4);
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
    model.on('change', () => { emitted += 1; });
    model.setSearchTerm('test');
    t.is(emitted, 1);
});

test('emits change on setFilter', (t) => {
    const model = createTestModel();
    let emitted = 0;
    model.on('change', () => { emitted += 1; });
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
