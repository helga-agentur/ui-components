import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

const setup = async (hideErrors) => getDOM({
    basePath,
    scripts: ['FacetedSearchResultUpdaterElement.mjs'],
    hideErrors,
});

const updaterHTML = `
    <faceted-search-result-updater
        data-item-selector=".result-item"
        data-item-id-selector="[data-id]"
        data-empty-results-selector=".no-results"
        data-results-selector=".results-wrapper"
    >
        <div class="results-wrapper">
            <div class="result-item" data-id="1">Item 1</div>
            <div class="result-item" data-id="2">Item 2</div>
            <div class="result-item" data-id="3">Item 3</div>
        </div>
        <div class="no-results" hidden>No results found</div>
    </faceted-search-result-updater>
`;

test('registers with orchestrator via facetedSearchRegisterResultUpdater event', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = updaterHTML;

    const events = [];
    container.addEventListener('facetedSearchRegisterResultUpdater', (ev) => {
        events.push(ev.detail);
    });

    document.body.appendChild(container);
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    const component = document.querySelector('faceted-search-result-updater');
    t.is(events.length, 1);
    t.is(events[0].element, component);
    t.is(errors.length, 0);
});

test('updateResults shows matching items and hides others', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = updaterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-updater');
    component.updateResults(['1', '3']);

    const item1 = document.querySelector('[data-id="1"]');
    const item2 = document.querySelector('[data-id="2"]');
    const item3 = document.querySelector('[data-id="3"]');
    t.false(item1.hidden);
    t.true(item2.hidden);
    t.false(item3.hidden);
    t.is(errors.length, 0);
});

test('updateResults reorders DOM nodes', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = updaterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-updater');
    component.updateResults(['3', '1']);

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
    container.innerHTML = updaterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-updater');
    component.updateResults([]);

    const emptyMessage = document.querySelector('.no-results');
    t.false(emptyMessage.hidden);
    t.is(errors.length, 0);
});

test('hides results wrapper when empty', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = updaterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-updater');
    component.updateResults([]);

    const resultsWrapper = document.querySelector('.results-wrapper');
    t.true(resultsWrapper.hidden);
    t.is(errors.length, 0);
});

test('restores results wrapper when results appear', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = updaterHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-result-updater');
    component.updateResults([]);
    component.updateResults(['1']);

    const resultsWrapper = document.querySelector('.results-wrapper');
    t.false(resultsWrapper.hidden);
    const emptyMessage = document.querySelector('.no-results');
    t.true(emptyMessage.hidden);
    t.is(errors.length, 0);
});
