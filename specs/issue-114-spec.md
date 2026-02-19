# Spec: Radio button support for faceted-search-filter-values (#114)

## User Story

As a developer, I want `faceted-search-filter-values` to support radio buttons in addition to checkboxes, so that I can create single-select filters alongside multi-select filters.

## Functional Requirements

### 1. Changes to `FilterValueItem`

- Replace the hardcoded `input[type="checkbox"]` selector with one that matches both `input[type="checkbox"]` and `input[type="radio"]`.
- Store the detected input type (`checkbox` or `radio`).
- Expose the input type so `FacetedSearchFilterValues` can query it.
- On `change` event for radios: emit `{ value, selected: true }`. The parent component handles emitting the deselect for the previously active value.
- `setChecked(selected)` must work for both input types.

### 2. Changes to `FacetedSearchFilterValues`

- Track the currently selected radio value per filter (needed only for radio-type filters).
- On receiving a radio `change` event from a `FilterValueItem`:
  1. Emit `facetedSearchFilterChange` with `selected: false` for the previously selected value (if any).
  2. Emit `facetedSearchFilterChange` with `selected: true` for the newly selected value.
- On receiving a checkbox `change` event: behavior unchanged.
- `setChecked(value, selected)`: works for both types. For radios, when `selected` is true, deselect the previously selected radio value (emit deselect event + update tracked state).
- Input type detection is automatic — no new attributes needed. The component inspects the actual input type found inside each item's DOM.

### 3. Changes to `faceted-search` (orchestrator)

None. The orchestrator handles `facetedSearchFilterChange` generically. Receiving a deselect followed by a select is already supported by `setFilter(name, value, selected)`.

### 4. Changes to `FacetedSearchModel`

None. `setFilter` already handles add/remove of individual values. OR logic within a filter naturally degrades to single-select when only one value is ever active.

## Non-Functional Requirements

- No new attributes or DOM structure requirements — detection is automatic from the existing HTML.
- Mixed filters (some checkbox, some radio) must work within the same orchestrator instance.

## Test Strategy

### Unit Tests

**FilterValueItem:**
- Constructs correctly with a radio input (finds and binds it).
- Radio `change` event calls `onChange` with `{ value, selected: true }`.
- `setChecked(true)` and `setChecked(false)` work for radio inputs.
- Checkbox behavior remains unchanged.

**FacetedSearchFilterValues:**
- Radio: selecting a value emits `facetedSearchFilterChange` with `selected: true`.
- Radio: selecting a different value emits deselect for the previous value, then select for the new value.
- Radio: first selection (no previous value) emits only the select event.
- `setChecked` for radios: programmatically setting a value deselects the previous one and emits both events.
- `updateExpectedResults` works identically for both input types.
- Checkbox behavior remains unchanged.

**Orchestrator (FacetedSearch):**
- Mixed filters: one radio filter + one checkbox filter, both producing correct visibility and counts.
- URL hash restore works correctly for radio-based filters.

### Edge Cases

- Filter containing only one radio item (selecting it, re-selecting it).
- `setChecked(value, false)` on a radio that isn't currently selected (no-op for deselect emission).
- Radio filter with no initial selection — first click emits only select, no deselect.
- All items in a radio filter lead to empty results — `updateExpectedResults` still reflects counts correctly.

## Open Questions

None — the issue is well-specified and aligns with the existing architecture.
