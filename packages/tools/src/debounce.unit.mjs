import test from 'ava';
import debounce from './debounce.mjs';

test('waits with execution', async (t) => {
    let called = 0;
    const call = () => called++;
    const debouncedCall = debounce(call, 5);
    debouncedCall();
    t.is(called, 0);
    await new Promise((resolve) => setTimeout(resolve, 5));
    t.is(called, 1);
});

test('debounce re-starts timer', async (t) => {
    let called = 0;
    const call = () => { called += 1; };
    const debouncedCall = debounce(call, 5);
    debouncedCall();
    await new Promise((resolve) => setTimeout(resolve, 3));
    debouncedCall();
    await new Promise((resolve) => setTimeout(resolve, 3));
    debouncedCall();
    await new Promise((resolve) => setTimeout(resolve, 5));
    t.is(called, 1);
});
