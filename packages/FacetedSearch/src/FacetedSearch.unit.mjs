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

test('defineElement registers the custom element', async (t) => {
    const { window } = await setup();
    t.truthy(window.customElements.get('faceted-search'));
});

test('defineElement is idempotent', async (t) => {
    const { window } = await setup();
    const FacetedSearch = window.customElements.get('faceted-search');
    // Calling defineElement again must not throw
    t.notThrows(() => FacetedSearch.defineElement());
    t.is(window.customElements.get('faceted-search'), FacetedSearch);
});

/** Creates a mock reader component. */
const createMockReader = (items = []) => ({
    getItemData: () => items,
});

/** Creates a mock updater component. */
const createMockUpdater = () => ({
    updateResults(ids) { this.lastVisibleIds = ids; },
    lastVisibleIds: null,
});

/** Creates a mock filter values component. */
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

/** Registers both reader and updater on the orchestrator. */
const registerReaderAndUpdater = (orchestrator, window, items = testItems) => {
    const reader = createMockReader(items);
    const updater = createMockUpdater();
    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', reader, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater, window);
    return { reader, updater };
};

// Registration constraints

test('errors on duplicate filter name', async (t) => {
    const { document, window, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    registerReaderAndUpdater(orchestrator, window);

    const filter1 = createMockFilterValues('category', [{ id: 'c1', value: 'shoes' }]);
    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filter1, window);

    const filter2 = createMockFilterValues('category', [{ id: 'c2', value: 'hats' }]);
    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filter2, window);

    t.is(errors.length, 1);
    t.regex(errors[0].message, /Duplicate filter name "category"/);
});

test('accepts filter-values and input as optional', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const { updater } = registerReaderAndUpdater(orchestrator, window);

    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);
});

// Delegation via events

test('delegates search term change to model and updates children', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const { updater } = registerReaderAndUpdater(orchestrator, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.deepEqual(updater.lastVisibleIds, ['1']);
});

test('delegates filter change to model and updates children', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const updater = createMockUpdater();
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);

    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filterCategory, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', createMockReader(testItems), window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'shoes', selected: true },
    }));

    t.deepEqual(updater.lastVisibleIds, ['1', '2']);
    t.truthy(filterCategory.lastCounts);
});

// Initialization

test('initializes model with item data from reader', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);

    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filterCategory, window);
    const { updater } = registerReaderAndUpdater(orchestrator, window);

    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);
    t.truthy(filterCategory.lastCounts);
});

test('rebuilds model when filter registers after initialization', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const { updater } = registerReaderAndUpdater(orchestrator, window);
    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);

    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);
    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filterCategory, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'hats', selected: true },
    }));

    t.deepEqual(updater.lastVisibleIds, ['3']);
    t.truthy(filterCategory.lastCounts);
});

// Reader/updater registration order

test('builds model when reader registers before updater', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const reader = createMockReader(testItems);
    const updater = createMockUpdater();

    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', reader, window);
    // Model built, but no updater yet — no visibility update
    t.is(updater.lastVisibleIds, null);

    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater, window);
    // Updater now registered — visibility update triggered
    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);
});

test('handles updater registering before reader', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const reader = createMockReader(testItems);
    const updater = createMockUpdater();

    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater, window);
    // No model yet — no visibility update
    t.is(updater.lastVisibleIds, null);

    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', reader, window);
    // Reader triggers model build, updater is present — visibility update
    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);
});

// URL hash propagation

test('writes search term to URL hash when input has propagateToUrl', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const mockInput = createMockSearchInput({ propagateToUrl: true });

    fireRegistration(orchestrator, 'facetedSearchRegisterSearchInput', mockInput, window);
    registerReaderAndUpdater(orchestrator, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.is(window.location.hash, '#search=running');

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
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ], { propagateToUrl: true });

    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filterCategory, window);
    registerReaderAndUpdater(orchestrator, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'shoes', selected: true },
    }));

    t.is(window.location.hash, '#category=shoes');

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'hats', selected: true },
    }));

    t.is(window.location.hash, '#category=shoes%2Chats');

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
    const mockInput = createMockSearchInput({ propagateToUrl: false });

    fireRegistration(orchestrator, 'facetedSearchRegisterSearchInput', mockInput, window);
    registerReaderAndUpdater(orchestrator, window);

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
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
        { id: 'c2', value: 'hats' },
    ]);

    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filterCategory, window);
    registerReaderAndUpdater(orchestrator, window);
    t.truthy(filterCategory.lastCounts);

    filterCategory.lastCounts = null;
    fireRegistration(orchestrator, 'facetedSearchUnregisterFilterValues', filterCategory, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.is(filterCategory.lastCounts, null);
});

test('unregistering reader clears the model', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const reader = createMockReader(testItems);
    const updater = createMockUpdater();
    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', reader, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater, window);
    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);

    fireRegistration(orchestrator, 'facetedSearchUnregisterResultReader', reader, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    // Visibility should not have changed since unregister
    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);
});

test('unregistering updater stops visibility updates but keeps model', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const reader = createMockReader(testItems);
    const updater = createMockUpdater();
    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', reader, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater, window);
    t.deepEqual(updater.lastVisibleIds, ['1', '2', '3']);

    fireRegistration(orchestrator, 'facetedSearchUnregisterResultUpdater', updater, window);

    // Filter still works (model intact), but updater doesn't receive updates
    updater.lastVisibleIds = null;
    const filterCategory = createMockFilterValues('category', [
        { id: 'c1', value: 'shoes' },
    ]);
    fireRegistration(orchestrator, 'facetedSearchRegisterFilterValues', filterCategory, window);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchFilterChange', {
        bubbles: true,
        detail: { name: 'category', value: 'shoes', selected: true },
    }));

    t.is(updater.lastVisibleIds, null);
    t.truthy(filterCategory.lastCounts);
});

// Multiple updaters

test('multiple updaters all receive updateResults calls', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const reader = createMockReader(testItems);
    const updater1 = createMockUpdater();
    const updater2 = createMockUpdater();

    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', reader, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater1, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater2, window);

    t.deepEqual(updater1.lastVisibleIds, ['1', '2', '3']);
    t.deepEqual(updater2.lastVisibleIds, ['1', '2', '3']);

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.deepEqual(updater1.lastVisibleIds, ['1']);
    t.deepEqual(updater2.lastVisibleIds, ['1']);
});

test('unregistering one updater does not affect the other', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    const reader = createMockReader(testItems);
    const updater1 = createMockUpdater();
    const updater2 = createMockUpdater();

    fireRegistration(orchestrator, 'facetedSearchRegisterResultReader', reader, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater1, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterResultUpdater', updater2, window);

    fireRegistration(orchestrator, 'facetedSearchUnregisterResultUpdater', updater1, window);
    updater1.lastVisibleIds = null;

    orchestrator.dispatchEvent(new window.CustomEvent('facetedSearchTermChange', {
        bubbles: true,
        detail: { term: 'running' },
    }));

    t.is(updater1.lastVisibleIds, null);
    t.deepEqual(updater2.lastVisibleIds, ['1']);
});

// Multiple search input warning

test('warns when a second search input registers', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = '<faceted-search></faceted-search>';
    document.body.appendChild(container);

    const orchestrator = document.querySelector('faceted-search');
    registerReaderAndUpdater(orchestrator, window);

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    const input1 = createMockSearchInput();
    const input2 = createMockSearchInput();
    fireRegistration(orchestrator, 'facetedSearchRegisterSearchInput', input1, window);
    fireRegistration(orchestrator, 'facetedSearchRegisterSearchInput', input2, window);

    console.warn = originalWarn;

    t.is(warnings.length, 1);
    t.regex(warnings[0], /Multiple search inputs/);
});
