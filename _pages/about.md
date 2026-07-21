---
layout: about
title: about
permalink: /
subtitle: zuoming(at)u.northwestern.edu
one_page_sections: true
display_categories: [work, fun]
horizontal: false

profile:
  align: right
  image:
  wulff_avatar: true
  image_circular: false # crops the image to make it circular
  more_info: false

selected_papers: false # the full publications list appears between about and blog
social: true # includes social icons at the bottom of the page

announcements:
  enabled: true # includes a list of news items
  scrollable: true # adds a vertical scroll bar if there are more than 3 news items
  limit: 5 # leave blank to include all the news in the `_news` folder

latest_posts:
  enabled: false
  scrollable: true # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 3 # leave blank to include all the blog posts

after_selected_papers: |
  <p>(listed in increasing order of number of characters in each bullet)</p>
  <ul>
    <li>biking</li>
    <li>sailing</li>
    <li>cooking</li>
    <li>making yogurt</li>
    <li>walking fast so that my legs heat up</li>
    <li>reading books - mostly non-fiction these days</li>
  </ul>
---

<style>
  .degree-preview {
    position: relative;
    display: inline-block;
  }

  .degree-preview-card {
    position: absolute;
    top: calc(100% + 0.7rem);
    left: 0;
    z-index: 1000;
    width: min(520px, calc(100vw - 2rem));
    padding: 0.4rem;
    visibility: hidden;
    background: var(--global-card-bg-color);
    border: 1px solid var(--global-divider-color);
    border-radius: 0.35rem;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    opacity: 0;
    pointer-events: none;
    transform: translateY(-0.25rem);
    transition:
      opacity 150ms ease,
      transform 150ms ease,
      visibility 150ms ease;
  }

  .degree-preview-card img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 0.2rem;
  }

  .degree-preview:hover .degree-preview-card,
  .degree-preview:focus-within .degree-preview-card {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }
</style>

I received my <span class="degree-preview"><a href="{{ '/assets/pdf/Technion_BSc_scan.pdf' | relative_url }}" target="_blank" rel="noopener noreferrer">Bachelor of Science</a><span class="degree-preview-card" aria-hidden="true"><img src="{{ '/assets/img/education/technion-bsc-thumbnail.png' | relative_url }}" alt=""></span></span> in Materials Science and Engineering from both [Guangdong Technion - Israel Institite of Technology (China)](https://gtiit.technion.ac.il) and [Technion - Israel Institute of Technology (Israel)](https://www.technion.ac.il/en/). I had the good fortune of doing research in hydrogen retention, spintronics, molecular electronics and hydrogels.
