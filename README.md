# Re-usable UI Components for and from Joinbox

## Develop

### Intro
- This is a monorepo that uses lerna to publish the components as individual packages

### Init
- Run `npm i && npx lerna exec --npm i` to initialize the whole repo locally (install node modules)
- Link packages if necessary (`lerna bootstrap` is deprecated)

### Release
1. Run `npm run test` in the **root directory** to run all tests in all packages
1. Run `npm run build`
1. Commit and push the generated files
1. Checkout main and merge feature branch
1. Run `npm run createVersion` in the root directory to create new versions for all packages with
changes since their last release; versions are created automatically based on 
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) and on the previous Git tag
1. Create a Git tag; when versioning, conventional commits are compared to to the
most recent Git tag, therefore this step is essential.
1. Push tags to server `git push origin <tag-name>`
1. Run `npm run release` to publish packages


## Use
- All components are [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). 
- Make sure to use the appropriate [polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements)
for [old browsers](https://caniuse.com/custom-elementsv1). If not noted otherwise, only the custom
element polyfill is needed.
- Embed the JavaScript file that ends with `Element`; it defines the custom element on `window`.
- If you are using Babel, install [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime)
and import it before the elements via `import 'regenerator-runtime/runtime.js';`

## Components
- [YouTube Player](./packages/YouTubePlayer/README.md)
- [YouTube Preview Image](./packages/YouTubePreviewImage/README.md)
- [Overlay and Buttons](./packages/Overlay/README.md)
- [Audio Player](./packages/Media/README.md)
- [Table of Contents](./packages/TableOfContents/README.md)
- [Slider](./packages/Slider/README.md)
- [Form Sync](./packages/FormSync/README.md)
- [Vimeo Player](./packages/VimeoPlayer/README.md)
- [Vimeo Preview Image](./packages/VimeoPreviewImage/README.md)
- [Dynamic Content Loader](./packages/DynamicContentLoader/README.md)
- [Async Loader](./packages/AsyncLoader/README.md)
- [Dynamic Page Loader](./packages/DynamicPageLoader/README.md)
- [Relative Time](./packages/RelativeTime/README.md)


## Tools
- [readAttribute](./packages/tools/README.md)
- [splitText](./packages/splitText/README.md)
- [once](./packages/tools/README.md)
- [slide](./packages/slide/README.md), import as `import { slide } from '@joinbox/ui-components'`
- [createDebounce](./packages/tools/README.md)

## Tests
`npm i && npm test`
