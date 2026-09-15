# Frontend

Next.js App Router dashboard (React, TypeScript, Tailwind, shadcn/ui).

## Layout

```
src/
├── app/                            # App Router pages
├── lib/config/backend.ts           # API_BASE_URL (/api/v1)
├── lib/modules/base/               # kit/platform (auth, shell, stores)
│   └── ui/                         # shadcn/ui primitives
└── lib/modules/apps/<name>/api.ts  # per-app HTTP clients
```

### Frontend modules (mandatory)

Under the frontend modules root there are **only**:

- `base/` — kit/platform (auth, users, shell, i18n, stores) + design primitives at `base/ui/`
- `apps/<domain>/` — product domains (API clients + UI), mirroring `backend/app/modules/apps/<domain>/`

There is **no** project `components/` folder as the app UI home. Modules are the component home.
Do not add `global/`, `shell/`, `layout/`, or a top-level `modules/ui/` peer of `base`/`apps`.
Where shadcn (or equivalent) is used: `ui` → `…/modules/base/ui`, `components` alias → `…/modules/base`.

## Canonical example

- API client: `src/lib/modules/apps/sample/api.ts`
- UI: `src/app/(dashboard)/sample/notes/page.tsx`

Inspect these before building new features.

## Dev

From repo root:

```bat
npm run dev
```

Or via CLI: `__ctrl__\fast-next-ctrl.bat dev run all`

## Ecosystem

Install npm packages in this workspace as needed.

Full docs: [docs/modules.md](../docs/modules.md) · [docs/architecture.md](../docs/architecture.md)
