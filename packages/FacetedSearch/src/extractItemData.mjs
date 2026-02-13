/**
 * Extracts filter and search field data from a single result item element.
 * Pure function, no side effects.
 */

/**
 * Extracts the attribute name from a selector like '[data-id]'.
 * @param {string} selector
 * @returns {string}
 */
const extractAttributeName = (selector) => {
    const match = selector.match(/\[([^\]]+)\]/);
    return match ? match[1] : selector;
};

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
 * Extracts structured data from a single result item DOM element.
 * @param {HTMLElement} item
 * @param {object} config
 * @param {string} config.itemIdSelector - Attribute selector for the item's ID
 * @param {object[]} config.filterProperties - [{ fieldIDSelector, filterName, valueSeparator }]
 * @param {object[]} config.searchProperties - [{ fieldIDSelector }]
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
            ? rawValue.split(valueSeparator).map((v) => v.trim()).filter(Boolean)
            : [rawValue];
    });

    const searchFields = {};
    searchProperties.forEach(({ fieldIDSelector }) => {
        const fieldName = extractAttributeName(fieldIDSelector);
        const rawValue = readItemAttribute(item, fieldIDSelector);
        searchFields[fieldName] = rawValue || '';
    });

    return { id, filterFields, searchFields };
};

export { extractItemData, readItemAttribute, extractAttributeName };
