# Dynamic Content Loader

Modular components to update multiple content blocks on a page in a synchronized way, e.g.
to update pagination, filters and content separately (to keep the UI as responsive as possible)
when a filter is changed.

Different components are wrapped in a `dynamic-content-orchestrator` and play together in a
loosely coupled way. There are two types of components:
- `Listener`s handle DOM or other events and request an update by dispatching an event.
- `Updater`s that return the URL from where their content should be fetched and handle the content
once it arrives.

Basic Flow:
1. All `Updater`s register themselves at the `DynamicContentOrchestrator` by dispatching an
`addDynamicContentUpdater` event with `{ updateResponseStatus, assembleURL }`.
2. Once a user interaction happens, a `Listener` dispatches a `loadDynamicContent` event with 
`{ requestConfiguration: { searchParams } }`. The `searchParams` correspond to the filters that
should be applied to the fetched content.
3. The `DynamicContentOrchestrator` calls `assembleURL` on each `Updater` and collects the
returned URLs.
4. The `DynamicContentOrchestrator` fetches the content from every URL and calls
`updateResponseStatus` on each `Updater` with the corresponding content.

Why the Orchestrator?
- If user interactions happen at a fast pace, we must make sure that all previous requests are
canceled (or at least discarded). If not, we might run into race conditions and display outdated
content. The orchestrator cancels **all** previous requests (for all `Updater`s) once a new user
interaction happens.
- If multiple `Updater`s intend to fetch the same URL, it batches those requests and makes sure
a URL is only fetched once.

An element can at the same time be a `Listener` and an `Updater` if it implements the the functions
and events of both types.

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

#### Exposed Element 
`<dynamic-content-orchestrator></dynamic-content-orchestrator>`

#### Structure
Serves as a wrapper around all other components below and ensures that they play togehter nicely. 

Handles two events:
- `addDynamicContentUpdater ({ detail: { assembleURL: function, updateResponseStatus: 
function } })`. The argument signatures are:
  - `assembleURL (function({ searchParams: SearchParams }))` will be called when new content 
    should be fetched. Must return a string or `null` if nothing should be fetched.
  - `updateResponseStatus (function({ status: string, content: string }))` will be called when the
    orchestrator receives new content. 
    Valid `status` are `loading`, `loaded` and `failed`. `content` will be the content that will
    be displayed (empty if the status is `loading`).
- `loadDynamicContent ({detail: { requestConfiguration: { searchParams: SearchParams } }})`:
  Dispatched by `Listener`s when they want to fetch new content.

#### Attributes
None




### Content Updater

#### Exposed Element
`<content-udpater></content-updater>`

#### Attributes
- `data-endpoint-url` (`string`, attribute is required but value may be empty): URL that should be
fetched; a query string may be automatically attached if it is requested by a listener
(e.g. to paginate or filter the view).
- `data-is-main-content` (`boolean`, optional): If set, the browser will scroll to the top of the
element when the content changes.

#### Content
The following elements **must** be provided within `<aync-loader>`:
- An element matching `[data-content]` (required): If the request succeeds, it will be added to 
this element and the element will be displayed.
- An element matching `[data-loading]` (required): It will be displayed while the data is loading.
- An element matching `[data-error]` (required): It will be displayed if loading data fails;
the error message will be added to this element.

#### Events
- `addDynamicContentUpdater` (see [DynamicContentOrchestrator](#DynamicContentOrchestrator))



### Link Listener

#### Exposed Element
`<link-listener></link-listener>`

#### Attributes
- `data-reset` (`boolean`, optional): If set, clicking the button will emit an event with 
`reset: true` in the `requestConfiguration` (see `input-updater`).

#### Structure
Wrap the `link-listener` around any number of links to update the content dynamically when they're
clicked. It listens to clicks on any child element and takes the `href` from the first surrounding
element that has a `href` attribute. The `href`'s query string will be used to dispatch a
`loadDynamicContent` event.

#### Example
```html
<link-listener>  
    <a href="/page?p=1"><span>1</span></a>  
    <a href="/page?p=2"><span>2</span></a>  
</link-listener>  
```

The click happens on the `<span>` elements (which do not have a `href` attribute); therefore
the query string will be taken from the clicked `span`'s first ancestor with a `href` attribute.

#### Events
- `loadDynamicContent` (see [DynamicContentOrchestrator](#DynamicContentOrchestrator)) with
the clicked link's (or its ancestral element's) `href` query string as `searchParams`.


### Filter Change Listener

#### Exposed Element 
`<filter-change-listener></filter-change-listener>`

#### Attributes
None

#### Structure
Wrap the `filter-change-listener` around a form to update the content dynamically when 
the form is changed.


### Query String Updater

#### Exposed Element 
`<query-string-updater></query-string-updater>`

#### Attributes
None

#### Structure
Updates the window location (query string) to represent the currently selected filters. Place it
anywhere in the DOM (below the `<dynamic-content-orchestrator>`).


### Facets Updater

#### Exposed Element 
`<facets-updater></facets-updater>`

#### Attributes
- `data-endpoint` (required, but may be empty): URL that should be fetched; a query string
may be attached if it is requested by a listener.

#### Structure
Wrap around the facets provided by Drupal; component is quite Drupal-specific.

### Input Updater

Very Drupal-specific component to fetch and update the HTML of the filter inputs to reseet them 
to their initial state (e.g. remove all input values) if the filters are reset.

#### Exposed Element 
`<input-updater></input-updater>`

#### Attributes
- `data-endpoint-url` (`string`, attribute is required but value may be empty): URL that should be
fetched to get the HTML (as key of a JSON-stringified object).