---
layout: distill
title: "30 questions to understand vibe coding"
date: 2026-05-18 09:00:00-0500
description: '“I would rather have questions that can''t be answered than answers that can''t be questioned.” ― Richard Feynman'
tags: ai-engineering
categories: ai-engineering
featured: false
site_owned: true
giscus_comments: false
related_posts: false
bibliography: 30-questions-to-understand-vibe-coding.bib
authors:
  - name: Zuoming Wang
    url: "https://zuomingwang.github.io/"
    affiliations:
      name: Northwestern University
toc:
  - name: Introduction
  - name: I. A Framework for Judgment
  - name: II. Core Toolbox
  - name: III. Context, Permissions, and Memory
  - name: IV. Everyday Workflow
  - name: V. Team Collaboration and System Design
  - name: VI. Discussion
  - name: "Appendix: Learning Path"
  - name: References
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
---

## Introduction

AI integration once destroyed our [robotics project](/projects/mobile_automation/) by turning small code changes into system-level inconsistencies across module dependencies.

Nature reported an autonomous agent that claimed to discover materials, yet fundamentally misinterpreted XRD data by skipping statistical database validation <d-cite key="peplow2023robot"></d-cite>. I discussed the technical issue in my [XRD phase-identification note](/blog/2025/xrd-phase-identification-good-fit/).

AI can destroy workflows, and it can fail at cross-disciplinary tasks due to a lack of domain expertise. These 30 questions offer a framework for understanding AI workflows while keeping engineering work meticulous and reliable.


## I. A Framework for Judgment

> Context, proactivity, long-running tasks, failure loops, and career.

### Q1. Is "Vibe Coding" hype or a paradigm shift?

One school of thought suggests that vibe coding is essentially just smarter auto-complete. In complex projects, AI agents still make rookie mistakes and the long-term maintenance costs are often heavily underestimated.

Another perspective argues that it represents a fundamental shift in programming paradigms. The unit of development is moving from lines of code and functions to intents and constraints. This shifts the engineer's role from a typist to an architect and reviewer. From this viewpoint, the traditional bottleneck of software delivery is finally being broken.

A more balanced stance is that vibe coding does bring a paradigm shift but it is not a direct replacement for humans. It amplifies the capabilities of high-level engineers because they excel at writing solid specs and conducting rigorous reviews. Conversely, it also amplifies the destructive power of lower-level developers since they can now pump out garbage code at unprecedented speeds.

The next-level questions worth asking are about where knowledge should actually live if agents are writing the code. Does it belong in a repository's instruction files or in the human brain? Will the role of code reviewer become significantly more important than code writer? And how will tech education, entry barriers, and junior roles evolve as a result?

### Q2. Why should we "keep context simple"? Isn't an information-stuffed prompt better?

Keeping the context simple is crucial because attention is a finite resource. An LLM's attention mechanism does not distribute focus evenly across all data; too much irrelevant information dilutes the weight of core instructions and triggers the well-known "lost in the middle" phenomenon.

Second, longer contexts mean higher token costs and increased inference latency. Because every inference cycle calculates and bills based on the full context, a bloated context directly increases both latency and cost.

Furthermore, a simple context is vastly easier to debug. When things break, a short context makes it straightforward to pinpoint exactly which instructions are clashing; with a massive context, post-mortems are nearly impossible. It's also much easier to iterate on: the simpler the content, the easier it is to update, replace, and reorganize. Otherwise, a complex context quickly degenerates into a messy pile of spaghetti.

To be clear, "simple" doesn't mean "lacking information", it means a "high signal-to-noise ratio." The goal is to give the agent exactly what it needs to know, rather than cramming in every single piece of tangentially related data.

### Q3. Should an agent be "proactive" or "reactive"? When should it ask the user, and when should it decide on its own?

The first criterion is reversibility. Editing a local file is usually reversible, so an agent can often decide on its own. Pushing, deleting, sending email, or changing shared state is not safely reversible, so the agent should ask first.

The second criterion is blast radius. Operations confined to the local machine can allow more autonomy. Operations that affect shared systems, such as CI, PRs, or Slack, should require confirmation. The third criterion is uncertainty: when the agent is genuinely unsure, it should ask instead of guessing. The fourth is user availability. If the user is online, the agent can ask about important forks in the road; if the task is running in the background, it should make conservative choices.

A good agent is neither one that asks nothing nor one that asks everything. It asks at the right level: major decision points should be explicit, while minor implementation details should not constantly interrupt the workflow.

### Q4. "I let an agent run all night, and now I do not understand what it did." Is that a problem with the agent or the user?

There are two responsibilities here. Observability is the tool's responsibility. An agent should be able to produce an auditable record: file diffs, command logs, and the major decision points. Understanding is the user's responsibility. Even with good tooling, no one can review a thousand overnight tool calls line by line. The boundary has to be set before the task starts, for example by using a `plan` permission mode or by restricting the agent to a clearly defined subtask.

The longer an autonomous task runs, the more it needs constraints and checkpoints. Letting an agent run freely overnight and expecting to audit the results the next day is very risky. In extreme cases, an unsupervised agent running a long loop is essentially an unsupervised junior engineer with sudo access, which is not acceptable in production.

### Q5. If an agent repeatedly fails to fix a bug, should you let it keep trying, or should you shut it down and take over?

If the agent is cycling through the same class of wrong solution, the context is probably already polluted. More attempts are unlikely to help. The token budget already spent is not the relevant metric. The question is whether another round has a good chance of solving the problem at an acceptable cost. If not, stop.

When an agent gets stuck, the issue is often not a sudden collapse in reasoning ability. It is usually missing information. A better intervention is to provide that information: logs, documentation, a failing test, or a precise counterexample. Letting it keep guessing usually deepens the failure loop. A useful habit is to set an explicit limit, such as taking over after three failed repair attempts.

Ultimately, an agent is an amplifier, not a replacement. When it amplifies a correct direction, it can be very effective. When it amplifies a dead end, continuing to use it only makes the failure loop longer.

## II. Core Toolbox

> Command, skill, agent, MCP, plugin, and ToolSearch.

### Q6. What is a `/command`? What is the difference between a command and a skill? When should we use a command (which is now deprecated) versus a skill?

`/command`, or Slash Command, was an early extension mechanism in Claude Code. A user could place `.md` files under `.claude/commands/` and invoke them by typing `/command-name` in the conversation.

Conceptually, a command is a prompt fragment that the user explicitly calls. In Claude Code, `/command` has now been officially marked as deprecated and replaced by skill.

A skill is the newer extension mechanism. It usually lives at `.claude/skills/<name>/SKILL.md`, though it can also live in `~/.claude/skills/` or inside a plugin. The key difference is that a skill can be selected by the model itself. If its YAML frontmatter has a good `description`, Claude can decide semantically when to activate it; the user does not need to type a slash command every time.

Skills also support attached files. A skill directory can contain scripts, reference documents, and templates. Skills have lifecycle behavior as well: during `/compact`, skill descriptions are re-injected, usually with the first 5K tokens per skill and a global 25K token budget. Skill frontmatter can also express finer control through fields such as `allowed-tools`, `disable-modelinvocation`, `paths`, `effort`, and `model`.

In practice, almost every new use case should prefer skill, especially if you want the model to trigger it automatically at the right moment, or if you need to attach scripts and examples. Commands only make sense in a few niche scenarios: legacy team assets, or highly deterministic, one-line prompt wrappers that must be explicitly triggered by a human. For new projects, however, ditching commands is highly recommended.

### Q7. What is an agent? When do we use an agent, and when do we use a skill?

An agent, or sub-agent, is a smaller Claude with its own system prompt, context window, and tool allowlist. In Claude Code, it is defined through `.claude/agents/<name>.md` and dispatched from the main conversation through the Agent tool. When the sub-agent finishes, it returns only a summary. Its intermediate tool output does not pollute the main context.

A skill is different. It is a set of instructions or procedures for the model to read inside the current conversation. It does not create a separate context; it shapes what Claude does next.

The core distinction is:

| Dimension | Skill | Agent |
| :--- | :--- | :--- |
| Context | Shares the main context | Uses an independent context |
| Invocation cost | Low: injected text | High: a full inference loop |
| Best for | Guidance, conventions, checklists, and "how to do this" procedures | Subtasks with many tool calls or noisy outputs |
| Result | Changes the behavior of the main conversation | Returns a summary |

Think of the decision rule like this: If a task will produce a large amount of tool output, such as reading dozens of files, running tests, or collecting logs, use an agent to protect the main context. If the task is fundamentally teaching Claude a protocol, like "always run the linter before committing," write it as a skill.

Read-only exploration and search are good fits for built-in agents such as `Explore`. Conversely, if a task requires multi-step design where future decisions rely on preserving the full train of thought, avoid spinning up an agent. Let the main chat handle it natively.

### Q8. What is a sub-agent? Can sub-agents communicate with each other?

The definition of a sub-agent is covered in Q7. Its defining traits are: independent context + isolated toolset + returning only a summary.

By default, sub-agents cannot talk directly to one another. Claude Code uses a star topology: every sub-agent communicates only with the main conversation, and the main conversation acts as the hub that forwards information when needed.

The experimental Agent Teams feature introduces a different paradigm. By enabling `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, the system provides a SendMessage tool, allowing peer agents to DM each other directly using their IDs. However, this is a distinct operational model, which we'll dive into in Q9.

The rationale behind the default star-topology design is to force information to converge back to the main chat. This ensures that the state remains traceable and auditable. It also prevents uncontrolled loops between agents.

### Q9. What is the biggest difference between an Agent Team and a sub-agent?

A Sub-agent is like hiring a temp worker to do one specific job and report back. It is one-off, star-shaped, and report-driven: the main conversation assigns a task, the sub-agent executes it, returns a summary, and is then destroyed.

An Agent Team is more like forming a longer-lived team whose members can speak to one another. It is persistent, communicative, and better suited to parallel work. Each teammate has its own persistent context and can send messages directly with `SendMessage(to=<agent_id>, message=...)`. This model fits situations where multiple long-lived roles proceed in parallel, such as a frontend engineer, a backend engineer, and a reviewer working at the same time.

The main differences are topology, lifecycle, and state sharing. A sub-agent topology is a tree from main to child; an Agent Team is a graph among peers. A sub-agent is fire-and-forget; a teammate persists. A sub-agent returns only a final summary; teammates can discuss work back and forth while maintaining their own contexts.

Agent Team is closer to the research idea of multi-agent collaboration, but it is harder to debug and more likely to create context explosion. For most daily work, sub-agents are enough.

### Q10. Can a sub-agent spawn or derive its own sub-agents?

No. Claude Code's official documentation states that a sub-agent cannot start another sub-agent.

The restriction prevents infinite recursion. If nested agents were allowed, the depth of the agent tree would become difficult to control, and both debugging and cost management would become painful. It also enforces information convergence: summaries must return to the main conversation, so the user and the main agent retain a complete, auditable path. Finally, it avoids exponential context growth, since each nested call would create another independent context.

If a workflow needs something that resembles nested delegation, there are several alternatives. A sub-agent can use a skill to organize its own internal steps, because a skill does not create a new context. The main conversation can dispatch multiple sub-agents serially or in parallel, flattening the task. Or the workflow can use Agent Team, which gives peer-to-peer communication without nesting.

### Q11. What is MCP? How is it different from a standard API interface?

MCP, or Model Context Protocol, is an open protocol led by Anthropic. Its role is to expose external tools, resources, and prompts to LLMs in a standard format. An MCP server process can simultaneously declare what tools, resources, and prompts it offers, allowing clients (like Claude Code, Claude Desktop, or Codex) to discover and call these capabilities via a unified protocol.

To understand how it differs from a "bare API", let's look at a few dimensions:

| Dimension | Bare API | MCP |
| :--- | :--- | :--- |
| Description | Natural language and documentation, with each LLM or client writing its own adapter | Standard schema, declared once and usable by compatible clients |
| Tool discovery | The model has to be told in advance | Tools are listed automatically when the client connects |
| Authentication | Each API has its own approach | Standard OAuth 2.0, including dynamic client registration |
| Transport | Varies across HTTP APIs | Standard stdio / HTTP / SSE transports |
| Reuse | Each LLM platform rebuilds integration logic | One MCP server can serve all MCP-compatible clients |

One analogy is that an API is like a USB cable with a vendor-specific shape, while MCP is closer to USB-C: a common interface for LLM clients.

The more fundamental difference is that MCP doesn't just pass data; it is self-describing. Tool signatures, parameter schemas, write permissions, and whether user confirmation is required are all exposed in a structured way. This allows the model to logically deduce "when to call it" and "how to call it."

### Q12. What is the relationship between plugin and skill?

A Skill is a single unit of capability, usually consisting of a `SKILL.md` file plus any supplementary resources.

A plugin is a package that can be distributed. A plugin can include multiple skills, and it can also bundle sub-agent definitions, hooks (see Q19), an MCP server, an LSP server, binaries, and default settings.

A plugin describes its metadata through `.claude-plugin/plugin.json`. After installation, skills inside the plugin can be invoked with namespacing, such as `/<plugin-name>:<skill-name>`, which avoids naming conflicts between skills.

In short, a skill is a component; a plugin is a packaged extension.

### Q13. What are ToolSearch and Deferred Tools? Why are they designed this way?

ToolSearch / Deferred Tools refers to a lazy-loading strategy: at startup, the full JSON schema for MCP tools and some built-in tools is not loaded immediately. The model initially knows only the tool names. When it actually needs a tool, ToolSearch brings the corresponding schema into context.

First and foremost, this design saves tokens. A massive MCP server might pack dozens or hundreds of tools. Dumping all those schemas into the context at once could easily balloon the token count into the tens of thousands. Second, it reduces attention noise. Having irrelevant tools hanging out in the prompt long-term distracts the model's decision. Third, it enables on-demand loading: detailed tool signatures are only pulled in when they are genuinely needed.

The trade-off is an extra ToolSearch round trip the first time a tool is used. In most cases, that cost is a good trade for the token savings and reduced noise.

## III. Context, Permissions, and Memory

> Long-term stability: rules, compression, permissions, memory, and context pollution.

### Q14. What are `CLAUDE.md` and `AGENTS.md`? What are their load order and priority?

`CLAUDE.md` in Claude Code and `AGENTS.md` in Codex are project-level or user-level persistent prompt injections. They are loaded automatically when a session starts and express rules that the agent should keep in mind throughout the session.

Taking Claude Code as an example, the common load hierarchy is:

1. Managed policy: enterprise-level controls deployed by IT, not overridable.
2. User: `~/.claude/CLAUDE.md`, personal global rules.
3. Project: `./CLAUDE.md` at the repository root, project-level rules.
4. Local: `CLAUDE.local.md`, private per-project overrides, usually placed in `.gitignore`.

The golden rule of priority is: the last loaded overrides the first. For example, Project rules can override User rules, but nothing overrides the Managed Policy.

In practice, try to keep each file under 200 lines. If it gets too bloated, split it up and reference it using `@path/to/file.md`. This is not the place for a sprawling "project background introduction"; it is the place for "hard rules the agent must obey."

A good `CLAUDE.md` should not try to be an encyclopedic wiki. It should not document things the agent will naturally figure out by reading the code. It should capture information that experienced project members take for granted but new contributors would need a long time to discover.

The first rule is to prevent `CLAUDE.md` from rotting. A stale, out-of-date `CLAUDE.md` does far more damage than an empty one. Less is more.

To be precise, `CLAUDE.md` should be a quick-start guide and a list of known traps, not a project brochure.

### Q15. How should we evaluate Claude Code's `/init` feature?

The intent behind `/init` is reasonable. At the beginning of a project, it generates onboarding material, usually `CLAUDE.md`, so a short Claude Code session can understand the directory layout, technology stack, and common commands without repeated explanation from the user.

The problem is the role `CLAUDE.md` plays in the Claude Code ecosystem. It serves two purposes at once: project memory, meaning factual information, and project rules, meaning constraints. As discussed in Q14, `CLAUDE.md` enters every session as high-priority context. That makes it hard for the model to ignore and hard to overturn. Its contents are sticky.

As a project evolves, the reality of the codebase drifts away from the memories or rules captured in `CLAUDE.md`. But because this document holds such high priority, fully automating its deletion or modification is difficult. The result is that an `/init`-generated `CLAUDE.md` can rot quickly. Claude Code does have features like auto-memory or auto-dream that aim to update project memory dynamically and mitigate this.

However, I'd argue that automated project memory management is in tension with how the model is supposed to work. You are asking the model to move in two opposite directions at once. In the forward direction, it should treat `CLAUDE.md` as factual context and obey its rules. In the reverse direction, it must decide whether those facts and rules are outdated and then modify `CLAUDE.md` itself.

At the prompt hierarchy level, this resembles asking the model to perform a non-aligned action against high-priority context. Given the system-level importance of `CLAUDE.md`, I personally prefer not to rely on `/init` to generate project memory automatically. I would rather maintain a shorter, clearer, and easier-to-review set of project memories and rules myself.

### Q16. What context is kept and what is lost during a /compact?

After `/compact`, some context is re-injected. Usually this includes the system prompt, the repository-root `CLAUDE.md`, rules without `paths:` restrictions, auto memory re-read from disk, a conversation summary generated by Claude, and the first N high-priority skill descriptions that fit within the 25K token budget.

What gets lost are the detailed output of historical tool calls, such as file contents that were read and bash output that was printed. Nested `CLAUDE.md` files or `.claude/rules/*.md` files with path restrictions won't stick around either; they usually wait to be re-triggered the next time a matching file is accessed. The full JSON schemas of MCP tools are also dropped, leaving only their names to be fetched again on the next call.

The practical recommendation is simple: do not rely solely on the chat history for "things that must be remembered long-term." Important rules should either be written into `CLAUDE.md` or explicitly saved via auto-memory.

### Q17. If you were designing a "long-term memory" mechanism like Claude Code's auto memory, how would you decide what to keep and what to discard?

Long-term memory should strictly store things that repeatedly impact output quality. This includes user preferences that have been corrected multiple times (like coding style and naming conventions), hard project-level constraints, and easily forgotten trivia (like specific port numbers or the locations of API keys).

It should not store one-off conversational context, sensitive data, or outdated facts. If a bug from last week has already been fixed, it should not remain in memory and influence future decisions.

The update mechanism is equally critical. Writes should merge information to avoid duplication. You also need a regular garbage collection (GC) process to downrank or delete old entries. Furthermore, users should be able to audit and edit the memory file with a single click.

To prevent context pollution, memory should have a size cap, for example 25KB. Once maxed out, retention can be based on usage frequency plus explicit user marks. Cross-project sharing should be conservative. Sharing across projects also requires caution: preference-based memory can be safely shared, but project-specific knowledge shouldn't be. Otherwise, a constraint from project A may be incorrectly applied to and break project B.

### Q18. How can we avoid polluting the main chat context?

Heavy reading and research tasks are best delegated to an `Explore` sub-agent, asking it to only return a summary. That keeps the main conversation from being flooded by dozens of files, test outputs, or log fragments. Long command outputs should also be reduced deliberately, for example with `head` / `grep`, or by writing the output to a file and asking the agent to read only the relevant parts.

Repeated procedures should become skills so the same rules are not repeatedly typed into the conversation. After a meaningful milestone, use `/compact` to bring the context back under control.

A few other habits also help. Do not make the agent reread the same file repeatedly; the file state is maintained by the harness, so there's no need to re-read it just to verify an edit. If something needs to be remembered long-term, put it in CLAUDE.md or auto-memory instead of just mentioning it once in chat. MCP tools should also be loaded on demand rather than connecting every MCP server at once if you don't need them.

### Q19. What are Hooks?

Hooks are deterministic callbacks registered on lifecycle events in Claude Code / Codex, such as `PreToolUse`, `PostToolUse`, `SessionStart`, and `Stop`. They are executed by the harness, not by the LLM, so the model cannot forget or bypass them.

In Claude Code, hook types include `command` for shell commands, `http` for POST endpoints, `prompt` for one-turn LLM evaluation, `agent` for multi-turn LLM behavior, and `mcp_tool`.

Common uses include:

- Auto-formatting: automatically running `prettier`, `eslint`, or `gofmt` when `PostToolUse` hits an `Edit` or `Write` action.
- Safety guards: blocking the action with exit code 2 when `PreToolUse` hits `Edit(/.env*)`, preventing accidental secret edits.
- Notifications: sending a desktop notification on `Stop` to let you know Claude is idle.
- Bootstrapping: dumping the current git status and environment variables on `SessionStart` so the agent knows the initial state.
- Manual overrides: dropping into an "ask" mode to force user confirmation if `PreToolUse` catches a destructive command like `Bash(rm -rf *)`.

### Q20. What are the Permission Modes, and what scenarios do they fit?

| Mode | Behavior | Best fit |
| :--- | :--- | :--- |
| default | Ask the first time each tool is used | Unfamiliar new projects |
| acceptEdits | Automatically allow file edits and fs commands | Familiar projects where faster iteration matters |
| plan | Read-only mode; writes are forbidden | Code review or design planning |
| auto | A background classifier judges whether an action is safe | Semi-automatic workflows that trust the classifier |
| dontAsk | Reject anything not on the allowlist | Strict allowlist production environments |
| bypassPermissions | Allow everything, while retaining breakers such as `rm -rf /` | Sandboxes, containers, or dev containers |

## IV. Everyday Workflow

> Task decomposition, debugging, TDD, readability, and security review.

### Q21. What is the core workflow in Superpowers? What is the essence of Brainstorming? When should we use Inline Execution versus use Sub-agent Driven Execution?

The core Superpowers workflow can be summarized as Brainstorm -> Writing Plan -> Inline / Sub-agent Driven Execution, with the execution phase usually driven by Test-Driven Development (TDD). Superpowers also provides structured workflows for merging features, isolating worktrees, and closing PRs, but the main skeleton is still Spec -> Plan -> Execution.

Brainstorming is best understood as a way to create forced anchors through Q&A. A similar skill is `grill-me`. The goal is not to make the model implement immediately, but to force the user to clearly define "what exactly am I trying to build" through multi-turn dialogue. Once the spec is anchored, the LLM's task path shifts from "exploration + implementation" to something much closer to "pure implementation."

The key difference between Inline Execution and Sub-agent Driven Execution is the execution subject. In Inline Execution, the same agent plans, discusses, and implements. When the context budget allows it, this often produces better alignment, because the spec discussion and implementation phase remain connected.

Sub-agent Driven Execution assigns each concrete step to a sub-agent with a clean context. The advantage is that each new agent has a larger context window, and the main chat isn't polluted by execution details. The cost is that every new agent has to spend time and tokens rebuilding the background. That can lead to execution drift or cause important context to be ignored.

Personally, I do not think `writing-plans` is a good default design. By May 2026, a spec with some ambiguity is already enough to guide many models to successful implementation. Adding a separate writing-plan layer between the spec and execution can create two problems.

First, the role of the plan becomes unclear. Is it design guidance, or is it an implementation recipe? Second, agents tend to put too much code-level detail into the plan. If those details are wrong, Sub-agent Driven Execution will amplify the deviation.

This amplification has two consequences. First, the execution agent no longer has a single source of ground truth, because the spec and plan may conflict. Second, errors in the plan introduce a kind of alignment drift across the documentation system, pushing subsequent phases further away from the original spec. Therefore, my personal habit is to skip the writing-plan phase entirely once brainstorming yields a solid spec.

### Q22. When you receive a task for a "medium-complexity new feature," how should you break it down using agentic tools?

A typical workflow starts by dropping into plan mode (via Shift+Tab or the corresponding shortcut) for read-only codebase exploration. Then use `Explore` sub-agents to search related files in parallel, focusing on entry points, data flows, and test locations.

Before writing any code, either use a `Plan` sub-agent or generate TDD-style strategy directly in the main chat. This strategy should define the acceptance criteria or test cases first, then the minimal implementation, and finally specify the verification strategy.

Once the plan is drafted, use `ask-codex` or `ask-gemini` for a second opinion: a cross-model review to patch any blind spots. For critical design forks, use `AskUserQuestion` to let the human make the final call.

After the plan is confirmed, use `ExitPlanMode` to switch to `acceptEdits` mode and execute. Write or update tests before writing the actual code, then let the agent implement it while running tests in real-time. Once done, self-audit using `/review` or the `superpowers:requesting-code-review` skill, and do a final pass with the `verification-before-completion` skill before committing.

### Q23. When should you open a sub-agent, and when shouldn't you?

Open a sub-agent when the task has a few common traits: the task requires reading 10+ files for research (perfect for `Explore`); it involves many `grep`, `find`, or log-analysis calls with noisy output; it needs an independent code review or security review; or it can be split into several independent subtasks and dispatched in parallel, as in dispatching-parallel-agents.

Avoid a sub-agent when the task needs only one to three tool calls, doing it directly in the main chat is simply faster. Avoid sub-agent when the main chat needs to retain the chain of thought for future decisions, otherwise the reasoning is summarized away. Also, tasks requiring highly interactive user confirmation shouldn't be handed off, because sub-agents cannot ask the user questions. As for simple tasks like "read a file at a known path", just use the Read tool natively, there's no need for an agent.

### Q24. When a bug appears in the code, how do you debug it using agentic tools?

The first step isn't rushing to edit code, but rather entering a systematic troubleshooting mode, for example by using the `superpowers:systematic-debugging` skill. Then reproduce the problem and write a minimal test that triggers the bug reliably.

The test should fail first. That failure confirms that the bug is understood well enough to be captured. Then, use `Explore` to identify all relevant files along the execution path where the bug occurs.

When it comes to the actual fix, proceed with hypothesis -> verification -> repair, not as guess-and-patch. After patching, run all relevant tests and go through `verification-before-completion`.

If the bug is particularly complex, use `codex:rescue` to let Codex run an independent diagnosis. The point is to cross-check the reasoning rather than leave one LLM's assumptions unchallenged.

### Q25. Why is test-driven development (TDD) more important in agentic workflows than in traditional workflows?

TDD matters more in agentic workflows because agents can be confidently wrong. They may invent APIs, fields, or return values, and tests are the only objective judge.

Tests also act as a contract with the agent. The user does not have to describe every implementation detail. It is often enough to state that a particular test must pass when the work is done. That turns an ambiguous request into an executable specification, which is exactly the kind of input an agent needs.

TDD also gives the agent a feedback loop. Without a failing test, the agent often cannot tell whether it is wrong. With a test, fixing the code revolves around explicit and undeniable feedback.

There is a risk: if the agent writes both the tests and the implementation, it may optimize for passing weak tests rather than solving the real problem. Therefore, critical tests, especially acceptance-level and security-level tests, should be written by a person or at least reviewed independently.

### Q26. What should we do when agent-written code is hard to read? Is it a flaw in the tool or a flaw in how we use it?

It is both. On the tool side, models tend toward certain bad habits: over-abstraction, overly defensive programming, and excessive commenting. System prompts can reduce this, for instance, Claude Code's default prompt explicitly includes constraints like "do not add meaningless comments."

However, if a user provides zero constraints, skips the review process, and blindly accepts the agent's first try, garbage code will inevitably pile up. At that point, it is mostly a usage problem.

There are three practical solutions. First, write readability rules into `CLAUDE.md`, such as limits on function length, naming conventions, and commenting standards. Second, make "simplify / refactor / remove redundancy" a separate step instead of expecting the first pass to be final. Third, externalize review standards into skills, such as `simplify` or `code-reviewer`, to force the agent to review its output before delivery.

Usually, the question is whether the code is truly unreadable, or whether no one has taken responsibility for reading it. If no one reads agent-written production code, the work has effectively been outsourced to an unaccountable intern.

### Q27. If you were designing an AI security review agent, what pitfalls would you avoid?

A security review agent must not look only at the diff. Security issues often appear in the calling functions or surrounding code outside the modified lines, so the review agent must be allowed to expand into context.

Never blindly trust passing tests. Many critical vulnerabilities like insecure deserialization or command injection, are rarely covered by the standard unit tests. The review phase must remain read-only as well. If the review agent is allowed to run exploit scripts to test a hypothesis, the review agent itself becomes part of the attack vector.

Security review also needs cross-checking. Employing a secondary model (like Codex) to run an independent audit drastically reduces the blind spots of a single model. Also, don't strive for "zero false positives." In security, it's always better to over-report than to under-report. However, the agent must triage these alerts (e.g., P0 / P1 / P2) so human engineers can focus on the real fires.

Finally, the review must be explainable. The agent should not merely say "this is unsafe." It needs to provide the reasoning chain that explains why the issue is a vulnerability.

## V. Team Collaboration and System Design

> Team use: shared rules, personal overrides, auditing, plugin distribution, and multi-agent topology.

### Q28. In a collaborative repository, how do you scale agentic workflows for a whole team?

The first requirement is a shared layer. The repository-root `CLAUDE.md` / `AGENTS.md` should contain hard rules shared by the team, such as code style, PR process, and strict prohibitions. `.claude/settings.json` can share the permission allowlist and hooks. All shared `.claude/skills/`, `.claude/agents/`, and `.claude/commands/` should be committed to git.

The personal layer is for individual preferences and local overrides. `CLAUDE.local.md` is typically added to `.gitignore` to store personal preferences. `.claude/settings.local.json` can store personal permission overrides.

For distribution, the team's shared capabilities can be packaged as a plugin and published to an internal marketplace, so new hires can start with a single `/plugin install` command.

Auditing must keep pace. Hooks can record sensitive operations at `PreToolUse`, and you can update your PR templates to require developers to paste in key decision points made during their agent sessions.

### Q29. If you were designing the multi-agent collaboration model for Claude Code / Codex, would you choose a star topology (hub and spoke) or a mesh topology (peer to peer)? Why?

A star topology is easier to debug. Context is more controlled, and responsibility is clearer. Its weakness is that the main conversation becomes a bottleneck, which limits parallelism.

A mesh topology, where agents communicate with one another, looks more like a real team and can achieve higher parallelism. Its risks are also obvious: it easily triggers infinite conversational loops between agents, causing context explosion, unclear responsibility, and debugging hell.

In practice, a star topology is sufficient for most tasks. Only a small number of complex, multi-role tasks need a mesh model. And even then, it requires strict guardrails like message budgets, maximum thread counts, and observable dialogue graphs.

A next-level question is: Is the ROI of multi-agent orchestration actually higher than just using a single, dramatically smarter agent? If foundational models continue to scale, complex multi-agent setups might just be a temporary stopgap.

## VI. Discussion

### Q30. Will agentic tools eventually make "programmer" disappear?

Agentic tools will probably reshape the profession of "programmer." Much of code writing will be outsourced to tools. Understanding requirements, decomposing complex systems, judging correctness, and taking responsibility will remain distinctly human tasks.

The mid-to-low-level roles defined mostly as "typing out code to match a spec" are at severe risk.

High-value work will consolidate around a few key areas: designing how agents collaborate, maintaining libraries of reusable skills and context strategies, reviewing agent outputs quickly, deciding whether the code, tests, and design are actually reliable, and translating messy domain knowledge into rules and constraints that agents can actually parse.

Think of it like the invention of the compiler. Compilers did not make assembly programmers disappear, but they certainly reduced the number of people hand-writing raw x86. Programming will move up another level of abstraction.

## Appendix: Learning Path

1. Read https://code.claude.com/docs/llms.txt, and run through /skill, /agent, /plugin, /compact, and /memory.
2. Turn three things you often do into skills.
3. Build a team plugin that includes skills, agents, hooks, and an MCP server.
4. Study complex `PreToolUse` decisions in hooks, the experimental Agent Team features, and checkpoint design for long-running overnight tasks.

## References

- Sihao Liu, [vibe-agentic-interview-notes](https://github.com/SihaoLiu/vibe-agentic-interview-notes).
- Anthropic, [Claude Code documentation](https://code.claude.com/docs/llms.txt).
- OpenAI, [Codex getting started documentation](https://github.com/openai/codex/blob/main/docs/getting-started.md).
- Berkeley RDI, [Agentic AI course page](https://rdi.berkeley.edu/agentic-ai/f25).
- Anthropic and OpenAI public documentation.
