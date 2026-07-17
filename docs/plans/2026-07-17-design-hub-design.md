# Design Hub — Design Doc

Date: 2026-07-17

> **Superseded.** After drafting this design and starting on a Next.js/Prisma
> implementation, it turned out to be significant overkill for the actual
> ask: a page to publish announcements and workflow guidelines, hosted as a
> GitHub link. What's actually built is a static Jekyll site (Markdown files
> in `_announcements/` and `_workflows/`, served via GitHub Pages — see the
> root `README.md`). No auth, no database, no admin UI, no API routes. This
> doc and the implementation plans below are kept for history but do not
> describe the current site.

## Purpose

An internal site for the design team to publish announcements and to document
the workflows PMs and other builders use to engage with the design team. All
myKaarma employees can log in and view; design team members can author
content through an admin UI. Engineer-facing workflows are an explicit
phase 2, not part of this design.

## Architecture & Tech Stack

- **Framework**: Next.js (App Router) — single deployable app serving both
  public pages and the admin UI.
- **Auth**: NextAuth.js, Google provider, restricted via the `hd`
  (hosted domain) claim to `mykaarma.com` — non-company Google accounts are
  rejected at the OAuth callback, before any role logic runs.
- **Database**: Postgres, hosted on Neon or Supabase (no AWS account
  required). Accessed via Prisma for schema management and type-safe
  queries.
- **Rich-text editor**: Tiptap, storing content as HTML.
- **HTML sanitization**: server-side sanitization (e.g. `sanitize-html`) run
  on every save, so stored content can never contain scripts/unsafe
  attributes regardless of what the editor UI allows client-side.
- **Hosting**: Vercel, deploying from this git repo.

## Data Model & Roles

```
users        (id, email, name, google_id, created_at)
roles        (user_id -> users, role: 'viewer' | 'editor')
content      (id, type: 'announcement' | 'workflow', title, body_html,
              slug, author_id -> users, published_at, updated_at)
```

- Every new Google login auto-creates a `users` row and a default `viewer`
  role.
- One or two emails are seeded as `editor` at deploy time, giving a first
  admin who can grant/revoke editor access to others from inside the app.
- `content.type` distinguishes announcements from workflow pages; both share
  one table since the shape (title + rich body) is identical.

## Pages & UX Flow

- `/` — announcements feed, newest first. Viewer-accessible.
- `/workflows` — list of workflow pages.
- `/workflows/[slug]` — an individual workflow page.
- `/admin` — editor-only. Lists all content with create/edit/delete actions,
  plus a "manage roles" tab to search a user by email and toggle their role.
  Viewers hitting `/admin` are redirected to `/`.

## Security & Error Handling

- Sanitize `body_html` server-side on save — defense at write time, not just
  render time.
- Every `/admin/*` route and mutating API route checks `role === 'editor'`
  server-side, independent of whether the UI hides the controls — a viewer
  hitting the URL or API directly gets a 403.
- NextAuth's standard session-error handling covers auth failures; a plain
  "not authorized" page covers role failures.

## Testing

Given the small scope of this internal tool, testing is focused on the two
places a bug would be a real security problem:

- Unit tests for the role-check middleware/guard.
- Unit tests for the HTML sanitization function.
- Integration tests hitting `/admin` as both a viewer and an editor to
  confirm the access gate behaves correctly.

Exhaustive coverage is not a goal here — this is a small internal CMS, not a
core product.

## Explicitly Out of Scope (Phase 1)

- Engineer-facing workflows section (phase 2).
- Any interactive actions on workflow pages (request forms, Jira/Slack
  integration) — phase 1 workflow pages are static reference content.
- Pagination/search/categorization of content — deferred until content
  volume actually warrants it.
