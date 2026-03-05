import test from 'ava';
import { readHash, writeHashKey, removeHashKey } from './hashSync.mjs';

// readHash

test('parses hash with multiple keys', (t) => {
    const result = readHash('#search=hello&category=a&category=b&color=red');
    t.deepEqual(result, {
        search: ['hello'],
        category: ['a', 'b'],
        color: ['red'],
    });
});

test('handles empty hash', (t) => {
    t.deepEqual(readHash(''), {});
    t.deepEqual(readHash('#'), {});
});

test('handles special characters', (t) => {
    const result = readHash(`#search=${encodeURIComponent('hello world')}&tag=${encodeURIComponent('c++')}`);
    t.deepEqual(result, { search: ['hello world'], tag: ['c++'] });
});

test('ignores pairs without equals sign', (t) => {
    const result = readHash('#validkey=value&invalidpair');
    t.deepEqual(result, { validkey: ['value'] });
});

// writeHashKey

test('writes single key preserving others', (t) => {
    const result = writeHashKey('#debug=true&color=red', 'search', ['hello']);
    t.is(result, 'debug=true&color=red&search=hello');
});

test('writes multiple values as repeated keys', (t) => {
    const result = writeHashKey('', 'category', ['books', 'music']);
    t.is(result, 'category=books&category=music');
});

test('overwrites existing key', (t) => {
    const result = writeHashKey('#search=old', 'search', ['new']);
    t.is(result, 'search=new');
});

test('writes to empty hash', (t) => {
    const result = writeHashKey('', 'search', ['term']);
    t.is(result, 'search=term');
});

test('encodes special characters when writing', (t) => {
    const result = writeHashKey('', 'search', ['hello world']);
    t.is(result, 'search=hello%20world');
});

test('removes key when values array is empty', (t) => {
    const result = writeHashKey('#search=term&color=red', 'search', []);
    t.is(result, 'color=red');
});

// removeHashKey

test('removes key preserving others', (t) => {
    const result = removeHashKey('#search=term&color=red&size=large', 'color');
    t.is(result, 'search=term&size=large');
});

test('handles removing non-existent key', (t) => {
    const result = removeHashKey('#search=term', 'color');
    t.is(result, 'search=term');
});

test('returns empty string when removing last key', (t) => {
    const result = removeHashKey('#search=term', 'search');
    t.is(result, '');
});

// Round-trip

test('round-trips parse and serialize', (t) => {
    const original = `#search=hello%20world&category=books&category=music&color=red`;
    const parsed = readHash(original);
    t.deepEqual(parsed, {
        search: ['hello world'],
        category: ['books', 'music'],
        color: ['red'],
    });
    let hash = writeHashKey('', 'search', parsed.search);
    hash = writeHashKey(`#${hash}`, 'category', parsed.category);
    hash = writeHashKey(`#${hash}`, 'color', parsed.color);
    const reparsed = readHash(`#${hash}`);
    t.deepEqual(reparsed, parsed);
});
