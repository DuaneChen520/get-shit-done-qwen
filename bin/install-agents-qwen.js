#!/usr/bin/env node

/**
 * Install GSD agents to Qwen Code
 * Copies GSD agent definitions to ~/.qwen/agents/ for global install
 * or ./.qwen/agents/ for local install
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
 * Copy directory recursively
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`  ${red}✗${reset} Source directory not found: ${src}`);
    return false;
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  return true;
}

/**
 * Remove directory recursively
 */
function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeDir(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
  fs.rmdirSync(dirPath);
}

/**
 * Transform agent content: replace ~/.claude/ with ~/.qwen/
 */
function transformAgentContent(content) {
  return content
    .replace(/@~\/\.claude\/get-shit-done\//g, '@~/.qwen/get-shit-done/')
    .replace(/@\$HOME\/\.claude\/get-shit-done\//g, '@$HOME/.qwen/get-shit-done/')
    .replace(/\$HOME\/\.claude\/get-shit-done\//g, '$HOME/.qwen/get-shit-done/')
    .replace(/~\/\.claude\/get-shit-done\//g, '~/.qwen/get-shit-done/');
}

/**
 * Install GSD agents to Qwen Code
 */
function install(isGlobal) {
  console.log(`  ${cyan}Mode:${reset} ${isGlobal ? 'Global' : 'Local'} agent installation\n`);

  const gsdRoot = path.join(__dirname, '..');
  const srcAgents = path.join(gsdRoot, 'agents');
  
  let destAgents;
  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    destAgents = path.join(qwenDir, 'agents');
  } else {
    const projectDir = process.cwd();
    destAgents = path.join(projectDir, '.qwen', 'agents');
  }

  console.log(`  ${dim}Source agents:${reset} ${srcAgents}`);
  console.log(`  ${dim}Target agents:${reset} ${destAgents}\n`);

  // Install agents
  console.log(`  ${cyan}►${reset} Installing GSD agents...`);
  if (copyDir(srcAgents, destAgents)) {
    console.log(`  ${green}✓${reset} Agents installed to ${destAgents}`);
  } else {
    console.error(`  ${red}✗${reset} Failed to install agents`);
    process.exit(1);
  }

  // Transform agent files: update path references
  console.log(`\n  ${cyan}►${reset} Transforming path references...`);
  let transformed = 0;
  const agentFiles = fs.readdirSync(destAgents).filter(f => f.endsWith('.md'));
  for (const file of agentFiles) {
    const fullPath = path.join(destAgents, file);
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      const newContent = transformAgentContent(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        transformed++;
      }
    } catch (e) {
      // Skip files that can't be read
    }
  }
  console.log(`  ${green}✓${reset} Transformed ${transformed} agent files`);

  console.log(`\n  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
  console.log(`  ${green}✓ GSD agents installed to Qwen Code!${reset}`);
  console.log(`  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);

  console.log(`  ${dim}Available agents:${reset}`);
  agentFiles.forEach(f => console.log(`    - ${f.replace('.md', '')}`));
  console.log('');
}

/**
 * Uninstall GSD agents from Qwen Code
 */
function uninstall(isGlobal) {
  console.log(`  ${yellow}Mode:${reset} Uninstall agents\n`);

  let destAgents;
  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    destAgents = path.join(qwenDir, 'agents');
  } else {
    const projectDir = process.cwd();
    destAgents = path.join(projectDir, '.qwen', 'agents');
  }

  console.log(`  ${yellow}►${reset} Removing GSD agents from ${destAgents}`);
  removeDir(destAgents);
  console.log(`  ${green}✓${reset} Agents removed`);

  console.log(`\n  ${green}GSD agents uninstalled from Qwen Code${reset}\n`);
}

// Main execution
if (hasUninstall) {
  uninstall(hasGlobal);
} else {
  install(hasGlobal || hasLocal ? hasGlobal : true);
}
