import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

const setup = async (hideErrors) => getDOM({
    basePath,
    scripts: ['FacetedSearchResultsAmountElement.mjs'],
    hideErrors,
});

const amountHTML = `
    <faceted-search-results-amount data-amount-selector=".count">
        <span class="count"></span>
    </faceted-search-results-amount>
`;

test('registers with orchestrator via facetedSearchRegisterResultUpdater event', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = amountHTML;

    const events = [];
    container.addEventListener('facetedSearchRegisterResultUpdater', (ev) => {
        events.push(ev.detail);
    });

    document.body.appendChild(container);
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    const component = document.querySelector('faceted-search-results-amount');
    t.is(events.length, 1);
    t.is(events[0].element, component);
    t.is(errors.length, 0);
});

test('updateResults sets count as textContent', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = amountHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-results-amount');
    component.updateResults(['1', '2', '3']);

    const countEl = document.querySelector('.count');
    t.is(countEl.textContent, '3');
    t.is(errors.length, 0);
});

test('updateResults displays 0 for empty results', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = amountHTML;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-results-amount');
    component.updateResults([]);

    const countEl = document.querySelector('.count');
    t.is(countEl.textContent, '0');
    t.is(errors.length, 0);
});

test('silently skips when amount selector matches no element', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = `
        <faceted-search-results-amount data-amount-selector=".missing">
        </faceted-search-results-amount>
    `;
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-results-amount');
    component.updateResults(['1', '2']);

    t.is(errors.length, 0);
});
