import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const setup = async (hideErrors) => {
    const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
    return getDOM({ basePath, scripts: ['FilterChangeListenerElement.js'], hideErrors });
};

test('emits loadDynamicContent and adds correct event details', async (t) => {
    const { document, errors, window } = await setup(true);
    const filterChangeListener = document.createElement('filter-change-listener');
    document.body.appendChild(filterChangeListener);
    const events = [];
    window.addEventListener('loadDynamicContent', (ev) => { events.push(ev); });
    // Without form: throws
    filterChangeListener.dispatchEvent(new window.MouseEvent('change'));
    t.is(errors.length, 1);
    t.is(errors[0].message.includes('Missing child form element'), true);
    errors.shift();
    // With form: Event is dispatched
    const form = document.createElement('form');
    filterChangeListener.appendChild(form);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'test';
    input.checked = true;
    const input2 = document.createElement('input');
    // Make sure that empty values are not added to searchParams
    input2.type = 'checkbox';
    input2.name = 'empty';
    input2.checked = false;
    form.appendChild(input);
    filterChangeListener.dispatchEvent(new window.MouseEvent('change'));
    t.is(events.length, 1);
    t.is(events[0].detail.requestConfiguration.searchParams.toString(), 'test=on');
    // Finally …
    t.is(errors.length, 0);
});
