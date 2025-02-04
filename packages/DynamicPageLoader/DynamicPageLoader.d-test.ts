import {
    applyChanges,
    handleLinkClicks,
    handlePopState,
    loadFile,
    createNode,
    isIdentical,
    canBeIdentical,
    applyAttributes,
} from '@helga-agency/dynamicpageloader';

const originalNode = document.createElement('ul');
const newNode = document.createElement('li');
originalNode.appendChild(newNode);
const nodeList = newNode.querySelectorAll('li');

applyChanges({
    originalNode: originalNode,
    newNode: newNode,
    canBeIdentical,
    isIdentical,
    updateNode: (node) => node,
    updateAttributes: (child, identical) => { console.log(child, identical); },
});

handleLinkClicks({
    linkElements: nodeList,
    checkLink: (link) => true,
});

handlePopState();

loadFile('https://helga.ch');

createNode(document, originalNode);

canBeIdentical(originalNode);

isIdentical(originalNode, newNode);

applyAttributes(originalNode, newNode);
