<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Gotchas

- **Base UI's `Select` crashes on item click in this project's `@base-ui/react` version.** Use `DropdownMenu` composed as a single-select filter instead (see `components/data-table/data-table-filter.tsx`, `components/data-table/product-picker.tsx`). `Popover` and `DropdownMenu` are both safe; only `Select` has been shown to crash.
- **`product-picker.tsx`'s search `Input` stops all keydown events except Escape from bubbling to the menu.** Base UI's `Menu` has its own built-in character-key typeahead that jumps focus to a matching item, which would otherwise steal every keystroke from the input before it reaches the value.
- **`DataTableSortHeader` is link-based (a plain server re-render on click) specifically to avoid client sort state.** This sidesteps a React Compiler memoization gotcha: components wrapping a `useReactTable` instance can silently stop re-rendering when handed stable-identity objects (`table`, `column`, `header`) as props — see the historical writeup in project memory (`feedback_base-ui-shadcn-nextjs16-gotchas`) if this resurfaces elsewhere.
- **`lib/analytics/semantic-search.ts`'s `runSemanticSearch` takes the product corpus as a parameter instead of fetching it itself.** Its only caller (`lib/products/dal.ts`) already has the corpus loaded, and fetching inside `semantic-search.ts` would create a `dal.ts` ↔ `semantic-search.ts` import cycle.
