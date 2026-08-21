---
layout: distill
title: ToF-SIMS Flake Pipeline
description: Human-in-the-loop ion mapping and SAM-assisted flake segmentation
img: assets/img/projects_tofsims/basic-sam-candidates.png
github: https://github.com/ZuomingWang/tofsims-flake-pipeline
importance: 1
category: work
published: true
related_publications: false
date: 2026-07-30 09:00:00-0500
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Northwestern University
toc:
  - name: See the Chemistry
  - name: Keep Judgment Visible
  - name: Basic or Refined
  - name: Export a Defensible Result
_styles: |
  d-title h1 {
    overflow-wrap: break-word;
    word-break: normal;
  }

  d-title p {
    font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    font-weight: 400 !important;
  }

  d-byline .byline p,
  d-byline .byline p.author,
  d-byline .byline p.affiliation,
  d-byline .byline p a,
  d-byline .byline p span {
    font-size: 0.78rem !important;
    font-weight: 400 !important;
    line-height: 1.45 !important;
  }

  d-article h2 {
    margin-top: 2.5rem;
    padding-top: 0.35rem;
  }

  d-article p,
  d-article li {
    line-height: 1.72;
  }

  d-article figure,
  d-article picture,
  d-article img {
    max-width: 100%;
  }

  .tofsims-lede {
    margin: 0.25rem 0 1.3rem;
    font-size: 1.12rem;
    line-height: 1.8;
    color: var(--global-text-color);
  }

  .tofsims-glance {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin: 1.5rem 0 2rem;
    padding: 1.05rem 0;
    border-top: 1px solid var(--global-divider-color);
    border-bottom: 1px solid var(--global-divider-color);
  }

  .tofsims-glance span {
    display: block;
    margin-bottom: 0.3rem;
    color: var(--global-text-color-light);
    font-size: 0.76rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .tofsims-glance p {
    margin: 0;
    line-height: 1.5;
  }

  .tofsims-media {
    grid-column: text;
    width: 100%;
    margin: 1.35rem 0 1.9rem;
  }

  .tofsims-media figure,
  .tofsims-media picture {
    display: block;
    width: 100%;
    margin: 0;
  }

  .tofsims-media img {
    display: block;
    width: 100% !important;
    height: auto !important;
    object-fit: contain;
    background: #fff;
  }

  .tofsims-media figcaption.caption {
    margin-top: 0.65rem;
    color: var(--global-text-color-light);
    font-size: 0.9rem;
    line-height: 1.45;
    text-align: left;
  }

  .tofsims-media-narrow {
    max-width: 560px;
    margin-right: auto;
    margin-left: auto;
  }

  .tofsims-note {
    margin: 1.45rem 0 1.8rem;
    padding: 0.15rem 0 0.15rem 1rem;
    border-left: 3px solid var(--global-theme-color);
    font-size: 1.02rem;
  }

  .tofsims-actions {
    margin-top: 1.5rem;
  }

  @media (min-width: 1025px) {
    d-article {
      contain: none !important;
      overflow-x: visible !important;
    }

    d-article d-contents {
      position: sticky !important;
      top: 5.25rem !important;
      grid-row: 1 / span 1000 !important;
      align-self: start !important;
      height: max-content;
      max-height: calc(100vh - 6rem);
      overflow-y: auto;
      z-index: 2;
    }
  }

  @media (max-width: 575.98px) {
    d-title h1 {
      font-size: 2rem;
    }

    .tofsims-glance {
      grid-template-columns: 1fr;
    }
  }
---

<p class="tofsims-lede">
Turn raw ToF-SIMS depth data into flake-resolved chemical maps—without hiding the decisions that make the result trustworthy.
</p>

<div class="tofsims-glance">
  <div>
    <span>Input</span>
    <p>ImzML/ibd spectra, optional vendor metadata, and target ions.</p>
  </div>
  <div>
    <span>Control</span>
    <p>Confirm m/z windows, choose the projection, and guide segmentation.</p>
  </div>
  <div>
    <span>Output</span>
    <p>Raw and masked Float32 TIFF stacks plus an analysis record.</p>
  </div>
</div>

## See the Chemistry

A ToF-SIMS experiment can contain millions of spectra across many ion channels and depth frames. The pipeline streams the full dataset, plots the summed spectrum around each target, and asks the researcher to confirm the integration window before any ion image is built.

<div class="tofsims-media">
  {% include figure.liquid loading="eager" path="assets/img/projects_tofsims/basic-mz-selection.png" avoid_scaling=true alt="Two summed ToF-SIMS spectra with confirmed integration windows around target mass-to-charge ratios" title="Confirmed m/z windows" caption="The target, confirmed center, and integration bounds remain visible. This archived depth-profile example streams 778,050 spectra." class="img-fluid rounded z-depth-1" %}
</div>

## Keep Judgment Visible

Segmentation is assisted, not outsourced. The researcher chooses a chemically meaningful image, places foreground and background points, compares SAM mask candidates, and selects the result that follows the flake.

<div class="tofsims-media tofsims-media-narrow">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tofsims/basic-prompt-points.png" avoid_scaling=true alt="ToF-SIMS ion image with green foreground points and red background points around a flake" title="Researcher-guided prompts" caption="Foreground and background points make the segmentation intent explicit." class="img-fluid rounded z-depth-1" %}
</div>

<div class="tofsims-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tofsims/basic-sam-candidates.png" avoid_scaling=true alt="Three SAM candidate masks over a ToF-SIMS ion image with prompt points" title="Inspectable mask candidates" caption="Candidate masks are presented separately so the researcher can compare boundaries before choosing." class="img-fluid rounded z-depth-1" %}
</div>

<div class="tofsims-note">
SAM proposes. The researcher decides.
</div>

## Basic or Refined

The **Basic** notebook is the shortest complete route: use the first target ion summed over all depth frames, segment, and export. The **Refined mask** notebook adds control when one fixed projection does not isolate the flake: select an ion or total-ion signal, restrict the Z range, or build an RGB composite.

<div class="tofsims-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tofsims/refined-mz-selection.png" avoid_scaling=true alt="Summed ToF-SIMS spectra for molybdenum and TBA positive-ion signals with confirmed integration windows" title="Refined workflow, same traceable selection" caption="More control changes the mask input—not the requirement to inspect and confirm the chemistry." class="img-fluid rounded z-depth-1" %}
</div>

<div class="tofsims-media tofsims-media-narrow">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tofsims/refined-projection.png" avoid_scaling=true alt="Selected ToF-SIMS projection showing multiple flakes across the field of view" title="Selected projection" caption="The refined workflow lets the researcher choose the projection sent to SAM." class="img-fluid rounded z-depth-1" %}
</div>

<div class="tofsims-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tofsims/refined-sam-candidates.png" avoid_scaling=true alt="Three SAM candidate masks for multiple flakes in a refined ToF-SIMS projection" title="Multi-flake candidates" caption="Multiple-flake candidates remain readable at the full text-column width." class="img-fluid rounded z-depth-1" %}
</div>

## Export a Defensible Result

The pipeline exports the raw ion slices, selected 2D mask, masked TIFF stack, and `analysis_settings.json`. The settings record connects the result back to the chosen dataset, ion windows, projection, depth range, prompts, and mask.

The intensity remains integrated ImzML signal in arbitrary units unless the source declares otherwise. The selected 2D mask is broadcast through the Z stack, so lateral drift and depth-dependent morphology still require scientific judgment.

<p class="tofsims-actions">
  <a href="https://github.com/ZuomingWang/tofsims-flake-pipeline"><i class="fa-brands fa-github"></i> View the notebooks and source on GitHub</a>
</p>
