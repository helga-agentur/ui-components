import canReadAttributes from '../../../src/shared/canReadAttributes.js';
import createListener from '../../../src/shared/createListener.mjs';

/* global HTMLElement, requestAnimationFrame, document, MutationObserver, window */

/**
 * Simple (horizontal) slider for wide elements that need (horizontal) scrolling
 */
export default class extends HTMLElement {

    constructor() {
        super();
        Object.assign(
            this,
            canReadAttributes([{
                // Button is optional
                name: 'data-previous-button-selector',
                property: 'previousButtonSelector',
            }, {
                // Button is optional
                name: 'data-next-button-selector',
                property: 'nextButtonSelector',
            }, {
                // Active content is optional
                name: 'data-active-content-selector',
                property: 'activeContentSelector',
            }, {
                // Buttons are optional, so is className
                name: 'data-disabled-button-class-name',
                property: 'disabledButtonClassName',
            }, {
                // Fraction of the viewport to scroll per button click; optional, defaults to 1 (100%)
                name: 'data-scroll-fraction',
                property: 'scrollFraction',
                transform: (value) => {
                    const number = Number(value);
                    return value !== null && number > 0 ? number : 1;
                },
            }]),
        );
        this.readAttributes();
    }

    connectedCallback() {
        this.cacheButtons();
        this.setupScrollListener();
        this.calculateButtonVisibility();
        this.updateDOM();
        this.setupClickListener();
        this.showActive();
        this.setupMutationListeners();
        this.setupResizeListeners();
    }

    /**
     * Only select buttons from DOM once to improve performance
     */
    cacheButtons() {
        if (!this.previousButtonSelector && !this.nextButtonSelector) return;
        this.previousButton = document.querySelector(this.previousButtonSelector);
        this.nextButton = document.querySelector(this.nextButtonSelector);
        if (!this.previousButton || !this.nextButton) {
            console.warn(
                'Previous or next button not found in DOM; previous is %o (selector %s) next is %o (selector %s)',
                this.previousButton,
                this.previousButtonSelector,
                this.nextButton,
                this.nextButtonSelector,
            );
        }
    }

    getElementWidth() {
        // Get content width without borders, see
        // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
        return this.clientWidth;
    }

    getContentWidth() {
        return this.scrollWidth;
    }

    setupScrollListener() {
        createListener(this, 'scroll', this.debounceScroll.bind(this));
    }

    debounceScroll() {
        if (this.debounceScrollTimeout) clearTimeout(this.debounceScrollTimeout);
        this.debounceScrollTimeout = setTimeout(this.handleScroll.bind(this), 50);
    }

    handleScroll() {
        this.calculateButtonVisibility();
        this.updateDOM();
    }

    calculateButtonVisibility() {
        const contentIsLarger = this.getContentWidth() > this.getElementWidth();

        // Detect the start/end edges via sentinels mobile sub-pixel scroll never lands on the exact end
        const maxScroll = this.getContentWidth() - this.getElementWidth();
        const atStart = this.scrollLeft <= 1;
        const atEnd = this.scrollLeft >= maxScroll - 1;
        this.isPreviousButtonVisible = contentIsLarger && !atStart;
        this.isNextButtonVisible = contentIsLarger && !atEnd;
    }

    setupClickListener() {
        if (this.previousButton) {
            this.previousButton.addEventListener('click', this.handleButtonClick.bind(this));
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', this.handleButtonClick.bind(this));
        }
    }

    handleButtonClick(ev) {
        const direction = ev.currentTarget === this.nextButton ? 1 : -1;
        const scrollDiff = this.getElementWidth() * this.scrollFraction * direction;
        this.scrollBy({
            left: scrollDiff,
            behavior: 'smooth',
        });
    }

    /**
     * Setup MutationObserver that updates button visibility if content of the Slider component
     * changes. Needed if DOM is e.g. modified by JS.
     */
    setupMutationListeners() {
        const config = { childList: true, subtree: true };
        const observer = new MutationObserver((list, obs) => {
            this.calculateButtonVisibility();
            this.updateDOM();
        });
        observer.observe(this, config);
    }

    /**
     * Resizing the window may change the visibility of buttons.
     */
    setupResizeListeners() {
        window.addEventListener('resize', () => {
            this.calculateButtonVisibility();
            this.updateDOM();
        });
    }

    showActive() {
        if (!this.activeContentSelector) return;
        const activeContent = this.querySelector(this.activeContentSelector);
        if (!activeContent) {
            console.warn(
                'Slider: Active content with selector %s not found in %o',
                this.activeContentSelector,
                this,
            );
            return;
        }
        activeContent.scrollIntoView({
            inline: 'center',
        });
    }

    updateDOM() {
        requestAnimationFrame(() => {
            const prevMethod = this.isPreviousButtonVisible ? 'remove' : 'add';
            const nextMethod = this.isNextButtonVisible ? 'remove' : 'add';
            if (!this.disabledButtonClassName && (this.previousButton || this.nextButton)) {
                console.warn('Slider: Tried to update visible class name on buttons, but disabled button class name is not set');
            }
            // Only update buttons if they exist; they're not mandatory arguments
            if (this.previousButton) {
                this.previousButton.classList[prevMethod](this.disabledButtonClassName);
            }
            if (this.nextButton) {
                this.nextButton.classList[nextMethod](this.disabledButtonClassName);
            }
        });
    }

}
