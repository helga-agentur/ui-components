import FacetedSearchResultUpdater from './FacetedSearchResultUpdater.mjs';

/* global window */
if (!window.customElements.get('faceted-search-result-updater')) {
    window.customElements.define('faceted-search-result-updater', FacetedSearchResultUpdater);
}
