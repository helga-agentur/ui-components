import createRollupConfig from '../../createRollupConfig.mjs';

const components = [
    'FacetedSearchElement.mjs',
    'FacetedSearchResultItemsElement.mjs',
    'FacetedSearchFilterValuesElement.mjs',
    'FacetedSearchInputElement.mjs',
];

export default createRollupConfig(components);
