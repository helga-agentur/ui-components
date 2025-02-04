import {
    readAttribute, debounce, once, measureElement, Dimensions,
} from '@helga-agency/ui-tools';

/**
 * Testfile for the type declarations of @joinbox/ui-tools.
 * Just run `tsc --noEmit` to see if there are no errors.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

const element = document.createElement('div');
element.id = 'ts-test';
element.setAttribute('data-string', '  test ');
element.setAttribute('data-number', '123');

/**
 * readAttribute()
 */
const readString: string = readAttribute<string>(element, 'data-string', {
    transform: (value: string) => value.trim(),
    validate: (value: string) => !!value,
    expectation: 'a none-empty string',
});

const readNumber: number = readAttribute<number>(element, 'data-number', {
    transform: (value: string) => parseFloat(value),
    validate: (value: number) => !Number.isNaN(value),
    expectation: 'a number',
});

/**
 * debounce()
 */
const debouncedFunction: () => void = debounce((): void => {
    console.log('debounced log');
}, 500);

/**
 * once()
 */
const onceReturnValue = once(element, 'once-test', (): void => {
    console.log('once-test', element.hasAttribute('data-initialized-once-test'));
});

/**
 * measureElement()
 */
const dimensions: Dimensions = measureElement({ element });

/* eslint-enable @typescript-eslint/no-unused-vars */
