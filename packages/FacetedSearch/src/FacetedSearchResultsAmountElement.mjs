import FacetedSearchResultsAmount from './FacetedSearchResultsAmount.mjs';

/* global window */
if (!window.customElements.get('faceted-search-results-amount')) {
    window.customElements.define('faceted-search-results-amount', FacetedSearchResultsAmount);
}
