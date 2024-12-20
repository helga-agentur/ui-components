# Tools

Provides some simple and regularily used frontend helpers for JavaScript.

## readAttribute

### Description
Reads, transforms and validates an attribute from an HTML element.

### Usage

```
import { readAttribute } from '@helga-agency/ui-tools';

const element = document.querySelector('div.className');
readAttribute(element, 'attributeName', { transform: (value) => parseInt(value, 10) });
```

### Arguments

Syntax: `readAttribute(element, attribute, additionalArguments)`;

- `element` (`HTMLElement`, required): Element to read attribute from
- `attribute` (`string`, required): Name of the attribute to read
- `additionalArguments` (`object`, optional): Object with properties
    - `transform` (`function`, optional), takes `value` as its only parameter and should return the 
    transformed value. Defaults to `(value) => value`. In order to check if a boolean attribute
    is present, use `(value) => value !== null`.
    - `validate` (`function`, optional), takes `value` as its only parameter (that is the
    attribute's value *after* the `transform` function has been applied) and should return `true`
    if the value is valid, else `false`. Defaults to `(value) => value`.
    - `expectation` (`string`, optional): expected value for the (transformed) value; will be
    printed in the error message if `validate` returns `false`.

### Returns
`*`: Transformed and validated value

### Errors
`Error` if `validate` function returns `false`



## debounce

### Description
Creates a debounced function. Primarily needed for performant scroll (and window resize) operations.

### Usage

```
import { debounce } from '@helga-agency/ui-tools';

const callbackFunction = () => { console.log('update'); };
const debouncedFunction = debounce(callbackFunction, 200);
// Will only print a console.log *after* the window has *not* been resized for 200ms
window.addEventListener('resize', debouncedFunction);
```

### Arguments

Syntax: `debounce(callback, timeout)`

- `callback` (`function`, required): The function that will be executed **after** the debounce 
function has not been called for `timeout` ms.
- `timeout` (`number`, required, in ms). The inactivity timeout in ms after which the `callback``
function will be executed.

### Returns

`undefined`



## once

### Description
Only executes a given function once for a given element; the execution state (executed or not) is
stored on an HTML element and only depends on the provided `name`, not the `function`. Needed
especially to implement Drupal behaviors.

### Usage

```
import { once } from '@helga-agency/ui-tools';

const executeOnlyOnce = () => { console.log('executing'); };
const element = document.querySelector('.executing-element');
once(element, 'example-executer', executeOnlyOnce);

// Will *not* execute executeOnlyOnce because it has been executed for this element before
once(element, 'example-executer', executeOnlyOnce);

// Will *not* execute because the name has been used before
once(element, 'example-executer', () => { console.log('nope') });

// Will execute as executeOnlyOnce has not been executed for this element before
once(document.querySelector('body'), 'example-executer', executeOnlyOnce);
```

### Arguments

Syntax: `once(element, name, function)`

- `element` (`HTMLElement`, required): The HTML element for which the `function` should be executed
once 
- `name` (`string`, required): Name under which the execution state function (executed or not)
will be stored on the provided `element`
- `function` (`function`, required): Function that shall only be executed once

### Returns

`undefined`


# measureElement

### Description
Gets dimensions of an element (by calling `getBoundingClientRect()`) on load, window resize
and (optionally) intersection. Returns them as an object that updates its values whenever any of
the events described happens.

### Usage

```
import { measureElement } from '@helga-agency/ui-tools';

const element = document.querySelector('div.className');
const dimensions = measureElement({ element, updateOnIntersection: true });
```

### Arguments

Syntax: `measureElement({ element, updateOnIntersection })`;

- `element` (`HTMLElement`, required): Element to measure
- `updateOnIntersection` (`boolean`, optional): If `true`, dimensions will update whenever the
  element becomes visible. Defaults to `false`.

### Returns
`object`: Object with same properties as [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect)
with values that reflect the element's current dimensions.

### Errors
No specific errors
