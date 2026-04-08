<div align="center">

# GSD for Qwen Code

**English** · [简体中文](README.zh-CN.md)

**Get Shit Done workflow system — now with full Qwen Code CLI support.**

[![GSD Version](https://img.shields.io/badge/GSD-v1.34.2-blue?style=for-the-badge)](https://github.com/gsd-build/get-shit-done)
[![Qwen Integration](https://img.shields.io/badge/Qwen-Code-8A2BE2?style=for-the-badge&logo=qwen)](https://qwenlm.github.io/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx --yes degit DuaneChen520/get-shit-done-qwen#main gsd-qwen-temp && node gsd-qwen-temp/bin/install-qwen-unified.js --global && rm -rf gsd-qwen-temp
```

<br>

</div>

---

## Background

**GSD (Get Shit Done)** is a powerful meta-prompting, context engineering, and spec-driven development system originally built for Claude Code. It solves "context rot" — the quality degradation that happens as AI agents fill their context windows — through structured workflows, multi-agent orchestration, and atomic git commits.

**Qwen Code CLI**, powered by the latest Qwen 3.6 Plus model, brings exceptional coding capabilities to the terminal. As developers, we immediately recognized its potential: strong reasoning, excellent code understanding, and reliable execution.

**This project bridges the two.** GSD was designed for Claude Code and didn't support Qwen Code. We adapted the entire system — 68 commands, 24 agents, 9 hooks — to work natively with Qwen Code. The result? A production-ready spec-driven development workflow for Qwen Code users.

---

## What This Is

This is a **fork of GSD v1.34.2**, adapted for Qwen Code CLI. It includes:

- ✅ **68 GSD commands** converted to Qwen Code format
- ✅ **24 GSD agents** compatible with Qwen Code subagent system
- ✅ **9 GSD hooks** with full Qwen Code hook system support (8 default + 1 opt-in)
- ✅ **Path transformation** from `~/.claude/` to `~/.qwen/` (145 files converted)
- ✅ **Installation scripts** for easy setup

---

## Quick Install

### One-Line Install (Global)

```bash
npx --yes degit DuaneChen520/get-shit-done-qwen#main gsd-qwen-temp && node gsd-qwen-temp/bin/install-qwen-unified.js --global && node -e "require('fs').rmSync('gsd-qwen-temp',{recursive:true,force:true})"
```

### One-Line Install (Local, Current Project)

```bash
npx --yes degit DuaneChen520/get-shit-done-qwen#main gsd-qwen-temp && node gsd-qwen-temp/bin/install-qwen-unified.js --local && node -e "require('fs').rmSync('gsd-qwen-temp',{recursive:true,force:true})"
```

### Manual Install

```bash
git clone --depth 1 https://github.com/DuaneChen520/get-shit-done-qwen.git
cd get-shit-done-qwen
node bin/install-qwen-unified.js --global  # or --local
```

### Verify Installation

Start Qwen Code and run:

```
/gsd-help
```

---

## Core Workflow

### 1. Initialize Project

```
/gsd-new-project
```

One command, one flow. The system asks questions until it understands your idea, optionally spawns research agents, extracts requirements, and creates a phase roadmap. You approve it — then you're ready to build.

**Creates:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`

---

### 2. Discuss Phase

```
/gsd-discuss-phase 1
```

Your roadmap has a sentence or two per phase. That's not enough context to build something the way *you* imagine it. This step captures your preferences before anything gets researched or planned.

The system identifies gray areas based on what's being built — visual features, APIs, content systems, organization tasks — and asks until you're satisfied.

**Creates:** `{phase_num}-CONTEXT.md`

---

### 3. Plan Phase

```
/gsd-plan-phase 1
```

The system researches how to implement this phase, creates atomic task plans with XML structure, and verifies them against requirements. Each plan is small enough to execute in a fresh context window.

**Creates:** `{phase_num}-RESEARCH.md`, `{phase_num}-{N}-PLAN.md`

---

### 4. Execute Phase

```
/gsd-execute-phase 1
```

Plans run in waves — parallel where possible, sequential when dependent. Fresh context per plan (no accumulated garbage). Every task gets its own atomic commit.

**Creates:** `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

---

### 5. Verify Work

```
/gsd-verify-work 1
```

Automated verification checks that code exists and tests pass. Then you walk through the deliverables yourself. If something's broken, the system spawns debug agents and creates fix plans automatically.

**Creates:** `{phase_num}-UAT.md`

---

### 6. Repeat → Ship

```
/gsd-discuss-phase 2
/gsd-plan-phase 2
/gsd-execute-phase 2
/gsd-verify-work 2
/gsd-ship 2                  # Create PR from verified work
```

Or let GSD auto-advance:

```
/gsd-next                    # Auto-detect and run next step
```

---

## Commands Reference

### Core Workflow

| Command | Description |
|---------|-------------|
| `/gsd-new-project` | Full initialization: questions → research → requirements → roadmap |
| `/gsd-discuss-phase [N]` | Capture implementation decisions before planning |
| `/gsd-plan-phase [N]` | Research + plan + verify for a phase |
| `/gsd-execute-phase <N>` | Execute all plans in parallel waves |
| `/gsd-verify-work [N]` | User acceptance testing |
| `/gsd-ship [N]` | Create PR from verified phase work |
| `/gsd-next` | Auto-detect and run next workflow step |

### Milestone Management

| Command | Description |
|---------|-------------|
| `/gsd-complete-milestone` | Archive milestone, tag release |
| `/gsd-new-milestone [name]` | Start next version |
| `/gsd-audit-milestone` | Verify milestone achieved definition of done |

### Phase Management

| Command | Description |
|---------|-------------|
| `/gsd-add-phase` | Append phase to roadmap |
| `/gsd-insert-phase [N]` | Insert urgent work between phases |
| `/gsd-remove-phase [N]` | Remove future phase |

### Utilities

| Command | Description |
|---------|-------------|
| `/gsd-help` | Show all commands |
| `/gsd-progress` | Where am I? What's next? |
| `/gsd-stats` | Project statistics |
| `/gsd-health` | Verify `.planning/` integrity |
| `/gsd-settings` | Configure model profiles and workflow agents |
| `/gsd-quick` | Execute ad-hoc tasks with GSD guarantees |
| `/gsd-fast <text>` | Inline trivial tasks, skip planning |

---

## How It Works

### Context Engineering

GSD maintains project context through structured files:

| File | Purpose |
|------|---------|
| `PROJECT.md` | Project vision, always loaded |
| `REQUIREMENTS.md` | Scoped v1/v2 requirements with phase traceability |
| `ROADMAP.md` | Where you're going, what's done |
| `STATE.md` | Decisions, blockers, position — memory across sessions |
| `PLAN.md` | Atomic task with XML structure and verification steps |
| `SUMMARY.md` | What happened, what changed, committed to history |

### Multi-Agent Orchestration

Every stage follows the same pattern:

| Stage | What Happens |
|-------|-------------|
| Research | 4 parallel researchers investigate stack, features, architecture, pitfalls |
| Planning | Planner creates plans, checker verifies, loop until pass |
| Execution | Executors implement in parallel, each with fresh context |
| Verification | Verifier checks codebase against goals, debuggers diagnose failures |

### Wave Execution

Plans are grouped by dependencies. Within each wave, plans run in parallel. Waves run sequentially.

```
WAVE 1 (parallel)    WAVE 2 (parallel)    WAVE 3
┌─────────┐ ┌─────────┐    ┌─────────┐ ┌─────────┐    ┌─────────┐
│ Plan 01 │ │ Plan 02 │ →  │ Plan 03 │ │ Plan 04 │ →  │ Plan 05 │
└─────────┘ └─────────┘    └─────────┘ └─────────┘    └─────────┘
```

### Atomic Git Commits

Each task gets its own commit immediately:

```bash
abc123f docs(08-02): complete user registration plan
def456g feat(08-02): add email confirmation flow
hij789k feat(08-02): implement password hashing
```

---

## Installation Details

### What Gets Installed

| Component | Destination | Count |
|-----------|-------------|-------|
| Commands | `~/.qwen/commands/gsd/` | 68 files |
| Agents | `~/.qwen/agents/` | 24 files |
| Resources | `~/.qwen/get-shit-done/` | workflows, templates, references |
| Hooks | `~/.qwen/get-shit-done/hooks/` | 9 hooks (8 default + 1 opt-in) |

### Hooks

GSD hooks integrate with Qwen Code's event system:

| Hook | Event | Default |
|------|-------|---------|
| `gsd-prompt-guard` | PreToolUse | ✅ Enabled |
| `gsd-stale-hooks` | PostToolUse | ✅ Enabled |
| `gsd-context-monitor` | PostToolUse | ✅ Enabled |
| `gsd-phase-boundary` | SessionStart | ⬜ Opt-in |
| ... | ... | ... |

Configure hooks in `~/.qwen/settings.json` or via `/gsd-settings`.

### Uninstall

```bash
cd get-shit-done-qwen
node bin/install-qwen-unified.js --global --uninstall
```

---

## Updating

When this repository updates:

```bash
cd get-shit-done-qwen
git pull
node bin/install-qwen-unified.js --global
```

To sync with upstream GSD:

```bash
git fetch upstream
git merge upstream/main
node bin/install-qwen-unified.js --global
```

---

## Credits

- **Original GSD**: [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) by TÂCHES
- **Qwen Code Integration**: [DuaneChen520](https://github.com/DuaneChen520)
- **Qwen Code CLI**: [Qwen Team](https://qwenlm.github.io/)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**GSD makes Claude Code reliable. Now it does the same for Qwen Code.**

</div>
