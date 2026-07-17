---
layout: default
title: Announcements
---

<h1>Design Team Announcements</h1>

{% assign announcements = site.announcements | sort: "date" | reverse %}
{% if announcements.size == 0 %}
  <p>No announcements yet.</p>
{% endif %}

{% for post in announcements %}
<article>
  <h2>{{ post.title }}</h2>
  <p class="meta">{{ post.date | date: "%B %-d, %Y" }}</p>
  {{ post.content }}
</article>
{% endfor %}
