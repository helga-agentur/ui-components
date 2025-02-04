import { slide } from '@helga-agency/slide';

const element = document.createElement('div');

slide({ element, targetSize: 40 });
slide({ element, targetSize: 40, dimension: 'x', onEnd: () => { console.log('end'); } });
