# Dynamic Content Loader

A set of components that are wrapped in a `dynamic-content-orchestrator` and play together in a
loosely coupled way.

Basically, there are two types of components:
- `Listeners` that that handle DOM events and let all `Updaters` know that there's new content
to fetch and display (through the orchestrator). They dispatch a `loadDynamicContent` event with 
`{ requestConfiguration: { searchParams } }` that can be consumed by `Updaters`.
- `Updaters` that wait for `Listeners` `loadDynamicContent` event, fetch content and update the 
DOM. In order to get noticed by the orchestrator, they need to register themselves by dispatching
an `addDynamicContentHandler` event.

The orchestrator sits between all those components and mainly:
- listens for `addDynamicContentHandler` events through which `Updaters` and `Listeners` register
themselves.
- listens for `loadDynamicContent` events fired by `Listeners`, then asks all `Updaters` for their
URLs (by calling their `assembleURL` function).
- combines all requests to the same URL, fetches them and cancels previous requests to prevent
race conditions.
- distributes the fetched content to the matching `Updaters`.

An element can at the same time be a `Listener` and an `Updater`.

Some of those components are provided within this package, others can be developed and integrated
for specific use cases.


## Example

```html
<dynamic-content-orchestrator>
    <content-updater data-endpoint-url="/results" data-is-main-content>
        <div data-loading hidden>Loading…</div>
        <div data-error hidden><!-- Will be populated when needed --></div>
        <div data-content>Initial content</div>
    </content-updater>

    <a href="/page?q=5">
        <link-listener>
            <!-- This content-updater fetches the new pagination when the page changes-->
            <content-updater data-endpoint-url="/page">
                <div data-loading hidden>Loading…</div>
                <div data-error hidden><!-- Will be populated when needed --></div>
                <div data-content>Page 3</div>
            </content-updater>
        <link-listener>
    </a>
```

## Components

### Dynamic Content Orchestrator

#### Exposed Element `<dynamic-content-orchestrator></dynamic-content-orchestrator>`

### Structure
Serves as a wrapper around all other components below and ensures that they play togehter nicely. 

Handles two events:
- `addDynamicContentHandler` with `{ detail: { updateResponseStatus, assembleURL } }`:
  - `updateResponseStatus` (`function`) will be called when the orchestrator receives new content.
    The argument will be an object with `status` and `content` properties; valid status are
    `loading`, `loaded` and `failed`. `content` will be the content that will be displayed (empty
    if the status is `loading`).
  - `assembleURL` (`function`) will be called when the orchestrator receives a
    `loadDynamicContent` event. It will be called with `{ searchParams }` (`URLSearchParams`) and
    must return a String (or null if nothing shold be fetched).
- `loadDynamicContent`: Dispatched by `Listeners` when they want to fetch new content with
  `{ detail: { requestConfiguration: { searchParams } }}`.

#### Attributes
None




### Content Updater

#### Exposed Element
`<content-udpater></content-updater>`

#### Attributes
- `data-endpoint-url` (required, but may be empty): URL that should be fetched; a query string
may be automatically attached if it is requested by a listener (e.g. to paginate or filter the
view).
- `data-is-main-content` (optional): If set, the browser will scroll to the top of the
element when the content changes.

#### Content
The following elements **must** be provided within `<aync-loader>`:
- An element matching `[data-content]` (required): If the request succeeds, it will be added to 
this element and the element will be shown.
- An element matching `[data-loading]` (required): It will be displayed while the data is loading.
- An element matching `[data-error]` (required): It will be displayed if loading data fails;
the error message will be added to this element.

### Events
- `addDynamicContentHandler` (see [DynamicContentOrchestrator](#DynamicContentOrchestrator))



## Link Listener

#### Exposed Element `<link-listener></link-listener>`

#### Attributes
None

### Structure
Wrap the `link-listener` around any number of links to update the content dynamically when they're
clicked. It listens to clicks on any child element and takes the `href` from the first surrounding
element that has a `href` attribute. The `href`'s query string will be used to dispatch a
`loadDynamicContent` event.

#### Events
- `loadDynamicContent` (see [DynamicContentOrchestrator](#DynamicContentOrchestrator)) with
the clicked link's (or its ancestral element's) `href` as `searchParams`.


## Filter Change Listener

#### Exposed Element `<filter-change-listener></filter-change-listener>`

#### Attributes
None

### Structure
Wrap the `filter-change-listener` around a form to update the content dynamically when 
the form is changed.


## Query String Updater

#### Exposed Element `<query-string-updater></query-string-updater>`

#### Attributes
None

### Structure
Updates the window location (query string) to represent the currently selected filters. Place it
anywhere in the DOM.


## Facets Updater

#### Exposed Element `<facets-updater></facets-updater>`

#### Attributes
- `data-endpoint` (required, but may be empty): URL that should be fetched; a query string
may be attached if it is requested by a listener.

### Structure
Wrap around the facets provided by Drupal; component is quite Drupal-specific.