/**
 * Web component that displays the number of visible results.
 * Registers as an updater with the faceted-search orchestrator.
 */
import { readAttribute } from '@helga-agency/ui-tools';

/* global HTMLElement */

export default class FacetedSearchResultsAmount extends HTMLElement {

    #amountSelector;

    constructor() {
        super();
        this.#amountSelector = readAttribute(this, 'data-amount-selector', {
            validate: (value) => !!value,
            expectation: 'a non-empty selector string',
        });
    }

    connectedCallback() {
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('facetedSearchRegisterResultUpdater', {
                bubbles: true,
                detail: { element: this },
            }));
        });
    }

    disconnectedCallback() {
        this.dispatchEvent(new CustomEvent('facetedSearchUnregisterResultUpdater', {
            bubbles: true,
            detail: { element: this },
        }));
    }

    /**
     * Receives the current visible IDs from the orchestrator.
     * Updates the target element's textContent with the count.
     * @param {string[]} orderedIds
     */
    updateResults(orderedIds) {
        const target = this.querySelector(this.#amountSelector);
        if (!target) {
            console.warn(`FacetedSearchResultsAmount: no element matches "${this.#amountSelector}".`);
            return;
        }
        target.textContent = orderedIds.length;
    }
}
