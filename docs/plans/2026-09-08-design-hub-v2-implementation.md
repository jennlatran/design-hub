# Design Hub v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Restructure Design Hub's navigation and add the Design System, Resources, Submit a Request, and Check Status sections defined in `docs/plans/2026-09-08-design-hub-v2-design.md`.

**Architecture:** Stays a static Jekyll site on GitHub Pages — every task below is Markdown/Liquid/vanilla JS/CSS, no build step, no backend. The two "Submit a Request" / "Check Status" pages read embed URLs from page front matter, so a non-engineer can wire them up later just by editing a Markdown file's front matter once the Google Forms/Sheets exist — no code change needed at that point.

**Tech Stack:** Jekyll (kramdown), Liquid templating, vanilla JS (no framework, no bundler), plain CSS.

---

## Before you start

This repo has no committed `Gemfile` — GitHub Pages builds it server-side. To preview locally, set up bundler once:

```bash
cd /Users/jenntran/code/design-hub
gem install bundler jekyll
bundle init
bundle add jekyll
```

Then for every task's "verify" step, run:

```bash
bundle exec jekyll build
```

Expected: exits 0, no `Liquid Exception` or `Invalid date` errors in the output. If `gem install` fails due to the system Ruby version (2.6.10, quite old), that's an environment issue to resolve separately — not something to work around by skipping verification.

To actually view pages in a browser instead of just checking the build succeeds:

```bash
bundle exec jekyll serve
```

Then visit `http://localhost:4000/design-hub/` (note the `baseurl` from `_config.yml` — it's not just `localhost:4000/`).

---

### Task 1: Split "Engage with Design" into a decision-tree page + three track pages

**Files:**
- Modify: `_workflows/engaging-with-design.md` (trim to decision tree only)
- Create: `_workflows/compliance-spot-check.md`
- Create: `_workflows/collaboration-and-refinement.md`
- Create: `_workflows/full-design-partnership.md`

**Step 1: Replace the content of `_workflows/engaging-with-design.md`**

```markdown
---
title: Working with Design - Find Your Track
---

PMs and builders engage with the design team in a few different ways
depending on where a feature is in its lifecycle. Answer the questions
below to find out which track applies to your project.

## Which track am I in?

1. **Has design been involved since the start of this feature/project?**
   - Yes: you're in [Full Design Partnership]({{ '/workflows/full-design-partnership/' | relative_url }}).
   - No: continue to question 2.
2. **Do you already have a working prototype and PRD (or equivalent), and
   want to collaborate with design to turn it into final designs?**
   - Yes: you're in [Design Collaboration & Refinement]({{ '/workflows/collaboration-and-refinement/' | relative_url }}).
   - No: continue to question 3.
3. **Is this feature already built, and you just need a check before it
   ships?**
   - Yes: you're in [UI Compliance Spot Check]({{ '/workflows/compliance-spot-check/' | relative_url }}).
   - No: none of these quite fit — reach out in the **UIUX Designers**
     Google Chat channel and we'll help sort out the right path.

Once you know your track, submit through [Submit a Request]({{ '/submit-a-request/' | relative_url }}).
```

**Step 2: Create `_workflows/compliance-spot-check.md`**

```markdown
---
title: UI Compliance Spot Check
---

[← Back to Find Your Track]({{ '/workflows/engaging-with-design/' | relative_url }})

**What it is:** Design is not involved until the feature is built. Design
does a fast, focused check to confirm the interface uses the design system
correctly before it ships — this is **not** a full design review, and
design does not sign off on the overall UX.

**Timeline:** 1–2 business days.

**Example scenarios:**
- A small feature built independently that needs a final check before merging

## The checklist

This is the same checklist design uses when reviewing your submission —
check your own work against it first to avoid back-and-forth.

> **Content TBD.** The actual checklist items (CSS token usage, component
> usage, spacing, accessibility, etc.) still need to be written — see
> `docs/plans/2026-09-08-design-hub-v2-design.md`, Explicitly Deferred.
> Until this is filled in, submit through
> [Submit a Request]({{ '/submit-a-request/' | relative_url }}) and design
> will review manually.

**What's checked (categories, detail pending):**
- Spacing
- Color tokens
- Buttons (correct variants/classes)
- Fonts
- Component usage
- Accessibility
- The single happy-path flow, checked only for major usability red flags
  (e.g. a user being unable to complete the task) — no other flows are
  reviewed

**What's not checked:** UX beyond the happy path, edge cases, alternate
flows.

**If issues are found:** Design will notify the builder directly, and the
deployment should not proceed until they're resolved.

See also: [common compliance failures]({{ '/design-system/common-failures/' | relative_url }})
for real examples of what usually trips this up.
```

**Step 3: Create `_workflows/collaboration-and-refinement.md`**

```markdown
---
title: Design Collaboration & Refinement
---

[← Back to Find Your Track]({{ '/workflows/engaging-with-design/' | relative_url }})

**What it is:** The PM/builder brings a working prototype and a PRD (or
equivalent), and design collaborates to turn it into final, polished
designs — the prototype is a starting point/inspiration, not the final
deliverable.

**Timeline:** ~1 week.

**What design delivers:**

> **Content TBD** — see `docs/plans/2026-09-08-design-hub-v2-design.md`,
> Explicitly Deferred.

**Example scenario:**

> **Content TBD** — no real example has been written yet.

Ready to start? Submit through [Submit a Request]({{ '/submit-a-request/' | relative_url }}).
```

**Step 4: Create `_workflows/full-design-partnership.md`**

```markdown
---
title: Full Design Partnership
---

[← Back to Find Your Track]({{ '/workflows/engaging-with-design/' | relative_url }})

**What it is:** Design is involved from the beginning and leads most or all
of the design work for the feature.

**Timeline:** Full design cycle — typically 2–4 weeks depending on scope.

**Example scenarios:**
- A new module in the service scheduler
- A redesign of the payments flow

**What design delivers:**

> **Content TBD** — see `docs/plans/2026-09-08-design-hub-v2-design.md`,
> Explicitly Deferred.

Ready to start? Submit through [Submit a Request]({{ '/submit-a-request/' | relative_url }}).
```

**Step 5: Verify**

```bash
bundle exec jekyll build
```

Expected: exits 0. Then check the built output has all four pages:

```bash
ls _site/design-hub/workflows/
```

Expected: `engaging-with-design/`, `compliance-spot-check/`, `collaboration-and-refinement/`, `full-design-partnership/` each containing an `index.html`.

**Step 6: Commit**

```bash
git add _workflows/
git commit -m "docs: split Engage with Design into decision tree + per-track pages"
```

---

### Task 2: Design System section

**Files:**
- Create: `design-system/index.md`
- Create: `design-system/common-failures.md`
- Create: `design-system/change-request.md`

**Step 1: Create `design-system/index.md`**

```markdown
---
layout: content
title: Design System
permalink: /design-system/
---

The design system's source of truth is our Figma library — this page
links out to it rather than duplicating it.

- **Figma library:** _TODO: paste the real Figma library link here._
- **Compliance checklist:** see the checklist inside
  [UI Compliance Spot Check]({{ '/workflows/compliance-spot-check/' | relative_url }})
  — it lives there, not here, since it's part of that workflow.
- **[Common compliance failures]({{ '/design-system/common-failures/' | relative_url }})** —
  real before/after examples of what usually trips reviews up.
- **[Requesting a design system change]({{ '/design-system/change-request/' | relative_url }})**

## Using an AI coding assistant?

If you use Claude Code, Codex, or a similar tool, check whether your setup
already includes myKaarma's `ui-tokens` / `ui-components` / `ui-typography`
/ `ui-layout` skills from the
[`mykaarma/claude-sutras`](https://github.com/mykaarma/claude-sutras) repo.
Those skills teach your AI assistant our actual design tokens and component
patterns, so it writes on-system UI without you having to remind it every
time.
```

**Step 2: Create `design-system/common-failures.md`**

```markdown
---
layout: content
title: Common Compliance Failures
permalink: /design-system/common-failures/
---

[← Back to Design System]({{ '/design-system/' | relative_url }})

Real before/after examples of the things that most often fail a
[UI Compliance Spot Check]({{ '/workflows/compliance-spot-check/' | relative_url }}),
so the same mistakes don't keep repeating.

> **Content TBD.** No examples have been collected yet — see
> `docs/plans/2026-09-08-design-hub-v2-design.md`, Explicitly Deferred.
> Add examples here as they come up in real reviews.
```

**Step 3: Create `design-system/change-request.md`**

```markdown
---
layout: content
title: Requesting a Design System Change
permalink: /design-system/change-request/
---

[← Back to Design System]({{ '/design-system/' | relative_url }})

> **Content TBD.** The process for proposing or requesting a change to the
> design system (who reviews it, what the turnaround looks like) hasn't
> been defined yet — this needs its own dedicated brainstorm, the same way
> the three engagement tracks got one. See
> `docs/plans/2026-09-08-design-hub-v2-design.md`, Explicitly Deferred.
>
> In the meantime, raise it in the **UIUX Designers** Google Chat channel.
```

**Step 4: Verify**

```bash
bundle exec jekyll build
ls _site/design-hub/design-system/
```

Expected: build exits 0; directory contains `index.html`, `common-failures/index.html`, `change-request/index.html`.

**Step 5: Commit**

```bash
git add design-system/
git commit -m "docs: add Design System section (index, common failures, change request)"
```

---

### Task 3: Resources page

**Files:**
- Create: `resources/index.md`

**Step 1: Create `resources/index.md`**

```markdown
---
layout: content
title: Resources
permalink: /resources/
---

Templates and reference material for working with design. Most of these
live elsewhere already — this page just indexes them in one place.

- **User interview templates:** _TODO: paste the real link here._
- **Other design docs/templates:** _TODO: paste real links here as they're
  gathered — see `docs/plans/2026-09-08-design-hub-v2-design.md`,
  Explicitly Deferred._

## AI coding tooling

See the [Design System]({{ '/design-system/' | relative_url }}) page's
"Using an AI coding assistant?" section for the `claude-sutras` design-token
skills.
```

**Step 2: Verify**

```bash
bundle exec jekyll build
ls _site/design-hub/resources/
```

Expected: build exits 0; directory contains `index.html`.

**Step 3: Commit**

```bash
git add resources/
git commit -m "docs: add Resources page"
```

---

### Task 4: Shared toggle script for the two-embed pages

**Files:**
- Create: `assets/js/toggle.js`

**Step 1: Create `assets/js/toggle.js`**

```javascript
// Generic two-pane toggle. Expects:
//   [data-toggle-group] wrapping [data-toggle-btn][data-target] buttons
//   and one or more [data-toggle-pane][id] panes matching those targets.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-toggle-group]').forEach(function (group) {
    var buttons = group.querySelectorAll('[data-toggle-btn]');
    var panes = document.querySelectorAll('[data-toggle-pane]');

    function activate(targetId) {
      buttons.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.target === targetId);
      });
      panes.forEach(function (pane) {
        pane.hidden = pane.id !== targetId;
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activate(btn.dataset.target);
      });
    });

    // Default to whichever button is marked active in the HTML, else the first.
    var initial = group.querySelector('[data-toggle-btn].active') || buttons[0];
    if (initial) activate(initial.dataset.target);
  });
});
```

**Step 2: Add the script tag to the layout**

Modify `_layouts/default.html:7` — add this line directly after the existing `<link rel="stylesheet" ...>` line:

```html
  <script src="{{ '/assets/js/toggle.js' | relative_url }}" defer></script>
```

**Step 3: Verify**

```bash
bundle exec jekyll build
cat _site/design-hub/assets/js/toggle.js | head -3
```

Expected: build exits 0; the file exists in the built output.

**Step 4: Commit**

```bash
git add assets/js/toggle.js _layouts/default.html
git commit -m "feat: add shared toggle script for two-pane embed pages"
```

---

### Task 5: Submit a Request page

**Files:**
- Create: `submit-a-request/index.md`
- Modify: `assets/css/style.css` (append toggle + embed styles)

**Step 1: Create `submit-a-request/index.md`**

Front matter holds the two embed URLs so they can be filled in later by
editing this file only — no code/JS change needed once the Forms exist.

```markdown
---
layout: content
title: Submit a Request
permalink: /submit-a-request/
bandwidth_form_url: ""
issue_form_url: ""
---

<div class="toggle-bar" data-toggle-group>
  <button type="button" data-toggle-btn data-target="pane-issue">Report an Issue</button>
  <button type="button" data-toggle-btn data-target="pane-bandwidth" class="active">Request Design Bandwidth</button>
</div>

<div id="pane-bandwidth" data-toggle-pane>
  <p>Requesting design time for a project? Not sure which track you're in?
  Check <a href="{{ '/workflows/engaging-with-design/' | relative_url }}">Find Your Track</a> first.</p>
  {% if page.bandwidth_form_url != "" %}
    <iframe src="{{ page.bandwidth_form_url }}" class="embed-frame" title="Request Design Bandwidth form" loading="lazy"></iframe>
  {% else %}
    <p class="embed-pending">This form isn't configured yet — see
    <code>submit-a-request/index.md</code> front matter.</p>
  {% endif %}
</div>

<div id="pane-issue" data-toggle-pane hidden>
  <p>Seen something confusing or broken in the product? Use this form —
  anyone in the company can report an issue, not just PMs/builders.</p>
  {% if page.issue_form_url != "" %}
    <iframe src="{{ page.issue_form_url }}" class="embed-frame" title="Report a Usability/UI Issue form" loading="lazy"></iframe>
  {% else %}
    <p class="embed-pending">This form isn't configured yet — see
    <code>submit-a-request/index.md</code> front matter.</p>
  {% endif %}
</div>
```

**Step 2: Append to `assets/css/style.css`**

```css
.toggle-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.toggle-bar button {
  padding: 0.6rem 1.1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font: inherit;
  color: #444;
}

.toggle-bar button.active {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

.embed-frame {
  width: 100%;
  height: 900px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.embed-pending {
  color: #888;
  font-style: italic;
}
```

**Step 3: Verify**

```bash
bundle exec jekyll build
```

Expected: exits 0. Then serve and check manually:

```bash
bundle exec jekyll serve
```

Visit `http://localhost:4000/design-hub/submit-a-request/` — confirm both
toggle buttons switch which pane is visible, and each pane shows the
"isn't configured yet" message (expected, since the URLs are still blank).

**Step 4: Commit**

```bash
git add submit-a-request/ assets/css/style.css
git commit -m "feat: add Submit a Request page with issue/bandwidth toggle"
```

---

### Task 6: Check Status page

**Files:**
- Create: `check-status/index.md`

Same pattern as Task 5, reusing the same CSS classes (no new CSS needed).

**Step 1: Create `check-status/index.md`**

```markdown
---
layout: content
title: Check Status
permalink: /check-status/
bandwidth_sheet_url: ""
issue_sheet_url: ""
---

<p class="embed-pending">Note: these sheets are visible to everyone who
loads this page — there's no per-person filtering. That's intentional
(whole-team transparency on the request queue), not a bug.</p>

<div class="toggle-bar" data-toggle-group>
  <button type="button" data-toggle-btn data-target="pane-bandwidth-status" class="active">Design Bandwidth Queue</button>
  <button type="button" data-toggle-btn data-target="pane-issue-status">Issue Log</button>
</div>

<div id="pane-bandwidth-status" data-toggle-pane>
  {% if page.bandwidth_sheet_url != "" %}
    <iframe src="{{ page.bandwidth_sheet_url }}" class="embed-frame" title="Design Bandwidth queue" loading="lazy"></iframe>
  {% else %}
    <p class="embed-pending">Not configured yet — requires the Sheet to be
    published via File → Publish to web first (confirm this isn't disabled
    for our Workspace before doing this). See
    <code>check-status/index.md</code> front matter.</p>
  {% endif %}
</div>

<div id="pane-issue-status" data-toggle-pane hidden>
  {% if page.issue_sheet_url != "" %}
    <iframe src="{{ page.issue_sheet_url }}" class="embed-frame" title="Issue log" loading="lazy"></iframe>
  {% else %}
    <p class="embed-pending">Not configured yet — requires the Sheet to be
    published via File → Publish to web first (confirm this isn't disabled
    for our Workspace before doing this). See
    <code>check-status/index.md</code> front matter.</p>
  {% endif %}
</div>
```

**Step 2: Verify**

```bash
bundle exec jekyll build
bundle exec jekyll serve
```

Visit `http://localhost:4000/design-hub/check-status/` — confirm the
toggle works and both panes show the "not configured yet" message.

**Step 3: Commit**

```bash
git add check-status/
git commit -m "feat: add Check Status page with bandwidth/issue toggle"
```

---

### Task 7: Update nav and homepage

**Files:**
- Modify: `_layouts/default.html:12-15`
- Modify: `index.md`
- Modify: `assets/css/style.css` (append category badge style)

**Step 1: Replace the `<nav>` block in `_layouts/default.html`**

```html
    <nav>
      <a href="{{ '/' | relative_url }}">Announcements</a>
      <a href="{{ '/workflows/engaging-with-design/' | relative_url }}">Engage with Design</a>
      <a href="{{ '/design-system/' | relative_url }}">Design System</a>
      <a href="{{ '/resources/' | relative_url }}">Resources</a>
      <a href="{{ '/submit-a-request/' | relative_url }}">Submit a Request</a>
      <a href="{{ '/check-status/' | relative_url }}">Check Status</a>
    </nav>
```

**Step 2: Replace the content of `index.md`**

```markdown
---
layout: default
title: Announcements
---

<h1>Design Team Announcements</h1>

<p class="callout">New here? Start with
<a href="{{ '/workflows/engaging-with-design/' | relative_url }}">Engage with Design</a>
to find out how to work with the design team on your project.</p>

{% assign announcements = site.announcements | sort: "date" | reverse %}
{% if announcements.size == 0 %}
  <p>No announcements yet.</p>
{% endif %}

{% for post in announcements %}
<article>
  <h2>{{ post.title }}</h2>
  <p class="meta">
    {{ post.date | date: "%B %-d, %Y" }}
    {% if post.category %}<span class="badge">{{ post.category }}</span>{% endif %}
  </p>
  {{ post.content }}
</article>
{% endfor %}
```

**Step 3: Append to `assets/css/style.css`**

```css
.callout {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
}

.badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: #e5e5e5;
  color: #444;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
```

**Step 4: Verify**

```bash
bundle exec jekyll build
bundle exec jekyll serve
```

Visit `http://localhost:4000/design-hub/` — confirm all five nav links
work and the callout renders above the announcements list.

**Step 5: Commit**

```bash
git add _layouts/default.html index.md assets/css/style.css
git commit -m "feat: update nav for new sections, add homepage callout and announcement category badge"
```

---

### Task 8: Document the new conventions in README

**Files:**
- Modify: `README.md`

**Step 1: Append a new section to `README.md`** (after the existing "Adding a workflow page" section)

```markdown
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
```

**Step 2: Verify**

```bash
grep -c "Tagging an announcement" README.md
```

Expected: `1`.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document design-system category tag and embed configuration"
```

---

### Task 9: Full-site verification pass

**Files:** none (verification only)

**Step 1: Full build**

```bash
bundle exec jekyll build
```

Expected: exits 0, no warnings about missing layouts or broken Liquid tags.

**Step 2: Manual link check**

```bash
bundle exec jekyll serve
```

Visit every nav link from the homepage, then click through:
`/workflows/engaging-with-design/` → each of the three track pages and
back → `/design-system/` → both sub-pages and back → `/resources/` →
`/submit-a-request/` (toggle both panes) → `/check-status/` (toggle both
panes).

Expected: no 404s, no broken internal links, both toggle pages switch
panes correctly.

**Step 3: No commit for this task** — it's verification only. If anything
is broken, fix it in the relevant task's files and amend that task's
commit before moving on, rather than adding a separate "fix" commit here.
