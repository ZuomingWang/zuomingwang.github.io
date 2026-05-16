---
layout: distill
title: Mobile Automation Robot
description: Robot localization, mapping, and navigation from noisy sensors
img: assets/img/projects_mobile_automation/Picture12.png
importance: 2
category: fun
related_publications: false
date: 2025-04-30 09:00:00-0500
bibliography: mobile-automation-robot.bib
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Cornell University
toc:
  - name: Project Goal
  - name: System Overview
  - name: Sensors
  - name: Localization
  - name: Mapping
  - name: Path Planning
  - name: Tuning And Results
  - name: Implementation Notes
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

  .ma-lede {
    margin-top: 0.35rem;
    margin-bottom: 1.15rem;
    font-size: 1.08rem;
    line-height: 1.8;
    color: var(--global-text-color);
  }

  .ma-glance {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.1rem;
    margin: 1.5rem 0 2.1rem;
    padding: 1.05rem 0;
    border-top: 1px solid var(--global-divider-color);
    border-bottom: 1px solid var(--global-divider-color);
  }

  .ma-glance span {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--global-text-color-light);
    font-size: 0.78rem;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .ma-glance p {
    margin: 0;
    line-height: 1.55;
  }

  .ma-note {
    margin: 1.4rem 0 1.8rem;
    padding: 0.15rem 0 0.15rem 1rem;
    border-left: 3px solid var(--global-theme-color);
    color: var(--global-text-color);
  }

  .ma-media {
    grid-column: text;
    margin-top: 1.2rem;
    margin-bottom: 1.7rem;
  }

  .ma-media figure,
  .ma-media picture {
    display: block;
    max-width: 520px;
    margin: 0 auto;
  }

  .ma-media img {
    width: 100%;
    height: auto !important;
    object-fit: contain;
    background-color: var(--global-card-bg-color);
  }

  .ma-media figcaption.caption {
    margin-top: 0.65rem;
    color: var(--global-text-color-light);
    font-size: 0.92rem;
    line-height: 1.45;
    text-align: center;
  }

  .ma-media-comparison {
    grid-column: page;
    max-width: 900px;
    margin-right: auto;
    margin-left: auto;
  }

  .ma-media-comparison figure {
    max-width: 390px;
  }

  .ma-media-comparison img {
    height: 230px !important;
    object-fit: contain;
  }

  .ma-media-stack {
    row-gap: 1.2rem;
  }

  .ma-media-system figure,
  .ma-media-system picture {
    max-width: 700px;
  }

  @media (min-width: 768px) {
    .ma-media-comparison figcaption.caption {
      min-height: 4.1rem;
    }
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

    .ma-glance {
      grid-template-columns: 1fr;
    }

    .ma-media-comparison img {
      height: auto !important;
    }
  }
---

<p class="ma-lede">
This project builds a compact mobile robot autonomy stack: estimate the robot pose, build a map from noisy contact and depth observations, and navigate through multiple waypoints without colliding with obstacles.
</p>

<div class="ma-glance">
  <div>
    <span>Question</span>
    <p>How can a small robot localize and navigate when its sensors are useful but imperfect?</p>
  </div>
  <div>
    <span>Method</span>
    <p>Combine EKF/PF localization, occupancy-style mapping, potential fields, and RRT planning.</p>
  </div>
  <div>
    <span>Takeaway</span>
    <p>The autonomy stack works only when estimation, mapping, planning, and tuning are treated as one loop.</p>
  </div>
</div>

## Project Goal

The goal is to make a mobile robot visit multiple waypoints using only its available sensors and a software stack that can reason about uncertainty. The robot has to infer where it is, update what it knows about the environment, and choose paths that remain feasible as new sensor information arrives.

This is a small robotics project, but it captures a common autonomy problem: each subsystem can look reasonable in isolation, yet the robot only succeeds when localization, mapping, and planning agree well enough in real time.

<p class="ma-note">
The project is framed as an integrated navigation exercise rather than a single algorithm demo. The important question is not whether one planner can draw a path, but whether the robot can keep that plan consistent with noisy state estimates and an evolving map.
</p>

## System Overview

The system combines sensing, state estimation, map construction, and motion planning into one navigation pipeline. The final behavior is a waypoint-following robot that updates its belief about the environment while avoiding obstacles.

<div class="row justify-content-center ma-media ma-media-comparison">
    <div class="col-12 col-md-6 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture11.png" alt="Field test before tuning" title="Field test before tuning" caption="Field test before tuning." class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-12 col-md-6 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture12.png" alt="Field test after tuning" title="Field test after tuning" caption="Field test after tuning." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The stack can be summarized as:

| Layer | Role | Main challenge |
|:------|:-----|:---------------|
| Sensors | Observe contacts, depth, and obstacles | Measurements are local and noisy |
| Localization | Estimate robot pose over time | Uncertainty accumulates during motion |
| Mapping | Convert observations into environment structure | Obstacles must be inferred from partial evidence |
| Planning | Generate waypoint paths | Paths must remain feasible as the map changes |
| Tuning | Balance robustness and speed | Parameters interact across subsystems |

## Sensors

The robot uses bumping sensors and depth sensors to perceive the environment. The bumping sensors provide direct evidence of contact with boundaries or obstacles, while the depth sensors give earlier distance cues for mapping and avoidance.

<div class="row justify-content-center ma-media ma-media-stack">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture2.png" alt="Robot bumping and depth sensors" title="Robot sensors" caption="Sensor setup used for contact detection, depth perception, and obstacle-aware navigation." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The sensor model is intentionally practical:

- bumping events help identify hard boundaries and failed paths
- depth readings provide local obstacle geometry before contact
- sensor fusion improves behavior because neither sensor is sufficient alone

## Localization

The project compares two localization strategies: an Extended Kalman Filter and a Particle Filter. The EKF is efficient when the uncertainty is close to Gaussian and the motion model is well behaved. The Particle Filter is more flexible when the belief distribution becomes nonlinear or multi-modal.

<div class="row justify-content-center ma-media ma-media-stack">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture3.png" alt="Extended Kalman Filter localization result" title="EKF localization" caption="Extended Kalman Filter localization result." class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-12 mt-3">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture4.png" alt="Particle Filter localization result" title="Particle Filter localization" caption="Particle Filter localization result." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

<div class="row justify-content-center ma-media ma-media-stack">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture5.png" alt="Particle Filter beacon-based localization correction strategy" title="Particle Filter beacon correction" caption="Particle Filter beacon correction strategy: when the robot reaches a region with clear beacon observations, the filter uses those measurements to recalibrate the robot's pose estimate." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

In implementation terms, the localization module has to maintain a pose estimate, update uncertainty after motion, and correct that belief using sensor likelihoods. The beacon-based correction is implemented with a Particle Filter: when the robot moves into a region where beacons are visible and reliable, the particle weights are updated from the beacon observations so the pose estimate can be pulled back toward the physically plausible heading and position. This is the first place where tuning matters: a filter that trusts odometry too much drifts, while a filter that trusts noisy observations too much becomes unstable.

## Mapping

Mapping turns local sensor observations into a usable representation of free and occupied space. The robot does not observe the whole world at once, so the map is built incrementally as the robot moves and collects depth/contact evidence.

<div class="row justify-content-center ma-media ma-media-stack">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture6.png" alt="Occupancy grid generated from bumping sensor observations" title="Bumping-sensor occupancy grid" caption="Occupancy grid generated from bumping sensor observations. Black cells indicate obstacles; white cells indicate traversable space." class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-12 mt-3">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture7.png" alt="Occupancy grid generated from depth sensor observations" title="Depth-sensor occupancy grid" caption="Occupancy grid generated from depth sensor observations and used by the planning module." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The useful map is not just a drawing. It is the interface between perception and planning: the bumping sensor provides direct contact evidence for hard obstacles, while the depth sensor gives a broader view of nearby free and occupied regions before collision. If the occupancy grid is too conservative, the robot may refuse usable paths; if it is too optimistic, the planner can send the robot into obstacles.

## Path Planning

The planner uses two complementary ideas. Potential fields provide a simple continuous control intuition: goals attract the robot, obstacles repel it. RRT planning is more global and sampling-based, which helps when the environment has turns or narrow passages.

<div class="row justify-content-center ma-media ma-media-stack">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture8.png" alt="Potential field navigation result" title="Potential field navigation" caption="Potential field navigation: attraction to goals and repulsion from obstacles." class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-12 mt-3">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture9.png" alt="RRT path planning result" title="RRT planning" caption="RRT planning: sampling-based search for a feasible path through the map." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

Potential fields are fast and reactive, but they can get trapped in local minima. RRT is less reactive but more capable of exploring difficult spaces. In this project, the important engineering decision is to use the right tool for the right layer rather than expecting one planning method to solve everything.

## Tuning And Results

The last part of the project is parameter tuning. The filter parameters, map update thresholds, potential field gains, and RRT settings all affect each other. A localization setting that looks smooth can make the planner sluggish; a planner that is aggressive can expose weaknesses in the map.

<div class="row justify-content-center ma-media ma-media-stack">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture11.png" alt="Field-test result without beacon correction" title="Field test without beacon correction" caption="Field-test result without beacon correction. The trajectory shows a large deviation when accumulated localization error is not corrected by visible beacons." class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-12 mt-3">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture10.png" alt="Simulator route using Particle Filter, depth sensor, and beacon correction" title="Simulator route with beacon correction" caption="Simulator route using the Particle Filter, depth sensor, and beacon correction strategy. When visible beacons are encountered, the filter recalibrates the route and produces a more stable trajectory." class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-12 mt-3">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture12.png" alt="Final field-test navigation result after tuning" title="Final field-test result after tuning" caption="Final field-test navigation result after tuning, showing a clear improvement over the untuned run." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

The tuning sequence starts from the field-test failure mode, then checks the correction strategy in simulation before returning to the physical robot. With Particle Filter localization, depth sensing, and beacon updates working together, the simulated route remains stable after correction events. The final field test shows the practical effect of tuning: the robot tracks the intended route much more closely than the untuned run.

## Implementation Notes

The core implementation can be read as a set of contracts between modules:

| Module | Input | Output |
|:-------|:------|:-------|
| Sensor processing | bumping and depth readings | obstacle/contact observations |
| Localization | odometry and observations | pose estimate with uncertainty |
| Mapping | pose estimate and observations | environment map |
| Planning | map, pose, and waypoints | feasible motion plan |
| Tuning | performance metrics | parameter updates |

The project uses modular algorithms so that each part can be tested independently, but the real validation comes from integration. A correct-looking map is not enough if the planner cannot use it. A good path is not enough if the pose estimate cannot keep the robot on that path.

<div class="row justify-content-center ma-media ma-media-stack ma-media-system">
    <div class="col-12 mt-3 mt-md-0">
        {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture1.png" alt="System overview for the mobile automation robot project" title="System overview" caption="System overview connecting sensing, localization, mapping, and planning." class="img-fluid rounded z-depth-1" %}
    </div>
</div>

## Takeaways

- Localization and planning should be evaluated together, not as isolated plots.
- EKF and PF are useful for different uncertainty regimes.
- Mapping quality directly controls how much freedom the planner has.
- Potential fields are useful for reactive behavior, while RRT helps with global feasibility.
- Parameter tuning is part of the algorithm, not an afterthought.
