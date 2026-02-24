/**
 * Extracts filter and search field data from a single result item element.
 * Pure function, no side effects.
 */

/**
 * Extracts the attribute name from the last attribute selector on the last element.
 * Handles compound selectors like `div[data-id].class` or `[data-foo][data-id]`,
 * always returning the attribute from the final `[...]` in the last element.
 * @param {string} selector
 * @returns {string}
 */
const extractAttributeName = (selector) => {
    // .*             — greedily consume everything so we match the *last* [...] in the string
    // \[             — opening bracket
    // ([^\]=~|^$*\s]+) — capture only the attribute name, stopping before any operator
    //                    (=, ~=, |=, ^=, $=, *=) or whitespace
    // [^\]]*\]       — skip optional value and closing bracket
    // [^+~>|\s]*     — allow trailing compound simple selectors (.class, :pseudo, etc.)
    //                  but stop at any combinator (+, ~, >, |, whitespace)
    // $              — anchor to end of string
    const match = selector.trim().match(/.*\[([^\]=~|^$*\s]+)[^\]]*\][^+~>|\s]*$/);
    return match ? match[1] : selector;
};

/**
 * Returns true if the last element in the selector is (or includes) an attribute selector.
 * Compound selectors on the same element are allowed after the attribute selector (e.g.
 * `[data-id].class`, `div[data-id]:hover`), but combinators that introduce a new element
 * (` `, `>`, `+`, `~`, `|`) are not (e.g. `[data-id]>.child` returns false).
 * @param {string} selector
 * @returns {boolean}
 */
const isAttributeSelector = (selector) => (
    // \[[^\]]+\]  — match an attribute selector [...]
    // [^+~>|\s]*  — allow trailing compound simple selectors (.class, :pseudo, etc.)
    //               but stop at any combinator (+, ~, >, |, whitespace)
    // $           — anchor to end of string
    /\[[^\]]+\][^+~>|\s]*$/.test(selector.trim())
);

/**
 * Reads an attribute value from an element. If the element itself matches
 * the attribute selector, reads from it directly; otherwise queries a child.
 * @param {HTMLElement} element
 * @param {string} selector - Attribute selector like '[data-id]'
 * @returns {string|null}
 */
const readItemAttribute = (element, selector) => {
    const attributeName = extractAttributeName(selector);
    if (element.matches(selector)) return element.getAttribute(attributeName);
    const child = element.querySelector(selector);
    return child ? child.getAttribute(attributeName) : null;
};

/**
 * Reads a value from an element: attribute value for attribute selectors,
 * trimmed textContent for element selectors.
 * @param {HTMLElement} element
 * @param {string} selector
 * @returns {string|null}
 */
const readItemValue = (element, selector) => {
    if (isAttributeSelector(selector)) return readItemAttribute(element, selector);
    const target = element.matches(selector) ? element : element.querySelector(selector);
    return target ? target.textContent.trim() : null;
};

/**
 * Extracts structured data from a single result item DOM element.
 * @param {HTMLElement} item
 * @param {object} config
 * @param {string} config.itemIdSelector - Attribute selector for the item's ID
 * @param {object[]} config.filterProperties - [{ fieldIDSelector, filterName, valueSeparator }]
 * @param {object[]} config.searchProperties - [{ fieldIDSelector }] - attribute selectors read
 *   the attribute value; element selectors (e.g. `h3`) read textContent
 * @returns {{ id: string|null, filterFields: object, searchFields: object }}
 */
const extractItemData = (item, { itemIdSelector, filterProperties, searchProperties }) => {
    const id = readItemAttribute(item, itemIdSelector);

    const filterFields = {};
    filterProperties.forEach(({ fieldIDSelector, filterName, valueSeparator }) => {
        const rawValue = readItemAttribute(item, fieldIDSelector);
        if (!rawValue) {
            filterFields[filterName] = [];
            return;
        }
        filterFields[filterName] = valueSeparator
            ? rawValue.split(valueSeparator).map((part) => part.trim()).filter(Boolean)
            : [rawValue];
    });

    const searchFields = {};
    searchProperties.forEach(({ fieldIDSelector }) => {
        const fieldName = extractAttributeName(fieldIDSelector);
        const rawValue = readItemValue(item, fieldIDSelector);
        searchFields[fieldName] = rawValue || '';
    });

    return { id, filterFields, searchFields };
};

export {
    extractItemData,
    readItemAttribute,
    readItemValue,
    extractAttributeName,
    isAttributeSelector,
};
