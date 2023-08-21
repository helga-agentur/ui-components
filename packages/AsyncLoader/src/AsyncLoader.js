import readAttribute from '../../tools/src/readAttribute.mjs';
import createListener from '../../../src/shared/createListener.mjs';
import Template from './Template.mjs';

/* global HTMLElement, window, CustomEvent */

/**
 * Custom element that loads content through XHR. Displays error messages if such are encountered.
 */
export default class extends HTMLElement {

    #loadingStates = {
        initial: 'initial',
        loading: 'loading',
        failed: 'failed',
        loaded: 'loaded',
    };

    #teardownTriggerEventListener

    #loadingStatus = this.#loadingStates.initial;

    #template;

    constructor() {
        super();

        this.endpointURL = readAttribute(
            this,
            'data-endpoint-url',
        );

        this.triggerEventName = readAttribute(
            this,
            'data-trigger-event-name',
            {
                validate: (value) => !!value,
                expectation: 'a non-empty string',
            },
        );

        this.eventEndpointPropertyName = readAttribute(
            this,
            'data-event-endpoint-property-name',
        );

        this.triggerEventFilter = readAttribute(
            this,
            'data-trigger-event-filter',
        );

        this.loadOnce = readAttribute(
            this,
            'data-load-once',
            {
                transform: (value) => value === '',
            },
        );

        if (!(this.endpointURL || this.eventEndpointPropertyName)) {
            throw new Error('The attributes "data-endpoint-url" or "data-event-endpoint-property-name" were not found but one of them needs to be set.');
        }

        this.#template = new Template(this, '[data-content-container]');
    }

    connectedCallback() {
        this.#setupTriggerEventListener();
    }

    disconnectedCallback() {
        this.#teardownTriggerEventListener();
    }

    /**
     * Listen to event specified in data-trigger-event-name
     */
    #setupTriggerEventListener() {
        this.#teardownTriggerEventListener = createListener(
            window,
            this.triggerEventName,
            this.#handleTiggerEvent.bind(this),
        );
    }

    /**
     * Tests if event dispatched passes filter in case trigger-event-filter was provided
     */
    #handleTiggerEvent(event) {
        if (this.triggerEventFilter) {
            // Do not use eval to limit scope of variables that can be accessed; still use JS in the
            // attribute to allow for maximum flexibility.
            try {
                const filterFunction = Function('event', `return ${this.triggerEventFilter}`);
                const eventMatchesFilter = filterFunction(event);
                if (!eventMatchesFilter) return;
            } catch (error) {
                // Make sure the user understands where the error came from
                error.message = `The filter function provided through the trigger-event-filter attribute of <async-loader> threw the following error: ${error.message}`;
                throw error;
            }
        }

        const fetchURL = this.endpointURL || event.detail?.[this.eventEndpointPropertyName];
        if (!fetchURL) throw new Error(`The property ${this.eventEndpointPropertyName} either has no value or was not found in the payload of the "${this.triggerEventName}" Event`);

        // If content should only be loaded once, return if fetch request was started or succeeded
        const requestIsLoadingOrLoaded = [this.#loadingStates.loading, this.#loadingStates.loaded]
            .includes(this.#loadingStatus);
        if (this.loadOnce && requestIsLoadingOrLoaded) return;
        this.#fetchData(fetchURL);
    }

    async #fetchData(fetchURL) {
        this.#loadingStatus = this.#loadingStates.loading;
        this.#template.generateContent(['[data-loading-template]']);
        try {
            const response = await fetch(fetchURL);
            if (!response.ok) {
                this.#handleError(`Status ${response.status}`, fetchURL, response.status);
            } else {
                const content = await response.text();
                this.#loadingStatus = this.#loadingStates.loaded;
                this.#template.setContent(content);
                this.#dispatchStatusEvent(fetchURL);
            }
        } catch (error) {
            this.#handleError(error.message, fetchURL);
            // Do not prevent error from being handled correctly; JSDOM displays an "Unhandled
            // rejection" error, therefore ignore it for now
            // throw error;
        }
    }

    #handleError(message, fetchURL, statusCode = null) {
        this.#loadingStatus = this.#loadingStates.failed;
        this.#dispatchStatusEvent(fetchURL, true);

        const errorTemplateSelectors = [
            ...(statusCode ? [`[data-error-${statusCode}-template]`] : []),
            '[data-error-template]',
        ];

        this.#template.generateContent(errorTemplateSelectors, { message }, true);
    }

    #dispatchStatusEvent(fetchURL, failed = false) {
        const type = failed ? 'asyncLoaderFail' : 'asyncLoaderSuccess';
        const payload = {
            bubbles: true,
            detail: {
                url: fetchURL,
                element: this,
            },
        };
        this.dispatchEvent(new CustomEvent(type, payload));
    }

}
