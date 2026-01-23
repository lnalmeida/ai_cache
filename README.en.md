# AICache

AICache is a full-stack solution (API + Web) for **caching and cataloging AI responses**.
It allows you to store prompts, responses, and metadata (tags, tech stack, source file),
then query that history quickly with pagination and flexible search.

## Project Overview

The project is split into two main modules:

- `api/` — **AICacheAPI**: .NET backend that exposes REST endpoints to save, search and retrieve AI responses.
- `web/` — **AICache Web**: React/TypeScript frontend that consumes the API, letting you browse, search and save prompts through a friendly UI.

The core idea is to act as a **"personal repository of AI conversations/generations"**, optimizing:

- **Productivity**: reuse responses you already generated.
- **Cost**: reduce repeated calls to external AI APIs.
- **Consistency**: keep a historical log with rich metadata.

---

## Goals

- Provide a **simple and efficient API** for persisting AI responses.
- Enable **fast search** by prompt, response, tags, tech stack or file.
- Expose a **modern UI** for viewing, filtering and quickly copying prompts and responses.
- Apply **solid architecture, testing and observability practices** in a small-sized project.

---

## High-Level Architecture

### API Module (`api/`)

**Main tech stack**:

- **Language/Framework**: .NET 9 / ASP.NET Core
- **ORM**: Entity Framework Core 9
- **Database**: SQLite (development and tests)
- **Testing**:
  - xUnit
  - Moq
  - Microsoft.AspNetCore.Mvc.Testing (integration/E2E tests)

**Main components** (folders under `api/src`):

- `Controllers/`
  - `AICacheController.cs`: exposes REST endpoints under `api/AICache`.
- `Services/`
  - `AICacheService.cs`: business logic (save, search, paging, get by hash, etc.).
- `Data/` (can appear as Context/Repositories depending on organization)
  - `AICacheDbContext`: EF Core DbContext.
  - `AICacheRepository`: data access (queries, pagination, filters).
- `Interfaces/`
  - `IAICacheRepository`, `IAICacheService`: contracts to enable testing and dependency inversion.
- `Models/`
  - `AIResponse.cs`: persisted entity.
  - `PagedResult.cs`: pagination model.
  - `SaveRequest.cs`: input DTO for saving prompts.

**Pipeline configuration** (key points from `Program.cs`):

- **Controllers + OpenAPI**: `AddControllers()`, `AddEndpointsApiExplorer()`, `AddOpenApi()` + `MapOpenApi()` in development.
- **Global rate limiting**:
  - Uses `PartitionedRateLimiter` keyed by client IP.
  - Fixed window: **30 requests/minute** per IP, with a small queue.
  - Status 429 responses with `Retry-After` header.
- **Database**:
  - `AddDbContext<AICacheDbContext>` with SQLite via `AICache` connection string.
  - `EnsureCreated()` during startup to ensure schema creation.
- **CORS**:
  - Permissive default policy: `AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()` (simplifies frontend dev).

### Core API Endpoints

All endpoints live under the `api/AICache` prefix (see `AICacheController`).

- `POST /api/AICache/save`
  - Saves or updates an AI response.
  - Body based on `SaveRequest` (prompt, response, tags, techStack, fileName, etc.).
- `GET /api/AICache/all`
  - Returns all records in a **paginated** way.
  - Query params: `page`, `pageSize`.
- `GET /api/AICache/search`
  - Searches records by keyword and/or other criteria.
  - Query params: `query`, `page`, `pageSize` (and potentially extra filters).
- `GET /api/AICache/hash/{*hash}`
  - Returns a specific record by prompt hash.
  - Uses `WebUtility.UrlDecode` to handle hashes with special characters.

> For more API details, see `api/README.md` and `api/tests/README.md` (currently in Portuguese).

---

## Web Module (`web/`)

**Main tech stack**:

- **Language**: TypeScript
- **Framework**: React 19 + Vite
- **UI / Design System**:
  - Radix UI (Dialog, Label, Slot)
  - Custom UI components (Button, Card, Badge, Dialog, etc.) built with TailwindCSS and `class-variance-authority`
- **Styling**:
  - TailwindCSS
  - Utility-first CSS and light/dark themes
- **Other libraries**:
  - `lucide-react` (icons)
  - `react-router-dom` (for future/optional navigation)
  - `sonner` (toast notifications)
  - `axios` (HTTP client, where needed)

Key scripts (`web/package.json`):

- `npm run dev` — start Vite in development mode.
- `npm run build` — production build (`tsc -b` + `vite build`).
- `npm run lint` — ESLint for TS/TSX.
- `npm run preview` — serve the built app locally.

### Frontend structure

Main folders under `web/src`:

- `App.tsx`
  - Root component (main shell of AICache Web).
  - Manages:
    - view mode (cards / table),
    - save and detail dialogs,
    - integration with hooks (`useTheme`, `useOffline`, `useCopyToClipboard`),
    - search and listing logic over the API (`promptApiService`).
- `main.tsx`
  - Bootstrap of the React app.
  - Renders `<Toaster />` (sonner) + `<App />` inside `React.StrictMode`.
- `components/`
  - `dialogs/`
    - `PromptDetailDialog.tsx`: shows full prompt details (metadata, formatted response, copy buttons, etc.).
    - `SavePromptDialog.tsx`: form to save a new prompt (prompt, response, tags, tech stack, file name) using the API.
  - `prompts/`
    - `PromptCard.tsx`: individual card with prompt summary, tags, tech stack, date and copy buttons.
    - `PromptCardsView.tsx`: grid of cards.
    - `PromptTableView.tsx`: responsive table, useful for dense views.
  - `layout/`
    - `OfflineBanner.tsx`: alerts when the app is offline.
    - `ThemeToggle.tsx`: light/dark toggle.
    - `PWAInstallButton.tsx`: PWA installation integration (when applicable).
    - `Toast.tsx`: custom toast for copy feedback.
  - `search/`
    - `SearchBar.tsx`: search bar integrated with the API plus a "save new" button.
    - `ViewModeToggle.tsx`: toggles between card and table views, displaying result count.
  - `ui/`
    - Low-level building blocks (Button, Card, Dialog, Badge, Input, Textarea, etc.) built atop Radix + Tailwind.
- `contexts/`
  - `ThemeContext.tsx`, `ThemeProvider.tsx`: global theme context.
- `hooks/`
  - `useTheme.ts`: hook to access and change theme.
  - `useOffline.ts`: hook to detect offline/online status.
  - `useCopyToClipboard.ts`: encapsulates clipboard logic and feedback state.
- `services/`
  - `promptService.ts`: API integration layer (`promptApiService`), responsible for:
    - Building the base URL (`API_BASE_URL` / `VITE_API_BASE_URL`).
    - Building query strings (`SearchParams`).
    - Transforming API responses (CSV strings for `tags`/`techStack`) into the frontend model (`Prompt` with arrays).
    - Main methods: `savePrompt`, `getAllPrompts`, `searchPrompts`, `getPromptByHash`.
- `types/`
  - `prompt.ts`:
    - `Prompt`: domain model used in the UI (arrays for `tags` and `techStack`).
    - `SavePromptDTO`: DTO used when sending data to the API (tags/techStack as CSV strings).

### Main UI flows

- **Initial listing**
  - When `AICacheContent` (`App.tsx`) mounts, it calls `promptApiService.getAllPrompts` (page 1, size 20) and stores the list in `prompts`.
- **Search**
  - `SearchBar` calls `onSearch`, which triggers `promptApiService.searchPrompts` with `query`, `page`, `pageSize`.
  - If `query` is empty, it falls back to `getAllPrompts`.
- **Saving a new prompt**
  - `SavePromptDialog` holds form state (prompt, response, tags, techStack, fileName).
  - On save:
    - Validates required fields (prompt and response).
    - Builds `SavePromptDTO` with `tags`/`techStack` as CSV strings.
    - Calls `promptApiService.savePrompt`.
    - On success: shows `toast.success`, closes the dialog and invokes `onSaveSuccess`, which refreshes the prompt list.
- **Prompt details**
  - Clicking on a card/row opens `PromptDetailDialog` with the selected prompt.
  - The component normalizes `tags` and `techStack` into lists (supports both arrays and CSV strings), displaying badges and metadata.
  - Offers copy buttons for prompt and response.

---

## Patterns and Practices

### API

- **Layered architecture** (Controller → Service → Repository → DbContext).
- **Dependency inversion** via interfaces (`IAICacheService`, `IAICacheRepository`).
- **Rate limiting** using `PartitionedRateLimiter` keyed by client IP.
- **Standard pagination** for list responses (`PagedResult`).
- **Unique hash** to identify prompts and enable direct lookups.
- **Automated tests** at three levels (unit, integration, E2E) as detailed in `api/tests/README.md`.

### Web

- **Clear separation of concerns**:
  - API services (`promptApiService`) concentrating HTTP calls and data transformation.
  - UI components decoupled from data logic.
  - Custom hooks for cross-cutting state (theme, offline, clipboard).
- **Strong TypeScript usage**:
  - Domain models (`Prompt`, `SavePromptDTO`, `SearchParams`, etc.) strongly typed.
- **Visual consistency**:
  - Tailwind + reusable components (`ui/*`).
  - `class-variance-authority` for component variants.
- **User feedback**:
  - Toasts (`sonner`) for success/error.
  - Custom toast for quick copy feedback.
  - Visual handling for loading/error states in lists.

### Git / Commit Style

- Commits follow a **semantic** style, for example:
  - `feat(web): ...` — new frontend features.
  - `feat(api): ...` — new API features.
  - `fix(api): ...` — bug fixes.
  - `chore(web): ...` — infra/housekeeping tasks.
- Messages are short, focused and scoped to small, cohesive changes.

---

## How to Run the Project

### 1. Start the API (`api/`)

Prerequisites:

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

Steps:

```sh
cd api
# run migrations if needed (e.g.: dotnet ef database update)
cd src
dotnet run
```

The API will be available at `http://localhost:<port>` (see the `dotnet run` output).

To run tests:

```sh
cd api
dotnet test
```

### 2. Start the frontend (`web/`)

Prerequisites:

- Node.js + npm (version compatible with Vite/React 19)

Steps:

```sh
cd web
npm install
npm run dev
```

By default, Vite runs on `http://localhost:3000`.

The API base URL can be configured via a Vite env variable
(e.g. `VITE_API_BASE_URL`) or, in development, falls back to a default
like `http://localhost:8080/api/AICache` defined in `promptService.ts`.

To build for production and preview:

```sh
npm run build
npm run preview
```

---

## Next Steps / Possible Improvements

- Authentication and authorization for accessing the cache.
- Export/backup of prompts in formats such as JSON/Markdown.
- Advanced filters by language/stack/multiple tags.
- Metrics and observability (e.g. Prometheus/Grafana) on the API.
- Versioning of responses for the same prompt over time.
