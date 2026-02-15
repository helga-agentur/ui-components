/**
 * Represents a single filter value item. Caches DOM references on construction,
 * binds input listener, and exposes methods for updating count, toggling
 * empty class, and setting checked state.
 * Not a web component — instantiated by FacetedSearchFilterValues.
 */
import { readItemAttribute } from './extractItemData.mjs';

export default class FilterValueItem {

    /** @type {HTMLElement} */
    #element;

    /** @type {string} */
    #id;

    /** @type {string} */
    #value;

    /** @type {HTMLInputElement|null} */
    #input;

    /** @type {HTMLElement|null} */
    #countElement;

    /**
     * @param {HTMLElement} element - The filter value DOM element
     * @param {object} config
     * @param {string} config.idSelector - Attribute selector for the item's ID
     * @param {string} config.valueSelector - Attribute selector for the item's value
     * @param {string|null} config.amountSelector - Selector for the count element
     * @param {(detail: { value: string, selected: boolean }) => void} onChange
     */
    constructor(element, { idSelector, valueSelector, amountSelector }, onChange) {
        this.#element = element;
        this.#id = readItemAttribute(element, idSelector);
        this.#value = readItemAttribute(element, valueSelector);
        this.#input = element.querySelector('input[type="checkbox"], input[type="radio"]');
        this.#countElement = amountSelector
            ? element.querySelector(amountSelector)
            : null;

        if (this.#input) {
            this.#input.addEventListener('change', () => {
                onChange({ value: this.#value, selected: this.#input.checked });
            });
        }
    }

    get id() { return this.#id; }
    get value() { return this.#value; }
    get element() { return this.#element; }
    get checked() { return this.#input ? this.#input.checked : false; }
    get isRadio() { return this.#input?.type === 'radio'; }

    /**
     * Updates the displayed count and toggles the empty-result class.
     * When count is null (value is currently active), the count display
     * is cleared and the empty class is removed.
     * @param {number|null} count
     * @param {string|null} emptyClass - CSS class to apply when count is 0
     */
    updateCount(count, emptyClass) {
        if (count === null) {
            if (this.#countElement) this.#countElement.textContent = '';
            if (emptyClass) this.#element.classList.remove(emptyClass);
            return;
        }
        if (this.#countElement) this.#countElement.textContent = String(count);
        if (emptyClass) this.#element.classList.toggle(emptyClass, count === 0);
    }

    /** @param {boolean} selected */
    setChecked(selected) {
        if (this.#input) this.#input.checked = selected;
    }
}
