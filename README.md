# Workflow Studio

Private source-available workflow builder for automation and Web3 orchestration.

This repository is published for portfolio/reference purposes. It is not open source, and reuse is restricted by the license in [`LICENSE`](/Volumes/Bao's%20Data/2027%20prj-baorlive/web3-workflow-builder/LICENSE).

## What it is

- Visual workflow editor built with React + Vite + React Flow
- Schema-driven node catalog backed by JSON definitions
- Workspace dashboard with folders, templates, sharing, servers, and contracts
- CSS-variable design system with reusable UI primitives
- In-app design system manager for token overrides and theme preview

## Stack

- React 18
- Vite 5
- React Flow 11
- Tailwind CSS 3
- Vitest + Testing Library

## Local development

```bash
npm install --legacy-peer-deps
cp .env.example .env.development
npm run dev
```

Useful commands:

```bash
npm run dev
npm run build
npm run preview
npm test
npm run lint
```

## Repository notes

- Only `.env.example` is meant to be committed.
- Session handling and some service flows are simplified for local development.
- Build output goes to `dist/` and should not be committed.
- Internal cache/log artifacts are excluded from version control.

## Codebase structure

```text
src/
  App.jsx                        Root composition and active-view switchboard
  main.jsx                       App bootstrap + design-system theme/override boot
  styles/
    index.css                    Global CSS entry; imports design-system CSS
  design-system.jsx              In-app design-system management screen
  components/
    auth/                        Login and auth-facing UI
    contracts/                   Contract management pages
    servers/                     Server management pages
    settings/                    Account, credentials, wallet, payment, API keys
    templates/                   Template browsing and solution pages
    ui/                          Reusable primitives: Button, Input, Card, Modal
    workflow/                    Editor canvas, node selector, properties, toolbar
    workspace/                   Sidebar, dashboard, folder tree, workflow cards
  contexts/
    ToastContext.jsx             Global toast state/provider
    WorkflowEditorContext.jsx    Editor context definitions
  data/
    mock*.js                     Local sample data used by the UI
    node_schemas.json            Node parameter schema definitions
    node_selector.json           Node library/category definitions
  design-system/
    tokens/                      Primitive, semantic, and component token CSS
    themes/                      Theme aliases for light/dark modes
    foundations/                 Typography, layout, and motion foundations
    index.css                    Single import surface for all DS layers
  features/
    assistant-chat/              Assistant-specific hooks
    editor/                      Editor services such as auto layout
    workspace/                   Workspace-specific hooks and services
  hooks/                         Shared React hooks
  services/                      Data, node API, and node library services
  constants/                     App, node, workflow, and UI constants
  utils/                         Shared helpers, analytics, storage, formatting
  __tests__/                     Cross-cutting tests such as design-system audits
```

## Runtime architecture

- `src/main.jsx` imports `src/styles/index.css`, which imports `src/design-system/index.css`.
- `src/main.jsx` also rehydrates the saved theme and token overrides from localStorage before React mounts.
- `src/App.jsx` is the main switchboard for the app views: workspace, workflow editor, settings, servers, contracts, and design system.
- Product features are assembled from reusable primitives in `src/components/ui` and domain components in `src/components/workflow`, `src/components/workspace`, and `src/components/settings`.
- Node behavior is driven by `src/data/node_selector.json` and `src/data/node_schemas.json`, then resolved through services in `src/services`.

## Design system management

The design system is not a separate package in this repo. It is a first-class layer inside the app and is managed through CSS custom properties plus the in-app manager at `src/design-system.jsx`.

### Token layers

The design system is structured in this order:

```text
primitives -> semantic tokens -> component tokens -> theme aliases -> components
```

- `src/design-system/tokens/primitives.css`
  Defines the raw building blocks: color scale, spacing, radius, typography, shadows, and motion primitives.
- `src/design-system/tokens/semantic.css`
  Maps primitives into role-based tokens such as brand, surface, text, border, success, warning, and error.
- `src/design-system/tokens/components/*.css`
  Maps semantic and primitive values into component-specific tokens such as `--button-*`, `--input-*`, and `--card-*`.
- `src/design-system/themes/light.css` and `src/design-system/themes/dark.css`
  Bind semantic values into the active theme and provide compatibility aliases consumed by the wider app.
- `src/design-system/foundations/*.css`
  Defines shared typography, spacing rhythm, layout, and motion behavior on top of the token layers.

### How components consume tokens

- `src/components/ui/Button.jsx` reads button tokens like `--button-primary-bg`, `--button-radius`, and `--button-font-size-md`.
- `src/components/ui/Input.jsx` and `src/components/ui/Card.jsx` follow the same pattern through their own component token namespaces.
- Tailwind is used for structure and utility composition, while CSS variables provide theming and visual control.

### In-app design system manager

`src/design-system.jsx` is a working management screen, not just a style guide. It provides:

- Primitive token browsing by category
- Semantic and component token editing
- Light/dark theme switching
- Base rem sizing controls
- Live component previews
- JSON display of active overrides

Overrides are stored in localStorage under:

- `workflowstudio.design-system.overrides.v1`
- `workflowstudio.design-system.theme.v1`
- `workflowstudio.design-system.rem-base.v1`

Those values are re-applied during app startup in `src/main.jsx`.

### Recommended workflow for design changes

1. Change raw values in `src/design-system/tokens/primitives.css` when the foundation itself should change.
2. Update `src/design-system/tokens/semantic.css` when the role mapping should change.
3. Update `src/design-system/tokens/components/*.css` when only one component family should change.
4. Verify theme behavior in `src/design-system/themes/light.css` and `src/design-system/themes/dark.css`.
5. Preview the result in the in-app design system screen at `src/design-system.jsx`.
6. Run the design system tests to catch token regressions.

### Validation and testing

- `src/__tests__/designSystem.test.js` verifies token mappings, theme aliases, and that semantic/component tokens reference primitives correctly.
- `npm run build` confirms the CSS import chain and app integration still compile.
- `scripts/export_design_tokens.cjs` is available as a helper for exporting token data.

## Publishing checklist

- Review sample data before making the repo public.
- Keep real secrets only in local env files or hosting platform settings.
- Re-run `npm run build` and `npm test` before pushing.

## License

This project is source-available for personal reference only. See [`LICENSE`](/Volumes/Bao's%20Data/2027%20prj-baorlive/web3-workflow-builder/LICENSE).
