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
