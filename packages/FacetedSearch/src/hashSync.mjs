/**
 * Pure utility for reading and writing URL hash parameters.
 * Multiple components share a single hash string; each caller owns its key(s)
 * and preserves all others.
 *
 * Format: #search=term&category=val1,val2&color=val3
 * Values within a key are comma-separated; commas in values are stripped on write.
 */

const valueSeparator = ',';

/**
 * Strips commas from a single value to prevent collision with the separator.
 * @param {string} value
 * @returns {string}
 */
const sanitizeValue = (value) => value.replace(/,/g, '');

/**
 * Parses the current location.hash into a map of key → string[].
 * @param {string} hash - The hash string (e.g. location.hash)
 * @returns {{ [key: string]: string[] }}
 */
const readHash = (hash) => {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!raw) return {};
    const result = {};
    raw.split('&').forEach((pair) => {
        const index = pair.indexOf('=');
        if (index === -1) return;
        const key = decodeURIComponent(pair.slice(0, index));
        const rawValue = decodeURIComponent(pair.slice(index + 1));
        result[key] = rawValue.split(valueSeparator).filter(Boolean);
    });
    return result;
};

/**
 * Serializes a key → string[] map back into a hash string (without leading #).
 * @param {{ [key: string]: string[] }} params
 * @returns {string}
 */
const serializeHash = (params) => {
    const pairs = Object.entries(params)
        .filter(([, values]) => values.length > 0)
        .map(([key, values]) => {
            const joined = values.map(sanitizeValue).join(valueSeparator);
            return `${encodeURIComponent(key)}=${encodeURIComponent(joined)}`;
        });
    return pairs.join('&');
};

/**
 * Writes a single key to the hash, preserving all other keys.
 * @param {string} currentHash - The current hash string (e.g. location.hash)
 * @param {string} key - The key to write
 * @param {string[]} values - The values to write
 * @returns {string} - The new hash string (without leading #)
 */
const writeHashKey = (currentHash, key, values) => {
    const params = readHash(currentHash);
    params[key] = values;
    return serializeHash(params);
};

/**
 * Removes a single key from the hash, preserving all other keys.
 * @param {string} currentHash - The current hash string (e.g. location.hash)
 * @param {string} key - The key to remove
 * @returns {string} - The new hash string (without leading #)
 */
const removeHashKey = (currentHash, key) => {
    const params = readHash(currentHash);
    delete params[key];
    return serializeHash(params);
};

export { readHash, writeHashKey, removeHashKey };
