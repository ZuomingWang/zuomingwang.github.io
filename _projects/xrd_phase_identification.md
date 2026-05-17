---
layout: distill
title: XRD Phase Identification
description: What can go wrong when diffraction fits are treated as phase proof
img: assets/img/projects_xrd_phase_identification/A-lab_Leeman.png
importance: 3
category: fun
bibliography: xrd-phase-identification-good-fit.bib
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Northwestern University
toc:
  - name: Project Goal
  - name: Why This Matters
  - name: Notebook Design
  - name: Method
  - name: Results
  - name: What The Case Study Shows
  - name: Methodological Problems
  - name: Takeaways
  - name: Implementation Notes
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

  d-article figure,
  d-article picture,
  d-article img {
    max-width: 100%;
  }

  d-article h2 {
    margin-top: 2.4rem;
    padding-top: 0.4rem;
  }

  d-article p,
  d-article li {
    line-height: 1.75;
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

  .xrd-lede {
    margin-top: 0.35rem;
    margin-bottom: 1.15rem;
    font-size: 1.08rem;
    line-height: 1.8;
    color: var(--global-text-color);
  }

  .xrd-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.15rem;
    margin: 1.2rem 0 1.8rem;
    padding: 0.85rem 0;
    border-top: 1px solid var(--global-divider-color);
    border-bottom: 1px solid var(--global-divider-color);
    font-size: 0.94rem;
  }

  .xrd-meta span {
    color: var(--global-text-color-light);
  }

  .xrd-meta strong {
    color: var(--global-text-color);
    font-weight: 600;
  }

  .xrd-glance {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1rem;
    margin: 1.5rem 0 2.1rem;
    padding: 1.05rem 0;
    border-top: 1px solid var(--global-divider-color);
    border-bottom: 1px solid var(--global-divider-color);
  }

  .xrd-glance span {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--global-text-color-light);
    font-size: 0.78rem;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .xrd-glance p {
    margin: 0;
    line-height: 1.55;
  }

  .xrd-note {
    margin: 1.4rem 0 1.8rem;
    padding: 0.15rem 0 0.15rem 1rem;
    border-left: 3px solid var(--global-theme-color);
    color: var(--global-text-color);
  }

  .xrd-media {
    grid-column: page;
    margin-top: 1.2rem;
    margin-bottom: 1.7rem;
  }

  .xrd-media figure,
  .xrd-media picture {
    display: block;
    margin: 0;
  }

  .xrd-media img {
    width: 100%;
    height: auto !important;
    object-fit: contain;
    background-color: var(--global-card-bg-color);
  }

  .xrd-media figcaption.caption {
    margin-top: 0.65rem;
    color: var(--global-text-color-light);
    font-size: 0.92rem;
    line-height: 1.45;
    text-align: center;
  }

  .xrd-media-raw {
    grid-column: text;
  }

  .xrd-media-raw figure {
    max-width: 620px;
    margin: 0 auto;
  }

  .xrd-media-claim {
    grid-column: text;
  }

  .xrd-media-claim figure {
    max-width: 520px;
    margin: 0 auto;
  }

  .xrd-media-results {
    grid-column: text;
    display: block;
  }

  .xrd-result-figure {
    margin: 1.45rem auto 2.2rem;
  }

  .xrd-result-figure figure {
    margin: 0 auto;
  }

  d-article table {
    margin: 1.25rem 0 1.75rem;
    font-size: 0.94rem;
  }

  d-article table th {
    white-space: nowrap;
  }

  @media (max-width: 575.98px) {
    d-title h1 {
      font-size: 2rem;
    }

    .xrd-glance {
      grid-template-columns: 1fr;
    }
  }
---

<p class="xrd-lede">
This project turns the A-Lab XRD phase-identification debate into a small reproducible model-comparison exercise. The goal is to show why a plausible diffraction fit is not enough to establish a new crystalline phase.
</p>

<div class="xrd-meta">
  <span><strong>Author</strong>: Zuoming Wang</span>
  <span><strong>Related blog</strong>: <a href="/blog/2025/xrd-phase-identification-good-fit/">Why a Good XRD Fit Is Not a Phase Identification</a></span>
  <span><strong>Notebook</strong>: <a href="/references/XRD_Phase_Identification_Methods_and_Pitfalls.ipynb.html"><code>references/XRD_Phase_Identification_Methods_and_Pitfalls.ipynb</code></a></span>
</div>

<div class="xrd-glance">
  <div>
    <span>Question</span>
    <p>When does an XRD fit become evidence for phase identity, rather than just a curve-fitting result?</p>
  </div>
  <div>
    <span>Method</span>
    <p>Compare an ordered-phase claim against a known disordered phase and a known-phase mixture.</p>
  </div>
  <div>
    <span>Takeaway</span>
    <p>Residuals, diagnostic peaks, and plausible alternatives matter more than one global fit score.</p>
  </div>
</div>

## Project Goal

This project uses a synthetic X-ray diffraction case study to discuss the phase-identification method criticized by Leeman _et al._ in their 2024 PRX Energy paper <d-cite key="leeman2024challenges"></d-cite> on A-Lab material claims <d-cite key="szymanski2023autonomous"></d-cite>. The focus is not only whether a candidate structure can be fitted to an XRD pattern, but whether that fit is enough to support a phase-identification or discovery claim.

The notebook turns the paper's methodological critique into a small reproducible exercise. It asks a practical question: when an XRD pattern appears compatible with a proposed new ordered phase, what checks are needed before accepting that phase assignment?

<p class="xrd-note">
The synthetic data are intentionally simple. The point is not to reproduce the A-Lab datasets, but to make the evidence standard visible: phase identification should be framed as model comparison, not single-model confirmation.
</p>

## Why This Matters

Powder XRD phase identification is often treated as a pattern-matching problem: propose a structure, calculate or tabulate expected peaks, fit scale/background/peak-width parameters, then report a goodness-of-fit metric. The paper argues that this workflow can be misleading when it is used as positive evidence for a new material without testing alternatives.

<div class="row justify-content-center xrd-media xrd-media-claim">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="references/A-lab_Leeman.png" avoid_scaling=true alt="Annotated comparison of the A-Lab Mg3MnNi3O8 XRD assignment and the Leeman reinterpretation with residuals and indexing" title="A-Lab and Leeman residual comparison" caption="Annotated comparison of the reported Mg3MnNi3O8 XRD assignment. The upper panel shows the Leeman et al. reanalysis indexed to known Ni-Mn-O spinel and NiO phases, while the lower red trace shows the residuals from the A-Lab assignment. The yellow annotation highlights high-angle peaks where indexing provides an alternative explanation." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

This figure summarizes the methodological issue. In the A-Lab view, several peaks are treated as assignment peaks for the proposed `Mg3MnNi3O8` phase. Leeman _et al._ instead emphasize indexing against known phases and the residuals left after fitting. If residual features line up with unassigned or misassigned reflections, then the fit is telling us that the candidate model is incomplete. A visually convincing fit therefore remains only one piece of evidence; phase identification also needs local peak logic, competing phase models, and residual analysis.

The main risks are:

| Risk                                          | Why it matters                                                                                                         |
| :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Good global fit, wrong local evidence         | A low error metric can hide missing or misplaced peaks that are chemically decisive.                                   |
| Confirmation-only fitting                     | Fitting only the proposed phase can make a discovery claim look stronger than it is.                                   |
| Ignoring known alternatives                   | A mixture of known phases may explain the pattern better than a new compound.                                          |
| Over-weighting or under-weighting small peaks | Weak ordering peaks can decide a cation-ordering claim, while minor impurity peaks may mostly indicate sample quality. |
| Treating flexible fits as identification      | Free Gaussian peaks can fit the pattern well, but they do not identify a crystal phase.                                |

## Notebook Design

The notebook builds a synthetic powder-diffraction pattern with five Gaussian peaks, a weak linear background, and random noise. The peak positions are near 18, 30, 36, 37, and 43 degrees in 2theta.

<div class="row justify-content-center xrd-media xrd-media-raw">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_xrd_phase_identification/synthetic_pattern.png" alt="Raw synthetic XRD data with peaks between 10 and 50 degrees two theta" title="Raw synthetic XRD data" caption="Raw synthetic XRD data used as the fitting target." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The exercise compares four models:

| Model   | Hypothesis                                      | Purpose                                                |
| :------ | :---------------------------------------------- | :----------------------------------------------------- |
| Model 0 | Five unconstrained Gaussian peaks               | A flexible diagnostic baseline, not a phase assignment |
| Model 1 | Ordered `Mg3MnNi3O8` plus background            | The proposed new ordered-phase claim                   |
| Model 2 | Disordered `Ni-Mn-O` plus background            | A known single-phase alternative                       |
| Model 3 | Disordered `Ni-Mn-O` plus `NiO` plus background | A known mixture alternative                            |

The model set is intentionally simple, but it captures the logic of the paper's critique: phase identification requires comparing the proposed material against plausible known alternatives, not just checking whether the proposed model can be made to fit.

## Method

Each diffraction peak is represented as a Gaussian:

$$
I(x) = A \exp \left(-\frac{(x - \mu)^2}{2\sigma^2}\right)
$$

The constrained phase models use tabulated relative peak intensities. The fitting routine adjusts scale factors, a linear background, and a shared peak width. The notebook evaluates each fit with:

- residual plots, to locate structured disagreement
- RSS and $\chi^2$, to quantify total fit error
- reduced $\chi^2$, to account for parameter count
- AIC, to penalize extra flexibility
- an F-test, to ask whether adding `NiO` significantly improves the known-phase model

## Results

Model 0 fits the synthetic pattern best numerically, which is expected because it has unconstrained peak positions and amplitudes. That fit is useful as a diagnostic, but it does not answer the phase-identification question.

Among the phase-constrained models, Model 3 is the strongest explanation. It fits the data better than the ordered `Mg3MnNi3O8` model and better than the single disordered `Ni-Mn-O` model.

| Model   |     RSS | Chi-square | Reduced chi-square |       AIC |
| :------ | ------: | ---------: | -----------------: | --------: |
| Model 0 |  1.5259 |    3,814.8 |             1.9180 | -14,334.6 |
| Model 1 | 27.6514 |   69,128.5 |            34.6335 | -8,554.45 |
| Model 2 | 21.1439 |   52,859.7 |            26.4828 | -9,091.10 |
| Model 3 | 19.4478 |   48,619.4 |            24.3706 | -9,256.34 |

<div class="xrd-media xrd-media-results">
    <div class="xrd-result-figure">
        {% include figure.liquid loading="lazy" path="assets/img/projects_xrd_phase_identification/unconstrained_gaussian_fit.png" alt="Model 0 unconstrained Gaussian fit with residuals for the synthetic XRD pattern" title="Model 0 unconstrained Gaussian diagnostic fit" caption="Model 0: unconstrained Gaussian diagnostic fit. It fits well numerically, but it is not a phase assignment." class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="xrd-result-figure">
        {% include figure.liquid loading="lazy" path="assets/img/projects_xrd_phase_identification/mixture_model_fit.png" alt="Model 3 mixture model fit showing observed pattern, residuals, and phase tick marks" title="Model 3 mixture fit with phase indices" caption="Model 3: disordered Ni-Mn-O plus NiO mixture fit, with phase indices marked below the pattern." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The F-test comparing Model 2 and Model 3 gives:

| Comparison          | F statistic | p-value | Interpretation                                             |
| :------------------ | ----------: | ------: | :--------------------------------------------------------- |
| Model 2 vs. Model 3 |      173.99 | < 1e-10 | Adding `NiO` gives a statistically significant improvement |

This supports the known-mixture explanation over the single disordered phase.

## What The Case Study Shows

The ordered-phase claim fails for two reasons. First, it does not fit as well as the known-mixture alternative. Second, the ordering-related peak near 18 degrees is not consistent with what the ordered model expects. In a cation-ordering claim, that local peak evidence matters even if it contributes only part of the total $\chi^2$.

The known-mixture model is better, but it is still incomplete. It leaves structured residual intensity near 30 degrees. In the notebook, that residual is interpreted as possible evidence for another impurity phase, such as `NiMn2O4`. This is the key methodological point: the best model among a limited candidate set is not automatically the correct model.

## Methodological Problems

The paper's broader critique maps onto the notebook in several concrete ways:

| Problem                                 | How it appears in the exercise                                                                 |
| :-------------------------------------- | :--------------------------------------------------------------------------------------------- |
| Positive hypothesis testing             | Model 1 can be fitted, but fitting it alone would hide that known alternatives perform better. |
| Missing alternative phases              | Model 2 improves the physical story, and Model 3 improves it further by adding `NiO`.          |
| Local residuals matter                  | The 30 degree residual remains important even after Model 3 wins by global metrics.            |
| Small peaks can be decisive             | The 18 degree ordering peak is central to the ordered-phase claim.                             |
| Statistical fit is not scientific proof | Model 0 has excellent metrics but does not identify a phase.                                   |

## Takeaways

- XRD phase identification should be treated as model comparison, not single-model confirmation.
- A proposed new phase must be tested against chemically plausible known phases and mixtures.
- Global fit metrics should be read together with residual plots and phase-specific peak logic.
- The absence or mismatch of an ordering peak can be more important than its small numerical contribution.
- A statistically improved model can still be incomplete if structured residuals remain.

## Implementation Notes

The final notebook uses `numpy`, `scipy`, `pandas`, and `matplotlib`. It generates synthetic diffraction data, fits Gaussian-based phase models with `scipy.optimize.curve_fit`, calculates RSS, $\chi^2$, reduced $\chi^2$, and AIC, then uses an F-test to compare the nested disordered-phase and mixture models.
