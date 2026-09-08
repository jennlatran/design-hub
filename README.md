# Design Hub

A simple static site for the design team to publish announcements and
document workflows for PMs and other builders. Built with Jekyll and hosted
on GitHub Pages — no server, no database, no build step required locally.

## Adding an announcement

Add a new Markdown file to `_announcements/`, named `YYYY-MM-DD-short-title.md`:

```markdown
---
title: Your Announcement Title
date: 2026-07-17
---

Your announcement content here. Regular Markdown works: **bold**, lists,
[links](https://example.com), etc.
```

Commit and push — it'll appear on the homepage automatically, newest first.

## Adding a workflow page

Add a new Markdown file to `_workflows/`, named `short-title.md`:

```markdown
---
title: Your Workflow Title
---

Steps or guidance here.
```

Commit and push — it'll appear on the [Workflows](/workflows/) page automatically.

## Tagging an announcement as a design-system update

Add `category: design-system` to an announcement's front matter to show a
small badge next to its date:

```markdown
---
title: New button variant available
date: 2026-09-08
category: design-system
---
```

## Adding a Design System / Resources page

These live as plain pages (not a Jekyll collection, since the set is small
and fixed) under `design-system/` and `resources/`. Each needs explicit
`permalink:` front matter to get a clean trailing-slash URL — see the
existing files in those folders for the pattern.

## Configuring the Submit a Request / Check Status embeds

Both pages read embed URLs from their own front matter
(`submit-a-request/index.md`, `check-status/index.md`) — once the Google
Forms and Sheets exist, paste the embed URLs into that front matter and
commit. No code change needed.

- Forms: use each Form's own **Send → Embed `<>`** option to get the URL.
- Sheets: use **File → Publish to web**, choosing the specific sheet/range,
  and use the generated embed URL. Confirm with IT/Workspace admin that
  Publish to web isn't disabled before doing this — it's a different
  (unauthenticated-URL) sharing mechanism than normal mykaarma.com-restricted
  sharing.

## Local preview (optional)

GitHub Pages builds and serves the site automatically on push — you don't
need to build locally to publish. If you want to preview changes before
pushing:

```bash
gem install bundler jekyll
bundle init
bundle add jekyll
bundle exec jekyll serve
```

Then visit `http://localhost:4000`.

## Publishing

1. Push this repo to GitHub.
2. In the repo's Settings → Pages, set the source to the `main` branch (root).
3. GitHub will publish it at `https://<your-username>.github.io/design-hub/`.
