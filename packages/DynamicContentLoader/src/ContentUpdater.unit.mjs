import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const setup = async (hideErrors) => {
    const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
    return getDOM({ basePath, scripts: ['ContentUpdaterElement.js'], hideErrors });
};

const createChildren = () => (
    `
        <div data-loading hidden>Loading</div>
        <div data-error hidden>Error</div>
        <div data-content>Content</div>
    `
);

test('emits addDynamicContentUpdater with correct arguments', async (t) => {
    const { document, errors, window } = await setup(true);
    const addEventsFired = [];
    window.addEventListener('addDynamicContentUpdater', (ev) => {
        addEventsFired.push(ev);
    });
    const updater = document.createElement('content-updater');
    document.body.appendChild(updater);
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(addEventsFired.length, 1);
    // We expect { detail: { getRequestConfig: function, updateResponseStatus: function } }
    t.is(typeof addEventsFired[0].detail.updateResponseStatus, 'function');
    t.is(typeof addEventsFired[0].detail.getRequestConfig, 'function');
    t.is(errors.length, 0);
});

test('assembles correct URL', async (t) => {
    const { document, errors, window } = await setup(true);
    const addEventsFired = [];
    // We can only access getRequestConfig by listening to addDynamicContentUpdater
    window.addEventListener('addDynamicContentUpdater', (ev) => {
        addEventsFired.push(ev);
    });
    const updater = document.createElement('content-updater');
    document.body.appendChild(updater);
    await new Promise((resolve) => { setTimeout(resolve); });
    const { getRequestConfig } = addEventsFired[0].detail;
    // URL is missing
    t.throws(
        () => getRequestConfig({ searchParams: new URLSearchParams('q=5') }),
        { message: /value undefined is not permitted/ },
    );
    // URL is set
    updater.setAttribute('data-endpoint-url', '/test');
    t.deepEqual(
        getRequestConfig({ searchParams: new URLSearchParams('q=5') }),
        { url: '/test?q=5', data: { action: undefined } },
    );
    // URL is empty
    updater.setAttribute('data-endpoint-url', '');
    t.deepEqual(
        getRequestConfig({ searchParams: new URLSearchParams('q=5'), action: 'paginateAppend' }), 
        { url: '?q=5', data: { action: 'paginateAppend' } },
    );
    t.is(errors.length, 0);
});

test('updates content', async (t) => {
    const { document, errors, window } = await setup(true);
    const addEventsFired = [];
    // We can only access getRequestConfig by listening to addDynamicContentUpdater
    window.addEventListener('addDynamicContentUpdater', (ev) => {
        addEventsFired.push(ev);
    });
    window.requestAnimationFrame = (cb) => { cb(); };
    const updater = document.createElement('content-updater');
    document.body.appendChild(updater);
    await new Promise((resolve) => { setTimeout(resolve); });
    const { updateResponseStatus } = addEventsFired[0].detail;
    // Invalid status
    await t.throwsAsync(
        () => updateResponseStatus({ status: 'test' }),
        { message: /statusUpdate.status to be one of/ },
    );
    // Children missing
    await t.throwsAsync(
        () => updateResponseStatus({ status: 'loading' }),
        { message: /missing element to display status "loading"/ },
    );
    // JSDOM does not provide a scrollTo method
    window.scrollTo = () => {};
    updater.innerHTML = createChildren();
    const loading = updater.querySelector('[data-loading]');
    const error = updater.querySelector('[data-error]');
    const content = updater.querySelector('[data-content]');
    // Loading
    updateResponseStatus({ status: 'loading' });
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(loading.hidden, false);
    t.is(error.hidden, true);
    t.is(content.hidden, true);
    // Loaded
    updateResponseStatus({ status: 'loaded', content: 'test' });
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(loading.hidden, true);
    t.is(error.hidden, true);
    t.is(content.hidden, false);
    t.is(content.innerHTML, 'test');
    // Failed
    updateResponseStatus({ status: 'failed', content: 'test', response: { status: 404 } });
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(loading.hidden, true);
    t.is(error.hidden, false);
    t.is(content.hidden, true);
    t.is(error.innerHTML, 'ERROR: Status 404 – test');
    // Finally …
    t.is(loading.innerHTML, 'Loading');
    t.is(errors.length, 0);
});

test('appends content if requested', async (t) => {
    const addEventsFired = [];
    const { document, errors, window } = await setup(true);
    window.requestAnimationFrame = (cb) => { cb(); };
    window.addEventListener('addDynamicContentUpdater', (ev) => {
        addEventsFired.push(ev);
    });
    const updater = document.createElement('content-updater');
    updater.setAttribute('data-is-main-content', '');
    document.body.appendChild(updater);
    await new Promise((resolve) => { setTimeout(resolve); });
    window.scrollTo = () => {};
    updater.innerHTML = createChildren();
    const { updateResponseStatus } = addEventsFired[0].detail;
    // Check if loading indicator and content are visible during loading
    updateResponseStatus({ status: 'loading', data: { action: 'paginateAppend' } });
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(updater.querySelector('[data-content]').hasAttribute('hidden'), false);
    t.is(updater.querySelector('[data-loading]').hasAttribute('hidden'), false);
    t.is(updater.querySelector('[data-error]').hasAttribute('hidden'), true);
    updateResponseStatus({ status: 'loaded', data: { action: 'paginateAppend' }, content: 'test' });
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(updater.querySelector('[data-content]').innerHTML, 'Contenttest');
    t.is(errors.length, 0);
});

test('scrolls if requested', async (t) => {
    const addEventsFired = [];
    const { document, errors, window } = await setup(true);
    window.requestAnimationFrame = (cb) => { cb(); };
    window.addEventListener('addDynamicContentUpdater', (ev) => {
        addEventsFired.push(ev);
    });
    const updater = document.createElement('content-updater');
    updater.setAttribute('data-is-main-content', '');
    document.body.appendChild(updater);
    await new Promise((resolve) => { setTimeout(resolve); });
    const scrolledArgs = [];
    window.scrollTo = (...args) => { scrolledArgs.push(args); };
    updater.innerHTML = createChildren();
    const { updateResponseStatus } = addEventsFired[0].detail;
    updateResponseStatus({
        status: 'loaded',
        content: 'test',
        data: { action: 'paginateReplace' },
    });
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(scrolledArgs.length, 1);
    t.is(errors.length, 0);
});

test('dispatches contentUpdate events', async (t) => {
    const addEventsFired = [];
    const updateEventsFired = [];
    const { document, errors, window } = await setup(true);
    window.requestAnimationFrame = (cb) => { cb(); };
    window.addEventListener('addDynamicContentUpdater', (ev) => {
        addEventsFired.push(ev);
    });
    const updater = document.createElement('content-updater');
    updater.addEventListener('contentUpdate', (ev) => {
        updateEventsFired.push(ev);
    });
    updater.innerHTML = createChildren();
    document.body.appendChild(updater);
    await new Promise((resolve) => { setTimeout(resolve); });
    const { updateResponseStatus } = addEventsFired[0].detail;
    updateResponseStatus({ status: 'loading', data: { action: 'paginateAppend' }, content: 'loading' });
    updateResponseStatus({ status: 'loaded', data: { action: 'paginateAppend' }, content: 'test' });
    await new Promise((resolve) => { setTimeout(resolve); });
    t.is(updateEventsFired.length, 2);
    t.is(updateEventsFired[0].detail.status, 'loading');
    t.is(updateEventsFired[1].detail.status, 'loaded');
    t.is(errors.length, 0);
});
