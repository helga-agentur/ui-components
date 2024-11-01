import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const setup = async (hideErrors) => {
    const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
    return getDOM({ basePath, scripts: ['QueryStringUpdaterElement.js'], hideErrors });
};

test('emits loadDynamicContent', async (t) => {
    const { document, errors, window } = await setup(true);
    const events = [];
    window.addEventListener('addDynamicContentUpdater', (ev) => { events.push(ev); });
    const queryStringUpdater = document.createElement('query-string-updater');
    document.body.appendChild(queryStringUpdater);
    await new Promise((resolve) => { setTimeout(resolve); });
    const pushStateArguments = [];
    window.history.pushState = (...state) => { pushStateArguments.push(state); }; 
    events[0].detail.assembleURL({ searchParams: new URLSearchParams('q=5') });
    t.is(pushStateArguments.length, 1);
    t.deepEqual(pushStateArguments[0], [null, '', '?q=5']);
    t.is(errors.length, 0);
});
