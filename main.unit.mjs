import test from 'ava';
import { createDebounce, once, splitText } from './main.mjs';

test('exports expected structures', (t) => {
    t.is(typeof createDebounce, 'function');
    t.is(typeof once, 'function');
    t.is(typeof splitText, 'function');
});
