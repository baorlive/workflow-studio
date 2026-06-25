---
name: web3-workflow-builder
description: >-
  Guides development on Workflow Studio — a React 18 + Vite + React Flow visual
  workflow builder with schema-driven nodes, workspace dashboard, and token-based
  design system. Use when editing this repo, adding workflow nodes, modifying the
  canvas editor, properties panel, node schemas, design tokens, or workspace UI.
---

# Workflow Studio — Agent Skill

Concise guide for repository assistants working in this repository.

## Project identity

| Field | Value |
|-------|-------|
| Package | `workflow-studio-app` |
| Entry | `src/main.jsx` → `src/App.jsx` |
| Canvas | React Flow 11 (`WorkflowEditor.jsx`) |
| Node specs | `src/data/node_schemas.json` + `node_selector.json` |
| Primary color | `#5B4DE8` (primary-500) |
| Routing | State-based in `App.jsx` — **no React Router** |

## Before you edit

1. Read surrounding code — match naming, imports, and patterns.
2. Prefer path aliases: `@components`, `@hooks`, `@data`, `@services`, `@constants`.
3. Use design tokens (`var(--color-*)`, `primary-600`) — never hardcode `indigo-*` or raw hex in UI.
4. Use `cn()` from `src/utils/cn.js` for conditional Tailwind classes.
5. Minimize scope — do not refactor unrelated files.

## Where to change what

| Task | Primary files |
|------|---------------|
| Add/modify node type | `src/data/node_schemas.json`, `src/data/node_selector.json`, optionally `public/icons/` + `nodeIcons.js` |
| Node metadata/runtime | `src/services/NodeLibraryService.js` |
| Canvas behavior | `src/components/workflow/WorkflowEditor.jsx` |
| Node rendering | `src/components/workflow/CanvasNode.jsx` |
| Edge rendering | `src/components/workflow/ButtonEdge.jsx` |
| Parameter UI | `src/components/workflow/PropertiesPanel.jsx`, `src/components/workflow/inputs/*` |
| Node library panel | `src/components/workflow/NodeSelectorPanel.jsx` |
| Mock node API | `src/services/NodeApiService.js` |
| App routing/views | `src/App.jsx` |
| Global workflows/folders | `App.jsx` (mock) or `src/services/dataService.js` (abstraction, not wired) |
| Design tokens | `src/design-system/tokens/`, `src/design-system/themes/` |
| UI primitives | `src/components/ui/` |
| Workspace | `src/components/workspace/` |
| Undo/redo | `src/hooks/useHistory.js` |
| Tests | Colocated `*.test.jsx` next to components |

## Architecture essentials

### View routing (`App.jsx`)

```js
activeView: 'workspace' | 'workflow' | 'settings' | 'servers' | 'contracts' | 'design-system'
workspaceMode: 'workflows' | 'templates'  // only when activeView === 'workspace'
```

Editor opens when `activeView === 'workflow'` with `selectedWorkflow` from app state.

### React Flow integration

- **State:** `useHistory(initialNodes, initialEdges)` — NOT `useNodesState`/`useEdgesState`.
- **Converters:** `toReactFlowNode` / `toCanvasNode`, `toReactFlowEdge` / `toCanvasEdge`.
- **Types:** `{ canvasNode: CanvasNode }`, `{ buttonEdge: ButtonEdge }`.
- **Changes:** `applyNodeChanges`, `applyEdgeChanges`, `addEdge` + `pushSnapshot()` on connect.
- **Drop:** `onDrop` uses `screenToFlowPosition` from React Flow instance ref.
- **No `ReactFlowProvider`** — uses `reactFlowInstanceRef`.

Initial canvas data from `@data/mockNodes` unless `workflow.type === 'Blank'`.

### Node system pipeline

```
node_selector.json  →  categories + items (type, label, description)
node_schemas.json   →  per-type fields (string, select, credential, code, asyncOptions, …)
         ↓
NodeLibraryService.getNodeLibrary() / getNodeSpec(type)
         ↓
createDefaultParametersForNode(type)  →  default param values
         ↓
NodeSelectorPanel  |  PropertiesPanel
```

**Kind mapping** (`determineKind`): `trigger`, `conditional`, `action`, `delay`, `transform`, `compute`.

**Field tiers:** `resolvedFields.basic` (required !== false) and `.advanced`.

### Mock vs real API

| Concern | Current | Migration target |
|---------|---------|------------------|
| Workflows/folders | `mockWorkflows.js`, `mockFolders.js` in `App.jsx` | `dataService.js` |
| Save/run/export | `setTimeout` in `WorkflowEditor` | `VITE_API_BASE_URL` fetch |
| Dynamic fields/test | `NodeApiService.js` | Real backend |
| Auth | `localStorage.authToken`, dev bypass | `dataService.signIn*` |

`src/config/env.js` exposes `VITE_USE_MOCK_DATA` but App does not branch on it yet.

## Component conventions

- Functional components only; `.jsx` extension.
- Services: `*Service.js`; hooks: `use*.js`.
- Node type strings: snake_case matching schema keys (`if_else`, `ai_agent_tool`).
- Destructive actions: `ConfirmDialog` + toast via `useToast()`.
- Error boundaries wrap editor and dashboard (`ErrorBoundary.jsx`).
- `React.memo` on hot workspace components (`WorkflowCard`).

### Imports — prefer aliases

```js
import { useHistory } from '@hooks/useHistory';
import { mockNodes } from '@data/mockNodes';
import Button from '@components/ui/Button';
```

Services are sometimes imported relatively from workflow components — either style is acceptable; stay consistent within a file.

### Styling rules

- Tailwind utilities + CSS vars from `src/design-system/`.
- Button variants: `primary`, `secondary`, `ghost`, `danger` in `Button.jsx`.
- Sizes: `sm` / `md` / `lg` — md uses `text-sm` (14px body scale).
- Theme: `document.documentElement.dataset.theme` set in `main.jsx`.

## Common workflows

### Add a new node type

1. Add schema entry in `src/data/node_schemas.json` (fields, defaults, descriptions).
2. Add catalog entry in `src/data/node_selector.json` (category, type, label).
3. Add icon mapping in `src/components/workflow/nodeIcons.js` and/or `public/icons/<type>.svg`.
4. If dynamic options needed, extend `NodeApiService.loadMethodNode`.
5. Verify in NodeSelectorPanel drag-drop and PropertiesPanel field rendering.
6. Add test in `NodeLibraryService.test.jsx` or `PropertiesPanel*.test.jsx` if non-trivial.

### Modify canvas/editor behavior

1. Start in `WorkflowEditor.jsx` for orchestration.
2. Node visuals → `CanvasNode.jsx`; edge visuals → `ButtonEdge.jsx`.
3. Snapshot undo/redo: call `pushSnapshot()` before mutating nodes/edges.
4. Panel toggles: `showNodeSelector`, `showAIChat`, `showPropertiesPanel` local state.

### Modify properties panel field type

1. Check if type already handled in `PropertiesPanel.jsx` inline renderers.
2. Dedicated inputs live in `src/components/workflow/inputs/` (e.g. `AsyncSelect`, `CredentialInput`, `CodeInput`).
3. `ParamField.jsx` exists as extracted helper but is **not wired** into PropertiesPanel — prefer extending PropertiesPanel or wiring ParamField intentionally.

### Add a new app view

1. Add `activeView` case in `App.jsx` `renderView()`.
2. Add sidebar nav handler in `Sidebar.jsx` if needed.
3. Create page component under `src/components/`.

## Testing

```bash
npm test                 # Vitest watch
npm run test:coverage    # Coverage
npm run lint             # ESLint (max-warnings 0)
```

- Setup: `src/__tests__/setup.js` (jest-dom, localStorage, matchMedia mocks).
- Mock `NodeApiService` in dynamic PropertiesPanel tests.
- Single-thread pool in `vitest.config.js` — do not parallelize tests sharing module state.
- Exclude: `.claude/`, `old-wf-studio-fe-main/`, `dist/`.

## Known pitfalls (do not reintroduce)

| Issue | Detail |
|-------|--------|
| `WorkflowEditorProvider` unused | Imported + `editorContextValue` built but render tree not wrapped — Sprint 5 debt |
| Duplicate schemas | Root `node_schemas.json` mirrors `src/data/` — edit `src/data/` only |
| Legacy hooks | `useWorkflowCanvas`, `useWorkflowNodes` superseded by WorkflowEditor inline logic |
| Legacy components | `WorkflowNode.jsx`, `WorkflowConnection.jsx` — CanvasNode/ButtonEdge are active |
| `constants/index.js` | ~10k lines embeds NODE_CONFIG — parallel to JSON schemas; avoid adding there |
| Auth bypass | `checkAuth()` commented out; `isAuthenticated` defaults `true` |
| External CDN icons | Login Google logo was a CSP risk — use local SVG |
| `alert()` | Replaced with toasts/file inputs — never add blocking dialogs |

## Commands

```bash
npm install --legacy-peer-deps   # Required on Vercel; use if peer dep conflicts
npm run dev                      # Port 3001 (vite.config.js)
npm run build                    # Output: dist/
npm run build              # Build production assets
```

## File reference

| Purpose | Path |
|---------|------|
| Spec / roadmap | `docs/PROJECT_CONTROL.md`, `docs/MASTER_SPEC.md` |
| Dev cheat sheet | `docs/guides/QUICK_REFERENCE.md` |
| Env config | `src/config/env.js`, `.env.example` |
| Vite aliases | `vite.config.js` |
| Vitest config | `vitest.config.js` |
| Tailwind bridge | `tailwind.config.js` |
| Service exports | `src/services/index.js` |

## Verification checklist

Before claiming work complete:

- [ ] `npm run lint` passes
- [ ] Relevant `npm test` passes
- [ ] No hardcoded colors outside design tokens
- [ ] Node schema changes reflected in both JSON files if applicable
- [ ] Canvas changes preserve undo/redo (`pushSnapshot`)
- [ ] New UI matches existing spacing/typography scale

## Additional resources

- Full UI spec: [docs/MASTER_SPEC.md](docs/MASTER_SPEC.md)
- Project map: [docs/PROJECT_CONTROL.md](docs/PROJECT_CONTROL.md)
- React Flow migration notes: [docs/REACTFLOW_COMPARISON_REPORT.md](docs/REACTFLOW_COMPARISON_REPORT.md)
