import createRollupConfig from '../../createRollupConfig.mjs';

const components = [
    'FacetedSearchElement.mjs',
    'FacetedSearchResultReaderElement.mjs',
    'FacetedSearchResultUpdaterElement.mjs',
    'FacetedSearchFilterValuesElement.mjs',
    'FacetedSearchInputElement.mjs',
];

export default createRollupConfig(components);
