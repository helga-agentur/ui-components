import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const basePath = dirname(fileURLToPath(new URL(import.meta.url)));

const setup = async (hideErrors) => getDOM({
    basePath,
    scripts: ['FacetedSearchInputElement.mjs'],
    hideErrors,
});

test('defineElement registers the custom element', async (t) => {
    const { window } = await setup();
    t.truthy(window.customElements.get('faceted-search-input'));
});

test('defineElement is idempotent', async (t) => {
    const { window } = await setup();
    const FacetedSearchInput = window.customElements.get('faceted-search-input');
    t.notThrows(() => FacetedSearchInput.defineElement());
    t.is(window.customElements.get('faceted-search-input'), FacetedSearchInput);
});

const inputHTML = (attrs = '') => `
    <faceted-search-input ${attrs}>
        <input type="text" />
    </faceted-search-input>
`;

test('registers with orchestrator via event containing component reference', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = inputHTML();

    const events = [];
    container.addEventListener('facetedSearchRegisterSearchInput', (ev) => {
        events.push(ev.detail);
    });

    document.body.appendChild(container);

    // Registration is delayed via setTimeout
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    const component = document.querySelector('faceted-search-input');
    t.is(events.length, 1);
    t.is(events[0].element, component);
    t.is(errors.length, 0);
});

test('emits on Enter when live search disabled', async (t) => {
    const { document, errors, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = inputHTML();
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-input');
    const input = component.querySelector('input');

    const events = [];
    component.addEventListener('facetedSearchTermChange', (ev) => {
        events.push(ev.detail);
    });

    input.value = 'hello';
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter' }));

    t.is(events.length, 1);
    t.is(events[0].term, 'hello');
    t.is(errors.length, 0);
});

test('does not emit on input when live search disabled', async (t) => {
    const { document, errors, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = inputHTML();
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-input');
    const input = component.querySelector('input');

    const events = [];
    component.addEventListener('facetedSearchTermChange', (ev) => {
        events.push(ev.detail);
    });

    input.value = 'hello';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));

    // Wait for potential debounce
    await new Promise((resolve) => { setTimeout(resolve, 300); });

    t.is(events.length, 0);
    t.is(errors.length, 0);
});

test('emits debounced on input when live search enabled', async (t) => {
    const { document, errors, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = inputHTML('data-live-search data-debounce="50"');
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-input');
    const input = component.querySelector('input');

    const events = [];
    component.addEventListener('facetedSearchTermChange', (ev) => {
        events.push(ev.detail);
    });

    input.value = 'h';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    input.value = 'he';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    input.value = 'hel';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));

    // Should not have emitted yet
    t.is(events.length, 0);

    // Wait for debounce to fire
    await new Promise((resolve) => { setTimeout(resolve, 100); });

    // Should have emitted once with the last value
    t.is(events.length, 1);
    t.is(events[0].term, 'hel');
    t.is(errors.length, 0);
});

test('setSearchTerm sets input value without emitting', async (t) => {
    const { document, errors } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = inputHTML();
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-input');
    const input = component.querySelector('input');

    const events = [];
    component.addEventListener('facetedSearchTermChange', (ev) => {
        events.push(ev.detail);
    });

    component.setSearchTerm('restored');

    t.is(input.value, 'restored');
    t.is(events.length, 0);
    t.is(errors.length, 0);
});

test('respects custom debounce delay', async (t) => {
    const { document, errors, window } = await setup(true);
    const container = document.createElement('div');
    container.innerHTML = inputHTML('data-live-search data-debounce="150"');
    document.body.appendChild(container);

    const component = document.querySelector('faceted-search-input');
    const input = component.querySelector('input');

    const events = [];
    component.addEventListener('facetedSearchTermChange', (ev) => {
        events.push(ev.detail);
    });

    input.value = 'test';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));

    // After 50ms, should not have emitted (delay is 150)
    await new Promise((resolve) => { setTimeout(resolve, 50); });
    t.is(events.length, 0);

    // After 200ms total, should have emitted
    await new Promise((resolve) => { setTimeout(resolve, 150); });
    t.is(events.length, 1);
    t.is(events[0].term, 'test');
    t.is(errors.length, 0);
});
