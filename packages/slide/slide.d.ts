declare module '@helga-agency/slide' {
    export function slide(options: {
        element: HTMLElement;
        targetSize: number;
        dimension?: 'x' | 'y';
        onEnd?: () => void;
    }): void;
}
