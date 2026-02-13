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
