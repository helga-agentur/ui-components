declare module '@helga-agency/dynamicpageloader' {
    type IsIdenticalFunction = (a: HTMLElement, b: HTMLElement) => boolean;

    export function applyChanges(options: {
         originalNode: HTMLElement;
         newNode: HTMLElement;
         canBeIdentical: (element: HTMLElement) => boolean;
         isIdentical: IsIdenticalFunction;
         updateNode: (node: HTMLElement) => HTMLElement;
         updateAttributes: (child: HTMLElement, identical: HTMLElement) => void;
     }): void;

    export function handleLinkClicks(options: {
        linkElements: NodeListOf<HTMLElement>;
        checkLink: (link: string) => boolean;
    }): void;

    export function handlePopState(): void;

    export function loadFile(url: string): Promise<HTMLHtmlElement>;

    export function createNode(document: Document, originalNode: HTMLElement): HTMLElement;

    export function canBeIdentical(element: HTMLElement): boolean;

    export const isIdentical: IsIdenticalFunction;

    export function applyAttributes(origin: HTMLElement, target: HTMLElement): void;
}
