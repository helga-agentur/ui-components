import FacetedSearchResultItems from './FacetedSearchResultItems.mjs';

/* global window */
if (!window.customElements.get('faceted-search-result-items')) {
    window.customElements.define('faceted-search-result-items', FacetedSearchResultItems);
}
