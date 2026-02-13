# Architecture: FacetedSearch (#111)

## Modules

### `FacetedSearchModel` — Orchestrator state and query logic
Pure class, no DOM. Holds active filters, search term, item data. Runs combined queries (itemsjs + MiniSearch). Emits `change` events.

**Public API:**
- `constructor({ items, filterConfigs, searchConfigs, fuzzy, orderByRelevance })` — builds indexes
- `setSearchTerm(term)` — updates search term, re-queries, emits `change`
- `setFilter(name, value, selected)` — toggles a filter value, re-queries, emits `change`
- `getVisibleIds()` → `string[]` — ordered IDs after applying filters + search
- `getExpectedResults(filterName)` → `{ [valueId]: number }` — per-value counts for a filter
- `get activeFilters()` → `{ [name]: string[] }` — currently active filter selections
- `get searchTerm()` → `string`

### `hashSync` — URL hash read/write utility
Pure functions, no DOM dependencies. Each caller owns its key(s). Comma is the value separator; values are always arrays. Commas in individual values are stripped on write.

**Public API:**
- `readHash(hash)` → `{ [key]: string[] }` — parses hash string, splits comma-separated values into arrays
- `writeHashKey(currentHash, key, values: string[])` — writes one key (joining values with `,`), preserves all others, strips commas from individual values
- `removeHashKey(currentHash, key)` — removes one key, preserves all others

### `FacetedSearch` — Orchestrator web component (`faceted-search`)
Handles child registration (with constraint enforcement), reads data from children, creates and feeds `FacetedSearchModel`, calls children's public methods with results. Restores state from URL on load.

**Public API (attributes):**
- `data-order-by-relevance` (boolean)
- `data-fuzzy-search` (boolean)

### `FacetedSearchInput` — Search input component (`faceted-search-input`)
Wraps `<input>`, emits search term changes.

**Public API:**
- Attributes: `data-live-search`, `data-debounce`, `data-propagate-to-url`
- Method: `setSearchTerm(term)`
- Event out: `facetedSearchTermChange` `{ term }`

### `FacetedSearchFilterValues` — Filter values component (`faceted-search-filter-values`)
Reads server-rendered checkboxes, emits filter changes, displays expected counts.

**Public API:**
- Attributes: `data-filter-name`, `data-item-selector`, `data-item-value-selector`, `data-item-id-selector`, `data-propagate-to-url`, `data-leads-to-empty-result-class`, `data-item-amount-selector`
- Method: `updateExpectedResults({ [valueId]: count })`
- Event out: `facetedSearchFilterChange` `{ name, value, selected }`
- Provides: `getFilterData()` → `{ name, values: [{ id, value }] }` (called by orchestrator during init)

### `FacetedSearchResultItems` — Result items component (`faceted-search-result-items`)
Reads server-rendered items, provides item data for indexing, reorders DOM on updates.

**Public API:**
- Attributes: `data-item-selector`, `data-item-id-selector`, `data-filter-properties`, `data-search-properties`, `data-empty-results-selector`, `data-results-selector`
- Method: `updateVisibility(orderedIds)`
- Provides: `getItemData()` → `[{ id, filterFields: {}, searchFields: {} }]` (called by orchestrator during init)

## Child Registration Strategy

No mixins (`canAnnounceElement`, `canRegisterElements`). Registration is explicit and manual.

**Children** dispatch a bubbling custom event in `connectedCallback`:
```js
this.dispatchEvent(new CustomEvent('registerFilterValues', { bubbles: true, detail: { element: this } }));
```

**Orchestrator** listens on `this` for three event names:
- `registerSearchInput` → stores reference, throws if already registered
- `registerFilterValues` → collects into array, throws on duplicate `data-filter-name`
- `registerResultItems` → stores reference

No model is passed to children. The orchestrator calls public methods on children directly (`updateVisibility`, `updateExpectedResults`, `setSearchTerm`). Children communicate back via their own bubbling events (`facetedSearchTermChange`, `facetedSearchFilterChange`).

**Item data** is represented as plain objects. `getItemData()` returns `[{ id, filterFields: {}, searchFields: {} }]` — fed directly into `FacetedSearchModel`'s constructor.

## External Dependencies

- **itemsjs** — faceted filtering (already on npm, no bundling issues with Rollup + node-resolve)
- **minisearch** — full-text search with fuzzy/boost/relevance
- **@helga-agency/tools** `debounce` — reuse existing debounce utility

## Tests

### `hashSync.unit.mjs`
- `parses hash with multiple keys`
- `handles empty hash`
- `handles hash with unrelated keys`
- `handles special characters`
- `ignores pairs without equals sign`
- `splits comma-separated values into array`
- `writes single key preserving others`
- `writes multiple values as comma-separated`
- `overwrites existing key`
- `writes to empty hash`
- `encodes special characters when writing`
- `removes key when values array is empty`
- `strips commas from values to prevent separator collision`
- `removes key preserving others`
- `handles removing non-existent key`
- `returns empty string when removing last key`
- `round-trips parse and serialize`

### `FacetedSearchModel.unit.mjs`
- `filters with single filter OR logic`
- `combines multiple filters with AND logic`
- `searches with MiniSearch`
- `intersects search results with filter results`
- `orders by relevance when search active`
- `restores DOM order when search cleared`
- `computes expected results per filter value`
- `handles fuzzy search`
- `handles empty dataset`
- `handles multi-value fields with separator`

### `FacetedSearchInput.unit.mjs`
- `emits on Enter when live search disabled`
- `emits debounced on input when live search enabled`
- `does not emit on input when live search disabled`
- `setSearchTerm sets input value`
- `respects custom debounce delay`

### `FacetedSearchFilterValues.unit.mjs`
- `emits filter change on checkbox toggle`
- `updateExpectedResults sets count text`
- `updateExpectedResults applies empty result class for zero counts`
- `getFilterData returns filter name and values`

### `FacetedSearchResultItems.unit.mjs`
- `updateVisibility shows matching items and hides others`
- `updateVisibility reorders DOM nodes`
- `shows empty message when no results`
- `hides results wrapper when empty`
- `getItemData extracts filter and search fields`
- `handles multi-value filter fields with separator`

### `FacetedSearchService.unit.mjs`
- `throws on second search input registration`
- `throws on duplicate filter name`
- `accepts filter-values and input as optional`
- `initializes model with item data from result-items`
- `delegates search term change to model and updates children`
- `delegates filter change to model and updates children`

### `FacetedSearch.unit.mjs`
- `routes registration events to orchestrator`
- `routes change events to orchestrator`

### `FacetedSearch.integration.mjs`
- `filters and updates visibility end to end`
- `searches and orders by relevance end to end`
- `restores state from URL hash on load`
- `propagates filters and search to URL hash`

## Definition of Done

- All tests passing (`npm test -w packages/FacetedSearch`)
- Lint passing (`npm run lint -w packages/FacetedSearch`)
- Built (`npm run build -w packages/FacetedSearch`)
- README with usage examples and debug scope docs
- CHANGELOG entry

## Iterations

### 1. `hashSync` utility
Pure functions for URL hash read/write/remove. Unit tests. No DOM, no components.

### 2. `FacetedSearchModel`
Core business logic: itemsjs + MiniSearch integration, filter/search state, query execution, expected-results computation. Unit tests. No DOM, no components.

### 3. `FacetedSearchResultItems` component
Reads item data from DOM, exposes `getItemData()` and `updateVisibility()`. Unit tests.

### 4. `FacetedSearchFilterValues` component
Reads filter values from DOM, exposes `getFilterData()` and `updateExpectedResults()`, emits change events. Unit tests.

### 5. `FacetedSearchInput` component
Wraps input, emits search term changes, debounce, `setSearchTerm()`. Unit tests.

### 6. `FacetedSearchService`
Pure orchestration logic: child registration, constraint enforcement, delegates to model, calls public methods on children. Unit tests.

### 7. `FacetedSearch` web component shell
Thin DOM wrapper: reads attributes, listens for registration/change events, delegates to `FacetedSearchService`. Unit tests.

### 7. Integration tests, URL propagation, build, README
End-to-end tests, `data-propagate-to-url` wiring in all components, Rollup config, package.json, docs.
