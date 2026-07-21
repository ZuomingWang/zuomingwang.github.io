---
layout: distill
title: "Machine learning for XRD phase identification"
date: 2026-07-20 09:00:00-0700
description: "Mixtures, uncertainty, texture, and missing phases shape the practical limits of automated XRD analysis."
tags: xrd machine-learning materials-science
categories: materials-science
featured: false
site_owned: true
giscus_comments: false
related_posts: false
bibliography: xrd-ml-phase-identification.bib
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Northwestern University
toc:
  - name: Phase Identification as Inference
  - name: Training on Simulated Patterns
  - name: Multiphase Samples
  - name: Calibrating Confidence
  - name: Using Interpretability to Guide Measurement
  - name: Direct Structure Reconstruction
  - name: Open Problems
  - name: What I Would Check
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

  .xrd-ml-note {
    margin: 1.4rem 0 1.8rem;
    padding: 0.2rem 0 0.2rem 1rem;
    border-left: 3px solid var(--global-theme-color);
  }

  .xrd-ml-figure {
    grid-column: text;
    margin: 1.35rem 0 1.9rem;
  }

  .xrd-ml-figure figure,
  .xrd-ml-figure picture {
    display: block;
    margin: 0;
  }

  .xrd-ml-figure img {
    width: 100%;
    height: auto !important;
    object-fit: contain;
    background: #fff;
  }

  .xrd-ml-figure figcaption.caption {
    margin-top: 0.65rem;
    color: var(--global-text-color-light);
    font-size: 0.92rem;
    line-height: 1.5;
    text-align: center;
  }

---

Powder X-ray diffraction phase identification takes a measured spectrum and a set of candidate crystal structures and assigns plausible phases. Real samples complicate this mapping through phase coexistence, peak shifts, broadening, texture, disorder, background, and phases missing from the reference database.

I am interested in machine learning here for a practical reason: it can screen large candidate sets quickly. The quality of that screening depends on the crystallographic constraints, the candidate database, and the experiments used to evaluate it. Those dependencies are where most of the interesting problems begin.

## Phase Identification as Inference

Manual phase identification begins with chemistry. An analyst identifies the material system, searches a crystal database, simulates stick patterns, and compares those patterns with the experiment. Automated variants use peak detection, full-pattern correlation, refinement, or refinement followed by search. Overlapping peaks and multiphase samples make fixed matching criteria unreliable across both workflows.

Machine learning changes the workflow. A model can learn from a large collection of simulated and augmented patterns, recognize nonlinear variations, and evaluate spectra much faster than an iterative refinement-and-search pipeline. Early convolutional neural network studies showed that this formulation can work even when experimental data are limited <d-cite key="oviedo2019fast"></d-cite>.

<div class="xrd-ml-figure">
  {% include figure.liquid loading="eager" path="assets/img/xrd_ml_phase_identification/problem-definition.png" avoid_scaling=true alt="Diagram defining automatic XRD phase identification as a model that combines measured patterns and candidate phases to predict labels, probabilities, and experimental attributes" title="Automatic XRD phase-identification problem" caption="Phase-identification models can report candidate labels, probabilities, and experimental attributes such as texture or single-crystal behavior." class="img-fluid rounded z-depth-1" %}
</div>

Computer vision supplies useful architectures for this task, although XRD data have a distinct structure. Individual peaks carry limited meaning. Phase identity emerges from relationships among peak positions and intensities across the full diffraction range. Model architecture and evaluation should reflect those long-range relationships.

## Training on Simulated Patterns

The natural training source is a crystal-structure database. For each structure, we simulate an XRD pattern and apply transformations intended to reproduce experimental variation. The model then learns a mapping from those synthetic spectra to phase labels.

Data augmentation carries much of the physical modeling. Strain shifts peaks, finite crystallite size and instruments broaden them, preferred orientation changes intensity ratios, disorder changes both ratios and positions, and experimental backgrounds depart from the clean baseline of a simulation. Published workflows perturb peak positions, widths, shapes, intensities, and backgrounds to bridge this simulation-to-experiment gap <d-cite key="oviedo2019fast,szymanski2021probabilistic"></d-cite>.

<div class="xrd-ml-figure">
  {% include figure.liquid path="assets/img/xrd_ml_phase_identification/data-augmentation.png" avoid_scaling=true alt="Examples of XRD data augmentation using peak shifting, broadening, intensity-ratio modification, peak-shape variation, and background variation" title="XRD data augmentation" caption="Augmentation encodes experimental physics through peak shifts, broadening, intensity changes, peak shapes, and backgrounds." class="img-fluid rounded z-depth-1" %}
</div>

Every augmentation pipeline encodes assumptions. A generator that omits the dominant experimental variation can produce excellent synthetic test accuracy alongside poor laboratory performance. Held-out synthetic accuracy measures consistency with the generator. Laboratory transfer depends on how well that generator spans the intended measurements.

## Multiphase Samples

Single-phase classification provides a useful baseline. If a database contains $n$ candidate phases and a sample may contain as many as $d$ phases, enumerating combinations grows roughly as $O(n^d)$. Peak overlap, phase fractions, and independent peak shifts add further ambiguity.

Brute-force mixture simulation samples phase combinations and fractions, generates hundreds of thousands of spectra, and trains a network over mixture classes or fraction bins <d-cite key="lee2020deep"></d-cite>. The resulting training distribution inherits the composition and structure bias of the database. A fixed top-three output also leaves the number of phases unresolved.

A more scalable strategy is **detect and deduct**. Predict one phase, align its simulated pattern to the experiment, subtract the explained signal, and repeat along several candidate branches. The best branch is chosen from the confidence accumulated through the sequence <d-cite key="szymanski2021probabilistic"></d-cite>.

<div class="xrd-ml-figure">
  {% include figure.liquid path="assets/img/xrd_ml_phase_identification/detect-and-deduct.png" avoid_scaling=true alt="Detect-and-deduct workflow using a neural network, dropout-based confidence estimates, dynamic time warping, signal subtraction, and branching search for multiphase XRD" title="Detect-and-deduct phase search" caption="Sequential search reduces the combinatorial training space. Alignment and intensity errors from each subtraction can propagate into later decisions." class="img-fluid rounded z-depth-1" %}
</div>

Detect-and-deduct inserts search around a learned classifier. A confident early mistake can contaminate every later residual, so the residual needs direct inspection throughout the sequence. Structured peaks in that residual often reveal an alignment error, an omitted phase, or a poor intensity estimate.

## Calibrating Confidence

Phase identification needs probabilities because experiments are ambiguous. Dropout sampling can estimate how often a model selects a phase across stochastic forward passes. An ensemble can train many shallow networks and interpret the voting fraction as confidence. Composition measurements such as EDX can then be combined with XRD evidence to update phase probabilities <d-cite key="maffettone2021crystallography"></d-cite>.

Raw confidence scores require calibration. A model reporting 90% confidence should be correct about 90% of the time on comparable samples. Noise, domain shift, and class imbalance can distort that relationship. Machine-learning calibration methods provide a starting point <d-cite key="guo2017calibration"></d-cite>. Diffraction applications still need validation across instruments, noise levels, and material systems. CrystalShift, for example, shows shifts in predicted reliability as noise changes even when the training set includes several noise levels <d-cite key="chang2023probabilistic"></d-cite>.

<div class="xrd-ml-note">
  <strong>Practical rule:</strong> use model confidence to rank follow-up actions only after checking reliability diagrams on data that resemble the intended experiment.
</div>

## Using Interpretability to Guide Measurement

For a convolutional classifier, a class activation map highlights the regions of a pattern that drive a phase prediction. Comparing those regions with physically discriminative peaks helps diagnose attention to background structure or experimental artifacts.

The same map can guide the next measurement. When the leading candidates depend on separate angular regions, an adaptive system can rescan the region where their activation maps disagree most <d-cite key="szymanski2023adaptive"></d-cite>.

<div class="xrd-ml-figure">
  {% include figure.liquid path="assets/img/xrd_ml_phase_identification/adaptive-measurement.png" avoid_scaling=true alt="Adaptive XRD measurement loop that uses model confidence and class activation maps to select new scan regions" title="Adaptive XRD measurement" caption="Class activation maps can connect interpretation with action: low-confidence predictions trigger targeted rescans where the leading candidates differ most." class="img-fluid rounded z-depth-1" %}
</div>

Used this way, class activation maps become part of the experimental control loop. I would judge their value through identification accuracy and measurement time.

## Direct Structure Reconstruction

Direct reconstruction asks a model to generate a crystal structure from a powder pattern. Conditional diffusion models offer one route: encode the XRD pattern, then condition an equivariant generative model while it denoises a candidate structure <d-cite key="lai2024end"></d-cite>.

Large generated cells may eventually represent subtle disorder. Powder XRD reconstruction remains underconstrained because multiple structures, mixtures, texture states, and defects can produce similar one-dimensional patterns. Validation therefore requires composition, symmetry, stability, and explicit comparison with alternative structures.

## Open Problems

Small gains in synthetic classification accuracy leave several practical gaps unresolved.

**Novelty detection.** A closed-set classifier assumes that its database contains the correct phase. Discovery experiments frequently encounter samples outside that candidate set. Autoencoder reconstruction error has been explored as an unknown-phase signal. Existing demonstrations use small, idealized datasets, leaving scalability to noisy mixtures unresolved <d-cite key="banko2021deep"></d-cite>.

**Texture-aware models.** Azimuthal integration turns a two-dimensional diffraction image into a one-dimensional pattern and discards ring structure. Preferred orientation can then resemble changes caused by disorder or phase fraction. Conditioning a phase model on the original 2D detector image could preserve information that data augmentation can only approximate.

<div class="xrd-ml-figure">
  {% include figure.liquid path="assets/img/xrd_ml_phase_identification/texturing-2d-xrd.png" avoid_scaling=true alt="Comparison of textured and random XRD patterns and a proposal to condition one-dimensional phase identification on two-dimensional detector data" title="Texture-aware phase identification" caption="Once a 2D detector image is azimuthally integrated, orientation information is lost. A multimodal model could use that information to distinguish texture from phase or disorder effects." class="img-fluid rounded z-depth-1" %}
</div>

**A credible benchmark.** Computer vision benefited from shared benchmarks that made methods comparable. XRD datasets differ in structure databases, simulated versus experimental patterns, augmentation, instruments, and label conventions. Simulated datasets are growing rapidly <d-cite key="cao2024simxrd"></d-cite>. A useful benchmark should expose performance across the variations that matter in practice and prevent one generator from defining the task.

**Dataset imbalance.** ICSD and Materials Project entries are highly uneven across space groups and chemistries. Sampling directly from them teaches the model that common database structures are intrinsically more probable. Database frequency can serve as an explicit prior, kept separate from evidence in the measured pattern.

**Appropriate inductive bias.** A CNN is naturally biased toward local features, while phase identity depends on relations among peaks separated across the diffraction range. Attention, set-based representations, or graph-like relational models may encode those dependencies more directly <d-cite key="battaglia2018relational"></d-cite>.

Optimization and search methods sometimes match or exceed learned models. Training instability and overfitting become especially visible when laboratory data depart from the simulated training distribution. Hybrid systems can combine fast candidate screening with refinement, residual analysis, and physical constraints.

## What I Would Check

Before I accept an automated phase assignment, I want answers to these questions:

- Were the candidate phases constrained by composition and chemistry?
- Does the training augmentation cover the instrument, strain, texture, disorder, and background regimes in the experiment?
- Can the method infer the number of phases along with their identities?
- Is confidence calibrated on comparable experimental data?
- Which peaks drive the decision, and are they crystallographically diagnostic?
- What happens when the true phase is absent from the database?
- Does the residual contain structured, unexplained peaks?
- Would another measurement region, a 2D detector image, or a second modality resolve the ambiguity?
- Has the learned model been compared with a strong refinement-and-search baseline?

Together, these checks make the assignment traceable from the measured pattern to the final label.

At this stage, I would use machine learning to narrow candidate sets and decide what to measure next. I would verify final assignments with refinement, residual analysis, chemistry, and competing phase models. The research directions I care most about are probabilistic multiphase labeling, novelty detection, end-to-end structure refinement, and multimodal models that preserve experimental context lost during one-dimensional integration.
