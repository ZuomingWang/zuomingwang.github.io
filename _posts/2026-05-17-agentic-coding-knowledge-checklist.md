---
layout: distill
title: "Agentic coding checklist"
date: 2026-05-17 00:00:00-0500
description: "“A computer lets you make more mistakes faster than any invention in human history.” — Mitch Ratcliffe"
tags: ai-engineering
categories: ai-engineering
featured: false
site_owned: true
giscus_comments: false
related_posts: false
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Northwestern University
toc:
  - name: Why This Checklist Exists
  - name: How To Use This Checklist
  - name: Core Concepts
  - name: Context and Memory
  - name: Permissions and Hooks
  - name: Delegation Rules
  - name: Workflow Playbooks
  - name: System Design Checklist
  - name: Judgment Checklist
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

  .agent-note {
    border-left: 4px solid var(--global-theme-color);
    background: color-mix(in srgb, var(--global-theme-color) 8%, transparent);
    padding: 0.9rem 1rem;
    margin: 1.25rem 0;
    border-radius: 6px;
  }

  .agent-note strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .agent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 0.8rem;
    margin: 1rem 0 1.5rem;
  }

  .agent-card {
    border: 1px solid var(--global-divider-color);
    border-radius: 6px;
    padding: 0.85rem 0.95rem;
    background: var(--global-bg-color);
  }

  .agent-card strong {
    display: block;
    margin-bottom: 0.35rem;
  }

  .agent-card p {
    margin-bottom: 0;
  }

  .compact-table table {
    font-size: 0.92rem;
  }

  .compact-table td,
  .compact-table th {
    vertical-align: top;
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
---

## Why This Checklist Exists

Research environments run on messy code and fragile scripts.

Coding agents can easily automate this work, but they confidently produce plausible yet scientifically wrong results.

This checklist is a field reference for what to delegate, what to verify, and when to slow down.

<div class="agent-note">
  <strong>Central idea</strong>
  Vibe coding means expressing intent, constraints, verification, and review. The central skill is engineering judgment.
</div>

## How To Use This Checklist

Use this page as a working reference rather than a linear essay.

<div class="agent-grid">
  <div class="agent-card">
    <strong>Before starting</strong>
    <p>Define the source of truth, the allowed edit surface, and the verification target.</p>
  </div>
  <div class="agent-card">
    <strong>While the agent works</strong>
    <p>Keep context small, move noisy exploration away from the main conversation, and request summaries.</p>
  </div>
  <div class="agent-card">
    <strong>Before accepting output</strong>
    <p>Inspect the diff, rerun checks, and verify assumptions instead of trusting the final summary.</p>
  </div>
  <div class="agent-card">
    <strong>After finishing</strong>
    <p>Move durable rules, commands, environment notes, and known traps into the repository.</p>
  </div>
</div>

<div class="compact-table" markdown="1">

| Situation                    | Agent can help with                | Human must own                        |
| :--------------------------- | :--------------------------------- | :------------------------------------ |
| Utility script               | Implementation, tests, cleanup     | Requirements and edge cases           |
| Data pipeline                | Parsing, refactoring, validation   | Meaning of columns and exclusions     |
| Figure generation            | Code, styling, reproducibility     | Scientific interpretation             |
| Literature notes             | Summaries, organization            | Citation accuracy and claims          |
| Instrument or lab automation | Drafting wrappers, logging, checks | Safety, calibration, and raw data     |
| Manuscript or proposal text  | Structure, clarity, editing        | Novelty, evidence, and responsibility |

</div>

## Core Concepts

The names vary across tools, but the boundaries matter more than the labels.

<div class="compact-table" markdown="1">

| Concept                               | Meaning                                            | Best use                                                | Watch out for                                      |
| :------------------------------------ | :------------------------------------------------- | :------------------------------------------------------ | :------------------------------------------------- |
| Slash command                         | A manually triggered prompt wrapper                | Legacy one-step command wrappers                        | New reusable behavior should usually be a skill    |
| Skill                                 | Reusable instructions loaded into the current task | Repeated procedures and house style                     | Does not create an isolated worker                 |
| Agent / sub-agent                     | Delegated worker with its own context              | Bounded subtasks with many tool calls                   | Poor fit for interactive or vague tasks            |
| Agent team                            | Multiple persistent agents that coordinate         | Long-running multi-role work                            | Higher debugging and context-management cost       |
| MCP                                   | Standard interface for tools/resources/prompts     | Structured access to external systems                   | Overkill for simple local commands                 |
| Hook                                  | Deterministic callback around tool use             | Rules that must be enforced even if the model forgets   | Not a substitute for task-level reasoning          |
| Plugin                                | Packaged skills, agents, hooks, tools, and config  | Shared team or lab capabilities                         | Too heavy for one small project instruction        |
| Memory                                | Long-lived user or project facts                   | Stable preferences and recurring project facts          | Bad place for secrets or temporary debugging state |
| Deferred tools / ToolSearch           | On-demand loading of tool schemas                  | Large tool surfaces where most tools are irrelevant     | First use may require an extra discovery step      |
| `AGENTS.md` / `CLAUDE.md`-style files | Repository-level persistent instructions           | Rules that should apply to every session in the project | Personal or one-time instructions                  |

</div>

<div class="agent-grid">
  <div class="agent-card">
    <strong>Skill</strong>
    <p>How should the agent do this kind of task?</p>
  </div>
  <div class="agent-card">
    <strong>Agent</strong>
    <p>Can a separate worker investigate or implement this bounded subtask?</p>
  </div>
  <div class="agent-card">
    <strong>MCP</strong>
    <p>How does the agent safely access an external system?</p>
  </div>
  <div class="agent-card">
    <strong>Hook</strong>
    <p>What rule should be enforced even if the model forgets?</p>
  </div>
  <div class="agent-card">
    <strong>Plugin</strong>
    <p>How do we package this for a group?</p>
  </div>
</div>

## Context and Memory

Treat context as working memory for the task, not as storage. Good context has high signal-to-noise.

<div class="compact-table" markdown="1">

| Context type      | Include                                                     | Avoid                                                       |
| :---------------- | :---------------------------------------------------------- | :---------------------------------------------------------- |
| Goal              | Exact task, expected output, definition of done             | Broad intent without a stopping point                       |
| Files             | Relevant paths, known entry points, small excerpts          | Repeated full-file dumps the agent has already inspected    |
| Logs              | Failing command, error frame, last useful lines             | Full logs when the last 40 lines are enough                 |
| Constraints       | Files not to touch, raw-data boundaries, style requirements | Hidden rules stated only after the agent has already edited |
| Verification      | Test command, benchmark, expected figure, sanity check      | "Looks good" as the only acceptance standard                |
| Scientific claims | Protected assumptions, units, labels, provenance boundaries | Asking the agent to infer the scientific standard alone     |

</div>

<div class="compact-table" markdown="1">

| Knowledge type                              | Durable home                                   |
| :------------------------------------------ | :--------------------------------------------- |
| Team-wide project rules                     | `AGENTS.md`, `CLAUDE.md`, or project docs      |
| Personal preferences                        | Local config or personal memory                |
| One-time task details                       | Current conversation                           |
| Repeated workflow                           | Script, skill, or plugin                       |
| Sensitive information                       | Outside the agent unless policy says otherwise |
| Raw data provenance                         | Repository docs, data registry, or lab record  |
| Known benchmark or expected scientific fact | Tests, notebooks, docs, or fixtures            |

</div>

<div class="agent-note">
  <strong>Compaction rule</strong>
  After compaction or a long session, assume detailed tool outputs may be gone. Preserve the current goal, decisions already made, important file paths, command outcomes, and durable project rules in files rather than only in chat.
</div>

## Permissions and Hooks

Permissions should match risk. The exact mode names vary by tool, but the operating principle is stable.

<div class="compact-table" markdown="1">

| Mode or behavior    | Practical meaning                       | Best fit                                  |
| :------------------ | :-------------------------------------- | :---------------------------------------- |
| Plan / read-only    | Agent can inspect but not edit          | Review, architecture, analysis design     |
| Default ask mode    | Agent asks before unfamiliar operations | New project or shared repository          |
| Accept edits        | Local edits are allowed                 | Fast iteration on a branch                |
| Auto classification | Tool decides which actions are safe     | Low-risk work with a trusted setup        |
| Strict allowlist    | Only approved tools/actions run         | Sensitive data or production-like systems |
| Bypass permissions  | Broad access                            | Disposable sandbox only                   |

</div>

<div class="compact-table" markdown="1">

| Hook use case         | Deterministic rule                                 |
| :-------------------- | :------------------------------------------------- |
| Formatting            | Run formatter after code edits                     |
| Tests and lint        | Run relevant checks after source changes           |
| Raw data protection   | Block edits to protected data paths                |
| Secret protection     | Block edits to `.env` and credential files         |
| Destructive commands  | Require confirmation before risky shell operations |
| Long-running tasks    | Notify when the agent becomes idle                 |
| Shared infrastructure | Log tool use for audit                             |

</div>

<div class="agent-note">
  <strong>Safety boundary</strong>
  Agents may edit derived files, scripts, and drafts. They should not overwrite raw data, send emails, submit jobs, push branches, delete files, or touch shared resources without explicit confirmation. They should not be trusted to decide whether a scientific result is valid.
</div>

## Delegation Rules

Delegation is useful only when it reduces noise or unlocks parallel work. If it hides reasoning you still need, keep the work in the main conversation.

<div class="compact-table" markdown="1">

| Work pattern        | Use the main conversation when                       | Use a sub-agent when                                          |
| :------------------ | :--------------------------------------------------- | :------------------------------------------------------------ |
| Tool count          | One to three tool calls are enough                   | Many file reads, searches, logs, or test outputs are expected |
| Path knowledge      | The relevant file path is already known              | The relevant files need to be discovered                      |
| Decision dependency | The next decision depends on details you need to see | A concise summary is enough for the next step                 |
| User interaction    | The task may need repeated clarification             | The task can run independently                                |
| Critical path       | You can inspect or fix it faster locally             | It can run in parallel with other bounded work                |

</div>

<div class="compact-table" markdown="1">

| Need                                     | Best tool pattern    |
| :--------------------------------------- | :------------------- |
| Repeat a procedure                       | Skill                |
| Explore a large codebase                 | Sub-agent            |
| Compare several independent approaches   | Multiple sub-agents  |
| Enforce a hard rule                      | Hook                 |
| Access external structured data          | MCP tool/server      |
| Share workflows across a team            | Plugin               |
| Remember stable project knowledge        | Repo guide or memory |
| Make a high-impact irreversible decision | Ask the human        |

</div>

## Workflow Playbooks

### New Feature or Analysis Script

<div class="compact-table" markdown="1">

| Phase                 | Action                                                             |
| :-------------------- | :----------------------------------------------------------------- |
| Before implementation | Define the objective and identify the source of truth              |
| Before implementation | Ask the agent to inspect before editing                            |
| Before implementation | Request a short plan and expected files to change                  |
| Before implementation | Define the verification command or acceptance output               |
| During implementation | Keep the change small and follow existing project patterns         |
| During implementation | Ask for tests, fixtures, or reproducible examples when useful      |
| During implementation | Avoid unrelated refactors and keep raw data read-only              |
| Before accepting      | Review the diff and run the relevant checks                        |
| Before accepting      | Check dimensions, units, labels, assumptions, and hidden filtering |
| Before accepting      | Save durable notes in the repository                               |

</div>

### Debugging

<div class="compact-table" markdown="1">

| Phase     | Action                                                                     |
| :-------- | :------------------------------------------------------------------------- |
| Reproduce | Capture the exact failing command and error                                |
| Reproduce | Make a minimal failing test or fixture when possible                       |
| Diagnose  | Ask the agent to trace the failure path before patching                    |
| Diagnose  | Separate symptoms from hypotheses                                          |
| Fix       | Change one causal thing at a time                                          |
| Fix       | Rerun the failing case and add a regression test if the bug matters        |
| Escalate  | Stop if the agent repeats the same failed strategy                         |
| Escalate  | Ask for hypotheses rather than patches, then switch to read-only diagnosis |

</div>

### Code Review

<div class="compact-table" markdown="1">

| Review layer    | What to inspect                                                          |
| :-------------- | :----------------------------------------------------------------------- |
| Behavior        | Regressions, changed assumptions, hidden data transformations            |
| Tests           | Missing coverage, weak fixtures, tests rewritten to match implementation |
| Safety          | Data corruption risks, broad permissions, external side effects          |
| Maintainability | Over-abstraction, excessive comments, style drift                        |
| Security        | Injection, unsafe file operations, secret handling, dependency risk      |
| Evidence        | Whether the output supports the claim                                    |
| Human judgment  | Whether the code answers the actual question, not only the visible test  |

</div>

### Manuscripts, Notes, and Citations

<div class="compact-table" markdown="1">

| Agent-friendly work                | Hard boundary                                   |
| :--------------------------------- | :---------------------------------------------- |
| Turn rough notes into an outline   | Do not allow invented citations                 |
| Rewrite for clarity                | Verify every reference                          |
| Build a missing-evidence checklist | Check numbers against source data               |
| Summarize a provided document      | Keep claims tied to evidence                    |
| Draft a methods paragraph          | Treat generated prose as a draft, not authority |

</div>

### Team Workflow

<div class="compact-table" markdown="1">

| Level      | Shared habit                                                         |
| :--------- | :------------------------------------------------------------------- |
| Repository | Add a short agent guide                                              |
| Repository | Document environment setup, data layout, protected paths, and tests  |
| Repository | Document figure-generation commands and known fragile assumptions    |
| Team       | Turn repeated prompts into skills                                    |
| Team       | Turn repeated manual steps into scripts                              |
| Team       | Use hooks for formatting and safety                                  |
| Team       | Use MCP only when structured external access is worth the complexity |
| Team       | Review agent-created code like any other contribution                |

</div>

## System Design Checklist

Use these questions when designing shared agentic infrastructure.

<div class="compact-table" markdown="1">

| System                         | Design questions                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agentic low-code or automation | What is the source of truth: generated code, visual workflow, or DSL?<br>Can every agent change be diffed, reviewed, and reverted?<br>Are raw and derived data separated?<br>Are read, write, delete, and submit permissions distinct?<br>Can failures be replayed?<br>Are costs and runtimes visible before long tasks start?<br>Are users asked at high-impact decision points?<br>Does the platform reduce typing without removing human judgment? |
| Internal MCP gateway           | Who can list which tools?<br>Are dangerous tools hidden from users without permission?<br>Are tool calls logged with user, agent id, parameters, latency, and response size?<br>Are sensitive fields redacted before returning to the agent?<br>Are rate limits and concurrency limits enforced?<br>Do failed backend services return structured errors?<br>Are tool schemas versioned?<br>Are tenants, projects, or teams isolated?                  |
| Security review agent          | Does it inspect enough context beyond the diff?<br>Does it stay read-only?<br>Does it distinguish severity levels?<br>Does it explain why something is unsafe?<br>Does it avoid running attack-like commands unless explicitly authorized?<br>Can a second model or human cross-check high-risk findings?<br>Does it prefer useful false positives over silent misses in sensitive code?                                                              |
| Long-term memory               | Does it remember stable coding preferences, project conventions, repeated user corrections, important paths, commands, and environment quirks?<br>Does it avoid secrets, temporary debugging state, one-time messages, stale facts, and sensitive data?<br>Can users merge duplicates, delete stale entries, scope project knowledge, and review memory content?                                                                                      |

</div>

## Judgment Checklist

Use this matrix before trusting an agent's work.

<div class="compact-table" markdown="1">

| Area               | Questions to answer before accepting output                                                                                                                                                                                                        |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Context            | Did I give the smallest sufficient context?<br>Did I identify the source of truth?<br>Did I avoid burying the key constraint?<br>Did I save durable knowledge outside the chat?                                                                    |
| Delegation         | Was this task small enough for the main conversation?<br>If I used a sub-agent, was the task bounded?<br>Did the delegated work return a useful summary?<br>Did I avoid delegating an urgent blocking decision?                                    |
| Verification       | Is there a test, benchmark, figure, checksum, or sanity check?<br>Did the relevant verification actually run?<br>Are units, labels, dimensions, and row counts correct?<br>Did the agent change the test to match its implementation too narrowly? |
| Permissions        | Is the action reversible?<br>Does it affect shared systems?<br>Could it modify raw data?<br>Could it send information outside the project?<br>Should a human confirm before proceeding?                                                            |
| Research integrity | Does the output support the claim?<br>Are citations real and checked?<br>Are assumptions explicit?<br>Can the result be reproduced from the repository?<br>Would I be comfortable explaining this workflow in a group meeting?                     |

</div>

<div class="agent-note">
  <strong>Final rule</strong>
  Use agents to move faster through mechanical work. Slow down wherever the result becomes evidence.
</div>
