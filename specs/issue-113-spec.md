# Spec: Split faceted-search-result-items (#113)

## User Story

As a developer, I want the data-reading and visibility-updating responsibilities of `faceted-search-result-items` separated into two components, so that I can replace or extend either concern independently.

## Functional Requirements

### Remove `faceted-search-result-items`

Delete the component class (`FacetedSearchResultItems.mjs`), its element registration (`FacetedSearchResultItemsElement.mjs`), built output, and tests. All its responsibilities move to the two new components below.

### 1. `faceted-search-result-reader`

Reads server-rendered result items from the DOM and provides structured data to the orchestrator. No visibility logic.

- Registers via `facetedSearchRegisterResultReader` event; unregisters via `facetedSearchUnregisterResultReader` in `disconnectedCallback`.
- Lazy collection (same `#ensureCollected` pattern as current implementation).
- Attributes:
  - `data-item-selector` (mandatory)
  - `data-item-id-selector` (mandatory)
  - `data-filter-properties` (optional, stringified JSON array)
  - `data-search-properties` (optional, stringified JSON array)
  - At least one of `data-filter-properties` or `data-search-properties` must be set.
- Public method: `getItemData()` → `[{ id, filterFields, searchFields }]`
- Reuses `extractItemData` and `readItemAttribute` from `extractItemData.mjs` (no changes needed there).

### 2. `faceted-search-result-updater`

Receives ordered visible IDs from the orchestrator and updates the DOM. No data extraction.

- Registers via `facetedSearchRegisterResultUpdater` event; unregisters via `facetedSearchUnregisterResultUpdater` in `disconnectedCallback`.
- Lazy collection of item elements and ID maps.
- Attributes:
  - `data-item-selector` (mandatory)
  - `data-item-id-selector` (mandatory)
  - `data-empty-results-selector` (optional)
  - `data-results-selector` (optional)
- Public method: `updateVisibility(orderedIds)` — shows/hides items via `hidden` attribute, reorders DOM nodes only when order changes, toggles empty-state elements.
- Empty-state toggle requires both `data-empty-results-selector` and `data-results-selector` to be set (same constraint as current implementation).

### 3. Changes to `faceted-search` (orchestrator)

- Replace `registerResultItems` / `unregisterResultItems` listeners with the four new event names.
- Store reader and updater as separate references.
- Build model when the reader is registered (needs item data).
- Call `updateVisibility` on the updater (needs updater reference).
- Both components are required for full functionality but register independently (load-order independent).
- If only the reader is registered, the model is built but no visibility updates happen. If only the updater is registered, nothing happens until the reader also registers.

### 4. DOM structure

Both components query items via `querySelectorAll` within their own subtree. No hierarchy between reader and updater is required — they can be siblings, or either can nest inside the other. Both just need the items to be within their `querySelectorAll` reach.

**Nested (either direction works):**
```html
<faceted-search>
  <faceted-search-result-updater data-item-selector=".item" ...>
    <faceted-search-result-reader data-item-selector=".item" ...>
      <div class="item" data-id="1" ...>...</div>
    </faceted-search-result-reader>
  </faceted-search-result-updater>
</faceted-search>
```

**Wrapping the same container:**
```html
<faceted-search>
  <faceted-search-result-reader data-item-selector=".item" ...>
    <faceted-search-result-updater data-item-selector=".item" ...>
      <div class="item" data-id="1" ...>...</div>
    </faceted-search-result-updater>
  </faceted-search-result-reader>
</faceted-search>
```

## Non-Functional Requirements

- Follow existing patterns: `readAttribute` from `@helga-agency/ui-tools`, AVA unit tests, Rollup build.
- Update `rollup.config.mjs` to build the two new element files instead of `FacetedSearchResultItemsElement.mjs`.
- Existing event names on other components (`registerSearchInput`, `registerFilterValues`, etc.) are out of scope for renaming in this issue.

## Test Strategy

### Unit Tests

**Reader:**
- `getItemData` extracts filter and search fields correctly.
- Handles multi-value fields with `valueSeparator`.
- Returns empty array when no items match selector.
- Registers and unregisters via events.

**Updater:**
- `updateVisibility` shows/hides correct items.
- Reorders DOM nodes to match ID order.
- Skips reorder when order hasn't changed.
- Toggles empty-state elements.
- Restores results wrapper when results reappear.
- Registers and unregisters via events.

**Orchestrator:**
- Builds model when reader registers (updater not yet present).
- Delegates visibility when updater registers after reader.
- Handles reverse registration order (updater first, then reader).
- Unregistering reader clears model.
- Unregistering updater stops visibility updates but keeps model.
- Full cycle: reader + updater + filter + search → correct visibility and counts.

### Edge Cases

- Reader and updater register in either order.
- Reader removed while updater remains (and vice versa).
- Reader and updater target overlapping but not identical item sets.
- Empty dataset (no items matching selector).
