import test from 'ava';
import { JSDOM } from 'jsdom';
import FilterValueItem from './FilterValueItem.mjs';

const config = {
    idSelector: '[data-id]',
    valueSelector: '[data-value]',
    amountSelector: '.count',
};

const noop = () => {};

const createElement = (html) => {
    const { document } = new JSDOM(html).window;
    return document.body.firstChild;
};

test('reads id and value from element', (t) => {
    const el = createElement(
        '<div data-id="cat-1" data-value="shoes"><input type="checkbox" /><span class="count">0</span></div>',
    );
    const item = new FilterValueItem(el, config, noop);
    t.is(item.id, 'cat-1');
    t.is(item.value, 'shoes');
});

test('exposes the DOM element', (t) => {
    const el = createElement('<div data-id="cat-1" data-value="shoes"></div>');
    const item = new FilterValueItem(el, config, noop);
    t.is(item.element, el);
});

test('updateCount sets count text', (t) => {
    const el = createElement(
        '<div data-id="cat-1" data-value="shoes"><span class="count">0</span></div>',
    );
    const item = new FilterValueItem(el, config, noop);
    item.updateCount(42, null);
    t.is(el.querySelector('.count').textContent, '42');
});

test('updateCount toggles empty class for zero count', (t) => {
    const el = createElement(
        '<div data-id="cat-1" data-value="shoes"><span class="count">0</span></div>',
    );
    const item = new FilterValueItem(el, config, noop);
    item.updateCount(0, 'is-empty');
    t.true(el.classList.contains('is-empty'));

    item.updateCount(5, 'is-empty');
    t.false(el.classList.contains('is-empty'));
});

test('setChecked sets checkbox state', (t) => {
    const el = createElement(
        '<div data-id="cat-1" data-value="shoes"><input type="checkbox" /></div>',
    );
    const item = new FilterValueItem(el, config, noop);
    item.setChecked(true);
    t.true(el.querySelector('input').checked);

    item.setChecked(false);
    t.false(el.querySelector('input').checked);
});

test('calls onChange callback on checkbox change', (t) => {
    const dom = new JSDOM(
        '<div data-id="cat-1" data-value="shoes"><input type="checkbox" /></div>',
    );
    const el = dom.window.document.body.firstChild;

    const events = [];
    const item = new FilterValueItem(el, config, (detail) => events.push(detail));

    const checkbox = el.querySelector('input');
    checkbox.checked = true;
    checkbox.dispatchEvent(new dom.window.Event('change'));

    t.is(events.length, 1);
    t.is(events[0].value, 'shoes');
    t.is(events[0].selected, true);
});

test('handles missing checkbox gracefully', (t) => {
    const el = createElement('<div data-id="cat-1" data-value="shoes"></div>');
    const item = new FilterValueItem(el, config, noop);
    item.setChecked(true);
    t.pass();
});

test('handles missing count element gracefully', (t) => {
    const el = createElement('<div data-id="cat-1" data-value="shoes"></div>');
    const item = new FilterValueItem(el, { ...config, amountSelector: null }, noop);
    item.updateCount(5, null);
    t.pass();
});
