# Rosin & Rye

A blog built with [XMLUI](https://xmlui.org), a declarative XML-based UI framework. Structured as an npm workspaces monorepo.

---

## Repository layout

```
rosin-and-rye/
├── apps/
│   ├── blog/                          # Blog application (@rosin-and-rye/blog)
│   │   ├── src/
│   │   │   ├── Main.xmlui             # App entry — layout, routes, post metadata
│   │   │   ├── config.ts              # App config — syntax highlighting (Shiki), search index, markdown utils
│   │   │   └── components/
│   │   │       ├── BlogOverview.xmlui # Post list (filters drafts, sorts by date)
│   │   │       ├── BlogPage.xmlui    # Single post view (title, author, date, YouTube embed, markdown body)
│   │   │       ├── LinkButton.xmlui  # Styled link rendered as button
│   │   │       ├── PageNotFound.xmlui # 404 page
│   │   │       └── Separator.xmlui   # Vertical content separator
│   │   ├── public/
│   │   │   ├── blog/                  # Blog post markdown files
│   │   │   │   └── *.md               # Post content (referenced by slug)
│   │   │   ├── resources/icons/       # SVG icons (RSS)
│   │   │   ├── serve.json             # SPA rewrite rules (local preview)
│   │   │   └── staticwebapp.config.json # Azure Static Web Apps config
│   │   ├── scripts/
│   │   │   └── generate-rss.js        # Parses var.posts from Main.xmlui → public/feed.rss
│   │   ├── extensions.ts              # XMLUI extensions (xmlui-search)
│   │   ├── index.html                 # HTML entry point
│   │   ├── index.ts                   # App bootstrap (startApp + HMR)
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── xmlui/                         # XMLUI framework source (git submodule / vendored)
│       ├── xmlui/                     # Core framework package ("xmlui")
│       └── packages/
│           └── xmlui-search/          # Search extension ("xmlui-search")
├── package.json                       # Root workspace config
├── .npmrc                             # legacy-peer-deps=true (vite 7 compat)
└── .gitignore
```

## Key concepts

### How posts work

Blog posts are self-contained markdown files with YAML frontmatter:

1. **Content + metadata** — `apps/blog/public/blog/{slug}.md` with a frontmatter block containing `title`, `slug`, `description`, `author`, `date`, `youtube` (video ID), and optional `draft: "true"`.
2. **Auto-discovery** — `config.ts` uses `import.meta.glob` to scan all `/public/blog/*.md` files at build time, parses their frontmatter, and exposes the sorted posts array via `appGlobals.posts`.
3. **Dynamic routing** — A single `<Page url="/blog/:slug">` in `Main.xmlui` handles all posts via `$routeParams.slug`.

### Adding a new post

1. Create `public/blog/{slug}.md` with a frontmatter block:
   ```markdown
   ---
   title: "My Post Title"
   slug: "my-post"
   description: "A short description."
   author: "Your Name"
   date: "2026-03-10"
   youtube: "dQw4w9WgXcQ"
   ---

   Post content here...
   ```

That's it — no code changes needed. The post automatically appears in the overview and is routable at `/blog/{slug}`. The `youtube` field is the video ID only (not the full URL); it is embedded as a player at the top of the post via an `IFrame`.

### XMLUI framework

The blog uses XMLUI in **Vite mode** (built, not standalone). `.xmlui` files are compiled at build time into JS modules. The framework provides reactive XML markup — `{expression}` syntax binds values, components are XML tags, attributes are props.

Key XMLUI components used: `App`, `AppHeader`, `NavPanel`, `Pages`/`Page`, `Footer`, `List`, `Markdown`, `IFrame`, `ContentSeparator`, `Search`, `ToneSwitch` (dark/light mode).

The `xmlui` CLI (from the xmlui package's `bin` field) provides `start`, `preview`, and `build` commands.

## Workspace dependencies

| Package | Location | Purpose |
|---|---|---|
| `@rosin-and-rye/blog` | `apps/blog` | The blog app |
| `xmlui` | `apps/xmlui/xmlui` | XMLUI framework (resolved from source in dev) |
| `xmlui-search` | `apps/xmlui/packages/xmlui-search` | Search component extension (resolved from `dist/`, must be pre-built) |

`xmlui` resolves from source (`src/index.ts`). `xmlui-search` resolves from its built `dist/` — run `npx xmlui build-lib` in `apps/xmlui/packages/xmlui-search` if dist is missing.

## Commands

Run from the repo root:

| Command | Description |
|---|---|
| `npm install` | Install all workspace dependencies |
| `npm start` | Dev server with HMR (Vite) |
| `npm run build` | Production build → `apps/blog/dist/` + `apps/blog/ui.zip` |
| `npm run preview` | Preview production build locally |

### Blog-specific commands (from `apps/blog/`):

| Command | Description |
|---|---|
| `npm run gen:rss` | Generate RSS feed from post metadata |
| `npm run build-optimized` | Build with xmlui-optimizer |
| `npm run preview-optimized` | Serve optimized build |

## Build details

- **Build mode**: `INLINE_ALL` — all assets inlined, flat dist output (`--flatDist`)
- **Syntax highlighting**: Shiki with JavaScript, JSON, HTML, CSS, SCSS, and XMLUI grammars
- **Search**: Client-side full-text search via `xmlui-search` (Fuse.js-based), indexed from `blog-search-data.json`
- **RSS**: Generated at build time by `scripts/generate-rss.js` which parses `var.posts` from `Main.xmlui`
- **Deployment**: Static files. Configured for Azure Static Web Apps (`staticwebapp.config.json`) and generic SPA hosting (`serve.json`)

## Config files

| File | Purpose |
|---|---|
| `apps/blog/src/config.ts` | App name ("Rosin & Rye"), default theme, syntax highlighter setup, search index, global settings |
| `apps/blog/extensions.ts` | Registers XMLUI extensions (currently only `xmlui-search`) |
| `apps/blog/tsconfig.json` | TypeScript config (ES2017 target, bundler module resolution, React JSX) |
| `.npmrc` | `legacy-peer-deps=true` — required because `@modyfi/vite-plugin-yaml` declares peer dep on vite 3-5 but xmlui uses vite 7 |
