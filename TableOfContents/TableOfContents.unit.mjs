import { dirname } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import getDOM from '../testHelpers/getDOM.mjs';

const setup = async(hideErrors) => {
    const basePath = dirname(fileURLToPath(new URL(import.meta.url)));
    return getDOM({ basePath, scripts: ['TableOfContentsElement.js'], hideErrors });
};

const createElement = (document, html) => {
    const container = document.createElement('div');
    container.innerHTML = html;
    return container.firstChild;
};

test('fails with missing attributes', async(t) => {
    const { document, errors } = await setup(true);
    const h2 = createElement(document, '<h2>test</h2>');
    document.body.appendChild(h2);
    // Only test internal errors, not the ones thrown by canReadAttributes
    const toc0 = createElement(document, '<table-of-contents-component data-chapters-selector="h2" data-template-selector="inexistent" data-template-content-selector=".text"></table-of-contents-component>');
    document.body.appendChild(toc0);
    t.is(errors[0].message.includes('selector inexistent not found'), true);
    const toc1 = createElement(document, '<table-of-contents-component data-chapters-selector="h2" data-template-selector="template" data-template-content-selector=".text"><template><div></div></template></table-of-contents-component>');
    document.body.appendChild(toc1);
    t.is(errors[1].message.includes('selector is .text, template <div></div>'), true);
    t.is(errors.length, 2);
});

test('creates table of contents', async(t) => {
    const { window, document, errors } = await setup(true);
    window.requestAnimationFrame = content => content();
    const toc = createElement(document, '<table-of-contents-component data-chapters-selector="h2" data-template-selector="template" data-template-content-selector=".text"><ul><template><li class="item"><span>–</span><span class="text"></span></li></template></ul></table-of-contents-component>');
    const title1 = createElement(document, '<h1>test1</h1>');
    const title2 = createElement(document, '<h2>test2</h2>');
    const title3 = createElement(document, '<h2>test3</h2>');
    document.body.appendChild(title1);
    document.body.appendChild(title2);
    document.body.appendChild(title3);
    document.body.appendChild(toc);
    // Correct amount of titles
    t.is(toc.querySelectorAll('li.item').length, 2);
    // Uses correct content
    t.is(toc.querySelector('li.item').innerHTML, '<span>–</span><span class="text">test2</span>');
    t.is(errors.length, 0);
});

test('scrolls to element', async(t) => {
    const { window, document, errors } = await setup(true);
    // Fake implementation of scrollIntoView that is missing in JSDom
    window.HTMLElement.prototype.scrollIntoView = () => { window.scrollY = 10; };
    window.requestAnimationFrame = content => content();
    const toc = createElement(document, '<table-of-contents-component data-chapters-selector="h1" data-template-selector="template" data-template-content-selector=".text"><ul><template><li><span class="text"></span></li></template></ul></table-of-contents-component>');
    const title1 = createElement(document, '<h1>test1</h1>');
    document.body.appendChild(title1);
    document.body.appendChild(toc);
    t.is(toc.querySelectorAll('li').length, 1);
    toc.querySelector('span.text').click();
    t.is(errors.length, 0);
});