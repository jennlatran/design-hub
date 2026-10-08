---
layout: default
title: Announcements
---

<h1>Design Team Announcements</h1>

<p class="callout"><strong>This site is archived.</strong> It has been replaced by
<a href="https://github.com/mykaarma/design-resources">mykaarma/design-resources</a> — see
<a href="https://github.com/mykaarma/design-resources/blob/main/PROCESS.md">PROCESS.md</a>
there for the current design engagement process.</p>

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
