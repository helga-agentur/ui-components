import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../../../src/testHelpers/getDOM.mjs';

const setup = async (hideErrors) => {
    const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
    return getDOM({
        basePath,
        scripts: ['LinkListenerElement.js'],
        hideErrors,
        jsdomOptions: { url: 'https://example.com/test' },
    });
};

test('emits loadDynamicContent and uses closest href\'s query string as event detail', async (t) => {
    const { document, errors, window } = await setup(true);
    const link = document.createElement('a');
    document.body.appendChild(link);
    const linkListener = document.createElement('link-listener');
    link.appendChild(linkListener);
    const events = [];
    window.addEventListener('loadDynamicContent', (ev) => { events.push(ev); });
    // Without href: Nothing happens
    linkListener.dispatchEvent(new window.MouseEvent('click'));
    t.is(events.length, 0);
    // With href: Event is dispatched
    link.setAttribute('href', '/test');
    linkListener.dispatchEvent(new window.MouseEvent('click'));
    t.is(events.length, 1);
    t.is(events[0].detail.requestConfiguration.searchParams.toString(), '');
    // Test with queryString
    link.setAttribute('href', '/test?q=5');
    linkListener.dispatchEvent(new window.MouseEvent('click'));
    t.is(events.length, 2);
    t.is(events[1].detail.requestConfiguration.searchParams.toString(), 'q=5');
    // Finally …
    t.is(errors.length, 0);
});
