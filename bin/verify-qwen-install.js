#!/usr/bin/env node

/**
 * Verify GSD installation in Qwen Code
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const cyan = '\x1b[36m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

function check(label, condition, detail = '') {
  const status = condition ? `${green}✓${reset}` : `${red}✗${reset}`;
  console.log(`  ${status} ${label}${detail ? dim + ' ' + detail : ''}`);
  return condition;
}

console.log(`\n${cyan}GSD Installation Verification for Qwen Code${reset}\n`);

const homeDir = os.homedir();
const qwenDir = path.join(homeDir, '.qwen');

let allPassed = true;

// 1. Check Qwen Code base directory
console.log(`${yellow}1. Qwen Code Base Directory${reset}`);
allPassed &= check('Qwen config directory exists', fs.existsSync(qwenDir), qwenDir);
console.log('');

// 2. Check GSD Commands
console.log(`${yellow}2. GSD Commands${reset}`);
const commandsDir = path.join(qwenDir, 'commands', 'gsd');
allPassed &= check('Commands directory exists', fs.existsSync(commandsDir), commandsDir);

if (fs.existsSync(commandsDir)) {
  const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  allPassed &= check('Command files count', commandFiles.length >= 60, `(${commandFiles.length} found)`);
  
  // Check key commands
  const keyCommands = ['new-project.md', 'plan-phase.md', 'execute-phase.md', 'discuss-phase.md', 'help.md'];
  for (const cmd of keyCommands) {
    allPassed &= check(`  Key command: ${cmd}`, fs.existsSync(path.join(commandsDir, cmd)));
  }
}
console.log('');

// 3. Check GSD Resources
console.log(`${yellow}3. GSD Resources${reset}`);
const resourcesDir = path.join(qwenDir, 'get-shit-done');
allPassed &= check('Resources directory exists', fs.existsSync(resourcesDir), resourcesDir);

if (fs.existsSync(resourcesDir)) {
  const requiredDirs = ['workflows', 'templates', 'references', 'bin'];
  for (const dir of requiredDirs) {
    allPassed &= check(`  Resource subdirectory: ${dir}`, fs.existsSync(path.join(resourcesDir, dir)));
  }
  
  // Check gsd-tools.cjs
  const toolsPath = path.join(resourcesDir, 'bin', 'gsd-tools.cjs');
  allPassed &= check('  GSD tools script exists', fs.existsSync(toolsPath));
}
console.log('');

// 4. Check GSD Agents
console.log(`${yellow}4. GSD Agents${reset}`);
const agentsDir = path.join(qwenDir, 'agents');
allPassed &= check('Agents directory exists', fs.existsSync(agentsDir), agentsDir);

if (fs.existsSync(agentsDir)) {
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.startsWith('gsd-') && f.endsWith('.md'));
  allPassed &= check('Agent files count', agentFiles.length >= 20, `(${agentFiles.length} found)`);
  
  // Check key agents
  const keyAgents = ['gsd-planner.md', 'gsd-executor.md', 'gsd-verifier.md', 'gsd-project-researcher.md'];
  for (const agent of keyAgents) {
    allPassed &= check(`  Key agent: ${agent}`, fs.existsSync(path.join(agentsDir, agent)));
  }
}
console.log('');

// 5. Check Path Transformations
console.log(`${yellow}5. Path Transformations${reset}`);
if (fs.existsSync(commandsDir)) {
  const sampleCommand = path.join(commandsDir, 'new-project.md');
  if (fs.existsSync(sampleCommand)) {
    const content = fs.readFileSync(sampleCommand, 'utf8');
    const hasOldPath = content.includes('~/.claude/get-shit-done');
    const hasNewPath = content.includes('~/.qwen/get-shit-done');
    allPassed &= check('  Paths transformed to ~/.qwen/', !hasOldPath && hasNewPath);
  }
}
console.log('');

// 6. Check Hooks
console.log(`${yellow}6. GSD Hooks${reset}`);
const hooksDir = path.join(resourcesDir, 'hooks');
allPassed &= check('Hooks directory exists', fs.existsSync(hooksDir), hooksDir);

if (fs.existsSync(hooksDir)) {
  const hookFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js') || f.endsWith('.sh'));
  allPassed &= check('Hook files count', hookFiles.length >= 5, `(${hookFiles.length} found)`);
  
  // Check key hooks
  const keyHooks = ['gsd-prompt-guard.js', 'gsd-context-monitor.js', 'gsd-workflow-guard.js'];
  for (const hook of keyHooks) {
    allPassed &= check(`  Key hook: ${hook}`, fs.existsSync(path.join(hooksDir, hook)));
  }
}
console.log('');

// 7. Check Hooks Configuration
console.log(`${yellow}7. Hooks Configuration${reset}`);
const settingsPath = path.join(qwenDir, 'settings.json');
allPassed &= check('Settings file exists', fs.existsSync(settingsPath));

if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const hasHooks = settings.hooks && (
      (settings.hooks.PreToolUse && settings.hooks.PreToolUse.length > 0) ||
      (settings.hooks.PostToolUse && settings.hooks.PostToolUse.length > 0)
    );
    allPassed &= check('  Hooks configured in settings', hasHooks);
    
    if (hasHooks) {
      const hookCount = (settings.hooks.PreToolUse || []).length + 
                       (settings.hooks.PostToolUse || []).length +
                       (settings.hooks.SessionStart || []).length;
      allPassed &= check('  Hook definitions count', hookCount >= 3, `(${hookCount} found)`);
    }
  } catch (e) {
    allPassed &= check('  Settings file valid JSON', false);
  }
}
console.log('');

// 8. Summary
console.log(`${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
if (allPassed) {
  console.log(`${green}✓ All checks passed! GSD is ready for Qwen Code.${reset}`);
  console.log(`${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);
  console.log(`${dim}You can now use GSD commands in Qwen Code:${reset}`);
  console.log(`  /gsd-new-project`);
  console.log(`  /gsd-plan-phase 1`);
  console.log(`  /gsd-execute-phase 1`);
  console.log(`  /gsd-help\n`);
  process.exit(0);
} else {
  console.log(`${red}✗ Some checks failed. Please reinstall GSD.${reset}`);
  console.log(`${red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);
  console.log(`${dim}Reinstall with:${reset}`);
  console.log(`  node bin/install-qwen-unified.js --global\n`);
  process.exit(1);
}
