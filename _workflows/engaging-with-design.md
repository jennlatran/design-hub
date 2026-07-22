---
title: Working with Design - Find Your Track
---

PMs and builders engage with the design team in a few different ways
depending on where a feature is in its lifecycle. Answer the questions
below to find out which track applies to your project, or skim the example
scenarios in each section if that's faster.

## Which track am I in?

1. **Has design been involved since the start of this feature/project?**
   - Yes: you're in [Full Design Partnership](#full-design-partnership).
   - No: continue to question 2.
2. **Do you already have a working prototype and PRD (or equivalent), and
   want to collaborate with design to turn it into final designs?**
   - Yes: you're in [Design Collaboration & Refinement](#design-collaboration--refinement).
   - No: continue to question 3.
3. **Is this feature already built, and you just need a check before it
   ships?**
   - Yes: you're in [UI Compliance Spot Check](#ui-compliance-spot-check).
   - No: none of these quite fit — reach out in the **UIUX Designers**
     Google Chat channel and we'll help sort out the right path.

## Full Design Partnership
{: #full-design-partnership }

**What it is:** Design is involved from the beginning and leads most or all
of the design work for the feature.

**Timeline:** Full design cycle — typically 2–4 weeks depending on scope.

**Example scenarios:**
- A new module in the service scheduler
- A redesign of the payments flow

## Design Collaboration & Refinement
{: #design-collaboration--refinement }

**What it is:** The PM/builder brings a working prototype and a PRD (or
equivalent), and design collaborates to turn it into final, polished
designs — the prototype is a starting point/inspiration, not the final
deliverable.

**Timeline:** ~1 week.

## UI Compliance Spot Check
{: #ui-compliance-spot-check }

**What it is:** Design is not involved until the feature is built. Design
does a fast, focused check to confirm the interface uses the design system
correctly before it ships — this is **not** a full design review, and
design does not sign off on the overall UX.

**Timeline:** 1–2 business days.

**What's checked:**
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

**Example scenarios:**
- A small feature built independently that needs a final check before merging
