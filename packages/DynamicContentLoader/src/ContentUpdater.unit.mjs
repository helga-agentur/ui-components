import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const setup = async (hideErrors) => {
    const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
    return getDOM({ basePath, scripts: ['ContentUpdaterElement.js'], hideErrors });
};

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
        { url: '/test?q=5' },
    );
    // URL is empty
    updater.setAttribute('data-endpoint-url', '');
    t.deepEqual(
        getRequestConfig({ searchParams: new URLSearchParams('q=5') }), 
        { url: '?q=5' },
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
    const updater = document.createElement('content-updater');
    document.body.appendChild(updater);
    await new Promise((resolve) => { setTimeout(resolve); });
    const { updateResponseStatus } = addEventsFired[0].detail;
    // Invalid status
    t.throws(
        () => updateResponseStatus({ status: 'test' }),
        { message: /statusUpdate.status to be one of/ },
    );
    // Children missing
    t.throws(
        () => updateResponseStatus({ status: 'loading' }),
        { message: /missing element to display status "loading"/ },
    );
    // Add children
    const children = `
        <div data-loading hidden>Loading</div>
        <div data-error hidden>Error</div>
        <div data-content>Content</div>
    `;
    // JSDOM does not provide a scrollTo method
    window.scrollTo = () => {};
    updater.innerHTML = children;
    const loading = updater.querySelector('[data-loading]');
    const error = updater.querySelector('[data-error]');
    const content = updater.querySelector('[data-content]');
    // Loading
    updateResponseStatus({ status: 'loading' });
    t.is(loading.hidden, false);
    t.is(error.hidden, true);
    t.is(content.hidden, true);
    // Loaded
    updateResponseStatus({ status: 'loaded', content: 'test' });
    t.is(loading.hidden, true);
    t.is(error.hidden, true);
    t.is(content.hidden, false);
    t.is(content.innerHTML, 'test');
    // Failed
    updateResponseStatus({ status: 'failed', content: 'test', response: { status: 404 } });
    t.is(loading.hidden, true);
    t.is(error.hidden, false);
    t.is(content.hidden, true);
    t.is(error.innerHTML, 'ERROR: Status 404 – test');
    // Finally …
    t.is(loading.innerHTML, 'Loading');
    t.is(errors.length, 0);
});
