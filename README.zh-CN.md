<div align="center">

# GSD for Qwen Code

[English](README.md) · **简体中文**

**Get Shit Done 工作流系统 — 现已完整支持 Qwen Code CLI。**

[![GSD 版本](https://img.shields.io/badge/GSD-v1.34.2-blue?style=for-the-badge)](https://github.com/gsd-build/get-shit-done)
[![Qwen 集成](https://img.shields.io/badge/Qwen-Code-8A2BE2?style=for-the-badge&logo=qwen)](https://qwenlm.github.io/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx --yes degit DuaneChen520/get-shit-done-qwen#main gsd-qwen-temp && node gsd-qwen-temp/bin/install-qwen-unified.js --global && rm -rf gsd-qwen-temp
```

<br>

</div>

---

## 背景

**GSD (Get Shit Done)** 是一个强大的元提示、上下文工程与规格驱动开发系统，最初为 Claude Code 构建。它解决的是 "context rot"（上下文腐化）—— 随着 AI 代理填满上下文窗口，输出质量逐步劣化的问题。GSD 通过结构化工作流、多代理编排和原子 git 提交来保持输出质量。

**Qwen Code CLI** 基于最新的 Qwen 3.6 Plus 模型，为终端带来了卓越的编码能力。作为开发者，我们立刻意识到了它的潜力：强大的推理能力、出色的代码理解、可靠的执行表现。

**这个项目将两者结合了起来。** GSD 原本专为 Claude Code 设计，并未支持 Qwen Code。我们把整个系统 — 68 条命令、24 个代理、9 个 hooks — 完整适配到了 Qwen Code。结果？一套生产级的、面向 Qwen Code 用户的规格驱动开发工作流。

---

## 这是什么

这是 **GSD v1.34.2 的 fork**，为 Qwen Code CLI 完整适配。包含：

- ✅ **68 条 GSD 命令** 已转换为 Qwen Code 格式
- ✅ **24 个 GSD 代理** 兼容 Qwen Code 子代理系统
- ✅ **9 个 GSD hooks** 完整支持 Qwen Code hooks 系统（8 个默认启用 + 1 个可选）
- ✅ **路径转换** 从 `~/.claude/` 到 `~/.qwen/`（已转换 145 个文件）
- ✅ **安装脚本** 一键完成配置

---

## 快速安装

### 一键安装（全局）

```bash
npx --yes degit DuaneChen520/get-shit-done-qwen#main gsd-qwen-temp && node gsd-qwen-temp/bin/install-qwen-unified.js --global && rm -rf gsd-qwen-temp
```

### 一键安装（本地，当前项目）

```bash
npx --yes degit DuaneChen520/get-shit-done-qwen#main gsd-qwen-temp && node gsd-qwen-temp/bin/install-qwen-unified.js --local && rm -rf gsd-qwen-temp
```

### 手动安装

```bash
git clone --depth 1 https://github.com/DuaneChen520/get-shit-done-qwen.git
cd get-shit-done-qwen
node bin/install-qwen-unified.js --global  # 或 --local
```

### 验证安装

启动 Qwen Code 后运行：

```
/gsd-help
```

---

## 核心工作流

### 1. 初始化项目

```
/gsd-new-project
```

一个命令，一条完整流程。系统会提问直到完全理解你的想法，可选地拉起研究代理，提取需求，再创建阶段路线图。你审核通过后就可以开始构建。

**生成：** `PROJECT.md`、`REQUIREMENTS.md`、`ROADMAP.md`、`STATE.md`

---

### 2. 讨论阶段

```
/gsd-discuss-phase 1
```

你的路线图里每个阶段通常只有一两句话。这点信息不足以让系统按你脑中的样子做出来。这一步在研究和规划之前，先把你的偏好收进去。

系统会根据要构建的内容识别灰区——视觉功能、API、内容系统、组织型任务——并持续追问直到你满意。

**生成：** `{phase_num}-CONTEXT.md`

---

### 3. 规划阶段

```
/gsd-plan-phase 1
```

系统研究该阶段如何实现，创建原子化任务计划（XML 结构），并与需求对照验证。每份计划都足够小，可以在全新上下文窗口中执行。

**生成：** `{phase_num}-RESEARCH.md`、`{phase_num}-{N}-PLAN.md`

---

### 4. 执行阶段

```
/gsd-execute-phase 1
```

计划按 wave 执行——能并行的并行，有依赖的顺序执行。每个计划使用全新上下文（零历史垃圾）。每项任务都有自己的原子提交。

**生成：** `{phase_num}-{N}-SUMMARY.md`、`{phase_num}-VERIFICATION.md`

---

### 5. 验证工作

```
/gsd-verify-work 1
```

自动化验证检查代码存在和测试通过。然后你亲自走查交付项。如果有问题，系统会自动拉起 debug 代理并生成修复计划。

**生成：** `{phase_num}-UAT.md`

---

### 6. 重复 → 发布

```
/gsd-discuss-phase 2
/gsd-plan-phase 2
/gsd-execute-phase 2
/gsd-verify-work 2
/gsd-ship 2                  # 从已验证的工作创建 PR
```

或者让 GSD 自动推进：

```
/gsd-next                    # 自动检测并执行下一步
```

---

## 命令参考

### 核心工作流

| 命令 | 说明 |
|------|------|
| `/gsd-new-project` | 完整初始化：提问 → 研究 → 需求 → 路线图 |
| `/gsd-discuss-phase [N]` | 在规划前收集实现决策 |
| `/gsd-plan-phase [N]` | 执行研究 + 规划 + 验证 |
| `/gsd-execute-phase <N>` | 以并行 wave 执行全部计划 |
| `/gsd-verify-work [N]` | 用户验收测试 |
| `/gsd-ship [N]` | 从已验证的阶段工作创建 PR |
| `/gsd-next` | 自动推进到下一个逻辑工作流步骤 |

### 里程碑管理

| 命令 | 说明 |
|------|------|
| `/gsd-complete-milestone` | 归档里程碑并打 release tag |
| `/gsd-new-milestone [name]` | 开始下一个版本 |
| `/gsd-audit-milestone` | 验证里程碑是否达到完成定义 |

### 阶段管理

| 命令 | 说明 |
|------|------|
| `/gsd-add-phase` | 在路线图末尾追加 phase |
| `/gsd-insert-phase [N]` | 在 phase 之间插入紧急工作 |
| `/gsd-remove-phase [N]` | 删除未来 phase |

### 工具

| 命令 | 说明 |
|------|------|
| `/gsd-help` | 显示全部命令 |
| `/gsd-progress` | 我现在在哪？下一步是什么？ |
| `/gsd-stats` | 显示项目统计 |
| `/gsd-health` | 校验 `.planning/` 目录完整性 |
| `/gsd-settings` | 配置模型 profile 和工作流代理 |
| `/gsd-quick` | 以 GSD 保障执行临时任务 |
| `/gsd-fast <text>` | 内联处理琐碎任务，跳过规划 |

---

## 工作原理

### 上下文工程

GSD 通过结构化文件维护项目上下文：

| 文件 | 作用 |
|------|------|
| `PROJECT.md` | 项目愿景，始终加载 |
| `REQUIREMENTS.md` | 带 phase 可追踪性的 v1/v2 范围定义 |
| `ROADMAP.md` | 你要去哪里、哪些已经完成 |
| `STATE.md` | 决策、阻塞、当前位置，跨会话记忆 |
| `PLAN.md` | 带 XML 结构和验证步骤的原子任务 |
| `SUMMARY.md` | 做了什么、改了什么、已写入历史 |

### 多代理编排

每个阶段遵循统一模式：

| 阶段 | 做什么 |
|------|--------|
| 研究 | 4 个并行研究代理分别调查技术栈、功能、架构、坑点 |
| 规划 | Planner 生成计划，checker 验证，循环直到通过 |
| 执行 | Executors 并行实现，每个都有全新上下文 |
| 验证 | Verifier 对照目标检查代码库，debuggers 诊断失败 |

### Wave 执行

计划根据依赖关系分组。同一 wave 内并行执行，不同 wave 之间顺序推进。

```
WAVE 1 (并行)      WAVE 2 (并行)      WAVE 3
┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐    ┌─────────┐
│ Plan 01 │ │ Plan 02 │ →  │ Plan 03 │ │ Plan 04 │ →  │ Plan 05 │
└─────────┘ └─────────┘    └─────────┘ └─────────┘    └─────────┘
```

### 原子 Git 提交

每个任务完成后都会立刻生成独立提交：

```bash
abc123f docs(08-02): complete user registration plan
def456g feat(08-02): add email confirmation flow
hij789k feat(08-02): implement password hashing
```

---

## 安装详情

### 安装了什么

| 组件 | 安装位置 | 数量 |
|------|---------|------|
| 命令 | `~/.qwen/commands/gsd/` | 68 个文件 |
| 代理 | `~/.qwen/agents/` | 24 个文件 |
| 资源 | `~/.qwen/get-shit-done/` | 工作流、模板、参考文档 |
| Hooks | `~/.qwen/get-shit-done/hooks/` | 9 个 hooks（8 默认 + 1 可选）|

### Hooks

GSD hooks 与 Qwen Code 的事件系统集成：

| Hook | 事件 | 默认 |
|------|------|------|
| `gsd-prompt-guard` | PreToolUse | ✅ 启用 |
| `gsd-stale-hooks` | PostToolUse | ✅ 启用 |
| `gsd-context-monitor` | PostToolUse | ✅ 启用 |
| `gsd-phase-boundary` | SessionStart | ⬜ 可选 |
| ... | ... | ... |

在 `~/.qwen/settings.json` 或通过 `/gsd-settings` 配置 hooks。

### 卸载

```bash
cd get-shit-done-qwen
node bin/install-qwen-unified.js --global --uninstall
```

---

## 更新

当本仓库更新时：

```bash
cd get-shit-done-qwen
git pull
node bin/install-qwen-unified.js --global
```

与上游 GSD 同步：

```bash
git fetch upstream
git merge upstream/main
node bin/install-qwen-unified.js --global
```

---

## 致谢

- **原版 GSD**: [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) by TÂCHES
- **Qwen Code 集成**: [DuaneChen520](https://github.com/DuaneChen520)
- **Qwen Code CLI**: [Qwen 团队](https://qwenlm.github.io/)

---

## License

MIT License。详见 [LICENSE](LICENSE)。

---

<div align="center">

**GSD 让 Claude Code 变得可靠。现在，它对 Qwen Code 也一样。**

</div>
