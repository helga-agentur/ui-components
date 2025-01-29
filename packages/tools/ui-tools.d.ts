declare module '@helga-agency/ui-tools' {
    interface ValidationOptions<T> {
        transform?: (value: string) => T;
        validate?: (value: T) => boolean;
        expectation?: string;
    }

    export function readAttribute<T>(
        element: HTMLElement,
        attributeName: string,
        options: ValidationOptions<T>,
    ): T;

    export function debounce(
        callback: () => void,
        offset: number,
    ): () => void;

    export function once(
        element: HTMLElement,
        name: string,
        callback: () => void,
    ): void;

    interface Dimensions extends Record<string, unknown> {
        update: () => void,
        destroy: () => void,
    }

    export function measureElement(options: {
        element: HTMLElement;
        updateOnIntersection?: boolean;
    }): Dimensions;
}
