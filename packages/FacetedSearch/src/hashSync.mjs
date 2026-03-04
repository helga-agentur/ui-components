/**
 * Pure utility for reading and writing URL hash parameters.
 * Multiple components share a single hash string; each caller owns its key(s)
 * and preserves all others.
 *
 * Format: #search=term&category=shoes&category=hats&city=New%20York%2C%20NY
 * Multiple values for a key use repeated key=value pairs (standard GET param
 * behaviour). Values are individually percent-encoded, so any character
 * including commas is preserved exactly through a read→write round-trip.
 */

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
        const value = decodeURIComponent(pair.slice(index + 1));
        if (!result[key]) result[key] = [];
        result[key].push(value);
    });
    return result;
};

/**
 * Serializes a key → string[] map back into a hash string (without leading #).
 * @param {{ [key: string]: string[] }} params
 * @returns {string}
 */
const serializeHash = (params) => {
    const pairs = [];
    Object.entries(params).forEach(([key, values]) => {
        values.forEach((value) => {
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        });
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
