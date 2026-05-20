---
layout: distill
title: "理解 Vibe Coding 的 30 个问题"
date: 2026-05-18 09:00:00-0500
description: "服务于本人的学习和实践需求"
tags: agentic-coding workflow agents
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
  - name: 引言
  - name: 一、判断的框架
  - name: 二、核心工具箱
  - name: 三、上下文、权限与记忆
  - name: 四、日常工作流
  - name: 五、团队化与系统设计
  - name: 六、长期能力与学习路径
  - name: 参考资料
---

## 引言

我第一次真正意识到 AI 编程工具的潜力和局限，是在做 autonomous mobile robot (2023)项目的时候。那个项目需要我们把 localization、mapping、path planning、parameter tuning 等模块组合成一个完整的机器人自主导航系统，在噪声和飘移的影响下实时做决策。单独看每个算法都不算陌生，但困难的是把它们写成大量可维护的函数文件，并让这些模块在团队协作中保持一致。我们最后总结，这类 autonomy stack 只有在 estimation、mapping、planning 和 tuning 被当作一个闭环处理时才真正工作。 ￼

当时我们已经在使用 AI 辅助编程，但方式非常原始：遇到 bug，就把报错、代码片段和自己的猜测一遍遍发进 chatbox；模型给出一个可能的修改，我们试一下，不行再贴新的日志。这个循环看起来像是在 debug，实际上很多时候只是把问题不断重新包装。上下文越来越长，token 消耗越来越多，但关键的信息并没有被结构化地保存下来，比如哪些假设已经被排除？哪些文件之间存在接口约束？哪些修改会影响队友的模块？哪些测试才是判断修复成功的标准？这些问题没有被系统地管理，AI 就很容易从“加速器”变成“消耗器”。

后来CS294/194-196: Agentic AI这门课改变了我对 AI 编程的理解，它把 Agentic AI 放在一个更系统的框架里讨论了当前 LLM agents 的限制和潜在风险。对我来说，这正好回应了我们在机器人项目中遇到的痛点，问题在于如何让模型在明确边界内读取上下文、调用工具、执行子任务、留下可审计记录，并在必要时停止或请求人类判断。

另一个让我重新思考 agent 边界的案例，来自 Nature 对 A-Lab 争议的报道。那篇报道讨论了一个 AI-controlled robotic lab assistant 声称合成新材料后引发的争议：一些研究者质疑这些材料是否真的具有报道中声称的新颖性。Nature 报道的核心并非否定 AI + robotics 在科学发现中的价值，而是指出，当 autonomous system 进入真实科学流程时，“生成结果”本身并不等于“完成验证”。尤其在材料发现这类场景中，模型预测、机器人合成、XRD 表征和相鉴定之间存在多层假设；如果验证标准不够严格，系统就可能把一个看似合理的拟合结果误读成新相证据。 ￼

这件事对我很有启发，因为它和 AI coding 中的失败模式非常相似：一个 agent 可以很快产出看似合理的结果，但合理不等于正确，更不等于已经被验证。后来我尝试复现其中涉及的错误，把它转化成一个 XRD phase identification 的小型统计模型比较问题，讨论了为什么一个 visually convincing 的 XRD fit 并不能直接证明 phase identification；更可靠的做法是比较 plausible alternatives，检查 residuals、diagnostic peaks、RSS、reduced χ²、AIC 和 F-test 等证据，而不是只看单一模型能否拟合数据。 ￼

从这些经历出发，我把 vibe coding 理解为一种需要工程边界的 agentic workflow，而不是一种“把需求丢给 AI”就结束的技巧。它的价值不是让人完全退出编程，而是把人的角色从反复粘贴报错，转移到定义任务、组织上下文、设置权限、设计测试、审查结果和判断何时接管。对于 graduate student 来说，我们的项目往往同时涉及研究假设、实验数据、代码实现、团队协作和长期维护。如果 agent 没有边界，它会放大混乱；如果边界设计得好，它才可能真正放大能力。

因此，这篇文章整理了我在使用 vibe coding 和 agentic coding 工具前最想回答的 30 个问题。我关心的问题包括：什么时候应该让 agent 主动行动，什么时候必须停下来问人？上下文应该如何组织，才不会被长对话污染？哪些规则应该写进项目文件，哪些知识应该留给人类判断？当 agent 写出一大段看似正确的代码或分析时，我们应该如何验证、审查和接管？

我认为在今天（May 2026），对这些问题的理解有助于我在借助 AI 完成复杂任务的同时，仍然做到可靠、细致，并对自己交付的结果负责。


## 一、判断的框架

> context、主动性、长任务、失败循环和职业变化

### Q1. “Vibe Coding” 到底是 hype 还是范式革命?

一种观点认为，vibe coding 主要是更智能的自动补全。复杂项目里，agent 仍然会犯低级错误，维护成本也经常被低估。

另一种观点认为，它代表了编程范式的变化：编程的“主单位”正在从“行/函数”上升到“意图/约束”，工程师的角色也从“打字员”转向“架构师 + 审稿人”。从这个角度看，软件交付速度的瓶颈正在被打破。

更折中的立场是：vibe coding 确实带来了范式变化，但并非 1:1 替代人。它会放大高水平工程师的能力，因为他们能给出好的 spec 和 review；它也会放大低水平工程师的破坏力，因为他们同样可以快速产出垃圾。

值得追问的是：如果 agent 写代码，知识应该沉淀在哪里，是仓库里的 `CLAUDE.md`，还是个体大脑？“代码 review” 的角色会不会比“写代码”更重要？教育、入门门槛和初级岗位又会如何变化？

### Q2. 为什么应该”保持 context 简单”? 一个塞满信息的 prompt 不是更好吗?

保持 context 简单，首先是因为注意力是有限资源。LLM 的注意力机制并不会均匀地对待所有相关内容，过多无关信息会稀释关键指令的权重，也会带来 “lost in the middle” 现象。

其次，context 越长，token 成本和推理延迟越高。每次推理都要基于全部 context 计费和计算，长 context 会直接拉高延迟和账单。

简单 context 也更容易调试。出问题时，短 context 更容易定位是哪条指令发生冲突；长 context 几乎无法复盘。它也更容易演化，因为内容越简单，越容易迭代、替换和重排，复杂 context 很快会变成一团 spaghetti。

这里的“简单”并不等于“少信息”，更接近“高信噪比”。目标是让 agent 知道它需要知道的内容，而不是把所有可能有关的信息都塞进去。

### Q3. Agent 应该”主动”还是”被动”? 它什么时候该问用户, 什么时候该自己决定?

判断 agent 该主动还是被动，首先要看行动是否可逆。本地改一个文件这类可逆操作，可以让 agent 自己决定；push、delete、send email 这类不可逆操作，必须先问人。

第二个标准是影响半径。只影响本机的操作，可以适当自决；会影响共享系统的操作，比如 CI、PR、Slack，就应该先确认。第三个标准是不确定度：agent 自己心里没底的时候，应该提问，而不是赌一把。第四个标准是用户当前是否可达。用户在线时，可以多问关键问题；后台任务或离线任务则应倾向于保守自决。

真正好的 agent 既不是“什么都不问”，也不是“什么都问”，而是问对问题。关键岔路要问，鸡毛蒜皮的细节不要频繁打扰。

### Q4. “我让 agent 跑了一整晚, 它做了什么我看不懂” —— 这是 agent 该解决的问题还是用户的问题?

这里有两层责任。可观测性是工具方的责任：agent 必须能输出可审计的操作序列，比如 file diff、command log 和关键决策点。理解力则是用户方的责任：工具再好，跨夜 1000 次 tool call 也不可能逐条审完，所以必须在任务开始前约定边界，例如把 permission mode 设为 plan，或者只允许它处理某个明确子任务。

越长的自主任务，越需要强约束和阶段 checkpoint。把任务完全放出去，第二天再回来审结果，风险很高。极端情况下，完全无人监督的长跑 agent，风险类似于“无人监督的初级实习生 + sudo”，在生产环境里基本不能接受。

### Q5. 一个 agent 反复改不对一个 bug, 你应该让它继续试, 还是关掉自己上?

如果 agent 已经开始循环尝试同一类错误解，通常说明上下文已经被污染，继续让它试下去多半效果不好。已经消耗了多少 token 并不重要，真正要判断的是：再消耗一轮 token 解决问题的概率有多高，成本是否划算。如果不划算，就应该停下来。

Agent 卡住时，很多时候不是推理能力突然不够，而是缺少关键信息。这时更有效的做法是人工补信息：贴日志、贴文档、贴失败用例，而不是让它继续猜。一个健康习惯是给自己设上限，比如 agent 改 3 次还不对就接手。

本质上，agent 是放大器，不是替代品。当它放大的是正确方向，效率会很高；当它放大的是死胡同，继续使用只会越走越深。

## 二、核心工具箱

> command、skill、agent、MCP、plugin 和 ToolSearch。

### Q6. 什么是 /command? 和 skill 的区别是什么? 什么时候用 command (已 deprecated), 什么时候用 skill?

`/command`，也就是 Slash Command，是 Claude Code 早期的扩展机制。用户可以在 `.claude/commands/` 下放置 `.md` 文件，然后通过在对话中输入 `/command-name` 来触发。它的本质是一段“用户主动调用的 prompt 片段”。目前在 Claude Code 中，`/command` 已经被官方标记为 deprecated，并由 skill 替代。

Skill 是新一代扩展机制，通常位于 `.claude/skills/<name>/SKILL.md`，也可以放在 `~/.claude/skills/` 或 plugin 中。它和 command 的关键区别在于，skill 可以被模型自主调用：只要在 YAML frontmatter 里写好 `description`，Claude 就能根据语义判断是否启用，而不需要用户每次手动敲 `/`。

Skill 也支持附属文件，skill 目录里可以放脚本、参考文档和子模板。它还有生命周期管理：在 `/compact` 时，skill 会被重新注入，通常是前 5K token、全局 25K token 预算。除此之外，skill 的 frontmatter 还能做更细粒度的控制，例如指定 `allowed-tools`、`disable-modelinvocation`、`paths`（路径范围限定）、`effort` 和 `model`。

实际使用时，几乎所有新场景都应优先考虑 skill，尤其是希望模型在合适时机自动启用，或者需要附带脚本、示例文件的场景。command 仍然有少数合理位置：比如某些完全确定、必须人工显式触发的一行 prompt 包装，或者团队遗留资产。但新项目里不再推荐继续使用 command。

### Q7. 什么是 agent? 什么情况下我们使用 agent, 什么情况下使用 skill?

Agent，也可以理解为 sub-agent，是一个拥有独立 system prompt、独立上下文窗口和独立工具白名单的“小型 Claude”。在 Claude Code 中，它通过 `.claude/agents/<name>.md` 定义，由主对话通过 Agent 工具派发。Sub-agent 完成任务后，只把“总结”回传给主对话，中间过程不会污染主上下文。

Skill 则是一段供模型读取的指令或规程（instructions）。它不会开启新的上下文，而是在当前对话中指导 Claude 接下来怎么做。

区别本质:

| 维度 | Skill | Agent |
| :--- | :--- | :--- |
| 上下文 | 共享主上下文 | 独立上下文 |
| 调用代价 | 低 (只是注入文本) | 高 (一次完整推理回合) |
| 适合 | “怎么做” 的指导、规范、check-list | 大量工具调用、可能产生大量噪声的子任务 |
| 结果 | 改变后续主对话行为 | 返回一段总结 |

决策原则可以这样理解：如果一个任务会产生大量工具输出，比如读几十个文件、跑测试、抓日志，就应该用 agent，避免污染主上下文。如果任务本质上是在告诉 Claude 一种规程，比如“提交前先跑 lint”，那更适合写成 skill。

只读的探索或搜索任务，优先交给 Explore 这类内置 agent。相反，如果任务需要多步骤设计，而且后续决策还依赖主对话保留完整思考过程，就不应该开 agent，而应该让主对话自己完成。

### Q8. Sub-agent 是什么? Sub-agent 之间可以互相通信吗?

Sub-agent 的定义见 Q7。它的关键特征是“独立上下文 + 独立工具集 + 只回传 summary”。

默认情况下，sub-agent 之间不能直接通信。Claude Code 的 sub-agent 通信模型是星型结构：所有 sub-agent 只与主对话通信，由主对话作为 hub 在它们之间转发信息。

实验性的 Agent Teams 引入了不同模型。开启 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` 后，系统会提供 `SendMessage` 工具，允许同级 agent 之间用 ID 直接发消息。但这是另一套模型，后面 Q9 会继续讨论。

这种设计的原因是强制信息汇聚到主对话，保证状态可追溯、可审计，同时防止 agent 之间形成不可控的循环对话。

### Q9. Agent Team 和 Sub-agent 之间最大的区别是什么?

Sub-agent 更像“雇一个临时工去做一件事，回来汇报”。它是一次性的、星型的、汇报式的：主对话发起任务，sub-agent 执行，然后返回 summary，任务结束后 sub-agent 即销毁。

Agent Team 更像“组建一个长期协作的团队，成员之间可以互相喊话”。它是持续性的、可互通的，也更适合并行推进。每个 teammate 都拥有持久的独立上下文，并且可以通过 `SendMessage(to=<agent_id>, message=...)` 直接互发消息。这种模型适合多个长期角色并行推进的场景，例如 frontend 工程师、backend 工程师和 reviewer 同时工作。

两者最大的区别首先是拓扑：sub-agent 是“主→子”的树，Agent Team 是“成员之间互通”的图。其次是生命周期：sub-agent 是 fire-and-forget，teammate 则长期存在。最后是状态共享：sub-agent 只返回最终 summary，而 teammate 之间可以来回讨论，维护持续上下文。

在取舍上，Agent Team 更接近“多 agent 协作”的研究方向，但它更难调试，也更容易造成上下文爆炸。大多数日常任务，用 sub-agent 就够了。

### Q10. Sub-agent 可否再衍生 (派生) 它自己的 sub-agents?

不可以。Claude Code 官方文档明确说明，sub-agent 无法再启动自己的 sub-agent。

这个限制首先是为了防止无限递归。一旦允许嵌套，agent 树的深度就会变得不可控，调试和成本控制都会变成噩梦。其次，它能保持信息汇聚：所有总结都必须回到主对话，用户和主 agent 才能拥有完整、可审计的轨迹。第三，它避免上下文窗口指数爆炸。嵌套调用的每一层都是独立 context，很容易把账单和延迟拉爆。

如果确实需要类似“嵌套委托”的效果，可以换几种做法：1. 在 sub-agent 里使用 skill 来组织内部步骤，因为 skill 不会开启新上下文；2. 让主对话串行或并行地多次派发 sub-agent，把任务扁平化；3. 使用 Agent Team 模型，不过 Agent Team 是平级互通，不是嵌套。

### Q11. MCP 是什么? 它和 API 接口的区别是什么?

MCP，也就是 Model Context Protocol，是 Anthropic 主导、现已开源的协议。它的作用是把“外部工具 / 资源 / prompt”以标准格式暴露给大模型。一个 MCP server 进程可以同时声明自己提供哪些 tools、resources 和 prompts，客户端（例如 Claude Code、Claude Desktop、Codex 等）再通过统一协议发现并调用这些能力。

它和“直接调 API”的区别，可以从几个维度看：

| 维度 | 裸 API | MCP |
| :--- | :--- | :--- |
| 描述方式 | 自然语言 + 文档, 每个 LLM/客户端自己实现适配 | 标准 schema, 一次声明全网客户端通用 |
| 工具发现 | 需要预先告知模型 | 客户端连接时自动 list tools |
| 鉴权 | 各 API 自己一套 | 标准 OAuth 2.0, 支持 dynamic client registration |
| 传输 | HTTP 各异 | stdio / HTTP / SSE 三种标准传输 |
| 复用 | 每个 LLM 平台都要重做 | 一份 MCP server, 所有支持 MCP 的客户端可用 |

可以用一个类比来理解：API 像“USB 线”，每家的形状都不太一样；MCP 更像“USB-C”，给所有 LLM 客户端提供统一接口。

更本质的区别是，MCP 不只是传数据，它还会自描述能力。工具签名、参数 schema、是否可写、是否需要确认，都会以结构化方式暴露出来，模型可以据此推理“何时调用、怎么调用”。

### Q12. Plugin 和 Skill 的关系是什么?

Skill 是单个能力单元，通常由一个 `SKILL.md` 加上附属资源组成。

Plugin 则是一个可以打包发布的扩展包。一个 plugin 可以包含多个 skill，也可以同时打包 sub-agent 定义、hooks（见 Q18）、MCP server、LSP server、二进制可执行文件和默认 settings。

Plugin 通过 `.claude-plugin/plugin.json` 描述元信息。安装之后，plugin 内的 skill 可以用命名空间调用，例如 `/<plugin-name>:<skill-name>`，这样可以避免不同 skill 之间命名冲突。

简言之，skill 是零件，plugin 是装好的整车。

### Q13. 什么是 ToolSearch / Deferred Tools? 为什么要这样设计?

ToolSearch / Deferred Tools 描述的是这样一种现象：启动时，MCP 工具和部分内置工具的完整 JSON schema 不会立刻加载，模型一开始只知道工具名字。当模型真正需要某个工具时，再通过 ToolSearch 把对应 schema 拉进来。

这样设计首先是为了节省 token。一个大型 MCP server 可能有几十上百个 tool，如果把所有 schema 一次性塞进上下文，很容易就多出上万 token。其次，它能降低注意力噪声。不相关的工具长期挂在 prompt 里，会干扰模型决策。第三，它实现了按需加载：只有真正要用某个工具时，才把详细签名带进来。

代价是第一次使用某个工具时，会多一次 ToolSearch round trip。但和节省下来的 token 相比，这笔交易通常很划算。

## 三、上下文、权限与记忆

> 长期稳定性：规则、压缩、权限、记忆和上下文污染

### Q14. CLAUDE.md / AGENTS.md 是什么? 加载顺序和优先级如何?

`CLAUDE.md`（Claude Code）和 `AGENTS.md`（Codex）可以理解为项目或用户级别的“持久 prompt 注入”。它们会在每次 session 启动时自动加载到 system prompt 中，用来声明“我希望 agent 一直记住的规则”。

以 Claude Code 为例，常见加载层级如下：

  1. Managed policy —— 企业管控级, 由 IT 部署, 不可被覆盖.
  2. User —— ~/.claude/CLAUDE.md, 个人全局规则.
  3. Project —— 仓库根 ./CLAUDE.md, 项目级规则.
  4. Local —— CLAUDE.local.md, 个人在该项目的私有覆盖 (通常 gitignore).

优先级规则是：后加载者覆盖先加载者。例如 project 可以覆盖 user，但 managed policy 不可被普通规则覆盖。

实践上，每个文件建议控制在 200 行以内。如果内容太长，可以用 `@path/to/file.md` 引用拆分。这里不适合写“项目背景介绍”，更适合写“agent 必须遵守的硬规则”。

维护一份好的 `CLAUDE.md`，关键不在于把项目资料写全。它不应该记录那些 agent 在理解项目过程中自然会意识到的信息，而应该记录那些“项目老手习以为常，但新手要探索很久”的信息。

避免 `CLAUDE.md` 腐烂是第一原则。一份信息腐烂的 `CLAUDE.md` 带来的问题，远大于一份没什么信息的 `CLAUDE.md`。所以它应该宁缺毋滥。

更准确地说，`CLAUDE.md` 应该是一份快捷指南和避坑指南，而不是项目介绍。

### Q15. 如何评价 Claude Code 的 `/init` 功能?

`/init` 的设计本意，是在项目开始时为用户生成一份 onboarding 素材，也就是 `CLAUDE.md`。这个出发点是好的：短期 Claude Code session 可以迅速理解当前项目的上下文，而不需要用户反复解释目录结构、技术栈和常用命令。

问题在于，`CLAUDE.md` 在 Claude Code 生态中的地位非常高。它同时承担了两个目的：项目记忆，也就是 factual info；以及项目规则，也就是 rules。Q14 已经提到，`CLAUDE.md` 会作为高优先级上下文进入每一次会话，因此它很难被模型违反，也很难被轻易推翻。换句话说，`CLAUDE.md` 的内容非常顽固。

随着项目继续开发，项目中的现实情况会逐渐和 `CLAUDE.md` 里的记忆或规则发生偏离。但因为这个文档优先级很高，用纯自动方式删除或修改它并不容易。结果就是由 `/init` 生成的 `CLAUDE.md` 很容易快速过时，产生某种文档腐烂。Claude Code 里确实有一些机制试图缓解这个问题，例如 auto-memory / auto-dream 一类自动更新项目记忆的能力。

但我认为，自动管理项目记忆本身在做一件和模型工作机制存在张力的事情。模型需要同时做两个方向相反的动作：正向上，它要基于事实并遵守 `CLAUDE.md` 里的规则；反向上，它又要判断这些事实和规则是否已经过时，并修改 `CLAUDE.md` 本身。

从 prompt 层级看，这有点像要求模型对高优先级上下文做“非对齐”的动作。考虑到 `CLAUDE.md` 的系统优先级，我倾向于不依赖 `/init` 自动生成项目记忆，而是主动维护一份更短、更明确、更容易审查的项目记忆和规则。

### Q16. /compact 时, 哪些上下文会被保留, 哪些会丢失?

`/compact` 之后，有些上下文会被重新注入。通常会保留 system prompt、项目根 `CLAUDE.md`、未带 `paths:` 限定的 rules、从磁盘重读的 auto memory、由 Claude 生成的 conversation summary，以及 25K token 预算内的前 N 个高优先级 skill 描述。

会丢失的是历史 tool call 的详细输出，例如读过的文件内容和 bash 输出。路径范围限定的嵌套 `CLAUDE.md` 或 `.claude/rules/*.md` 也不会一直保留，通常要等到下次匹配文件被读到时才会重新触发。MCP tool 的完整 schema 也不会保留，只留下名字，等下次调用时再 fetch。

实践建议很简单：不要把“必须长期记住的事情”只放在对话里。重要规则要么写进 `CLAUDE.md`，要么用 auto memory 显式保存。

### Q17. 设计一个”长期记忆”机制 (类似 Claude Code 的 auto memory), 你会怎么决定记什么、不记什么?

长期记忆应该保存那些会反复影响工作质量的内容，比如用户多次纠正过的偏好，包括代码风格和命名习惯；也应该保存项目级硬约束，以及容易遗忘的 trivia，比如端口号、密钥位置这类固定信息。

不应该写入长期记忆的，是一次性的临时对话、含有敏感数据的内容，以及已经过时的事实。比如上次的 bug 早已修复，就不应该继续留在 memory 里影响后续判断。

更新机制也很重要。写入时应该合并，避免重复；还要定期 GC，把太老的条目降权或删除。用户也应该能一键审查和编辑 memory 文件。

为了避免污染，memory 应该有大小限制，例如 25KB。超过限制之后，可以按“使用频率 + 用户标记”来取舍。跨项目共享也要谨慎：偏好类信息可以共享，项目知识类信息不应该共享，否则 A 项目的密钥或约束可能被误用到 B 项目。

### Q18. 怎么避免主对话上下文被污染?

大量读取和调研工作，最好交给 Explore sub-agent，只让它回传 summary。这样主对话不会被几十个文件、测试输出或日志片段淹没。对于长输出命令，也要主动收敛，可以用 `head` / `grep` 截取关键部分，或者先写进文件，再让 agent 挑选需要阅读的片段。

重复性任务应该封装成 skill，避免把同一套规则反复打字进对话。阶段性里程碑之后，也应该及时 `/compact`，把上下文压缩到更可控的状态。

还有几个习惯也很重要。不要让 agent 反复读同一文件，因为文件状态由 harness 维护，改完后不需要靠重读来验证。需要长期记住的事情，应写进 `CLAUDE.md` 或 auto memory，不要只靠在对话里讲一次。MCP 工具也要按需加载，不要一次性把所有 MCP server 都连上。

### Q19. Hooks 是什么?

Hook 是 Claude Code / Codex 在生命周期事件上注册的确定性回调，例如 `PreToolUse`、`PostToolUse`、`SessionStart` 和 `Stop`。它由 harness 执行，而不是由 LLM 执行，因此不会被模型遗忘或绕过。

在 Claude Code 中，hook 的类型包括 `command`（shell）、`http`（POST endpoint）、`prompt`（单轮 LLM 评估）、`agent`（多轮 LLM）和 `mcp_tool`。

常见场景包括：`PostToolUse` 命中 `Edit|Write` 后自动跑 prettier、eslint 或 gofmt；`PreToolUse` 命中 `Edit(/.env*)` 时阻止操作（exit 2），防止误改密钥；`Stop` 时发桌面通知，提示 Claude 已经空闲；`SessionStart` 时输出当前 git 状态和环境变量，让 agent 一开始就知道现状；`PreToolUse` 命中 `Bash(rm -rf *)` 时切到 ask 模式，强制用户确认。

### Q20. Permission Mode 有哪些? 各自适合什么场景?

| 模式 | 行为 | 适合场景 |
| :--- | :--- | :--- |
| default | 每个工具第一次使用时询问 | 不熟悉的新项目 |
| acceptEdits | 自动放行文件编辑和 fs 命令 | 已熟悉的项目, 想加速迭代 |
| plan | 只读模式, 禁止写操作 | 代码 review 或方案设计 |
| auto | 后台分类器判断是否安全 | 信任分类器的”半自动”模式 |
| dontAsk | 没在 allowlist 的一律拒绝 | 严格白名单生产场景 |
| bypassPermissions | 全部放行 (仍保留 rm -rf / 等熔断) | 沙箱 / 容器 / dev container 内部 |

## 四、日常工作流

> 拆任务、调试、TDD、可读性和安全 review。

### Q21. Superpowers 里的核心流程是什么? Brainstorming 的本质是什么? 什么时候使用 Inline Execution, 什么时候使用 Sub-agent Driven Execution?

Superpowers 的核心流程可以概括为：Brainstorm -> Writing Plan -> Inline / Subagent-Driven Execution，并且执行阶段通常由 TDD 驱动。后续它还提供了一系列关于合并 feature、隔离 worktree、关闭 PR 的流程化能力，但最核心的骨架仍然是 Spec -> Plan -> Execution。

Brainstorming 的本质是以问答形式制造“强制锚点”。类似的 skill 还有 `grill-me`。它们的目标不是让模型立刻实现，而是通过多轮对话强迫用户想清楚“我到底要做什么”。当 spec 被锚定以后，LLM 的任务路径就会从“探索 + 实现”变成更接近“纯实现”。

Inline Execution 和 Subagent-Driven Execution 的关键区别在于执行主体。Inline 执行时，负责规划、讨论和实现的是同一个智能体；在上下文允许的情况下，它通常能获得更好的对齐效果，因为前面的 spec 讨论和实现阶段没有断开。

Subagent-Driven Execution 则会把每个具体步骤分配给拥有干净上下文的 sub-agent。它的好处是每个新 agent 有更大的上下文空间，主对话也不会被执行细节污染；坏处是每个新 agent 接到任务后，都需要花时间和 token 重新理解背景，因此可能出现执行偏差或上下文忽略。

我个人并不认为 `writing-plans` 是一个很好的默认设计。到 2026 年 5 月，spec 本身的模糊性已经足够指导很多模型完成目标实现。在 spec 和具体执行之间再插入一层 writing plan，反而容易带来两个负面后果。

第一，plan 的定位不清：它到底是设计指导，还是具体实现方案？第二，agent 往往会在 plan 里写入大量代码级实现细节。一旦这些细节本身有偏差，Subagent-Driven Execution 会把偏差继续放大。

这种放大又会带来两个后果。其一，执行 agent 没有明确的 single source of ground truth，因为 spec 和 plan 可能互相冲突。其二，plan 里的偏差会放大文档系统之间的“智能锯齿毛刺”，让后续阶段离原始 spec 更远。因此我自己的习惯是：brainstorming 产出 spec 之后，直接跳过 writing-plan 阶段。

### Q22. 你接到一个”中等复杂度的新功能”任务, 应该怎么用 agentic 工具拆?

一种典型流程是先进入 plan mode（Shift+Tab 或对应快捷键），只读探索代码。接着用 Explore sub-agent 并行搜索相关文件，重点找入口、数据流和测试位置。

在动手实现前，可以用 Plan sub-agent，或者直接在主对话中产出 TDD 风格的方案。这个方案应该先写验收标准或测试用例，再写最小实现，最后写验证策略。

方案出来后，可以用 `ask-codex` 或 `ask-gemini` 做第二意见，也就是 cross-model review，用来修补盲点。关键设计岔路则通过 `AskUserQuestion` 让用户拍板。

等方案确认后，再用 `ExitPlanMode` 进入 `acceptEdits` 模式落地。写代码前先写或更新测试，然后让 agent 实现，并实时跑测试。完成后用 `/review` 或 `superpowers:requesting-code-review` 自审，提交前再过一遍 `verification-before-completion` skill。

### Q23. 什么时候应该开 sub-agent, 什么时候不该?

应该开 sub-agent 的情况，通常有几个共同点：任务需要读 10 个以上文件做调研，适合交给 Explore；需要跑大量 `grep`、`find` 或日志分析，输出会很噪；需要做独立的代码 review 或安全 review；或者有多个互不依赖的子任务，可以并行派发，也就是 dispatching-parallel-agents。

不该开 sub-agent 的情况也：如果任务只需要 1 到 3 个工具调用，主对话直接做更快。如果任务需要主对话保留思考过程，以便后续决策，开 agent 反而会丢上下文。如果任务需要多次交互式确认，也不适合交给 sub-agent，因为 sub-agent 不能问用户。至于“读一个已知路径”这种简单任务，直接 Read 就好，不需要开 agent。

### Q24. 代码出了 bug, 你会怎么用 agentic 工具调试?

代码出了 bug，第一步不是急着改代码，而是先进入系统化排查模式，比如使用 `superpowers:systematic-debugging` skill。然后要先复现问题，写一个能稳定触发 bug 的最小用例或测试。

测试应该先失败，这一步是为了确认自己确实理解了 bug。接着可以用 Explore 找出 bug 发生路径上的所有相关文件。

真正修复时，应按“假设 → 验证 → 修复”的节奏推进，而不是猜测式打补丁。修完之后，要跑全部相关测试，并过一遍 `verification-before-completion`。

如果 bug 比较复杂，可以用 `codex:rescue` 让 Codex 做独立诊断，用 cross-check 的方式检查自己的思路。

### Q25. 为什么”测试驱动开发 (TDD)” 在 agentic 工作流里比传统工作流更重要?

在 agentic 工作流里，TDD 比传统工作流更重要，首先是因为 agent 容易“自信地写错”。它会编 API、编字段、编返回值，而测试是唯一的客观裁判。

测试也是和 agent 沟通的契约。你不需要把“怎么做”描述到每个实现细节，只需要明确“做完后这个测试必须过”。这会把模糊需求变成可执行规约，而这正是 agent 最需要的输入。

TDD 还能给 agent 提供反馈循环。没有失败的测试，agent 很难知道自己到底错没错；有了测试，修复就能围绕明确反馈展开。

风险也存在。如果 agent 自己写测试，又自己写实现，它可能“为了过测试而过测试”。因此，关键测试，尤其是验收级和安全级测试，应该由人来写，或至少经过独立 review。

### Q26. “agent 写的代码可读性差” 该怎么办? 这是工具问题还是用法问题?

这既是工具问题，也是用法问题。工具侧确实存在一些倾向，比如过度抽象、过度防御、过度注释。通过系统 prompt 做限制可以改善，例如 Claude Code 默认 prompt 里就有“不要加无意义注释”这类约束。

如果用户没有给约束、没有 review、直接接受 first try，垃圾代码就会逐渐堆积。这个时候主要是用法问题，而不只是工具问题。

根本解有三类。第一，在 `CLAUDE.md` 里写明可读性硬规则，比如函数长度、命名和注释规约。第二，把“简化 / 重构 / 删冗余”作为独立 step，而不是寄希望于 first try 一次到位。第三，把 review 标准外置成 skill，例如 `simplify` 或 `code-reviewer`，强制 agent 自审。

更深一层的问题是：agent 写的代码是真的“读不懂”，还是因为读的人没有花时间理解。如果完全不读，那就相当于把生产代码外包给了一个不会被追责的实习生。

### Q27. 设计一个”AI 安全 review agent”, 要避免哪些坑?

设计安全 review agent 时，首先不能只看 diff。安全问题往往出现在 diff 没改到的调用方，所以 review agent 必须能扩展到上下文。

也不能盲信测试通过。很多真正容易出问题的地方，比如反序列化、命令注入，往往不在测试覆盖范围内。review 阶段还必须保持只读，不能让 agent 自己跑攻击命令，否则 review agent 本身反而会变成攻击面。

安全 review 还需要 cross-check。可以用第二个模型，例如 Codex，独立 review 一遍，降低单模型盲点。它也不应该追求“零误报”。安全 review 宁可误报，也不能漏报，但必须做分级，比如 P0 / P1 / P2，让人工可以聚焦真正重要的问题。

最后，安全 review 必须可解释。Agent 不能只丢一句 “this is unsafe”，而要给出“为什么这是漏洞”的论证链。

## 五、团队化与系统设计

> 团队化：共享规则、个人覆盖、审计、plugin 分发和多 agent 拓扑

### Q28. 在多人协作的仓库里, 如何让 agentic 工作流”团队化”?

多人协作时，首先要有共享层。仓库根目录的 `CLAUDE.md` / `AGENTS.md` 应该写团队所有人共享的硬规则，比如代码风格、PR 流程和禁止事项。`.claude/settings.json` 可以用来共享 permission allowlist 和 hooks。团队公共的 `.claude/skills/`、`.claude/agents/`、`.claude/commands/` 也应该全部入 git。

个人层则用来放个人偏好和本地覆盖。`CLAUDE.local.md` 通常加入 gitignore，用来保存个人偏好；`.claude/settings.local.json` 则可以保存个人 permission 覆盖。

分发机制上，可以把团队公共能力打包成 plugin，放到内部 marketplace，让新成员通过一条 `/plugin install` 命令上手。

审计也要跟上。可以通过 hooks 在 `PreToolUse` 上对敏感操作记审计日志，同时在 PR 模板里要求贴出 agent 协作过程中的关键决策点。

### Q29. 如果让你设计 Claude Code / Codex 的多 agent 协作模型, 你会选择”星型 (主-子)“还是”网状 (互通)“? 为什么?

星型，也就是主-子模型，优点是易调试、上下文可控、责任清晰。它的缺点是主对话会成为瓶颈，并行度也有限。

网状，也就是 agent 之间互通的模型，更接近真实团队，并行度更高。但它的风险也明显：容易出现 agent 间循环对话、上下文爆炸、责任不清，以及调试地狱。

在实操中大多数任务用星型就够了，只有极少数复杂多角色任务才需要上网状模型。即便使用网状协作，也要配合消息预算、总线程数上限、可观测的对话图等护栏。

更深一层的问题：多 agent 协作的 ROI 是否真的高于“一个更强的单 agent”？如果模型能力继续提升，多 agent 编排可能只是短期权宜之计。

## 六、讨论


### Q30. Agentic 工具最终会让”程序员”这个职业消失吗?

Agentic 工具大概率不会让“程序员”这个职业消失，但会重塑它。写代码的部分会被大量外包给工具，但理解需求、拆分系统、判断对错和承担责任，这些部分仍然需要人。

会消失的，可能是某一种“程序员”：把工作完全定义为“打字实现 spec”的中下层岗位，风险会显著上升。

重要的工作可能会集中在几类事情上：设计 agent 如何协作，维护可复用的 skill 库和 context 策略；快速 review agent 输出，判断代码、测试和设计是否真的可靠；把领域知识整理成工具能使用的规则、文档和检查流程。

可以类比编译器。编译器没有让汇编程序员消失，但确实让“手写 x86”的人变少了。程序员的抽象层次会再上一层，而不是被简单取代。

### 附录: 学习路径

1. 读 https://code.claude.com/docs/llms.txt, 跑通 /skill, /agent, /plugin, /compact, /memory.
2. 把自己常做的 3 件事各写成一个 skill.
3. 给团队写一个 plugin, 内含 skills + agents + hooks + 一个 MCP server.
4. 研究 hooks 在 PreToolUse 上的复杂决策、Agent Team 实验特性、长任务 (overnight) 的 checkpoint 设计.

## 参考资料

- [SihaoLiu/vibe-agentic-interview-notes](https://github.com/SihaoLiu/vibe-agentic-interview-notes)
- https://code.claude.com/docs/llms.txt
- https://github.com/openai/codex/blob/main/docs/getting-started.md
- Anthropic / OpenAI 公开文档.