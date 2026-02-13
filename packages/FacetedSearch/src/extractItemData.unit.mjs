import test from 'ava';
import { JSDOM } from 'jsdom';
import { extractItemData, readItemAttribute, extractAttributeName } from './extractItemData.mjs';

const createItem = (html) => {
    const { document } = new JSDOM(html).window;
    return document.body.firstChild;
};

// extractAttributeName

test('extracts attribute name from bracket selector', (t) => {
    t.is(extractAttributeName('[data-id]'), 'data-id');
    t.is(extractAttributeName('[data-category]'), 'data-category');
});

test('returns selector as-is if no brackets', (t) => {
    t.is(extractAttributeName('data-id'), 'data-id');
});

// readItemAttribute

test('reads attribute from element itself', (t) => {
    const item = createItem('<div data-id="42"></div>');
    t.is(readItemAttribute(item, '[data-id]'), '42');
});

test('reads attribute from child element', (t) => {
    const item = createItem('<div><span data-id="42"></span></div>');
    t.is(readItemAttribute(item, '[data-id]'), '42');
});

test('returns null when attribute not found', (t) => {
    const item = createItem('<div></div>');
    t.is(readItemAttribute(item, '[data-id]'), null);
});

// extractItemData

test('extracts id, filter fields and search fields', (t) => {
    const item = createItem(
        '<div data-id="1" data-category="shoes" data-name="Red Shoe" data-description="Fast"></div>',
    );
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [{ fieldIDSelector: '[data-category]', filterName: 'category' }],
        searchProperties: [{ fieldIDSelector: '[data-name]' }, { fieldIDSelector: '[data-description]' }],
    });
    t.is(result.id, '1');
    t.deepEqual(result.filterFields.category, ['shoes']);
    t.is(result.searchFields['data-name'], 'Red Shoe');
    t.is(result.searchFields['data-description'], 'Fast');
});

test('splits multi-value filter fields by separator', (t) => {
    const item = createItem('<div data-id="1" data-tags="sport, outdoor, running"></div>');
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [{ fieldIDSelector: '[data-tags]', filterName: 'tags', valueSeparator: ',' }],
        searchProperties: [],
    });
    t.deepEqual(result.filterFields.tags, ['sport', 'outdoor', 'running']);
});

test('returns empty array for missing filter field', (t) => {
    const item = createItem('<div data-id="1"></div>');
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [{ fieldIDSelector: '[data-category]', filterName: 'category' }],
        searchProperties: [],
    });
    t.deepEqual(result.filterFields.category, []);
});

test('returns empty string for missing search field', (t) => {
    const item = createItem('<div data-id="1"></div>');
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [],
        searchProperties: [{ fieldIDSelector: '[data-name]' }],
    });
    t.is(result.searchFields['data-name'], '');
});

test('returns null id when id attribute is missing', (t) => {
    const item = createItem('<div></div>');
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [],
        searchProperties: [],
    });
    t.is(result.id, null);
});
