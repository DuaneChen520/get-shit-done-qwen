# GSD for Qwen Code - 集成文档

## 概述

Get Shit Done (GSD) 已成功集成到 Qwen Code CLI 中，提供完整的规格驱动开发工作流。

## 安装统计

- ✅ **68 个 GSD 命令** - 已安装到 `~/.qwen/commands/gsd/`
- ✅ **24 个 GSD 代理** - 已安装到 `~/.qwen/agents/`
- ✅ **完整工作流资源** - 已安装到 `~/.qwen/get-shit-done/`
  - `workflows/` - 工作流定义文件
  - `templates/` - 项目模板
  - `references/` - 参考文档
  - `contexts/` - 上下文定义
  - `bin/` - GSD 工具脚本

## 快速开始

### 1. 安装 GSD（如果尚未安装）

```bash
# 全局安装（推荐）
cd E:\personwork\gsd-qwen\get-shit-done
node bin/install-qwen-unified.js --global

# 或者本地安装到当前项目
node bin/install-qwen-unified.js --local
```

### 2. 在 Qwen Code 中使用 GSD

启动 Qwen Code 后，您可以使用以下命令：

#### 核心工作流命令

```bash
# 初始化新项目
/gsd-new-project

# 讨论阶段（规划前收集决策）
/gsd-discuss-phase 1

# 规划阶段（研究 + 规划 + 验证）
/gsd-plan-phase 1

# 执行阶段（并行执行计划）
/gsd-execute-phase 1

# 验证工作
/gsd-verify-work 1

# 查看进度
/gsd-progress

# 自动推进到下一步
/gsd-next

# 查看帮助
/gsd-help
```

#### 完整工作流示例

```bash
# 1. 初始化项目
/gsd-new-project

# 2. 规划第一阶段
/gsd-plan-phase 1

# 3. 执行第一阶段
/gsd-execute-phase 1

# 4. 验证第一阶段工作
/gsd-verify-work 1

# 5. 继续下一阶段
/gsd-plan-phase 2
/gsd-execute-phase 2
```

## 安装选项

### 全局 vs 本地

- **全局安装** (`--global`): 所有项目都可用
  - 命令: `~/.qwen/commands/gsd/`
  - 代理: `~/.qwen/agents/`
  - 资源: `~/.qwen/get-shit-done/`

- **本地安装** (`--local`): 仅当前项目可用
  - 命令: `<project>/.qwen/commands/gsd/`
  - 代理: `<project>/.qwen/agents/`
  - 资源: `<project>/.qwen/get-shit-done/`

### 选择性安装

```bash
# 仅安装命令（跳过代理）
node bin/install-qwen-unified.js --global --skip-agents

# 仅安装代理（跳过命令）
node bin/install-qwen-unified.js --global --skip-commands

# 卸载
node bin/install-qwen-unified.js --global --uninstall
```

## GSD 命令完整列表

### 核心工作流

| 命令 | 描述 |
|------|------|
| `/gsd-new-project` | 完整初始化：提问 → 研究 → 需求 → 路线图 |
| `/gsd-discuss-phase [N]` | 在规划前收集实现决策 |
| `/gsd-plan-phase [N]` | 执行研究 + 规划 + 验证 |
| `/gsd-execute-phase <N>` | 以并行 wave 执行全部计划 |
| `/gsd-verify-work [N]` | 用户验收测试 |
| `/gsd-ship [N]` | 从已验证的阶段工作创建 PR |
| `/gsd-next` | 自动推进到下一个逻辑工作流步骤 |

### 里程碑管理

| 命令 | 描述 |
|------|------|
| `/gsd-complete-milestone` | 归档里程碑并打 release tag |
| `/gsd-new-milestone [name]` | 开始下一个版本 |
| `/gsd-audit-milestone` | 验证里程碑是否达到完成定义 |

### 阶段管理

| 命令 | 描述 |
|------|------|
| `/gsd-add-phase` | 在路线图末尾追加 phase |
| `/gsd-insert-phase [N]` | 在 phase 之间插入紧急工作 |
| `/gsd-remove-phase [N]` | 删除未来 phase，并重编号 |

### 工具和实用程序

| 命令 | 描述 |
|------|------|
| `/gsd-help` | 显示全部命令和使用指南 |
| `/gsd-progress` | 我现在在哪？下一步是什么？ |
| `/gsd-stats` | 显示项目统计 |
| `/gsd-health` | 校验 `.planning/` 目录完整性 |
| `/gsd-settings` | 配置模型 profile 和工作流代理 |
| `/gsd-quick` | 以 GSD 保障执行临时任务 |
| `/gsd-fast <text>` | 内联处理琐碎任务 |

## GSD 代理列表

已安装 24 个专用代理：

### 研究类代理

- `gsd-project-researcher` - 研究领域生态系统
- `gsd-phase-researcher` - 研究特定阶段的技术决策
- `gsd-research-synthesizer` - 综合多个研究代理的发现
- `gsd-ui-researcher` - 研究 UI/UX 模式和组件库

### 规划类代理

- `gsd-planner` - 创建详细的阶段计划
- `gsd-roadmapper` - 创建分阶段执行路线图
- `gsd-plan-checker` - 验证计划是否满足阶段目标

### 执行类代理

- `gsd-executor` - 实现计划中的任务
- `gsd-codebase-mapper` - 分析现有代码库
- `gsd-debugger` - 调试问题

### 验证类代理

- `gsd-verifier` - 验证工作是否满足需求
- `gsd-integration-checker` - 检查集成问题
- `gsd-code-reviewer` - 代码审查
- `gsd-ui-checker` - UI 实现审查

### 其他专业代理

- `gsd-user-profiler` - 分析开发者行为档案
- `gsd-advisor-researcher` - 顾问级研究代理
- `gsd-assumptions-analyzer` - 分析假设条件
- `gsd-security-auditor` - 安全审计
- `gsd-nyquist-auditor` - Nyquist 验证审计

## 工作原理

### 1. 上下文工程

GSD 通过以下文件维护项目上下文：

- `PROJECT.md` - 项目愿景，始终加载
- `REQUIREMENTS.md` - 带 phase 可追踪性的 v1/v2 范围定义
- `ROADMAP.md` - 你要去哪里、哪些已经完成
- `STATE.md` - 决策、阻塞、当前位置，跨会话记忆
- `PLAN.md` - 带 XML 结构和验证步骤的原子任务
- `SUMMARY.md` - 做了什么、改了什么、已写入历史

### 2. 多代理编排

每个阶段遵循统一模式：

```
Orchestrator (主会话)
  ├─ 研究阶段: 4 个并行研究代理
  ├─ 规划阶段: Planner + Plan Checker 循环
  ├─ 执行阶段: 多个 Executor 代理并行
  └─ 验证阶段: Verifier + Debugger
```

### 3. Wave 执行机制

计划根据依赖关系分组为 wave：

```
WAVE 1 (parallel) → WAVE 2 (parallel) → WAVE 3
┌─────────┐ ┌─────────┐    ┌─────────┐
│ Plan 01 │ │ Plan 02 │ →  │ Plan 03 │
└─────────┘ └─────────┘    └─────────┘
```

- 同一 wave 内并行执行
- 不同 wave 之间顺序推进
- 每个计划使用全新上下文（20 万 token）

## 配置选项

### 模型 Profile

通过 `/gsd-settings` 或 `/gsd-set-profile` 配置：

| Profile | Planning | Execution | Verification |
|---------|----------|-----------|--------------|
| `quality` | Opus | Opus | Sonnet |
| `balanced`（默认） | Opus | Sonnet | Sonnet |
| `budget` | Sonnet | Sonnet | Haiku |
| `inherit` | 继承当前模型 | 继承当前模型 | 继承当前模型 |

### 工作流代理开关

```bash
# 通过 /gsd-settings 配置
- workflow.research: 每个 phase 规划前先调研
- workflow.plan_check: 执行前验证计划
- workflow.verifier: 执行后确认交付项
- workflow.auto_advance: 自动串联工作流
```

## 路径映射

GSD 原始为 Claude Code 设计，路径已从 `~/.claude/` 映射到 `~/.qwen/`：

| 原始路径 (Claude Code) | 新路径 (Qwen Code) |
|------------------------|---------------------|
| `~/.claude/commands/gsd/` | `~/.qwen/commands/gsd/` |
| `~/.claude/get-shit-done/` | `~/.qwen/get-shit-done/` |
| `~/.claude/agents/` | `~/.qwen/agents/` |
| `$HOME/.claude/get-shit-done/bin/gsd-tools.cjs` | `$HOME/.qwen/get-shit-done/bin/gsd-tools.cjs` |

## 故障排查

### 命令未找到

如果 `/gsd-*` 命令未出现：

1. 验证安装：
   ```bash
   ls ~/.qwen/commands/gsd/
   ```

2. 重新安装：
   ```bash
   node bin/install-qwen-unified.js --global
   ```

3. 重启 Qwen Code

### 代理未找到

如果工作流报告代理未找到：

1. 验证代理安装：
   ```bash
   ls ~/.qwen/agents/gsd-*.md
   ```

2. 重新安装代理：
   ```bash
   node bin/install-qwen-unified.js --global --skip-commands
   ```

### 路径错误

如果看到 `~/.claude/` 相关错误：

1. 检查文件是否已转换：
   ```bash
   grep -r "~/.claude/" ~/.qwen/commands/gsd/ | head -5
   ```

2. 重新安装（会自动转换路径）：
   ```bash
   node bin/install-qwen-unified.js --global
   ```

## 与原始 GSD 的兼容性

✅ **完全兼容** - 所有 68 个命令已转换并可用
✅ **工作流完整** - 所有工作流文件已安装
✅ **代理系统** - 24 个代理已定义
✅ **工具脚本** - `gsd-tools.cjs` 已安装并更新路径

## 更新 GSD

当 GSD 上游更新时：

```bash
# 更新 get-shit-done 仓库
cd E:\personwork\gsd-qwen\get-shit-done
git pull

# 重新安装
node bin/install-qwen-unified.js --global
```

## 贡献

如果您发现任何问题或有改进建议，请提交 issue 到：
`E:\personwork\gsd-qwen` 仓库

## 许可证

MIT License - 与原始 GSD 相同

---

**最后更新**: 2026-04-08
**GSD 版本**: v1.34.2
**集成状态**: ✅ 完整可用
