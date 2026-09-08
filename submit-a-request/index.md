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
