import test from 'ava';
import addSearchParamsToURL from './addSearchParamsToURL.mjs';

test('adds searchParams to url', (t) => {
    const url = new URL('https://example.com');
    const searchParams = new URLSearchParams();
    searchParams.set('foo', 'bar');
    searchParams.set('baz', 'qux');
    const newURL = addSearchParamsToURL(url, searchParams);
    t.is(newURL.toString(), 'https://example.com/?foo=bar&baz=qux');
});

test('does not add ? if searchParams are empty', (t) => {
    const url = new URL('https://example.com');
    const searchParams = new URLSearchParams();
    const newURL = addSearchParamsToURL(url, searchParams);
    t.is(newURL.toString(), 'https://example.com/');
});

test('does not modify input URL', (t) => {
    const url = new URL('https://example.com');
    const searchParams = new URLSearchParams();
    searchParams.set('foo', 'bar');
    addSearchParamsToURL(url, searchParams);
    t.is(url.toString(), 'https://example.com/');
});

