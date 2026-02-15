import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

const setup = async (hideErrors) => getDOM({
    basePath,
    scripts: ['FacetedSearchElement.mjs'],
    hideErrors,
});

/** Creates a mock result items component that registers via event. */
const createMockResultItems = (document, window, items = []) => {
    const mock = {
        getItemData: () => items,
        updateVisibility(ids) { this.lastVisibleIds = ids; },
        lastVisibleIds: null,
    };
    return mock;
};

/** Creates a mock filter values component that registers via event. */
const createMockFilterValues = (name, values = [], { propagateToUrl = false } = {}) => ({
    getFilterData: () => ({ name, values }),
    updateExpectedResults(counts) { this.lastCounts = counts; },
    setChecked(value, selected) {
        this.checkedValues = this.checkedValues || {};
        this.checkedValues[value] = selected;
    },
    propagateToUrl,
    lastCounts: null,
    checkedValues: {},
});

/** Creates a mock search input component. */
const createMockSearchInput = ({ propagateToUrl = false } = {}) => ({
    setSearchTerm(term) { this.lastTerm = term; },
    propagateToUrl,
    lastTerm: null,
});

/** Fires a registration event on the orchestrator. */
const fireRegistration = (orchestrator, eventName, element, window) => {
    orchestrator.dispatchEvent(new window.CustomEvent(eventName, {
        bubbles: true,
        detail: { element },
    }));
};

const testItems = [
    {
        id: '1',
        filterFields: { category: ['shoes'], color: ['red'] },
        searchFields: { name: 'Red Running Shoe' },
    },
    {
        id: '2',
        filterFields: { category: ['shoes'], color: ['blue'] },
        searchFields: { name: 'Blue Walking Shoe' },
    },
    {
        id: '3',
        filterFields: { category: ['hats'], color: ['red'] },
        searchFields: { name: 'Red Baseball Hat' },
    },
];

// Registration constraints

test('errors on duplicate filter name', async (t) => {
    const { document, window, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    const filter1 = createMockFilterValues('category', [{ id: 'c1', value: 'shoes' }]);
    fireRegistration(orchestrator, 'registerFilterValues', filter1, window);

    const filter2 = createMockFilterValues('category', [{ id: 'c2', value: 'hats' }]);
    fireRegistration(orchestrator, 'registerFilterValues', filter2, window);

    t.is(errors.length, 1);
    t.regex(errors[0].message, /Duplicate filter name "category"/);
});

test('accepts filter-values and input as optional', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    t.deepEqual(resultItems.lastVisibleIds, ['1', '2', '3']);
});

// Delegation via events

test('delegates search term change to model and updates children', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.deepEqual(resultItems.lastVisibleIds, ['1']);
});

test('delegates filter change to model and updates children', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);

    fireRegistration(orchestrator, 'registerFilterValues', filterCategory, window);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'shoes', selected: true },
    }));

    t.deepEqual(resultItems.lastVisibleIds, ['1', '2']);
    t.truthy(filterCategory.lastCounts);
});

// Initialization

test('initializes model with item data from result-items', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);

    fireRegistration(orchestrator, 'registerFilterValues', filterCategory, window);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    t.deepEqual(resultItems.lastVisibleIds, ['1', '2', '3']);
    t.truthy(filterCategory.lastCounts);
});

test('rebuilds model when filter registers after initialization', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);

    // Initialize with result-items only (no filters)
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);
    t.deepEqual(resultItems.lastVisibleIds, ['1', '2', '3']);

    // Late-register a filter and apply it
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);
    fireRegistration(orchestrator, 'registerFilterValues', filterCategory, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'hats', selected: true },
    }));

    t.deepEqual(resultItems.lastVisibleIds, ['3']);
    t.truthy(filterCategory.lastCounts);
});

// URL hash propagation

test('writes search term to URL hash when input has propagateToUrl', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    const mockInput = createMockSearchInput({ propagateToUrl: true });

    fireRegistration(orchestrator, 'registerSearchInput', mockInput, window);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.is(window.location.hash, '#search=running');

    // Clearing the term removes the key
    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: '' },
    }));

    t.is(window.location.hash, '');
    window.location.hash = '';
});

test('writes filter state to URL hash when filter has propagateToUrl', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ], { propagateToUrl: true });

    fireRegistration(orchestrator, 'registerFilterValues', filterCategory, window);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'shoes', selected: true },
    }));

    t.is(window.location.hash, '#category=shoes');

    // Adding a second value appends it
    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'hats', selected: true },
    }));

    t.is(window.location.hash, '#category=shoes%2Chats');

    // Deselecting all removes the key
    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'shoes', selected: false },
    }));
    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'hats', selected: false },
    }));

    t.is(window.location.hash, '');
    window.location.hash = '';
});

test('does not write to URL hash when propagateToUrl is false', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    const mockInput = createMockSearchInput({ propagateToUrl: false });

    fireRegistration(orchestrator, 'registerSearchInput', mockInput, window);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.is(window.location.hash, '');
});

// Unregistration

test('unregistering a filter component removes it from updates', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);

    fireRegistration(orchestrator, 'registerFilterValues', filterCategory, window);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);
    t.truthy(filterCategory.lastCounts);

    // Reset and unregister
    filterCategory.lastCounts = null;
    fireRegistration(orchestrator, 'unregisterFilterValues', filterCategory, window);

    // Trigger an update — filter should no longer receive counts
    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.is(filterCategory.lastCounts, null);
});

test('unregistering result items clears the model', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);
    t.deepEqual(resultItems.lastVisibleIds, ['1', '2', '3']);

    fireRegistration(orchestrator, 'unregisterResultItems', resultItems, window);

    // Search term change should be silently ignored (no model)
    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    // lastVisibleIds should not have changed since unregister
    t.deepEqual(resultItems.lastVisibleIds, ['1', '2', '3']);
});

// Multiple search input warning

test('warns when a second search input registers', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const resultItems = createMockResultItems(document, window, testItems);
    fireRegistration(orchestrator, 'registerResultItems', resultItems, window);

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    const input1 = createMockSearchInput();
    const input2 = createMockSearchInput();
    fireRegistration(orchestrator, 'registerSearchInput', input1, window);
    fireRegistration(orchestrator, 'registerSearchInput', input2, window);

    console.warn = originalWarn;

    t.is(warnings.length, 1);
    t.regex(warnings[0], /Multiple search inputs/);
});
