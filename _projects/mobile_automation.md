---
layout: page
title: MobileAutomationRobot
description: Robot Localization and Navigation System
img: assets/img/projects_mobile_automation/Picture12.png
importance: 2
category: fun
related_publications: false
---

<div class="row justify-content-center">
    <div class="col-sm-6 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture12.png" title="Mobile Automation Robot" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

## Author
- **Name**: Zuoming Wang
- **Date**: 30th April 2025

## Overview

This project aims to localize the robot using its bumping and depth sensors, produce a correct map, and navigate the environment to visit multiple waypoints. The MobileAutomationRobot system integrates advanced robotics algorithms for autonomous navigation including:

- Extended Kalman Filter (EKF) and Particle Filter (PF) for localization
- Simultaneous mapping using bumping and depth sensors
- Potential field navigation and Rapidly-exploring Random Tree (RRT) path planning
- Real-time sensor fusion and environment mapping
- Multi-waypoint navigation with obstacle avoidance
- Parameter tuning and optimization algorithms

This comprehensive robotics system demonstrates state-of-the-art techniques in mobile robot autonomy and navigation.

## System Components

The robot system consists of several integrated components:

### (1) Robot Sensors
The robot is equipped with bumping and depth sensors for environment perception and obstacle detection.

<div class="row justify-content-center">
    <div class="col-sm-6 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture2.png" title="Robot Sensors" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

- **Bumping Sensors**: Contact-based collision detection for boundary identification
- **Depth Sensors**: Distance measurement for obstacle avoidance and mapping
- **Sensor Fusion**: Integration of multiple sensor modalities for robust perception

### (2) Localization
The system implements two complementary localization algorithms:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture3.png" title="EKF Localization" class="img-fluid rounded z-depth-1" style="height: 300px; object-fit: contain;" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture4.png" title="Particle Filter" class="img-fluid rounded z-depth-1" style="height: 300px; object-fit: contain;" %}
    </div>
</div>

<div class="row justify-content-center">
    <div class="col-sm-6 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture5.png" title="Localization Results" class="img-fluid rounded z-depth-1" style="height: 300px; object-fit: contain;" %}
    </div>
</div>

- **Extended Kalman Filter (EKF)**: Gaussian-based state estimation with linearized motion models
- **Particle Filter (PF)**: Monte Carlo localization for non-Gaussian distributions
- **Comparative Analysis**: Performance evaluation under different environmental conditions

### (3) Mapping
Simultaneous Localization and Mapping (SLAM) using sensor data:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture6.jpg" title="Mapping Process" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture7.jpg" title="Generated Map" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

- **Occupancy Grid Mapping**: Probabilistic representation of free and occupied space
- **Sensor Integration**: Fusion of bumping and depth sensor data
- **Dynamic Updates**: Real-time map refinement during exploration

### (4) Path Planning
Advanced navigation algorithms for efficient waypoint traversal:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture8.png" title="Potential Field Navigation" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture9.png" title="RRT Planning" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

- **Potential Field Navigation**: Attractive and repulsive force-based path generation
- **RRT (Rapidly-exploring Random Tree)**: Sampling-based path planning for complex environments
- **Obstacle Avoidance**: Dynamic trajectory adjustment for collision-free navigation

### (5) Tuning and Optimization
System parameter optimization and performance enhancement:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture10.png" title="Parameter Tuning" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture11.png" title="Performance Analysis" class="img-fluid rounded z-depth-1" style="height: 250px; object-fit: contain;" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture12.png" title="Final Results" class="img-fluid rounded z-depth-1" style="height: 100px; object-fit: contain;" %}
    </div>
</div>

- **Filter Parameter Optimization**: Tuning of EKF and PF parameters for optimal performance
- **Navigation Gain Adjustment**: Fine-tuning of potential field and RRT parameters
- **Performance Metrics**: Evaluation of localization accuracy and navigation efficiency

## Technical Implementation

### Localization Algorithms

**Extended Kalman Filter (EKF)**:
- State vector includes position (x, y) and orientation (θ)
- Process model incorporates wheel odometry and sensor measurements
- Covariance update handles uncertainty propagation

**Particle Filter (PF)**:
- Monte Carlo sampling with weighted particles
- Resampling based on sensor likelihood
- Robust to non-linear motion models and multi-modal distributions

### Mapping Framework

**SLAM Implementation**:
- Occupancy grid representation with probabilistic updates
- Bayesian inference for map cell occupancy
- Loop closure detection for map consistency

### Path Planning Strategies

**Potential Field Method**:
- Attractive potential towards goal waypoints
- Repulsive potential from obstacles and boundaries
- Gradient descent for continuous path generation

**RRT Algorithm**:
- Random sampling in configuration space
- Tree expansion towards unexplored regions
- Path smoothing and optimization


## Additional Notes

- **Robustness**: System handles sensor noise and dynamic environments
- **Scalability**: Algorithms adapt to different environment sizes and complexities
- **Modularity**: Individual components can be tested and optimized independently
- **Real-time Performance**: Optimized for embedded systems and real-time constraints


<div class="row justify-content-center">
    <div class="col-sm-6 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/projects_mobile_automation/Picture1.png" title="System Overview" class="img-fluid rounded z-depth-1" %}
    </div>
</div>