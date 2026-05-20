# topicfinder-admin — Agent Notes

## Commands

```bash
npm run dev      # vite — start dev server
npm run build    # tsc -b && vite build — production build
npm run preview  # vite preview — preview production build
npm test         # vitest run
npm run test:watch  # vitest — watch mode
npm run lint     # tsc --noEmit
```

## Architecture

- `src/App.tsx` — Route definitions. `/login` renders LoginPage; all other routes nested under MainLayout.
- `src/components/MainLayout.tsx` — Ant Design Sider+Header+Content layout with 7 menu items.
- `src/pages/LoginPage.tsx` — Admin login form (壳，无后端对接).
- `src/pages/PlaceholderPage.tsx` — Generic placeholder for route stubs.
- `tests/App.test.tsx` — Vitest + @testing-library/react. Uses MemoryRouter for route isolation.
- `tests/setup.ts` — jsdom polyfill for `window.matchMedia` (required by Ant Design).

## Conventions

- All UI text in Chinese (zh-CN).
- Ant Design 6.x with dark sidebar theme.
- Route-based code splitting not yet implemented (all pages in single bundle).
- Test queries: prefer `getByRole` over `getByText` when Ant Design renders duplicates (menu + page title).
