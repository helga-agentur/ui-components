import FacetedSearchInput from './FacetedSearchInput.mjs';

/* global window */
if (!window.customElements.get('faceted-search-input')) {
    window.customElements.define('faceted-search-input', FacetedSearchInput);
}
