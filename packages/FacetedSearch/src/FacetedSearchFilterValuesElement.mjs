import FacetedSearchFilterValues from './FacetedSearchFilterValues.mjs';

/* global window */
if (!window.customElements.get('faceted-search-filter-values')) {
    window.customElements.define('faceted-search-filter-values', FacetedSearchFilterValues);
}
