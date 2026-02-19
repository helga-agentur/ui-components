# Spec: FacetedSearch (#111)

## User Story

As a developer integrating server-rendered content, I want a set of web components that provide client-side faceted filtering and full-text search, so that users can narrow down and search through pre-rendered result sets without server round-trips.

## Functional Requirements

### Package: `FacetedSearch`

New workspace package at `packages/FacetedSearch/` following existing monorepo conventions. Four web components:

### 1. `faceted-search` (orchestrator)

- Coordinates all child components; children register via events (never selected from DOM).
- Integrates **itemsjs** for filtering/faceting and **MiniSearch** for full-text search.
- On initialization: reads items + properties from `faceted-search-result-items`, builds itemsjs + MiniSearch indexes.
- Reacts to `facetedSearchTermChange` and `facetedSearchFilterChange` events.
- Runs combined query: applies active filters via itemsjs, applies search term via MiniSearch, intersects results.
- Calls `updateVisibility(orderedIds)` on result-items component.
- Calls `updateExpectedResults({ valueId: count })` on each filter-values component (computed per filter by temporarily toggling each value).
- Attributes:
  - `data-order-by-relevance` (boolean) — when set and a search term is active, results are ordered by MiniSearch relevance score. When the search term is cleared, original DOM order is restored.
  - `data-fuzzy-search` (boolean) — enables fuzzy matching in MiniSearch.
- Constraints:
  - Max one `faceted-search-input` registered (throw if a second registers).
  - Filter names must be unique across all `faceted-search-filter-values` instances (throw on duplicate).
  - `faceted-search-input` and `faceted-search-filter-values` are each optional.
  - Multiple `faceted-search-filter-values` allowed.
  - Filter logic: values within a single filter are combined with **OR**; different filters are combined with **AND**. Hardcoded, not configurable per filter.
- On load: restores state from URL hash and triggers initial filtering.

### 2. `faceted-search-input`

- Registers at parent via `registerSearchInputComponent`.
- Wraps an `<input>` element.
- Attributes:
  - `data-live-search` (boolean) — searches on `input` event (debounced); otherwise searches on Enter keypress.
  - `data-debounce` (number, optional) — debounce delay in ms for live search. Default: 200.
  - `data-propagate-to-url` (boolean) — writes `#search=term` to URL hash, preserving other hash keys.
- Public method: `setSearchTerm(term)` — sets the input's value programmatically (used by orchestrator for URL restore).
- Emits: `facetedSearchTermChange` with `{ term }`.

### 3. `faceted-search-filter-values`

- Registers at parent via `registerFilterValuesComponent` (multiple instances allowed).
- Contains server-rendered filter values as DOM children.
- Attributes:
  - `data-filter-name` — filter identifier (e.g. `category`).
  - `data-item-selector` — selector for a single filter value item.
  - `data-item-value-selector` — attribute selector to extract the value (e.g. `[data-value]`).
  - `data-item-id-selector` — attribute selector to extract the value's ID (e.g. `[data-id]`).
  - `data-propagate-to-url` (boolean) — writes `#filterName=value1,value2` to URL hash, preserving other keys.
  - `data-leads-to-empty-result-class` (optional) — CSS class added to values that would yield zero results.
  - `data-item-amount-selector` (optional) — selector within an item for the element displaying expected result count.
- Public method: `updateExpectedResults({ valueId: count })` — updates displayed counts and applies the empty-result class.
- Emits: `facetedSearchFilterChange` with `{ name, value, selected }`.

### 4. `faceted-search-result-items`

- Registers at parent via `registerResultItemsComponent`.
- Contains server-rendered result items as DOM children.
- Attributes:
  - `data-item-selector` — selector for a single result item.
  - `data-item-id-selector` — attribute selector to extract the item's ID (e.g. `[data-id]`).
  - `data-filter-properties` — stringified JSON array: `[{ fieldIDSelector, filterName, valueSeparator }]`.
  - `data-search-properties` — stringified JSON array: `[{ fieldIDSelector, boost }]`.
  - `data-empty-results-selector` — selector for the "no results" message element.
  - `data-results-selector` — selector for the results wrapper (hidden when empty).
  - At least one of `data-filter-properties` or `data-search-properties` must be set.
- Public method: `updateVisibility(orderedIds)` — physically reorders DOM nodes to match the given ID order, hides non-matching items. Toggles empty-results/results elements accordingly.

## Non-Functional Requirements

- **No reset functionality** — explicitly out of scope.
- Follow existing patterns: shared mixins (`canAnnounceElement`, `canRegisterElements`, `canReadAttributes`), Model for orchestrator state, AVA unit tests, Rollup build.
- Business logic (index building, query merging, URL hash read/write) in pure, testable functions/classes — not in the components themselves.
- Checkboxes are server-rendered inside filter value items; the component reads their state, does not inject them.
- Filter value IDs are unique within their filter; the orchestrator prefixes them with the filter name internally (e.g. `category:13`).
- Accessible: filter checkboxes must be keyboard-navigable; search input needs appropriate labeling (left to consuming HTML).

## URL Hash Strategy

Multiple components share a single hash string. Each component only writes its own key(s) and preserves all others. Format:

```
#search=term&category=val1,val2&color=val3
```

A shared utility (e.g. `hashSync`) should handle read/write/parse to avoid race conditions between components.

## Test Strategy

### Unit Tests

- **Hash utility**: round-trip parse/serialize, preserving foreign keys, encoding special characters.
- **Orchestrator logic (Model/pure functions)**:
  - Filter combination: OR within filter, AND across filters.
  - Search + filter intersection.
  - Relevance ordering vs. DOM ordering.
  - Fuzzy search toggle.
  - Expected-results computation per filter value.
  - Initial state restore from URL hash.
- **Result items**: `updateVisibility` shows/hides correct items, toggles empty state.
- **Filter values**: `updateExpectedResults` sets counts and applies empty-result class.
- **Search input**: emits event on Enter vs. on input (live search).

### Integration Tests

- Full orchestrator with all three child components wired up; verify end-to-end filter + search + visibility cycle.

### Edge Cases

- Zero results for all filters active.
- Filter property with `valueSeparator` producing multi-value fields (e.g. an item belonging to multiple categories).
- Search term with special characters.
- Hash already contains unrelated keys on load.
- Components connected in arbitrary order (child before parent, etc.).
- Second `faceted-search-input` registration (expect error).
- Duplicate filter name registration (expect error).
- Empty dataset (no result items).
- `data-filter-properties` and `data-search-properties` both set vs. only one.
