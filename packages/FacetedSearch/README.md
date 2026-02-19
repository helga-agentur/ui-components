# Faceted Search

Web components for client-side faceted filtering and full-text search over server-rendered content.

All filtering, searching and facet counting happens in the browser — no server round-trips needed.
The components read data attributes from existing DOM elements, build internal indexes (powered by
[itemsjs](https://github.com/itemsjs/itemsjs) and
[MiniSearch](https://github.com/lucaong/minisearch)), and update visibility in place.

Five custom elements work together through an orchestrator pattern:

1. **`<faceted-search>`** — orchestrator that wires everything together
2. **`<faceted-search-input>`** — wraps a text input for full-text search
3. **`<faceted-search-filter-values>`** — wraps checkbox or radio inputs for facet filtering
4. **`<faceted-search-result-reader>`** — reads item data from the DOM
5. **`<faceted-search-result-updater>`** — shows/hides/reorders result items

## Example

```html
<faceted-search data-fuzzy-search data-order-by-relevance>

    <faceted-search-input data-live-search data-debounce="200" data-propagate-to-url>
        <input type="text" placeholder="Search…" />
    </faceted-search-input>

    <faceted-search-filter-values
        data-filter-name="color"
        data-item-selector=".filter-item"
        data-item-value-selector="[data-value]"
        data-item-id-selector="[data-id]"
        data-leads-to-empty-result-class="is-empty"
        data-item-amount-selector=".count"
        data-propagate-to-url
    >
        <div class="filter-item" data-id="col-red" data-value="red">
            <label><input type="checkbox" /> Red <span class="count">0</span></label>
        </div>
        <div class="filter-item" data-id="col-blue" data-value="blue">
            <label><input type="checkbox" /> Blue <span class="count">0</span></label>
        </div>
    </faceted-search-filter-values>

    <faceted-search-result-updater
        data-item-selector=".result-item"
        data-item-id-selector="[data-id]"
        data-empty-results-selector=".empty-message"
        data-results-selector=".results"
    >
        <p class="empty-message" hidden>No results found.</p>
        <div class="results">
            <faceted-search-result-reader
                data-item-selector=".result-item"
                data-item-id-selector="[data-id]"
                data-filter-properties='[{"fieldIDSelector": "[data-color]", "filterName": "color"}]'
                data-search-properties='[{"fieldIDSelector": "[data-name]"}]'
            >
                <div class="result-item" data-id="1" data-color="red" data-name="Red Shoe">Red Shoe</div>
                <div class="result-item" data-id="2" data-color="blue" data-name="Blue Hat">Blue Hat</div>
            </faceted-search-result-reader>
        </div>
    </faceted-search-result-updater>

</faceted-search>
```

## Components

### `<faceted-search>`

Orchestrator element. Wraps all other components. Manages child registration, creates the
internal model, delegates updates, and restores state from the URL hash.

#### Attributes
- `data-fuzzy-search` (boolean, optional): Enables fuzzy matching for full-text search.
- `data-order-by-relevance` (boolean, optional): Orders results by search relevance when a
  search term is active. When the search term is cleared, DOM order is restored.


### `<faceted-search-input>`

Wraps a single `<input>` element for full-text search.

#### Attributes
- `data-live-search` (boolean, optional): Emits search events on every keystroke (debounced).
  Without this attribute, search is triggered only on Enter.
- `data-debounce` (number, optional): Debounce delay in milliseconds for live search. Defaults
  to `0`.
- `data-propagate-to-url` (boolean, optional): Persists the search term in the URL hash.

#### Structure
Must contain exactly one `<input>` element.


### `<faceted-search-filter-values>`

Wraps a group of filter value items. Each item contains a checkbox or radio input. The input type
is detected automatically: radio inputs enable single-select behavior, checkboxes allow
multi-select.

#### Attributes
- `data-filter-name` (string, required): Unique name for this filter group. Must match a
  `filterName` in `data-filter-properties` on the result reader.
- `data-item-selector` (string, required): CSS selector matching each filter item element.
- `data-item-value-selector` (string, required): Attribute selector (e.g. `[data-value]`)
  to read the filter value from each item.
- `data-item-id-selector` (string, required): Attribute selector to read a unique ID from
  each item.
- `data-leads-to-empty-result-class` (string, optional): CSS class applied to items whose
  expected result count is zero.
- `data-item-amount-selector` (string, optional): CSS selector for the element whose text
  content is updated with the expected result count.
- `data-propagate-to-url` (boolean, optional): Persists selected values in the URL hash.

#### Structure
Each item matching `data-item-selector` must contain an `<input type="checkbox">` or
`<input type="radio">`. All radios in a group should share the same `name` attribute.


### `<faceted-search-result-reader>`

Reads item data from the DOM. Extracts filter field values and search field values from
data attributes on each result item.

#### Attributes
- `data-item-selector` (string, required): CSS selector matching each result item.
- `data-item-id-selector` (string, required): Attribute selector for the unique item ID.
- `data-filter-properties` (JSON string, required): Array of objects mapping DOM attributes
  to filter names. Each entry has:
  - `fieldIDSelector`: attribute selector (e.g. `[data-color]`)
  - `filterName`: name matching a `data-filter-name` on a filter-values component
- `data-search-properties` (JSON string, required): Array of objects specifying which
  attributes to index for full-text search. Each entry has:
  - `fieldIDSelector`: attribute selector (e.g. `[data-name]`)

#### Structure
Must contain the result item elements that match `data-item-selector`.


### `<faceted-search-result-updater>`

Receives ordered visible IDs from the orchestrator and updates the DOM: shows/hides items,
reorders them to match relevance order, and toggles an empty-state message.

#### Attributes
- `data-item-selector` (string, required): CSS selector matching each result item.
- `data-item-id-selector` (string, required): Attribute selector for the unique item ID.
- `data-empty-results-selector` (string, optional): CSS selector for the "no results" message
  element. Hidden when results exist, shown when empty.
- `data-results-selector` (string, optional): CSS selector for the results wrapper element.
  Hidden when no results, shown when results exist.

#### Structure
Must wrap the result reader and contain the empty-state element (if configured). The result
reader must be nested inside the element matching `data-results-selector`.


## Development

To test the components locally in a browser, use [Vite](https://vitejs.dev/) to serve the
source files (it resolves bare module imports from `node_modules` automatically):

```bash
npx vite packages/FacetedSearch/src
```

Then open `http://localhost:5173/FacetedSearchTest.html`.
