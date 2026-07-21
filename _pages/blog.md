---
layout: default
permalink: /blog/
title: blog
nav: true
nav_order: 2
home_section: blog
pagination:
  enabled: false
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
---

<div class="post">
  {% include blog_listing.liquid %}
</div>
