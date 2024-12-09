# Re-usable UI Components for and from Joinbox

## Develop

### Intro
- This is a monorepo that uses npm workspaces to publish the components as individual packages

### Init
Run `npm i` in the root directory. It will install all dependencies for all workspaces.

### Release
1. Run `npm run test -ws` in the **root directory** to run all tests in all packages
1. Run `npm run build -ws --if-present` to run build scripts in all packages where one exits
1. Commit and push the generated files
1. Checkout main and merge feature branch
1. Run `npm version <patch|major|minor> -w <packageName>` to create a new version for a specific package
   or `-ws` for all packages.
1. Run `npm publish -w <packageName>` to publish a specific package or `-ws` for all packages.

### Run npm commands across workspaces
Configuration flags for npm commands in relation to workspaces:

* `--workspace=<packageName>` or `-w <packageName>` to run a command in a specific workspace.
  Valid values for `<packageName>` are either:
  * Workspace names (e.g. `@joinbox/async-loader`)
  * Path to a workspace directory (e.g. `packages/AsyncLoader`)
  * Path to a parent workspace directory (will result in selecting all workspaces within that folder)
* `--workspaces` or `-ws` to run a command across all workspaces. 
  * By running the command with the `--if-present` flag, npm will ignore workspaces missing the target script;
    e.g. `npm run build --workspaces --if-present`.

#### Scripts
* Run tests: `npm test`
* Lint JS files: `npm run lint`
* Run build script: `npm run build`

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

## Changesets
[Changesets](https://github.com/changesets/changesets) helps to manage package versioning and publishing. Acctually it is not in use.
This is just a reminder in case we want to use it sometime.
