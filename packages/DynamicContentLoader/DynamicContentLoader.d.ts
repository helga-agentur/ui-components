declare module '@helga-agency/dynamic-content-loader' {
    export class DynamicContentOrchestrator extends HTMLElement {
        static defineCustomElement(): void;
    }

    export class LinkListener extends HTMLElement {
        static defineCustomElement(): void;
    }

    export class ContentUpdater extends HTMLElement {
        static defineCustomElement(): void;
    }

    export class FilterChangeListener extends HTMLElement {
        static defineCustomElement(): void;
    }

    export class QueryStringUpdater extends HTMLElement {
        static defineCustomElement(): void;
    }

    export class FacetsUpdater extends HTMLElement {
        static defineCustomElement(): void;
    }

    export class InputsUpdater extends HTMLElement {
        static defineCustomElement(): void;
    }
}
