/**
 * Adds searchParams to url. If we used string concatenation (`${url}?${searchParams}`), we ended
 * up with an unnecessary ? if searchParams were empty.
 * @param {URL} url
 * @param {URLSearchParams} searchParams
 */
export default (url, searchParams) => {
    const clonedURL = new URL(url);
    for (const [key, value] of searchParams) {
        clonedURL.searchParams.set(key, value);
    }
    return clonedURL;
};
