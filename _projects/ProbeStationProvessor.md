---
layout: distill
title: Probe Station Processor
description: Voltage-Current Data Processing Tool for Molecular Electronics
img: assets/img/projects_probe_station_processor/demo_thumbnail.webp
video: assets/video/probe_station_processor_demo.mp4
importance: 1
category: work
related_publications: false
date: 2023-05-22 09:00:00-0500
bibliography: probe-station-processor.bib
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Guangdong Technion
toc:
  - name: Overview
  - name: Input Files
  - name: Processing Steps
  - name: Output Files
  - name: Usage Instructions
  - name: Additional Notes
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
  d-article img,
  d-article video {
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

  .psp-media {
    grid-column: text;
    margin: 1.25rem auto 1.8rem;
  }

  .psp-media img,
  .psp-media video {
    display: block;
    width: 100%;
    height: auto;
    margin: 0 auto;
    object-fit: contain;
    background-color: var(--global-card-bg-color);
  }

  .psp-media-hero img {
    max-width: 680px;
  }

  .psp-media-pair {
    grid-column: page;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.2rem;
    align-items: center;
    max-width: 900px;
  }

  .psp-media-pair img,
  .psp-media-pair video {
    max-height: 360px;
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

    .psp-media-pair {
      grid-template-columns: 1fr;
    }
  }
---

<div class="psp-media psp-media-hero">
<img src="https://github.com/user-attachments/assets/d7ed0973-76d3-4734-aa92-26364d391329" alt="image">
</div>

## Overview

The `ME.ipynb` script is a Jupyter Notebook designed to process voltage-current (I-V) data from probe station measurements of large-area molecular tunnel junction. It performs the following tasks:

- Reads multiple CSV files containing raw I-V data.
- Corrects instrumental offsets by adjusting current values to pass through (0,0).
- Merges data from multiple files into a single dataset.
- Filters I-V curves based on user-defined rectification factor ranges.
- Converts current units from amperes (A) to microamperes (µA).
- Generates two output CSV files formatted for analysis in Origin software:
  - One with voltage and current data for selected repeats.
  - Another with calculated transition voltage spectra.

This tool streamlines the analysis of large I-V datasets for researchers.

## Input Files

The script processes CSV files with the following structure:

- **Columns**:
  - `REPEAT`: Integer identifier for each measurement cycle.
  - `TIME(sec)`: Float timestamp of the measurement in seconds.
  - `VOLTAGE(V)`: Float applied voltage in volts, typically ranging from -1.06V to 1.00V (except in `3.csv`, which starts at -1.04V).
  - `CURRENT(A)`: Float measured current in amperes.

- **Format**: Each file includes a "START TIME" header followed by multiple repeats of voltage sweeps, with approximately 102 data points per repeat.

### Example Input Files

- **`1.csv`**:
  - Start Time: 2022-08-22 22:17:10
  - Repeats: At least 50 (full count not shown due to truncation)
  - Voltage Range: -1.06V to 1.00V

- **`2.csv`**:
  - Start Time: 2022-08-22 22:19:30
  - Repeats: Up to 500
  - Voltage Range: -1.06V to 1.00V

- **`3.csv`**:
  - Start Time: 2022-08-22 22:41:03
  - Repeats: Up to 600
  - Voltage Range: -1.04V to 1.00V

**Note**: The number of repeats varies across files, and the script accommodates this variability.

## Processing Steps

The script executes the following operations:

1. **Data Reading**:
   - Loads user-specified CSV files (e.g., `1.csv`, `2.csv`, `3.csv`).

2. **Offset Correction**:
   - Adjusts current values for each repeat to ensure the current at `VOLTAGE = 0V` is zero by subtracting the current at `VOLTAGE = 0V`.

3. **Data Merging**:
   - Combines data from all input files into a single dataset, retaining repeat identifiers.

4. **Voltage Filtering**:
   - Truncates the voltage range to [-1V, 1V], resulting in approximately 101 data points per repeat with 0.02V steps.

5. **Rectification Factor Calculation**:
   - Computes the rectification factor as `abs(I at 1V / I at -1V)` for each repeat.

6. **Curve Filtering**:
   - Selects repeats within a user-defined rectification factor range (e.g., 1.1 to 1.4).

7. **Unit Conversion**:
   - Converts current from amperes (A) to microamperes (µA) by multiplying by 1,000,000.

8. **Output Generation**:
   - Produces two CSV files:
     - **`rf_<min>_<max>_n<total>_forOrigin.csv`**: Voltage and current (µA) for selected repeats.
     - **`rf_<min>_<max>_n<total>_forOrigin2.csv`**: Transition voltage spectra calculated as `abs(VOLTAGE(V)^2 / CURRENT(µA)) * area * 10^6`, where `area = 1.59e-5`.

## Output Files

For each rectification factor range, the script generates:

1. **`rf_<min>_<max>_n<total>_forOrigin.csv`**:
   - **Structure**: 101 rows (voltage from -1.0V to 1.0V) and columns for each selected repeat's current (µA).
   - **Units**: Voltage in volts (V), Current in microamperes (µA).

2. **`rf_<min>_<max>_n<total>_forOrigin2.csv`**:
   - **Structure**: 101 rows with calculated values for each selected repeat.
   - **Units**: Voltage in volts (V), Calculated values in unspecified units.

**Example**: For a range of 1.1 to 1.4 with 52 repeats:
- `rf_1.1_1.4_n52_forOrigin.csv`
- `rf_1.1_1.4_n52_forOrigin2.csv`

## Usage Instructions

### Prerequisites
- **Python**: Version 3.9.6 or compatible.
- **Libraries**: `pandas`, `os`, `sys`.
- **Installation**:
  ```bash
  pip install pandas
  ```

### Steps to Run
1. **Prepare Files**:
   - Place input CSV files in the same directory as `ME.ipynb`.

2. **Launch the Script**:
   - Open `ME.ipynb` in Jupyter Notebook or a compatible IDE.
   - Run all cells sequentially.

3. **Interact with Prompts**:
   - **Input File Names**: Enter base names (e.g., `1`, `2`, `3`), pressing Enter after each. Press Enter without input to finish.
   - **Rectification Factor Range**: Enter min and max values (e.g., `1.1` and `1.4`). Review selected repeats, then press Enter to accept or Space+Enter to adjust.
   - **Output Base Name**: Provide a base name (e.g., `output`). The script appends details and suffixes.
   - **Restart Option**: Type `y` to restart or `n` to exit after completion.

4. **Verify Outputs**:
   - Check the generated CSV files in the working directory.

## Additional Notes

- **Voltage Range**: The script truncates to [-1V, 1V]. Ensure input data includes this range. Note `3.csv` starts at -1.04V, slightly affecting the lower bound.
- **Area Constant**: Uses `1.59e-5` in calculations; adjust if needed for different setups.
- **File Consistency**: Input files must follow the described column structure. Variations may cause errors.
- **Large Datasets**: Efficiently handles files with hundreds of repeats (e.g., `3.csv` with 600 repeats).

For support, refer to the script's comments or contact the author.

**GitHub Repository**: [https://github.com/ZuomingWang/ProbeStationIVProcessor/tree/main](https://github.com/ZuomingWang/ProbeStationIVProcessor/tree/main)

<div class="psp-media psp-media-pair">
<video src="/assets/video/probe_station_processor_demo.mp4" poster="/assets/img/projects_probe_station_processor/demo_thumbnail.webp" autoplay loop muted playsinline preload="metadata" aria-label="Probe Station Processor demo"></video>
<img src="https://github.com/user-attachments/assets/79093ca4-ab1b-4f0c-8db0-9a1993e1da02" alt="image" loading="lazy" decoding="async">
</div>
