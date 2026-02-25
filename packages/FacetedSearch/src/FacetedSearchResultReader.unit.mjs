import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

const setup = async (hideErrors) => getDOM({
    basePath,
    scripts: ['FacetedSearchResultReaderElement.mjs'],
    hideErrors,
});

test('defineElement registers the custom element', async (t) => {
    const { window } = await setup();
    t.truthy(window.customElements.get('faceted-search-result-reader'));
});

test('defineElement is idempotent', async (t) => {
    const { window } = await setup();
    const FacetedSearchResultReader = window.customElements.get('faceted-search-result-reader');
    t.notThrows(() => FacetedSearchResultReader.defineElement());
    t.is(window.customElements.get('faceted-search-result-reader'), FacetedSearchResultReader);
});

const readerHTML = `
    <faceted-search-result-reader
        data-item-selector=".result-item"
        data-item-id-selector="[data-id]"
        data-filter-properties='[{"fieldIDSelector":"[data-category]","filterName":"category","valueSeparator":null},{"fieldIDSelector":"[data-tags]","filterName":"tags","valueSeparator":","}]'
        data-search-properties='[{"fieldIDSelector":"[data-name]","boost":2},{"fieldIDSelector":"[data-description]"}]'
    >
        <div class="result-item" data-id="1" data-category="shoes" data-tags="sport,outdoor" data-name="Red Shoe" data-description="A fast shoe">Item 1</div>
        <div class="result-item" data-id="2" data-category="hats" data-tags="casual" data-name="Blue Hat" data-description="A nice hat">Item 2</div>
        <div class="result-item" data-id="3" data-category="shoes" data-tags="casual,indoor" data-name="Green Shoe" data-description="A comfy shoe">Item 3</div>
    </faceted-search-result-reader>
`;

test('registers with orchestrator via facetedSearchRegisterResultReader event', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = readerHTML;

    const events = [];
    container.addEventListener('facetedSearchRegisterResultReader', (ev) => {
        events.push(ev.detail);
    });

    document.body.appendChild(container);
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    const component = document.querySelector('faceted-search-result-reader');
    t.is(events.length, 1);
    t.is(events[0].element, component);
    t.is(errors.length, 0);
});

test('getItemData extracts filter and search fields', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = readerHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-reader');
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
    container.innerHTML = readerHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-reader');
    const data = component.getItemData();

    t.deepEqual(data[0].filterFields.tags, ['sport', 'outdoor']);
    t.deepEqual(data[1].filterFields.tags, ['casual']);
    t.deepEqual(data[2].filterFields.tags, ['casual', 'indoor']);
    t.is(errors.length, 0);
});

test('returns empty array when no items match selector', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = `
        <faceted-search-result-reader
            data-item-selector=".nonexistent"
            data-item-id-selector="[data-id]"
            data-search-properties='[{"fieldIDSelector":"[data-name]"}]'
        ></faceted-search-result-reader>
    `;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-reader');
    t.deepEqual(component.getItemData(), []);
    t.is(errors.length, 0);
});
