/* global HTMLElement */

import splitTextContent from './splitTextContent.mjs';
import { debounce } from '@helga-agency/ui-tools';
import watchResize from './watchResize.mjs';
import normalizeScrollAxes from './normalizeScrollAxes.mjs';

/**
 * Provides a simple interface to split the textContent of a HTML element into single blocks where
 * every block represents a letter, a word or a line. Updates blocks on resize.
 */
export default ({
    updateOnResize = true,
    element,
    wrapLetter,
    wrapWord,
    wrapLine,
} = {}) => {
    if (!(element instanceof HTMLElement)) {
        throw new Error(`SplitText: argument element must be of type HTMLElement, is ${element} instead.`);
    }

    const originalContent = element.innerHTML;

    // Only restore on resize if textContent is split
    let wasSplit = false;

    const split = () => {
        splitTextContent({
            element,
            wrapLetter,
            wrapWord,
            wrapLine,
        });
        wasSplit = true;
    };

    const restore = () => {
        element.innerHTML = originalContent;
        wasSplit = false;
    };

    const debouncedSplit = debounce(split, 500);
    if (updateOnResize) {
        watchResize({
            axes: normalizeScrollAxes(updateOnResize),
            callback: () => {
                if (wasSplit) restore();
                debouncedSplit();
            },
        });
    }

    split();

    // Return restore function
    return restore;

};


