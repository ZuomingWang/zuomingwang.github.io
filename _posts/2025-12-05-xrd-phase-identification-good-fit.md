---
layout: distill
title: Why a Good XRD Fit Is Not a Phase Identification
date: 2025-05-05 09:00:00-0500
description: A short note on the A-Lab debate, Leeman et al., and evidence standards for automated diffraction analysis
tags: materials-science xrd automation
categories: materials-science
featured: true
site_owned: true
giscus_comments: false
related_posts: false
bibliography: xrd-phase-identification-good-fit.bib
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Northwestern University
toc:
  - name: The Evidence Problem
  - name: What Automated XRD Needs To Prove
  - name: The Companion Notebook
  - name: My Takeaway
_styles: |
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

    d-article d-contents nav {
      position: sticky !important;
      top: 5.25rem !important;
    }
  }

  .xrd-blog-figure {
    grid-column: text;
    margin-top: 1.2rem;
    margin-bottom: 1.7rem;
  }

  .xrd-blog-figure figure {
    max-width: 520px;
    margin: 0 auto;
  }

  .xrd-blog-figure img {
    width: 100%;
    height: auto !important;
    object-fit: contain;
  }

  .xrd-blog-figure figcaption.caption {
    margin-top: 0.65rem;
    color: var(--global-text-color-light);
    font-size: 0.92rem;
    line-height: 1.45;
    text-align: center;
  }
---

In 2023, the A-Lab paper presented an autonomous workflow for inorganic powder synthesis, combining computation, literature data, machine learning, active learning, robotics, and automated characterization <d-cite key="szymanski2023autonomous"></d-cite>. It reported 36 synthesized compounds from 57 targets over 17 days of operation. That is an important direction. If autonomous labs are going to matter, they need to close the loop from prediction to synthesis to characterization without waiting for a human to inspect every sample.

The controversy that followed was not only about one set of material claims. A Nature news article framed the dispute around whether an AI-controlled laboratory had actually made new substances <d-cite key="peplow2023robot"></d-cite>. Leeman _et al._ then published a detailed PRX Energy perspective arguing that the reported phase assignments did not provide sufficient evidence for new material discovery <d-cite key="leeman2024challenges"></d-cite>.

For me, the useful lesson is narrower and more technical: **a fitted powder XRD pattern is not the same thing as a phase identification**.

<div class="row justify-content-center xrd-blog-figure">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="references/A-lab_Leeman.png" avoid_scaling=true alt="Annotated comparison of the A-Lab Mg3MnNi3O8 XRD assignment and the Leeman reinterpretation with residuals and indexing" title="A-Lab and Leeman residual comparison" caption="Annotated comparison of the A-Lab Mg3MnNi3O8 assignment and the Leeman et al. reinterpretation. The central issue is whether the assigned peaks, indexing ticks, and residuals support the claimed phase, not only whether the calculated curve follows the observed pattern." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The figure captures the main evidence problem. The A-Lab assignment highlights peaks associated with the proposed `Mg3MnNi3O8` phase, while the Leeman et al. interpretation points to indexing against known phases and structured residuals. If the residuals still contain systematic peak-like features, then the fitted model may be absorbing disagreement rather than identifying the phase.

I made a small companion project, [XRD Phase Identification](/projects/xrd_phase_identification/), to turn this issue into a reproducible toy example. The notebook compares an ordered-phase claim, a known disordered phase, and a known-phase mixture against the same synthetic diffraction pattern.

## The Evidence Problem

Powder XRD is often treated like a matching task. A structure is proposed, expected peak positions are calculated, scale and background are fitted, and the result is summarized with a goodness-of-fit number. That workflow is useful, but it can become misleading when the question changes from "can this model fit?" to "did we discover a new phase?"

Those are different questions.

A model can improve a global fit while still missing the peak that actually matters for the claim. A weak superlattice reflection can carry the evidence for cation ordering. A small impurity peak might be scientifically secondary, while an unexplained peak at a diagnostic position might mean that the proposed model is incomplete. Collapsing all of that into one error metric loses the chemistry.

This is why the Leeman _et al._ critique matters. Their argument is not that automation is useless. It is that automated interpretation has to handle the same burden of proof that a careful experimentalist would apply: compare against known phases, account for disorder, inspect residuals, and treat mixtures as serious alternatives.

## What Automated XRD Needs To Prove

For a new-phase claim, I would want an automated workflow to answer at least four questions.

First, what are the plausible known alternatives? A proposed structure should not be fitted in isolation. If a mixture of known phases explains the pattern better, the new-phase claim becomes much weaker.

Second, where are the diagnostic peaks? A global fit statistic is not enough. The workflow should identify which reflections distinguish the proposed phase from known alternatives, then evaluate those reflections directly.

Third, are the residuals structured? Random noise and systematic disagreement mean different things. A residual peak can be a hint that a minor phase, disorder, preferred orientation, peak shift, or wrong background model is being hidden by a superficially acceptable fit.

Fourth, how much model flexibility was used? Free Gaussian peaks can fit almost anything. They are helpful as diagnostics, but they do not identify a crystal structure. A constrained phase model has less freedom, but it carries more physical meaning.

## The Companion Notebook

The notebook uses a synthetic XRD pattern because the goal is not to reanalyze the A-Lab data directly. The goal is to isolate the logic of phase identification discussed in the A-Lab paper and the later critique <d-cite key="szymanski2023autonomous,leeman2024challenges"></d-cite>.

It compares four models:

| Model   | Interpretation                  |
| :------ | :------------------------------ |
| Model 0 | Free Gaussian diagnostic fit    |
| Model 1 | Proposed ordered phase          |
| Model 2 | Known disordered phase          |
| Model 3 | Known disordered phase plus NiO |

The flexible Gaussian model wins numerically, as expected, but it is not a phase assignment. Among the physically constrained models, the known-phase mixture is stronger than the ordered-phase explanation. Even then, the residuals suggest that the candidate set may still be incomplete.

That last point is the most important one. The best model in a limited set is not automatically the correct model. It is only the best explanation that has been tested so far.

## My Takeaway

Autonomous labs will need automated diffraction analysis, but the hard part is not drawing a fitted curve through an XRD pattern. The hard part is encoding scientific skepticism into the workflow.

For materials discovery, the standard should not be "the proposed phase can be fitted." It should be closer to:

- the proposed phase fits diagnostic peaks better than known alternatives
- plausible mixtures and disordered structures have been tested
- residuals have been inspected rather than averaged away
- the model's extra flexibility is justified by evidence, not convenience

That is a higher bar, but it is the bar that makes autonomous synthesis scientifically useful rather than just fast.

**Related project**: [XRD Phase Identification](/projects/xrd_phase_identification/)  
**Source notebook**: [`references/XRD_Phase_Identification_Methods_and_Pitfalls.ipynb`](/references/XRD_Phase_Identification_Methods_and_Pitfalls.ipynb.html)
