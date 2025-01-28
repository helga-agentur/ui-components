declare module '@helga-agency/splittext' {
    type WrapFunction = ((content: string, index: number) => string) | false;

    export function splitText(options: {
        updateOnResize?: boolean;
        element: HTMLElement;
        wrapLetter: WrapFunction;
        wrapWord: WrapFunction;
        wrapLine: WrapFunction;
    }): void;
}
