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
