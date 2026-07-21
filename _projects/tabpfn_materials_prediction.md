---
layout: distill
title: TabPFN for Small-Data Materials Prediction
description: Small-data materials prediction with the Tabular Prior-Data Fitted Network (TabPFN) and structure-aware features
img: assets/img/projects_tabpfn/structure-aware-gain.png
importance: 2
category: work
github: https://github.com/ZuomingWang/matbench-tabpfn
related_publications: false
date: 2026-06-08 09:00:00-0500
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Northwestern University
  - name: Kyle Xu
    affiliations:
      name: Northwestern University
toc:
  - name: Project Goal
  - name: Benchmark Design
  - name: Results
  - name: Representation Study
  - name: Small-Data Diagnostics
  - name: Active-Learning Screening
  - name: Limitations and Next Steps
  - name: Implementation and Contributions
  - name: Takeaways
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

  .tabpfn-lede {
    margin-top: 0.35rem;
    margin-bottom: 1.15rem;
    font-size: 1.08rem;
    line-height: 1.8;
    color: var(--global-text-color);
  }

  .tabpfn-glance {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1rem;
    margin: 1.5rem 0 2.1rem;
    padding: 1.05rem 0;
    border-top: 1px solid var(--global-divider-color);
    border-bottom: 1px solid var(--global-divider-color);
  }

  .tabpfn-glance span {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--global-text-color-light);
    font-size: 0.78rem;
    text-transform: uppercase;
  }

  .tabpfn-glance p {
    margin: 0;
    line-height: 1.55;
  }

  .tabpfn-media {
    grid-column: text;
    width: 100%;
    max-width: none;
    margin: 1.35rem 0 1.9rem;
  }

  .tabpfn-media figure,
  .tabpfn-media picture {
    display: block;
    margin: 0;
  }

  .tabpfn-media img {
    width: 100%;
    height: auto !important;
    object-fit: contain;
    background-color: #fff;
  }

  .tabpfn-media figcaption.caption {
    margin-top: 0.65rem;
    color: var(--global-text-color-light);
    font-size: 0.92rem;
    line-height: 1.45;
    text-align: center;
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

    .tabpfn-glance {
      grid-template-columns: 1fr;
    }
  }
---

<p class="tabpfn-lede">
Use a Tabular Prior-Data Fitted Network (TabPFN) for materials-property prediction in the small-data regime. TabPFN treats training examples as context and predicts new samples without task-specific weight updates. Test how much performance depends on the physical information encoded in the input representation.
</p>

<div class="tabpfn-glance">
  <div>
    <span>Question</span>
    <p>How to make useful predictions when materials datasets contain only hundreds to a few thousand labeled examples?</p>
  </div>
  <div>
    <span>Method</span>
    <p>Use TabPFN's in-context learning with composition and structure-aware features under the official Matbench folds.</p>
  </div>
  <div>
    <span>Takeaway</span>
    <p>TabPFN is strong in this regime. Physically meaningful representation is more decisive.</p>
  </div>
</div>

## Project Goal

Many materials datasets are small because labels come from expensive experiments or density-functional-theory calculations. This makes them a useful test case for TabPFN, a pretrained tabular foundation model that performs in-context prediction without task-specific weight updates.

We built a staged reproduction of the in-context learning foundation-model workflow for materials property prediction, then extended it in two directions. First, we added inexpensive structure-aware descriptors to test whether TabPFN could use physical information beyond composition. Second, we moved beyond full-data benchmark scores to examine data efficiency, neural-network baselines, and retrospective active-learning screening.

## Benchmark Design

The evaluation uses four Matbench regression tasks spanning composition-only and structure-dependent targets:

| Task                  | Samples | Target                        | Input             |
| :-------------------- | ------: | :---------------------------- | :---------------- |
| Steels                |     312 | Yield strength (MPa)          | Composition       |
| Experimental band gap |   4,604 | Band gap (eV)                 | Composition       |
| JDFT2D                |     636 | Exfoliation energy (meV/atom) | Crystal structure |
| Phonons               |   1,265 | Phonon peak frequency (cm⁻¹)  | Crystal structure |

Every comparison follows the official five-fold Matbench splits. Composition is represented by 132 Magpie statistics. For the two structure-dependent tasks, we add density, maximum packing efficiency, global symmetry, and structural-complexity descriptors calculated without labels. The same feature matrix is passed to every model within a branch.

The baseline ladder includes a dummy predictor, RidgeCV, random forest, Extra Trees, histogram gradient boosting, and dense MLPs. Performance is reported with mean absolute error (MAE) and \(R^2\); lower MAE is better. Test folds are reserved for final evaluation rather than tuning.

## Results

Against the strongest classical baseline in the tested setup, TabPFN lowers five-fold mean MAE on all four tasks. The margin ranges from about 3% on steels to about 31% on phonon-frequency prediction.

<div class="tabpfn-media">
  {% include figure.liquid loading="eager" path="assets/img/projects_tabpfn/tabpfn-vs-baseline.png" avoid_scaling=true alt="Four-panel comparison of TabPFN and Extra Trees mean absolute error on steels, experimental band gap, JDFT2D, and phonons" title="TabPFN versus the strongest classical baseline" caption="TabPFN outperforms the strongest tested classical baseline on each task under the same five-fold protocol. These bars compare against classical machine learning, not against the published paper." class="img-fluid rounded z-depth-1" %}
</div>

This comparison also exposes an important caveat. A composition-only TabPFN can lose to a classical model that receives structure information. Model capability cannot compensate for a representation that omits the variables governing the target property.

## Representation Study

Adding four lightweight structure descriptors reduces TabPFN MAE by 25.4% for JDFT2D exfoliation energy and 16.9% for phonon peak frequency. This agrees with the underlying physics: both targets depend on atomic arrangement, not only elemental composition.

<div class="tabpfn-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tabpfn/structure-aware-gain.png" avoid_scaling=true alt="Structure-aware TabPFN mean absolute error comparison for JDFT2D exfoliation energy and phonon peak frequency" title="Structure-aware features improve TabPFN" caption="Adding density, packing, symmetry, and structural-complexity descriptors substantially reduces error on both structure-dependent tasks." class="img-fluid rounded z-depth-1" %}
</div>

The ablation study shows that this is not merely an effect of adding more columns. Density and packing account for most of the gain, while symmetry-only and complexity-only branches provide smaller improvements. The full descriptor set performs best on both tasks.

<div class="tabpfn-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tabpfn/structure-ablation.png" avoid_scaling=true alt="Ablation study comparing density, packing, symmetry, complexity, and combined structure descriptor branches" title="Structure descriptor ablation" caption="Geometric and packing-related descriptors drive most of the improvement, while the combined structure branch produces the lowest error." class="img-fluid rounded z-depth-1" %}
</div>

## Small-Data Diagnostics

To test whether the result survives when labels become scarcer, we repeat the structure-dependent benchmarks with 10%, 20%, 40%, 60%, 80%, and 100% of each official training fold. Area under the learning curve summarizes error across the full budget sweep. TabPFN with structure descriptors has the lowest aggregate error on both tasks.

<div class="tabpfn-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tabpfn/data-efficiency-aulc.png" avoid_scaling=true alt="Area under the learning curve comparison for TabPFN and Extra Trees with composition and structure features" title="Small-data efficiency across training budgets" caption="Lower area under the learning curve indicates lower average error across reduced training fractions. TabPFN with structure descriptors ranks first on both tasks." class="img-fluid rounded z-depth-1" %}
</div>

A dense MLP provides a useful negative control. Structure descriptors help both untuned and inner-validation-tuned MLPs, but neither approaches the structure-aware TabPFN result. In this dataset-size range, adding a generic neural network is not enough by itself.

<div class="tabpfn-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tabpfn/mlp-baseline.png" avoid_scaling=true alt="Mean absolute error comparison between composition and structure MLP baselines and structure-aware TabPFN" title="MLP baseline comparison" caption="Inner-validation tuning changes MLP performance only modestly; the structure-aware TabPFN remains substantially more accurate in this experiment." class="img-fluid rounded z-depth-1" %}
</div>

## Active-Learning Screening

The final extension reframes prediction as a limited-budget screening problem. Each strategy begins with 10% of an official training fold labeled, then selects 100 additional candidates. Random sampling is compared with Extra Trees and TabPFN acquisition strategies.

<div class="tabpfn-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_tabpfn/active-learning-curves.png" avoid_scaling=true alt="Active-learning curves comparing random sampling with Extra Trees and TabPFN guided acquisition" title="Model-guided active-learning screening" caption="Model-guided acquisition recovers top candidates much faster than random search on both structure-dependent tasks under the same label budget." class="img-fluid rounded z-depth-1" %}
</div>

At the final budget, random search recovers about 29% of the top JDFT2D candidates and 21% of the top phonon candidates. The tested model-guided strategies recover roughly 84–87% and 97–98%, respectively. The exact winning acquisition rule varies, but the practical result is stable: a surrogate model can focus expensive labels on promising candidates much more efficiently than random selection.

## Limitations and Next Steps

- implement ALIGNN and CGCNN embeddings for a same-representation comparison
- extend uncertainty calibration for prospective active learning
- test whether the screening behavior transfers to experimental feedback loops
- improve packaging, documentation, and automated reproducibility in the public repository

## Implementation and Contributions

The current code and results are available at [ZuomingWang/matbench-tabpfn](https://github.com/ZuomingWang/matbench-tabpfn).

**Zuoming Wang** developed the four-task official-fold benchmark, structure-aware feature branches, classical-model comparisons, descriptor ablations, ensemble diagnostics, and comparisons with the reference study.

**Kyle Xu** developed the reduced-data learning curves, target-regime analysis, MLP baselines, and retrospective active-learning experiments.

## Takeaways

- TabPFN is a strong and convenient predictor for the selected small materials datasets.
- Physically meaningful representation matters at least as much as model selection.
- Density and packing descriptors explain most of the observed structure-feature gain.
- The TabPFN advantage persists across reduced training budgets in the tested tasks.
- Model-guided acquisition can turn a static benchmark into a practical label-allocation experiment.
