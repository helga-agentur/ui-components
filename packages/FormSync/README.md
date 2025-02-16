# Form Sync

Synchronizes forms and elements between an original form (e.g. one created by Drupal) and another
form (e.g. freely created as a template based on crazy mockups). Needed as Drupal has strict limits 
on how filter forms are structured.

Features:
- clones any number of inputs from the original form to a new container
- synchronizes original and cloned form elements
- supports auto submit on cloned form elements
- clones placeholder from original to cloned inputs (if not already set on cloned input)
- sets for attribute on label and id attribute on input (if not already set on cloned input)
- can clone select options to checkbox inputs


## Polyfills
- Use a [template polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/template)
[if needed](https://caniuse.com/#feat=template)


## Example

````html
<form id="originalForm">
    <label for="firstName">Your First Name:</label>
    <input type="text" id="firstName" />
    <div id="checkboxes">
        <label for="fish"><input type="checkbox" id="fish" checked> Fish</label>
        <label for="chicken"><input type="checkbox" id="chicken"> Chicken</label>
    </div>
    <!-- Without label -->
    <select id="dropdown">
        <option>1</option>
        <option>2</option>
        <option>3</option>
    </select>
</form>


<!-- The cloned form -->
<div id="clonedForm">
    <form-sync data-form-elements-selector="#firstName">
        <template>
            <!-- Template needs exactly one child -->
            <div>
                <!-- Original label's textContent is copied to textContent of element with
                attribute data-label -->
                <label data-label></label>
                <!-- Original's element's value is copied to element with attribute data-input -->
                <input type="text" data-input/>
            </div>
        </template>
    </form-sync>
    <form-sync data-form-elements-selector="#checkboxes input" data-auto-submit="change,submit,blur">
        <div>
            <h3>Checkboxes</h3>
            <!-- One template will be cloned for every input in #checkboxes -->
            <template>
                <div>
                    <label>
                        <span data-label></span>
                        <input type="checkbox" data-input/>
                    </label>
                </div>
            </template>
        </div>
    </form-sync>
    <form-sync data-form-elements-selector="#dropdown">
        <template>
            <div>
                <!-- Options will be cloned from original <select> -->
                <select data-input>
                </select>
            </div>
        </template>
    </form-sync>

    <!-- Will submit #originalForm; gets class .active when #cloned is changed for the
    first time-->
    <form-submit-button
        data-form-selector="#originalForm"
        data-change-selector="#clonedForm"
        data-changed-class-name="active"
    >
        <button>Submit</button>
    </form-submit-button>

</div>


<script type="module" src="@helga-agency/formsync/FormSyncElement.js"></script>
<script type="module" src="@helga-agency/formsync/FormSubmitButtonElement.js"></script>
````

## Components

### FormSync

#### Exposed Element
`<form-sync></form-sync>`

#### Attributes
- `data-auto-submit` (optional): Use if certain events on the cloned input should auto-submit the
original form. Provide all events that should trigger the auto-submit as a comma delimited list,
e.g. `"blur,input"`. If you want to auto-submit with a debounce, add the debounce after a colon in
ms, e.g. `"input:50,blur"` (for a debounce of 50ms after an input). To submit the form, the
component will trigger a click on the original element's `button` or `input` with `type="submit"`
(this is required in order to work with Drupal's AJAX based forms). 
- `data-form-elements-selector`: CSS selector for all input elements that should be cloned and synced
between the original and the cloned input.
- `data-submit-on-enter` (optional, boolean attribute): Submit original form if user presses enter
while the input is focused. Make sure the cloned form is not wrapped in a <form> element or it will
be submitted at the same time (and reload the page if not prevented).

#### Content
- Use any content you like with the following exceptions:
    - Use a `<template>` tag to provide a template for the inputs that will be selected by
      `data-form-elements-selector` and cloned. 
    - The `<template>` tag must contain **exactly** one child.
    - Provide an element with a `data-label` attribute within the template tag, if you wish. This
      element's `textContent` will be set to the original label's `textContent`.
    - You must provide an element with a `data-input` attribute within the template tag. This
      element's `changed` or `value` property will be synced with the original element.



### FormSubmitButton

#### Exposed Element
`<form-submit-button></form-submit-button>`

#### Attributes
- `data-form-selector` (mandatory): CSS selector for the form element that should be submitted
when the current element is clicked.
- `data-change-selector` (optional): CSS selector for a HTML element that should be watched for
`change` and `input` events; if any of those happens, `data-changed-class-name` will be added to
the current `form-submit-button`.
- data-changed-class-name (optional): Class name that will be added to the current data-submit-button
when the element that matches data-change-element is changed. Use class (instead of disabled
attribute) as watching for input/change may not be completely fail-safe.




## Libraries/Classes

### InputSync

Class that synchronizes two inputs (form elements). Example:

```
const sync = new InputSync();
sync.setup({
    originalElement: document.querySelector('#source'),
    clonedElement: document.querySelector('#target'),
    originalProperty: 'value',
    clonedProperty: 'value',
    autoSubmit: ['change', 'input'],
});
```

Synchronizes the property `value` of the two inputs `#source` and `#target` whenever a change event
occurs on one of them. When `setup()` is called, also copies `value` of original to cloned element
and calls `submit()` on closest `<form>` of `originalElement` whenever a `change` or `input` event
occurs on the cloned element.


