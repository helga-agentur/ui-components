import test from 'ava';
import { JSDOM } from 'jsdom';
import {
    extractItemData, readItemAttribute, readItemValue, extractAttributeName, isAttributeSelector,
} from './extractItemData.mjs';

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

// isAttributeSelector

test('detects attribute selectors', (t) => {
    t.true(isAttributeSelector('[data-id]'));
    t.true(isAttributeSelector('.name[data-x]'));
    t.false(isAttributeSelector('.name'));
    t.false(isAttributeSelector('h3'));
});

// readItemValue

test('reads attribute value for attribute selectors', (t) => {
    const item = createItem('<div data-name="Red Shoe"></div>');
    t.is(readItemValue(item, '[data-name]'), 'Red Shoe');
});

test('reads textContent for element selectors on child', (t) => {
    const item = createItem('<div><span class="name">Red Shoe</span></div>');
    t.is(readItemValue(item, '.name'), 'Red Shoe');
});

test('reads textContent for element selectors on item itself', (t) => {
    const item = createItem('<div class="name">Red Shoe</div>');
    t.is(readItemValue(item, '.name'), 'Red Shoe');
});

test('trims textContent whitespace', (t) => {
    const item = createItem('<div><span class="name">  Red Shoe  </span></div>');
    t.is(readItemValue(item, '.name'), 'Red Shoe');
});

test('returns null for element selector when no match', (t) => {
    const item = createItem('<div></div>');
    t.is(readItemValue(item, '.name'), null);
});

test('flattens nested HTML in textContent', (t) => {
    const item = createItem('<div><span class="name"><em>Red</em> Shoe</span></div>');
    t.is(readItemValue(item, '.name'), 'Red Shoe');
});

// extractItemData with element selectors

test('uses textContent for search properties with element selectors', (t) => {
    const item = createItem(
        '<div data-id="1"><span class="name">Red Shoe</span></div>',
    );
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [],
        searchProperties: [{ fieldIDSelector: '.name' }],
    });
    t.is(result.searchFields['.name'], 'Red Shoe');
});

test('mixes attribute and element selectors in search properties', (t) => {
    const item = createItem(
        '<div data-id="1" data-sku="ABC"><span class="name">Red Shoe</span></div>',
    );
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [],
        searchProperties: [
            { fieldIDSelector: '[data-sku]' },
            { fieldIDSelector: '.name' },
        ],
    });
    t.is(result.searchFields['data-sku'], 'ABC');
    t.is(result.searchFields['.name'], 'Red Shoe');
});

test('returns empty string for element selector with empty content', (t) => {
    const item = createItem('<div data-id="1"><span class="name">   </span></div>');
    const result = extractItemData(item, {
        itemIdSelector: '[data-id]',
        filterProperties: [],
        searchProperties: [{ fieldIDSelector: '.name' }],
    });
    t.is(result.searchFields['.name'], '');
});
