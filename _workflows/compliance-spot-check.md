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
