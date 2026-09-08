---
layout: default
title: Workflows
permalink: /workflows/
---

<h1>PM &amp; Builder Workflows</h1>
<p>How PMs and other builders engage with the design team. Start with
<a href="{{ '/workflows/engaging-with-design/' | relative_url }}">Find Your Track</a>
to figure out which of these applies to you.</p>

{% assign workflows = site.workflows | where_exp: "p", "p.url != '/workflows/engaging-with-design/'" | sort: "title" %}
{% if workflows.size == 0 %}
  <p>No workflow pages yet.</p>
{% endif %}

<ul class="list">
{% for page in workflows %}
  <li><a href="{{ page.url | relative_url }}">{{ page.title }}</a></li>
{% endfor %}
</ul>
