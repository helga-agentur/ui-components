import { splitText } from '@helga-agency/splittext';

const element = document.createElement('div');

splitText({
    updateOnResize: false,
    element: element,
    wrapLetter: (content, index) => `<div class='my-letter' style='--splitTextIndex: ${index}'>${content}</div>`,
    wrapWord: false,
    wrapLine: false,
});

splitText({
    element: element,
    wrapLetter: (content, index) => `<span class='my-letter' style='--splitTextIndex: ${index}'>${content}</span>`,
    wrapWord: (content, index) => `<span class='my-word' style='--splitTextIndex: ${index}'>${content}</span>`,
    wrapLine: (content, index) => `<div class='my-line' style='--splitTextIndex: ${index}'>${content}</div>`,
});
