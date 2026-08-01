# json-schema-form-builder

A Vue 3 + TypeScript + Vuetify builder for forms backed by JSON schema.

- [json-schema-form-builder](#json-schema-form-builder)
  - [Project structure](#project-structure)
    - [`form-builder/src`](#form-buildersrc)
  - [Development workflow](#development-workflow)
    - [Docker](#docker)
  - [Production build](#production-build)
    - [Docker](#docker-1)
  - [CI/CD](#cicd)
  - [Architectural decisions](#architectural-decisions)
    - [Tooling notes](#tooling-notes)
  - [Possible future improvements](#possible-future-improvements)

## Project structure

```
.
├── form-builder/         # The Vue application (see below)
├── .github/workflows/    # CI and GitHub Pages deploy
├── docker-compose.yml    # Dev environment entrypoint
├── package.json          # Root tooling (git hooks)
└── .editorconfig, .nvmrc # Repo-wide conventions
```

### `form-builder/src`

```
src/
├── assets/      # Static assets (images / global CSS)
├── components/  # Small, reusable, presentational components
├── composables/ # Reusable Composition API logic
├── fields/      # Field type definitions, defaults, and factory logic
├── layouts/     # Page structure (app bar, nav) wrapping route content
├── plugins/     # Third-party plugin setup
├── router/      # Route definitions
├── stores/      # Pinia stores
├── types/       # Shared TypeScript types
└── views/       # Route-level components
```

## Development workflow

Requires Node 24.

```bash
cd form-builder
npm install
npm run dev          # Vite dev server at localhost:5173
npm run lint         # ESLint, autofixing
npm run type-check   # vue-tsc
npm run test:unit    # Vitest
npm run test:e2e     # Cypress, against a production preview build
npm run test:e2e:dev # Cypress, interactive, against the dev server
```

A pre-commit hook (Husky + lint-staged, configured at the repo root) runs ESLint and Prettier on staged files before every commit.

### Docker

```bash
docker compose up
```

This builds `form-builder/Dockerfile.dev`, bind-mounts the `form-builder/` source into the container, and runs the Vite dev server at `localhost:5173`. `node_modules` is installed inside the image. Vite's dev server hot reloads local development changes.

## Production build

```bash
cd form-builder
npm run build   # type-checks, then builds to dist/
npm run preview # serves the production build locally for a smoke test
```

### Docker

```bash
docker build -f form-builder/Dockerfile form-builder -t form-builder:prod
docker run -p 8080:80 form-builder:prod
```

Although out of scope for this project, the built frontend project could easily be hosted by a CDN like AWS Cloudfront to be globally deployed. Alternatively, `form-builder/Dockerfile` is also included to host the application in an AWS ECS deployment.

Note that no certificates have been configured for this project as it has no domain name. As such, the frontend uses port 80 (http).

## CI/CD

| Workflow Name | Trigger                                    | Action                                                                                           |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `ci.yml`      | Push to `main`, or any PR targeting `main` | Runs 5 checks in parallel: lint, type-check, unit test, production build smoke test, Cypress e2e |
| `deploy.yml`  | Push to `main`                             | Build the app, deploy to [GitHub Pages](https://willpwa.github.io/json-schema-form-builder/)     |

**One-time manual setup**: in the repository's Settings → Pages, set "Source" to "GitHub Actions". This can't be done from a workflow file - without it, `deploy.yml` will run successfully but nothing will actually be served.

## Architectural decisions

| Decision                                                                                               | Reason                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Vue layouts, despite having only one layout                                                        | This is the most futureproof way to build a Vue app, removing unnecessary rerenders of components that do not change when navigating between pages and positioning well for future implementation.                                                                                                                                        |
| State and mutation logic live in the Pinia stores                                                      | Components can read store state and call actions but don't edit or own the state themselves. This leads to more predictable mutations and a single source of truth, generally safer.                                                                                                                                                      |
| ESLint enforces code-quality rules while Prettier enforces formatting                                  | ESLint's stylistic rules have been disabled to avoid fighting with Prettier. This keeps the best of both tools, keeping the code more maintainable and clear.                                                                                                                                                                             |
| Vuetify as component library                                                                           | Speeds up development and avoids reinventing common UI patterns. It's a mature, well-established library with accessibility support built in.                                                                                                                                                                                             |
| TypeScript frontend instead of JavaScript                                                              | Static typing catches more bugs at compile time, and will make it safer to model JSON Schema types as the schema-driven form logic gets built out.                                                                                                                                                                                        |
| Deployment to GitHub Pages                                                                             | Demonstrates a usable version of the project for free, with certificates handled automatically. This project has no backend yet, and GitHub Pages is sufficient until then.                                                                                                                                                               |
| Husky + lint-staged instead of the Python `pre-commit` framework                                       | Keeps repo tooling entirely in the npm ecosystem - no Python dependency required just to run a git hook.                                                                                                                                                                                                                                  |
| Cypress specs target `data-cy` attributes, not text or CSS classes                                     | Decouples e2e tests from copy and styling changes, and avoids ambiguous matches when text appears in more than one place on a page.                                                                                                                                                                                                       |
| `splitpanes` for the resizable panel layout                                                            | Vuetify has no resizable split-pane primitive. `splitpanes` is a small, dependency-free, Vue 3-native library that handles drag-resize and touch input without pulling in a second UI kit.                                                                                                                                                |
| Field types modeled as a discriminated union on `type`, not one interface with every property optional | Lets TypeScript narrow to the correct field-specific properties (`minLength`, `isFloat`, `options`, ...) at each usage site, and turns a missing case for a new field type into a compile error in the registry, store guard, and property editor rather than a silent gap.                                                               |
| Fields and select options referenced by UUID `id`, never by array index                                | Keeps remove/select/update operations - and the property-editor's runtime allow-list - stable regardless of position, which matters now that drag-and-drop reordering changes array order without changing identity.                                                                                                                      |
| `vue-draggable-plus` for field and select-option reordering, not `vuedraggable`                        | Vuetify has no sortable-list primitive. `vuedraggable` (the more widely-known SortableJS wrapper) has its Vue 3-compatible v4 stuck on the npm `next` dist-tag rather than `latest`. `vue-draggable-plus` is a newer and actively maintained SortableJS wrapper built for Vue 3, with `latest` correctly pointing at its current release. |
| Small screen widths use a dedicated single panel setup                                                 | Three resizable panels stacked on top of each other is unusable on a small screen. The mobile layout shows one panel at a time, reusing the same `FieldList`/`FieldPropertiesEditor`/`FieldPalette` components as desktop.                                                                                                                |
| A field's `key` is a separate property from its `id`, and is what's exported                           | `id` stays an opaque UUID used purely for store/DOM identity (selection, removal, reordering, list `:key`). `key` is user-editable and becomes the property name in the exported JSON schema, so it needs to be human-meaningful and renameable without disturbing the field's identity elsewhere in the app.                             |
| `generateJsonSchema` (`fields/schema.ts`) is a pure function, not a store action                       | Takes a plain `FormField[]` and returns a plain object schema, with no dependency on Pinia or a mounted component. Keeps schema generation independently unit-testable and reusable as-is by a future schema-driven form renderer.                                                                                                        |
| Field UI hints (e.g. a text field's `placeholder`) are namespaced under a non-standard `ui` key        | Draft 2020-12 has no keyword for input placeholder text. Nesting form-builder-specific rendering hints under `ui` keeps them clearly separated from standard validation keywords, and gives other field types room to contribute their own hints under the same key later without inventing a new top-level keyword each time.            |
| The export trigger is a floating action button (`v-fab`), not an app-bar or toolbar button             | The mobile toolbar's `#append` slot is already used by the "add field" button, and the desktop app-bar only has room for the theme toggle. A `v-fab` overlays `v-main` instead of competing for toolbar space, and lives once in `DefaultLayout.vue` so it renders identically for both `MobileFormBuilder` and `ThreeColumnLayout`.      |

### Tooling notes

- **`vue/max-attributes-per-line` was tried and dropped.** Prettier's attribute wrapping is purely printWidth-based, so it and this rule structurally disagree - whichever tool runs last wins, meaning `lint:check` and `format:check` could never both pass. Prettier now owns attribute wrapping.
- **`vue/block-order` enforces `template` → `script` → `style`** as the `.vue` file layout convention. No conflict with Prettier here, since block order isn't a formatting decision Prettier makes.
- **`.gitattributes` forces LF line endings repo-wide.** Some dev machines default to `core.autocrlf=true`, which could otherwise check out `.husky/pre-commit` with CRLF endings and break the hook's shell execution.
- **Drag-and-drop in Cypress needs `forceFallback` + `supportPointer: false` on `vue-draggable-plus`, plus `cypress-real-events`.** SortableJS uses native HTML5 drag-and-drop, which Cypress's synthetic `.trigger()` events can't recreated. `forceFallback`/`supportPointer: false` on `<VueDraggable>` usages switch SortableJS to use its own plain mouse-event implementation, and `cypress-real-events` (see `cypress/support/commands.ts`'s `dragAndDrop` command) fires real OS-level events via CDP instead of untrusted synthetic ones.
- **Cypress's default viewport is 1920x1080** (`cypress.config.ts`), so `mdAndDown`-gated mobile UI (`MobileFormBuilder.vue`) never renders in the default desktop specs. `cypress/e2e/mobile-form-builder.cy.ts` explicitly overrides this with `cy.viewport(390, 844)` per-spec to exercise the mobile layout - any future mobile-specific spec needs the same override.
- **`cypress/support/e2e.ts` globally ignores the "ResizeObserver loop completed with undelivered notifications." browser warning.** It fires when a ResizeObserver callback doesn't finish before the next frame - harmless, but Cypress otherwise treats it as an uncaught exception and fails whichever spec happens to trigger a resize (e.g. the resizable Splitpanes layout) at the wrong tick.

## Possible future improvements

- Add Vitest component testing (`@vue/test-utils` mount tests) alongside the existing store unit tests.
- Introduce per-route layouts if a second layout becomes necessary, rather than before.
- Add environment-based config (`.env` files) once the app talks to a real backend.
