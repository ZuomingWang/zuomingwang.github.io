---
layout: distill
title: Mobile Automation Robot
description: A code-grounded walkthrough of localization, mapping, RRT planning, and online replanning
img: assets/img/projects_mobile_automation/Picture12.png
github: https://github.com/ZuomingWang/MobileAutomationRobot
importance: 2
category: fun
permalink: /projects/mobile_automation/
related_publications: false
date: 2025-04-30 09:00:00-0500
bibliography: mobile-automation-robot.bib
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Cornell University
toc:
  - name: Mission
  - name: Hardware And Interfaces
  - name: Navigation Loop
  - name: Initial Localization
  - name: Mapping And Replanning
  - name: Planning And Control
  - name: Experiments And Final Run
  - name: Reproducing The Project
  - name: Engineering Lessons
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

  d-article {
    --ma-accent: var(--global-theme-color);
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
    width: 100%;
    max-width: 100%;
    height: auto;
    border-top: 0 !important;
  }

  .ma-lede {
    margin: 0.25rem 0 1.3rem;
    font-size: 1.08rem;
    line-height: 1.8;
    color: var(--global-text-color);
  }

  .ma-glance {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin: 1.5rem 0 2rem;
    padding: 1.05rem 0;
    border-top: 1px solid var(--global-divider-color);
    border-bottom: 1px solid var(--global-divider-color);
  }

  .ma-glance span {
    display: block;
    margin-bottom: 0.3rem;
    color: var(--global-text-color-light);
    font-size: 0.76rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ma-glance p {
    margin: 0;
    line-height: 1.5;
  }

  .ma-note {
    margin: 1.4rem 0 1.8rem;
    padding: 0.15rem 0 0.15rem 1rem;
    border-left: 3px solid var(--ma-accent);
  }

  .ma-media {
    grid-column: text;
    width: 100%;
    margin: 1.25rem 0 1.8rem;
  }

  .ma-media figure,
  .ma-media picture {
    display: block;
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .ma-media img {
    display: block;
    width: 100% !important;
    max-width: none !important;
    object-fit: contain;
    background: var(--global-card-bg-color);
  }

  .ma-media figcaption.caption {
    margin-top: 0.65rem;
    color: var(--global-text-color-light);
    font-size: 0.9rem;
    line-height: 1.45;
    text-align: left;
  }

  .ma-pair {
    grid-column: text;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    width: 100%;
    margin: 1.25rem 0 1.8rem;
  }

  .ma-pair figure,
  .ma-pair picture {
    width: 100%;
    max-width: none;
    margin: 0;
  }

  .ma-pair img {
    width: 100% !important;
    aspect-ratio: 4 / 3;
    object-fit: contain;
    background: var(--global-card-bg-color);
  }

  .ma-specs {
    margin: 1.2rem 0 1.8rem;
    font-size: 0.92rem;
  }

  .ma-code-links a {
    white-space: nowrap;
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

    .ma-glance,
    .ma-pair {
      grid-template-columns: 1fr;
    }

    .ma-pair img {
      aspect-ratio: auto;
    }
  }
---

<p class="ma-lede">
This project turns an iRobot Create and a RealSense camera into a compact autonomy system. The robot estimates its starting pose, orders eight goals, plans collision-free routes, follows them with closed-loop control, and revises the map when depth measurements reveal a wall that was previously uncertain.
</p>

<div class="ma-glance">
  <div>
    <span>Platform</span>
    <p>MATLAB R2024a, iRobot Create, and Intel RealSense.</p>
  </div>
  <div>
    <span>Perception</span>
    <p>Odometry, bump sensors, nine depth rays, and AprilTag beacons.</p>
  </div>
  <div>
    <span>Autonomy</span>
    <p>Pose initialization, goal ordering, RRT planning, tracking, and replanning.</p>
  </div>
</div>

## Mission

The robot operates in a 6.10 m × 4.57 m indoor course containing fixed walls, three possible wall segments, eight destinations, and AprilTag landmarks. It has to visit the destinations within a time budget while keeping enough clearance for its physical footprint.

The uncertain wall segments make this more than a one-shot path-planning exercise. A route that is valid at the start can become blocked after the robot observes the environment. The software therefore carries perception into the planning loop: depth measurements update an occupancy grid, confirmed walls enter the line map, and the current goal is planned again.

<div class="ma-media">
  {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/competition-map.svg" alt="Competition environment with fixed walls, optional walls, goals, and AprilTag beacons" title="Competition environment" caption="The runtime map contains 13 fixed segments, three optional walls, eight goals, and eight AprilTag beacons. The drawing uses the coordinates stored in compMap.mat." class="img-fluid" %}
</div>

## Hardware And Interfaces

The iRobot Create supplies wheel odometry, collision switches, and velocity control. A RealSense camera supplies a fan of depth readings and detects AprilTags placed around the course. Both physical hardware and the compatible simulator expose the same small API, allowing the navigation code to keep its sensing and control calls unchanged.

<div class="ma-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture2.png" alt="iRobot Create platform with bump sensing and RealSense depth measurements" title="Robot sensing hardware" caption="The mobile platform combines contact sensing, wheel odometry, forward depth measurements, and visual landmarks." class="img-fluid rounded z-depth-1" %}
</div>

Each control cycle collects the latest odometry increment, six bump and wheel-drop flags, nine depth values, and any visible tag measurements. The readings are appended to a shared `dataStore`, which also records the estimated trajectory and completed goals. This log connects online navigation with later diagnosis.

| Signal | Used for | Repository interface |
|:--|:--|:--|
| Wheel distance and angle | Incremental pose propagation | `DistanceSensorRoomba`, `AngleSensorRoomba` |
| RealSense depth | Pose matching and occupancy updates | `RealSenseDist` |
| AprilTag pose | Restricting initial-location candidates | `RealSenseTag` |
| Bump and wheel-drop state | Contact and safety record | `BumpsWheelDropsSensorsRoomba` |
| Velocity commands | Waypoint tracking | `SetFwdVelAngVelCreate` |

## Navigation Loop

The entry point loads the map, performs initial localization, chooses an order for the eight goals, and allocates time to each segment. RRT produces a path to the current goal. While tracking that path, the robot continues updating its map. A newly confirmed wall interrupts tracking and sends the same goal back through the planner.

<div class="ma-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/navigation-pipeline.svg" alt="Navigation pipeline from initial localization through online mapping and replanning" title="Closed-loop navigation pipeline" caption="The current code path links initialization, planning, tracking, occupancy updates, and map-triggered replanning." class="img-fluid" %}
</div>

The implementation is divided by responsibility rather than assembled as one long competition script:

| Module | Responsibility | Source |
|:--|:--|:--|
| Localization | Beacon-assisted or depth-only initial pose | [`src/localization`](https://github.com/ZuomingWang/MobileAutomationRobot/tree/main/src/localization) |
| Mapping | Log-odds grid and optional-wall confirmation | [`src/mapping`](https://github.com/ZuomingWang/MobileAutomationRobot/tree/main/src/mapping) |
| Planning | Goal ordering and collision-aware RRT | [`src/planning`](https://github.com/ZuomingWang/MobileAutomationRobot/tree/main/src/planning) |
| Control | Odometry integration and waypoint tracking | [`src/control`](https://github.com/ZuomingWang/MobileAutomationRobot/tree/main/src/control) |
| Sensing | Hardware/simulator acquisition and logging | [`src/sensing`](https://github.com/ZuomingWang/MobileAutomationRobot/tree/main/src/sensing) |

## Initial Localization

At startup, the robot rotates through a full scan while looking for a nearby AprilTag. Tags mounted on optional walls are excluded because their presence cannot be assumed. A valid tag identifies a local region of the line map and narrows the candidate starting waypoints.

The camera measurements are averaged over the most recent ten readings. Tag range constrains the robot to a circle around the known landmark. Candidate positions on that circle are scored by comparing the nine measured depth values with ray–wall intersections predicted from the map. If no suitable tag is visible, the same depth residual is evaluated around the waypoint nearest the origin and refined with `fminsearch`.

<div class="ma-note">
The deployed initializer uses geometric search and depth prediction. The EKF and particle-filter plots below record earlier localization experiments and remain useful as design history, but they are separate from the current navigation entry point.
</div>

<div class="ma-pair">
  <div>
    {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture3.png" alt="Early EKF localization experiment" title="Early EKF experiment" caption="An early EKF study compared the estimate, dead reckoning, and ground truth." class="img-fluid rounded z-depth-1" %}
  </div>
  <div>
    {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture4.png" alt="Early particle-filter localization experiment" title="Early particle-filter experiment" caption="A particle-filter experiment explored a more flexible representation of pose uncertainty." class="img-fluid rounded z-depth-1" %}
  </div>
</div>

This split makes the engineering path visible: probabilistic filters informed the localization study, while the final competition workflow adopted a constrained geometric initializer that matched the available landmarks, depth geometry, and known start regions.

## Mapping And Replanning

The runtime map starts as a 40 × 40 log-odds grid. Every valid depth beam marks traversed cells as free and its endpoint as occupied. Bresenham's line algorithm supplies the discrete cells between the RealSense origin and the measured endpoint.

<div class="ma-pair">
  <div>
    {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture6.png" alt="Occupancy evidence obtained from contact sensing" title="Contact evidence" caption="Contact observations expose hard boundaries after the robot reaches them." class="img-fluid rounded z-depth-1" %}
  </div>
  <div>
    {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture7.png" alt="Occupancy grid updated from RealSense depth data" title="Depth occupancy grid" caption="Depth rays add free-space and occupied-cell evidence before contact." class="img-fluid rounded z-depth-1" %}
  </div>
</div>

The midpoint of each optional wall is monitored in the occupancy grid. A probability above 0.7 increments a confirmation counter; three consecutive detections promote the segment into the global line map. The robot stops, retains the current goal, and asks RRT for a new route using the updated geometry.

This simple temporal check rejects isolated depth spikes while still reacting quickly enough to a blocking wall. It also gives mapping a focused role: the grid does not need to reconstruct every surface at high resolution. It only needs enough evidence to resolve the three map hypotheses that affect navigation.

## Planning And Control

The planner first chooses a compact visit order for the eight destinations. For each destination, a goal-biased RRT explores the bounded line map with a 0.5 m extension step and up to 2,000 iterations. Collision checks use a 0.35 m safety radius, combining the 0.25 m robot radius with 0.10 m of clearance.

The raw tree path passes through three post-processing stages:

1. Random shortcuts remove unnecessary detours when a direct segment is collision-free.
2. Iterative smoothing moves interior points toward neighboring midpoints.
3. Densification limits the spacing between commands to 0.5 m.

<div class="ma-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture9.png" alt="RRT route through the competition line map" title="RRT route" caption="Sampling-based planning finds a collision-free connection through the line-segment map." class="img-fluid rounded z-depth-1" %}
</div>

During tracking, wheel increments propagate the pose estimate. Feedback linearization converts the displacement to the next path point into forward and angular velocity commands. Wheel-speed limits protect the Create platform, and a waypoint is accepted within 0.15 m. An `onCleanup` guard sends a zero-velocity command if the function exits because of completion, timeout, map change, or error.

## Experiments And Final Run

Early simulation exposed two recurring failure modes. Dead reckoning accumulated enough error to move the estimated path away from the intended corridor, while local reactive planning could settle into poor routes around internal walls. The later workflow used landmark-assisted initialization, explicit line-map collision checks, and map-triggered replanning.

<div class="ma-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture11.png" alt="Field run showing substantial trajectory deviation before localization tuning" title="Field run before tuning" caption="A field run with accumulated pose error shows why the planner and localization pipeline had to be evaluated together." class="img-fluid rounded z-depth-1" %}
</div>

<div class="ma-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture10.png" alt="Simulation route after adding landmark-assisted correction" title="Simulation after correction" caption="Simulation provided a controlled check of the corrected route before the next physical run." class="img-fluid rounded z-depth-1" %}
</div>

<div class="ma-media">
  {% include figure.liquid loading="lazy" path="assets/img/projects_mobile_automation/Picture12.png" alt="Final mobile robot field run after localization and planning tuning" title="Final field run" caption="The final field run follows the intended route much more closely after localization, planning, and control were tuned as one system." class="img-fluid rounded z-depth-1" %}
</div>

The figures document a qualitative improvement rather than a benchmark. The repository preserves one recorded `dataStore` run for inspection, but it does not contain a repeated-trial dataset from which to claim a success rate or confidence interval.

## Reproducing The Project

The repository is organized as a MATLAB project with portable path setup, dependency diagnostics, preserved map data, and hardware-independent tests. From the repository root:

```matlab
setupProject;
report = checkProject;
results = runtests('tests');
assertSuccess(results);
```

After connecting an iRobot Create or starting a compatible simulator, the navigation workflow is launched with:

```matlab
dataStore = finalCompetition(Robot, maxTime, offsetX, offsetY);
```

The tests cover project paths, coordinate transformation, odometry integration, feedback control and wheel limiting, beacon geometry, and a direct RRT path. End-to-end execution still depends on the external Create and RealSense interfaces listed in the [dependency guide](https://github.com/ZuomingWang/MobileAutomationRobot/blob/main/docs/dependencies.md).

<p class="ma-code-links">
Explore the <a href="https://github.com/ZuomingWang/MobileAutomationRobot">complete repository</a>, the <a href="https://github.com/ZuomingWang/MobileAutomationRobot/blob/main/README.md">setup guide</a>, or the <a href="https://github.com/ZuomingWang/MobileAutomationRobot/blob/main/tests/testCoreFunctions.m">deterministic test suite</a>.
</p>

## Engineering Lessons

- A known map can still require online reasoning when some structures are conditional.
- Landmark geometry is most useful when it sharply narrows a depth-based pose search.
- Path post-processing matters on a physical robot; sparse tree vertices do not make a smooth control reference.
- A mapping trigger should lead to an explicit behavior. Here, wall confirmation stops tracking, updates the planning map, and retries the current goal.
- Logs, dependency checks, and hardware-independent tests make a competition prototype easier to inspect and reuse after the event.
