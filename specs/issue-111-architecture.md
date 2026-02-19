# Architecture: FacetedSearch (#111)

## Modules

### `hashSync` — URL hash read/write utility
Pure functions, no DOM dependencies. Each caller owns its key(s). Comma is the value separator; values are always arrays. Commas in individual values are stripped on write.

**Public API:**
- `readHash(hash)` → `{ [key]: string[] }` — parses hash string, splits comma-separated values into arrays
- `writeHashKey(currentHash, key, values: string[])` — writes one key (joining values with `,`), preserves all others, strips commas from individual values
- `removeHashKey(currentHash, key)` — removes one key, preserves all others

### `FacetedSearchModel` — State and query logic
Pure class, no DOM. Holds active filters, search term, item data. Runs combined queries (itemsjs for filtering with `native_search_enabled: false`, MiniSearch for full-text search via `ids` parameter). Emits `change` events via `canEmitEvents` mixin.

**Public API:**
- `constructor({ items, filterConfigs, searchConfigs, fuzzy, orderByRelevance })`
- `setSearchTerm(term)` — updates search term, emits `change`
- `setFilter(name, value, selected)` — toggles a filter value, emits `change`
- `getVisibleIds()` → `string[]` — ordered IDs after applying filters + search
- `getExpectedResults(filterName, filterValues)` → `{ [valueId]: number }` — per-value counts
- `get activeFilters()` → `{ [name]: string[] }`
- `get searchTerm()` → `string`

### `extractItemData` — DOM data extraction
Pure functions for reading structured data from server-rendered result item elements.

**Public API:**
- `extractAttributeName(selector)` — extracts attribute name from bracket selector
- `readItemAttribute(element, selector)` — reads attribute value from element or its children
- `extractItemData(item, config)` → `{ id, filterFields, searchFields }`

### `FilterValueItem` — Filter value item model
Plain class (not a web component) representing a single filter value. Caches DOM refs on construction, accepts `onChange` callback for checkbox binding.

**Public API:**
- `constructor(element, { idSelector, valueSelector, amountSelector }, onChange)`
- `get id()`, `get value()`, `get element()`
- `updateCount(count, emptyClass)` — updates count display, toggles empty class
- `setChecked(selected)` — sets checkbox state programmatically

### `FacetedSearchResultItems` — Result items component (`faceted-search-result-items`)
Reads server-rendered items via lazy collection (`#ensureCollected()`), provides item data for indexing, toggles visibility via `hidden` attribute, reorders DOM only when order changes.

**Public API:**
- Attributes: `data-item-selector`, `data-item-id-selector`, `data-filter-properties`, `data-search-properties`, `data-empty-results-selector`, `data-results-selector`
- Method: `updateVisibility(orderedIds)` — shows/hides items, reorders if needed
- Method: `getItemData()` → `[{ id, filterFields, searchFields }]`
- Event out: `registerResultItems` `{ element: this }`

### `FacetedSearchFilterValues` — Filter values component (`faceted-search-filter-values`)
Reads server-rendered checkboxes via lazy collection, delegates item logic to `FilterValueItem` instances. Emits filter changes, displays expected counts.

**Public API:**
- Attributes: `data-filter-name`, `data-item-selector`, `data-item-value-selector`, `data-item-id-selector`, `data-propagate-to-url`, `data-leads-to-empty-result-class`, `data-item-amount-selector`
- Method: `updateExpectedResults({ [valueId]: count })`
- Method: `getFilterData()` → `{ name, values: [{ id, value }] }`
- Method: `setChecked(value, selected)` — sets checkbox state programmatically
- Getter: `propagateToUrl` → `boolean`
- Event out: `registerFilterValues` `{ element: this }`
- Event out: `facetedSearchFilterChange` `{ name, value, selected }`

### `FacetedSearchInput` — Search input component (`faceted-search-input`)
Wraps `<input>`, emits search term changes. Default debounce delay is 0.

**Public API:**
- Attributes: `data-live-search`, `data-debounce`, `data-propagate-to-url`
- Method: `setSearchTerm(term)` — sets input value without emitting
- Getter: `propagateToUrl` → `boolean`
- Event out: `registerSearchInput` `{ element: this }`
- Event out: `facetedSearchTermChange` `{ term }`

### `FacetedSearch` — Orchestrator web component (`faceted-search`)
Central coordinator. Listens for child registration and user interaction events. (Re)builds model on every child registration for load-order independence. Reads/writes URL hash centrally, checking each child's `propagateToUrl` getter. Validates `detail.element` on all registration events.

**Public API (attributes):**
- `data-order-by-relevance` (boolean)
- `data-fuzzy-search` (boolean)

## Child Registration Strategy

Children dispatch a bubbling custom event in `connectedCallback` (delayed via `setTimeout` for load-order independence):
```js
setTimeout(() => {
    this.dispatchEvent(new CustomEvent('registerFilterValues', {
        bubbles: true, detail: { element: this },
    }));
});
```

The orchestrator listens on `this` for registration events. Each registration handler validates `detail.element`, stores the reference, and calls `#buildModel()`. The model is rebuilt on every registration so that late-arriving components are included.

No model is passed to children. The orchestrator calls public methods on children directly (`updateVisibility`, `updateExpectedResults`, `setSearchTerm`, `setChecked`). Children communicate back via bubbling events (`facetedSearchTermChange`, `facetedSearchFilterChange`).

## URL Hash Strategy

All hash read/write logic lives in the orchestrator. Each child component owns a `data-propagate-to-url` attribute and exposes it via a `propagateToUrl` getter. The orchestrator checks this getter before writing to the hash. Hash restoration on init is always performed (reading is unconditional).

## External Dependencies

- **itemsjs** — faceted filtering (`conjunction: false` for OR, `native_search_enabled: false`, `custom_id_field: 'id'`)
- **minisearch** — full-text search with fuzzy/boost/relevance, integrated via itemsjs `ids` parameter
- **@helga-agency/ui-tools** — `readAttribute`, `debounce`
