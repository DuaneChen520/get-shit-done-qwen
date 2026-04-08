#!/usr/bin/env node

/**
 * Install GSD hooks configuration to Qwen Code settings.json
 * Configures PreToolUse, PostToolUse, and SessionStart hooks
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');
const hasAll = args.includes('--all');
const hasMinimal = args.includes('--minimal');

/**
 * Expand ~ to home directory
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Get Qwen Code global config directory
 */
function getQwenGlobalDir() {
  if (process.env.QWEN_CONFIG_DIR) {
    return expandTilde(process.env.QWEN_CONFIG_DIR);
  }
  return path.join(os.homedir(), '.qwen');
}

/**
 * Read and parse JSON file, returning empty object if not exists
 */
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`  ${red}✗${reset} Failed to parse ${filePath}: ${e.message}`);
    return {};
  }
}

/**
 * Write JSON to file with proper formatting
 */
function writeJsonFile(filePath, data) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Get GSD hooks directory path
 */
function getGsdHooksDir() {
  const qwenDir = getQwenGlobalDir();
  return path.join(qwenDir, 'get-shit-done', 'hooks');
}

/**
 * Build hook configuration for a specific hook
 */
function buildHookConfig(hookFile, hookName, type = 'command') {
  const hooksDir = getGsdHooksDir();
  const hookPath = path.join(hooksDir, hookFile);
  
  // Use $HOME for cross-platform compatibility
  const homeDir = os.homedir();
  const relativePath = hookPath.replace(homeDir, '$HOME').replace(/\\/g, '/');
  
  const isShell = hookFile.endsWith('.sh');
  const command = isShell ? `bash "${relativePath}"` : `node "${relativePath}"`;
  
  return {
    type,
    command,
    name: hookName
  };
}

/**
 * Get hooks configuration - mirrors original GSD hooks setup
 * Configures ALL hooks by default (matching original Claude Code behavior)
 */
function getHooksConfig(mode = 'all') {
  const hooks = {
    PreToolUse: [],
    PostToolUse: [],
    SessionStart: []
  };

  if (mode === 'all' || mode === 'recommended' || mode === 'minimal') {
    // Essential: Prompt injection guard
    hooks.PreToolUse.push({
      matcher: "Write|Edit",
      hooks: [buildHookConfig('gsd-prompt-guard.js', 'gsd-prompt-guard')]
    });
  }

  if (mode === 'all' || mode === 'recommended') {
    // Context monitor
    hooks.PostToolUse.push({
      hooks: [buildHookConfig('gsd-context-monitor.js', 'gsd-context-monitor')]
    });

    // Read-before-edit guard
    hooks.PreToolUse.push({
      matcher: "Write",
      hooks: [buildHookConfig('gsd-read-guard.js', 'gsd-read-guard')]
    });

    // Workflow guard
    hooks.PreToolUse.push({
      hooks: [buildHookConfig('gsd-workflow-guard.js', 'gsd-workflow-guard')]
    });
  }

  if (mode === 'all') {
    // All hooks (matching original GSD Claude Code setup)
    hooks.PreToolUse.push({
      matcher: "Bash",
      hooks: [buildHookConfig('gsd-validate-commit.sh', 'gsd-validate-commit')]
    });

    hooks.SessionStart.push(
      { hooks: [buildHookConfig('gsd-session-state.sh', 'gsd-session-state')] },
      { hooks: [buildHookConfig('gsd-check-update.js', 'gsd-check-update')] }
    );

    hooks.PostToolUse.push({
      hooks: [buildHookConfig('gsd-statusline.js', 'gsd-statusline')]
    });
  }

  return hooks;
}

/**
 * Merge hooks into settings
 */
function mergeHooks(settings, newHooks, mode = 'recommended') {
  if (!settings.hooks) {
    settings.hooks = {};
  }

  const existingHooks = settings.hooks;
  
  for (const [eventName, definitions] of Object.entries(newHooks)) {
    if (!existingHooks[eventName]) {
      existingHooks[eventName] = [];
    }

    for (const def of definitions) {
      // Avoid duplicates
      const exists = existingHooks[eventName].some(existing => {
        if (!existing.matcher && !def.matcher) {
          return existing.hooks?.some(h => 
            def.hooks?.some(newH => newH.name === h.name)
          );
        }
        return existing.matcher === def.matcher && existing.hooks?.some(h =>
          def.hooks?.some(newH => newH.name === h.name)
        );
      });

      if (!exists) {
        existingHooks[eventName].push(def);
      }
    }
  }

  return settings;
}

/**
 * Remove GSD hooks from settings
 */
function removeGsdHooks(settings) {
  if (!settings.hooks) {
    return settings;
  }

  for (const eventName of Object.keys(settings.hooks)) {
    settings.hooks[eventName] = settings.hooks[eventName].filter(def => {
      if (!def.hooks) return true;
      return !def.hooks.some(h => h.name && h.name.startsWith('gsd-'));
    }).filter(def => def.hooks && def.hooks.length > 0);
    
    if (settings.hooks[eventName].length === 0) {
      delete settings.hooks[eventName];
    }
  }

  return settings;
}

/**
 * Install hooks configuration
 */
function install(isGlobal, mode = 'recommended') {
  console.log(`  ${cyan}Mode:${reset} ${isGlobal ? 'Global' : 'Local'} hooks installation (${mode})\n`);

  let settingsPath;
  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    settingsPath = path.join(qwenDir, 'settings.json');
  } else {
    const projectDir = process.cwd();
    settingsPath = path.join(projectDir, '.qwen', 'settings.json');
  }

  console.log(`  ${dim}Settings file:${reset} ${settingsPath}`);
  console.log(`  ${dim}Hooks directory:${reset} ${getGsdHooksDir()}\n`);

  // Verify hooks directory
  const hooksDir = getGsdHooksDir();
  if (!fs.existsSync(hooksDir)) {
    console.error(`  ${red}✗${reset} Hooks directory not found. Please install GSD first.`);
    process.exit(1);
  }

  // Read existing settings
  const settings = readJsonFile(settingsPath);
  const hadHooks = !!settings.hooks;

  // Build new hooks config
  const newHooks = getHooksConfig(mode);

  // Merge
  const updatedSettings = mergeHooks(settings, newHooks, mode);

  // Write
  writeJsonFile(settingsPath, updatedSettings);

  console.log(`  ${cyan}►${reset} Configuring hooks...`);
  
  let hookCount = 0;
  for (const [eventName, definitions] of Object.entries(newHooks)) {
    for (const def of definitions) {
      if (def.hooks) {
        hookCount += def.hooks.length;
      }
    }
  }

  console.log(`  ${green}✓${reset} Configured ${hookCount} hooks across ${Object.keys(newHooks).length} events`);
  console.log(`  ${green}✓${reset} Settings ${hadHooks ? 'updated' : 'created'} at ${settingsPath}`);

  console.log(`\n  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
  console.log(`  ${green}✓ GSD hooks configured for Qwen Code!${reset}`);
  console.log(`  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);

  console.log(`  ${dim}Installed hooks:${reset}`);
  for (const [eventName, definitions] of Object.entries(newHooks)) {
    console.log(`    ${cyan}${eventName}:${reset}`);
    for (const def of definitions) {
      if (def.matcher) {
        console.log(`      matcher: ${def.matcher}`);
      }
      if (def.hooks) {
        for (const hook of def.hooks) {
          console.log(`      - ${hook.name}`);
        }
      }
    }
  }
  console.log('');
}

/**
 * Uninstall hooks configuration
 */
function uninstall(isGlobal) {
  console.log(`  ${yellow}Mode:${reset} Uninstall hooks\n`);

  let settingsPath;
  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    settingsPath = path.join(qwenDir, 'settings.json');
  } else {
    const projectDir = process.cwd();
    settingsPath = path.join(projectDir, '.qwen', 'settings.json');
  }

  console.log(`  ${dim}Settings file:${reset} ${settingsPath}\n`);

  const settings = readJsonFile(settingsPath);
  const hadHooks = !!settings.hooks;

  if (!hadHooks) {
    console.log(`  ${yellow}⊘${reset} No hooks configured, nothing to remove`);
    return;
  }

  const updatedSettings = removeGsdHooks(settings);
  writeJsonFile(settingsPath, updatedSettings);

  console.log(`  ${green}✓${reset} GSD hooks removed from ${settingsPath}\n`);
}

// Main execution
if (hasUninstall) {
  uninstall(hasGlobal);
} else {
  // Default to 'all' to match original GSD hooks configuration
  const mode = hasAll ? 'all' : hasMinimal ? 'minimal' : 'all';
  install(hasGlobal || hasLocal ? hasGlobal : true, mode);
}
