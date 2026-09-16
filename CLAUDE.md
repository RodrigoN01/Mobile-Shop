# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (http://localhost:5173)
- `npm run build` — type-check (`tsc -b`) then build for production
- `npm run lint` — run ESLint
- `npm test` — run the Vitest suite once
- `npm test -- --watch` — run tests in watch mode
- `npm test -- --coverage` — run tests with coverage
- `npx vitest run src/path/to/File.test.tsx` — run a single test file
- `npx vitest run -t "test name"` — run tests matching a name pattern

## Architecture

**Stack:** React 19 + React Router v7 (declarative `<Routes>` mode, not the file-based/data-router mode) + TypeScript + SCSS Modules, built with Vite. No backend — all data comes from a remote REST API at `https://itx-frontend-test.onrender.com/api/...`.

**Provider nesting** (`src/main.tsx`): `BrowserRouter` > `ProductProvider` > `ProductDetailsProvider` > `CartProvider` > `App`. These three contexts (`src/context/`) are the only state management in the app — there is no Redux/Zustand/etc.

- `ProductContext` fetches the full product catalog once on mount (`GET /api/product`) and exposes `products`, `loading`, `error`.
- `ProductDetailsContext` exposes an imperative `fetchProductDetails(id)` that pages call in a `useEffect` keyed on the route param (`GET /api/product/:id`); it does not auto-fetch on mount.
- `CartContext` holds cart state client-side and persists it to `localStorage` (`cart`, `cartTimestamp`) with a 1-hour expiry, checked both lazily on load and via a `setInterval` poll. `addToCart` also fires a best-effort `POST /api/cart` (errors are swallowed/logged, not surfaced to the UI — the local cart is the source of truth).

**Routing** (`src/App.tsx`): three routes — `/` (home/catalog), `/details/:id` (product details), `/cart`. `App` also conditionally renders `SearchBar` (only on `/`) vs `BackButton` (everywhere else) based on `pathname`, and owns the search-term state that's passed down to `HomePage` as a prop (filtering happens client-side in `home.tsx` against the already-fetched product list).

**Types** (`src/types.ts`): `Product` is the lightweight catalog-list shape; `ProductDetails` is the full detail shape (includes `options.colors`/`options.storages` for the variant pickers on the details page); `CartItem extends ProductDetails` adding `quantity`, `selectedColor`, `selectedStorage`. Don't conflate `Product` and `ProductDetails` — the list endpoint and detail endpoint return different shapes.

**Styling:** SCSS Modules colocated with each component/page (`Component.module.scss`). `src/styles/_variables.scss` (colors, breakpoint variables) is auto-injected into every SCSS file via `additionalData` in `vite.config.ts` — don't add manual `@use "variables"` imports in component styles, it's already global.

**Path alias:** `@` resolves to `src/` (configured in `vite.config.ts`; mirror in `tsconfig` if adding new aliases).

## Testing conventions

- Test files are colocated as `*.test.tsx` next to the code under test (e.g. `Header.test.tsx` beside `Header.tsx`); context tests live in `src/context/__tests__/`.
- Vitest runs in `jsdom` environment with React Testing Library + `@testing-library/jest-dom/vitest` (imported per-file, not globally set up).
- Components/pages that consume `CartContext`, `ProductContext`, etc. need to be wrapped in the relevant provider(s) in tests; anything using `react-router` hooks (`Link`, `useParams`, `useLocation`) needs a `MemoryRouter` wrapper.

## Git conventions

- When committing a multi-file change, split it into separate commits grouped by logical area (e.g. one commit per component/page, or per concern like "tokens" vs "nav chrome" vs "pages") rather than one large commit — this keeps PRs easy to review. Only combine files into one commit when they're a single indivisible unit of change.
