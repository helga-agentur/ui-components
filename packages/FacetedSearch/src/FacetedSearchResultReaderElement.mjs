import FacetedSearchResultReader from './FacetedSearchResultReader.mjs';

/* global window */
if (!window.customElements.get('faceted-search-result-reader')) {
    window.customElements.define('faceted-search-result-reader', FacetedSearchResultReader);
}
