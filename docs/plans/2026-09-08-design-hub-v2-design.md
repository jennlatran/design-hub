# Design Hub v2 — Design

## Why

Design Hub today (announcements + a single "which track am I in" decision-tree
page) solves discovery for engagement tracks, but three real gaps remain:

1. No self-serve, actionable checklist for the Compliance Spot Check track —
   builders can't check their own work before looping in design.
2. No single place to submit a request or see its status — engagement asks
   happen informally, and there's no way to flag a usability/UI issue at all.
3. Design-system access, contribution, and other resources (templates, AI
   tooling) are scattered or undocumented.

This doc covers structure and mechanism only. Actual page content (the
compliance checklist items, common-failure examples, resource links, the
design-system change-request process) is scoped as follow-up work — see
Explicitly Deferred below.

## Constraints carried over from v1

- Static site (Jekyll + GitHub Pages), no backend, no database, no auth.
  Confirmed still holds even with status tracking in scope — see Mechanism.
- Repo stays on the personal GitHub account (`jennlatran/design-hub`) for
  now. Revisit moving to the myKaarma org once usage is broad enough that
  continuity/access control genuinely matters — not blocking today.

## Mechanism: submission + tracking without a backend

Two Google Forms, each backed by its own Google Sheet:

- **Request Design Bandwidth** — feeds an engagement queue (Compliance,
  Collaboration & Refinement, Full Partnership all submit through this one
  form, selecting their track).
- **Report a Usability/UI Issue** — feeds a separate issue log. Open to
  anyone in the company, not just PMs/builders.

These are kept as two separate Forms/Sheets rather than one Form with
branching logic, because Google Forms branching still writes every response
into one Sheet — splitting issue reports back out from engagement requests
afterward would need spreadsheet formula work that's more fragile than just
having two of each.

Both are embedded via `<iframe>`, not linked out to, so submitting and
checking status both happen inline on Design Hub:

- Forms embed natively via each Form's own "Embed HTML" option, respecting
  whatever sharing restriction the Form already has (e.g. mykaarma.com-only
  login carries into the iframe).
- Sheets require **File → Publish to web** to embed as a read-only table.
  This is a different sharing mechanism than normal mykaarma.com-restricted
  sharing — it produces an unauthenticated (though unguessable) public URL.
  **Action item before building the Check Status page:** confirm with
  IT/Workspace admin that Publish to web isn't disabled org-wide.
- No per-viewer filtering — the whole sheet is visible to everyone who
  loads the page. Confirmed acceptable: whole-team transparency on the
  request queue is a feature here, not a leak.

## Site structure

| Nav item | Content |
|---|---|
| **Home** | Existing announcements feed. Also carries design-system-update posts going forward — same collection, distinguished by tag/category, not a new mechanism. A "New here? Start with Engage with Design" callout at the top. |
| **Engage with Design** | The existing decision-tree page stays as a short index/router. Each of the three tracks gets its own full page (was previously one page): Compliance Spot Check, Collaboration & Refinement, Full Partnership. The compliance checklist itself lives on the Compliance Spot Check page — this is the canonical location. |
| **Design System** | Links to the Figma library (canonical source of truth — not duplicated here). Links to the compliance checklist (Engage with Design → Compliance Spot Check) rather than repeating it. New: a "common compliance failures" page with real before/after examples. New: a design-system change-request page (process TBD — see Explicitly Deferred). |
| **Resources** | Index of scattered templates/docs (user interview templates, etc.). Callout on the `claude-sutras` repo's `ui-tokens`/`ui-components`/etc. skills — relevant to anyone using Claude Code, Codex, or similar AI tooling, since those skills already keep an AI assistant's code aligned to myKaarma's design tokens. |
| **Submit a Request** | One page. A toggle at the top ("Report an Issue" / "Request Design Bandwidth") swaps which of the two Forms is embedded. |
| **Check Status** | Same toggle pattern, showing the corresponding published-to-web Sheet for whichever queue is selected. |

## Content plan for the two forms

**Request Design Bandwidth:**
- Name / team
- Project or feature name
- Which track: Full Partnership / Collaboration & Refinement / Compliance
  Spot Check / "Not sure" (links back to the Engage with Design decision
  tree)
- Link to relevant materials (PRD, prototype, staging build — whichever is
  relevant to the chosen track)
- Target timeline or deployment date
- Brief description of what's needed

**Report a Usability/UI Issue** (open to anyone in the company — fields are
deliberately opinionated toward actionable over easy-to-fill, since wider
audience means higher and less predictable volume):
- Name / team or role
- Where you saw it (page/feature/screen)
- What's wrong (free text)
- Severity: blocks task completion / confusing but workable / minor or
  cosmetic
- Steps to reproduce (optional)
- Screenshot or recording link (optional)

## Explicitly deferred (structure exists, content/process does not yet)

- **IT/Workspace check**: confirm Publish to web is allowed before building
  Check Status embeds. Blocks that one page, not the rest of the site.
- **Design-system change-request process**: who reviews, what SLA, what
  intake looks like. Scoped as its own follow-up brainstorm — same way the
  three engagement tracks got their own dedicated design pass rather than
  being invented inline here.
- **Compliance checklist content**: the actual items (CSS token usage, UI
  consistency, usability happy-path check, etc.) — content-writing task
  once the page exists.
- **Common compliance failures examples**: needs real before/after
  examples gathered over time; page can ship with a couple of seed
  examples or be initially empty.
- **Resources page links**: gathering the actual scattered template/doc
  links.
- **Onboarding callout copy**: the actual "start here" text.
- **Pre-existing open items carried over from v1**, still unresolved:
  Collaboration & Refinement has no filled-in example scenario; Full
  Partnership and Collaboration & Refinement are both missing their
  "what design delivers" deliverables bullets.
- **Repo ownership** (personal vs. myKaarma org): revisit once usage
  broadens, not blocking now.

## Explicitly rejected

- **Embedding via a link-out instead of an iframe** — rejected because the
  whole point raised was avoiding click-out friction for something checked
  often.
- **One Google Form with branching logic instead of two** — rejected due
  to the Sheet-splitting fragility described in Mechanism above.
- **A real backend/database for tracking** — rejected; the existing Sheet
  the team already uses for intake covers this without reintroducing the
  complexity that was deliberately removed from Design Hub's original
  Next.js/Postgres scope.
