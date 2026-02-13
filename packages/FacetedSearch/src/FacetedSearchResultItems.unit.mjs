import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

const setup = async (hideErrors) => getDOM({
    basePath,
    scripts: ['FacetedSearchResultItemsElement.mjs'],
    hideErrors,
});

const resultItemsHTML = `
    <faceted-search-result-items
        data-item-selector=".result-item"
        data-item-id-selector="[data-id]"
        data-filter-properties='[{"fieldIDSelector":"[data-category]","filterName":"category","valueSeparator":null},{"fieldIDSelector":"[data-tags]","filterName":"tags","valueSeparator":","}]'
        data-search-properties='[{"fieldIDSelector":"[data-name]","boost":2},{"fieldIDSelector":"[data-description]"}]'
        data-empty-results-selector=".no-results"
        data-results-selector=".results-wrapper"
    >
        <div class="results-wrapper">
            <div class="result-item" data-id="1" data-category="shoes" data-tags="sport,outdoor" data-name="Red Shoe" data-description="A fast shoe">Item 1</div>
            <div class="result-item" data-id="2" data-category="hats" data-tags="casual" data-name="Blue Hat" data-description="A nice hat">Item 2</div>
            <div class="result-item" data-id="3" data-category="shoes" data-tags="casual,indoor" data-name="Green Shoe" data-description="A comfy shoe">Item 3</div>
        </div>
        <div class="no-results" hidden>No results found</div>
    </faceted-search-result-items>
`;

test('getItemData extracts filter and search fields', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = resultItemsHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-items');
    const data = component.getItemData();

    t.is(data.length, 3);
    t.is(data[0].id, '1');
    t.deepEqual(data[0].filterFields.category, ['shoes']);
    t.deepEqual(data[0].filterFields.tags, ['sport', 'outdoor']);
    t.is(data[0].searchFields['data-name'], 'Red Shoe');
    t.is(data[0].searchFields['data-description'], 'A fast shoe');
    t.is(errors.length, 0);
});

test('handles multi-value filter fields with separator', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = resultItemsHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-items');
    const data = component.getItemData();

    t.deepEqual(data[0].filterFields.tags, ['sport', 'outdoor']);
    t.deepEqual(data[1].filterFields.tags, ['casual']);
    t.deepEqual(data[2].filterFields.tags, ['casual', 'indoor']);
    t.is(errors.length, 0);
});

test('updateVisibility shows matching items and hides others', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = resultItemsHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-items');
    component.updateVisibility(['1', '3']);

    const item1 = document.querySelector('[data-id="1"]');
    const item2 = document.querySelector('[data-id="2"]');
    const item3 = document.querySelector('[data-id="3"]');
    t.false(item1.hidden);
    t.true(item2.hidden);
    t.false(item3.hidden);
    t.is(errors.length, 0);
});

test('updateVisibility reorders DOM nodes', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = resultItemsHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-items');
    component.updateVisibility(['3', '1']);

    const visibleItems = [...document.querySelectorAll('.result-item')]
        .filter((el) => !el.hidden);

    t.is(visibleItems.length, 2);
    t.is(visibleItems[0].getAttribute('data-id'), '3');
    t.is(visibleItems[1].getAttribute('data-id'), '1');
    t.is(errors.length, 0);
});

test('shows empty message when no results', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = resultItemsHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-items');
    component.updateVisibility([]);

    const emptyMessage = document.querySelector('.no-results');
    t.false(emptyMessage.hidden);
    t.is(errors.length, 0);
});

test('hides results wrapper when empty', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = resultItemsHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-items');
    component.updateVisibility([]);

    const resultsWrapper = document.querySelector('.results-wrapper');
    t.true(resultsWrapper.hidden);
    t.is(errors.length, 0);
});

test('restores results wrapper when results appear', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = resultItemsHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-items');
    component.updateVisibility([]);
    component.updateVisibility(['1']);

    const resultsWrapper = document.querySelector('.results-wrapper');
    t.false(resultsWrapper.hidden);
    const emptyMessage = document.querySelector('.no-results');
    t.true(emptyMessage.hidden);
    t.is(errors.length, 0);
});
