import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

const setup = async (hideErrors) => getDOM({
    basePath,
    scripts: ['FacetedSearchFilterValuesElement.mjs'],
    hideErrors,
});

test('defineElement registers the custom element', async (t) => {
    const { window } = await setup();
    t.truthy(window.customElements.get('faceted-search-filter-values'));
});

test('defineElement is idempotent', async (t) => {
    const { window } = await setup();
    const FacetedSearchFilterValues = window.customElements.get('faceted-search-filter-values');
    t.notThrows(() => FacetedSearchFilterValues.defineElement());
    t.is(window.customElements.get('faceted-search-filter-values'), FacetedSearchFilterValues);
});

const filterHTML = `
    <faceted-search-filter-values
        data-filter-name="category"
        data-item-selector=".filter-item"
        data-item-value-selector="[data-value]"
        data-item-id-selector="[data-id]"
        data-leads-to-empty-result-class="is-empty"
        data-item-amount-selector=".count"
    >
        <div class="filter-item" data-id="cat-shoes" data-value="shoes">
            <input type="checkbox" />
            <span>Shoes</span>
            <span class="count">0</span>
        </div>
        <div class="filter-item" data-id="cat-hats" data-value="hats">
            <input type="checkbox" />
            <span>Hats</span>
            <span class="count">0</span>
        </div>
        <div class="filter-item" data-id="cat-bags" data-value="bags">
            <input type="checkbox" />
            <span>Bags</span>
            <span class="count">0</span>
        </div>
    </faceted-search-filter-values>
`;

test('registers with orchestrator via event containing component reference', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = filterHTML;

    const events = [];
    container.addEventListener('facetedSearchRegisterFilterValues', (ev) => {
        events.push(ev.detail);
    });

    document.body.appendChild(container);

    await new Promise((resolve) => { setTimeout(resolve, 0); });

    const component = document.querySelector('faceted-search-filter-values');
    t.is(events.length, 1);
    t.is(events[0].element, component);
    t.is(errors.length, 0);
});

test('getFilterData returns filter name and values', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = filterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    const data = component.getFilterData();

    t.is(data.name, 'category');
    t.is(data.values.length, 3);
    t.deepEqual(data.values[0], { id: 'cat-shoes', value: 'shoes' });
    t.deepEqual(data.values[1], { id: 'cat-hats', value: 'hats' });
    t.deepEqual(data.values[2], { id: 'cat-bags', value: 'bags' });
    t.is(errors.length, 0);
});

test('emits filter change on checkbox toggle', async (t) => {
    const { document, errors, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = filterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    // Trigger lazy collection by calling getFilterData
    component.getFilterData();

    const events = [];
    component.addEventListener('facetedSearchFilterChange', (ev) => {
        events.push(ev.detail);
    });

    const checkbox = document.querySelector('.filter-item [type="checkbox"]');
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));

    t.is(events.length, 1);
    t.is(events[0].name, 'category');
    t.is(events[0].value, 'shoes');
    t.is(events[0].selected, true);
    t.is(errors.length, 0);
});

test('updateExpectedResults sets count text', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = filterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    component.updateExpectedResults({
        'cat-shoes': 5,
        'cat-hats': 3,
        'cat-bags': 0,
    });

    const counts = document.querySelectorAll('.count');
    t.is(counts[0].textContent, '5');
    t.is(counts[1].textContent, '3');
    t.is(counts[2].textContent, '0');
    t.is(errors.length, 0);
});

test('updateExpectedResults applies empty result class for zero counts', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = filterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    component.updateExpectedResults({
        'cat-shoes': 5,
        'cat-hats': 0,
        'cat-bags': 0,
    });

    const items = document.querySelectorAll('.filter-item');
    t.false(items[0].classList.contains('is-empty'));
    t.true(items[1].classList.contains('is-empty'));
    t.true(items[2].classList.contains('is-empty'));
    t.is(errors.length, 0);
});

test('updateExpectedResults removes empty class when count becomes positive', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = filterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    component.updateExpectedResults({ 'cat-shoes': 0 });
    t.true(document.querySelector('[data-id="cat-shoes"]').classList.contains('is-empty'));

    component.updateExpectedResults({ 'cat-shoes': 3 });
    t.false(document.querySelector('[data-id="cat-shoes"]').classList.contains('is-empty'));
    t.is(errors.length, 0);
});

test('setChecked sets checkbox state programmatically', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = filterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    component.setChecked('hats', true);

    const checkbox = document.querySelectorAll('.filter-item input[type="checkbox"]')[1];
    t.true(checkbox.checked);
    t.is(errors.length, 0);
});

// select-one-only support

const selectOneFilterHTML = `
    <faceted-search-filter-values
        data-filter-name="size"
        data-item-selector=".filter-item"
        data-item-value-selector="[data-value]"
        data-item-id-selector="[data-id]"
        data-item-amount-selector=".count"
    >
        <div class="filter-item" data-id="size-s" data-value="small">
            <input type="radio" name="size" />
            <span>Small</span>
            <span class="count">0</span>
        </div>
        <div class="filter-item" data-id="size-m" data-value="medium">
            <input type="radio" name="size" />
            <span>Medium</span>
            <span class="count">0</span>
        </div>
        <div class="filter-item" data-id="size-l" data-value="large">
            <input type="radio" name="size" />
            <span>Large</span>
            <span class="count">0</span>
        </div>
    </faceted-search-filter-values>
`;

test('selectOneOnly: first selection emits only select event', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = selectOneFilterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    component.getFilterData();

    const events = [];
    component.addEventListener('facetedSearchFilterChange', (ev) => {
        events.push(ev.detail);
    });

    const checkbox = document.querySelector('[data-value="small"] input');
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change', { bubbles: true }));

    t.is(events.length, 1);
    t.deepEqual(events[0], { name: 'size', value: 'small', selected: true });
});

test('selectOneOnly: selecting another value emits deselect then select', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = selectOneFilterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');
    component.getFilterData();

    const events = [];
    component.addEventListener('facetedSearchFilterChange', (ev) => {
        events.push({ ...ev.detail });
    });

    const first = document.querySelector('[data-value="small"] input');
    first.checked = true;
    first.dispatchEvent(new window.Event('change', { bubbles: true }));

    const second = document.querySelector('[data-value="medium"] input');
    second.checked = true;
    second.dispatchEvent(new window.Event('change', { bubbles: true }));

    t.is(events.length, 3);
    t.deepEqual(events[0], { name: 'size', value: 'small', selected: true });
    t.deepEqual(events[1], { name: 'size', value: 'small', selected: false });
    t.deepEqual(events[2], { name: 'size', value: 'medium', selected: true });
});

test('selectOneOnly: setChecked tracks active value for subsequent changes', async (t) => {
    const { document, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = selectOneFilterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-filter-values');

    // Programmatically select "small"
    component.setChecked('small', true);
    t.true(document.querySelector('[data-value="small"] input').checked);

    // Now simulate user clicking "medium" — should emit deselect for "small"
    const events = [];
    component.addEventListener('facetedSearchFilterChange', (ev) => {
        events.push({ ...ev.detail });
    });

    const medium = document.querySelector('[data-value="medium"] input');
    medium.checked = true;
    medium.dispatchEvent(new window.Event('change', { bubbles: true }));

    t.is(events.length, 2);
    t.deepEqual(events[0], { name: 'size', value: 'small', selected: false });
    t.deepEqual(events[1], { name: 'size', value: 'medium', selected: true });
});
