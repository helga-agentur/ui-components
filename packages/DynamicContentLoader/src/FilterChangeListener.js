/* global FormData, HTMLElement, customElements, CustomEvent */

/**
 * Custom element that dispatches a loadDynamicContent event when a filter changes (checkboxes,
 * inputs etc.). Needs DynamicContentOrchestrator to work.
 */
export default class FilterChangeListener extends HTMLElement {
    connectedCallback() {
        this.#addChangeListener();
    }

    #addChangeListener() {
        this.addEventListener('change', this.#handleChange.bind(this));
    }

    #handleChange() {
        const form = this.querySelector('form');
        if (!form) {
            throw new Error('Missing child form element in FilterChangeListener.');
        }
        const formData = new FormData(form);
        // Only add form elements to the searchParams if they are not empty. If we use empty params
        // as well, Drupal gets bitchy.
        const cleanFormData = new FormData();
        [...formData.entries()].forEach(([key, value]) => {
            if (value) cleanFormData.append(key, value);
        });
        console.log('clean', cleanFormData);
        this.dispatchEvent(new CustomEvent('loadDynamicContent', {
            bubbles: true,
            detail: {
                requestConfiguration: {
                    searchParams: new URLSearchParams(cleanFormData),
                },
            },
        }));
    }

    static defineCustomElement() {
        if (!customElements.get('filter-change-listener')) {
            customElements.define('filter-change-listener', FilterChangeListener);
        }
    }
}
