import FacetedSearch from './FacetedSearch.mjs';

/* global window */
if (!window.customElements.get('faceted-search')) {
    window.customElements.define('faceted-search', FacetedSearch);
}
