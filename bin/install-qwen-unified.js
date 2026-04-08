#!/usr/bin/env node

/**
 * GSD Installer for Qwen Code CLI - Unified Installer
 * Installs GSD commands, resources, and agents to Qwen Code
 * 
 * Usage:
 *   node bin/install-qwen-unified.js [--global|--local] [--uninstall]
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

// Get version from package.json
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const QWEN_DIR = '.qwen';

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');
const hasHelp = args.includes('--help') || args.includes('-h');
const hasSkipAgents = args.includes('--skip-agents');
const hasSkipCommands = args.includes('--skip-commands');

const banner = '\n' +
  cyan + '   ██████╗ ███████╗██████╗\n' +
  '  ██╔════╝ ██╔════╝██╔══██╗\n' +
  '  ██║  ███╗███████╗██║  ██║\n' +
  '  ██║   ██║╚════██║██║  ██║\n' +
  '  ╚██████╔╝███████║██████╔╝\n' +
  '   ╚═════╝ ╚══════╝╚═════╝' + reset + '\n' +
  '\n' +
  '  Get Shit Done ' + dim + 'v' + pkg.version + reset + '\n' +
  '  Unified Installer for Qwen Code CLI\n';

console.log(banner);

if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} node bin/install-qwen-unified.js [options]\n\n  ${yellow}Options:${reset}\n    ${cyan}-g, --global${reset}              Install globally (to ~/.qwen/)\n    ${cyan}-l, --local${reset}               Install locally (to current project/.qwen/)\n    ${cyan}-u, --uninstall${reset}           Uninstall GSD from Qwen Code\n    ${cyan}--skip-agents${reset}              Skip agent installation\n    ${cyan}--skip-commands${reset}            Skip command installation\n    ${cyan}-h, --help${reset}                Show this help message\n\n  ${yellow}Examples:${reset}\n    ${dim}# Install everything globally${reset}\n    node bin/install-qwen-unified.js --global\n\n    ${dim}# Install only commands globally${reset}\n    node bin/install-qwen-unified.js --global --skip-agents\n\n    ${dim}# Uninstall everything globally${reset}\n    node bin/install-qwen-unified.js --global --uninstall\n`);
  process.exit(0);
}

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
  return path.join(os.homedir(), QWEN_DIR);
}

/**
 * Get source directories
 */
function getSourceDirs() {
  const gsdRoot = path.join(__dirname, '..');
  return {
    commands: path.join(gsdRoot, 'commands', 'gsd'),
    resources: path.join(gsdRoot, 'get-shit-done'),
    agents: path.join(gsdRoot, 'agents'),
    hooks: path.join(gsdRoot, 'hooks'),
  };
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
 * Transform file content: replace ~/.claude/ with ~/.qwen/
 */
function transformFileContent(content) {
  return content
    .replace(/@~\/\.claude\/get-shit-done\//g, '@~/.qwen/get-shit-done/')
    .replace(/@\$HOME\/\.claude\/get-shit-done\//g, '@$HOME/.qwen/get-shit-done/')
    .replace(/\$HOME\/\.claude\/get-shit-done\//g, '$HOME/.qwen/get-shit-done/')
    .replace(/~\/\.claude\/get-shit-done\//g, '~/.qwen/get-shit-done/');
}

/**
 * Transform all files in a directory
 */
function transformFiles(dir, fileExtensions = ['.md', '.toml']) {
  let transformed = 0;
  
  const processDir = (currentDir) => {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        processDir(fullPath);
      } else if (fileExtensions.some(ext => entry.name.endsWith(ext))) {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          const newContent = transformFileContent(content);
          if (content !== newContent) {
            fs.writeFileSync(fullPath, newContent, 'utf8');
            transformed++;
          }
        } catch (e) {
          // Skip binary files or files that can't be read as UTF-8
        }
      }
    }
  };
  
  processDir(dir);
  return transformed;
}

/**
 * Install GSD to Qwen Code
 */
function install(isGlobal) {
  console.log(`  ${cyan}Mode:${reset} ${isGlobal ? 'Global' : 'Local'} installation\n`);

  const src = getSourceDirs();
  let destCommands, destResources, destAgents, destHooks;

  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    destCommands = path.join(qwenDir, 'commands', 'gsd');
    destResources = path.join(qwenDir, 'get-shit-done');
    destAgents = path.join(qwenDir, 'agents');
    destHooks = path.join(qwenDir, 'get-shit-done', 'hooks');
  } else {
    const projectDir = process.cwd();
    destCommands = path.join(projectDir, QWEN_DIR, 'commands', 'gsd');
    destResources = path.join(projectDir, QWEN_DIR, 'get-shit-done');
    destAgents = path.join(projectDir, QWEN_DIR, 'agents');
    destHooks = path.join(projectDir, QWEN_DIR, 'get-shit-done', 'hooks');
  }

  let totalTransformed = 0;

  // Install commands
  if (!hasSkipCommands) {
    console.log(`  ${cyan}►${reset} Installing GSD commands...`);
    console.log(`  ${dim}Source:${reset} ${src.commands}`);
    console.log(`  ${dim}Target:${reset} ${destCommands}`);
    if (copyDir(src.commands, destCommands)) {
      console.log(`  ${green}✓${reset} Commands installed`);
      totalTransformed += transformFiles(destCommands);
    } else {
      console.error(`  ${red}✗${reset} Failed to install commands`);
      process.exit(1);
    }
  } else {
    console.log(`  ${yellow}⊘${reset} Skipping commands (--skip-commands)`);
  }

  // Install resources
  if (!hasSkipCommands) {
    console.log(`\n  ${cyan}►${reset} Installing GSD resources...`);
    console.log(`  ${dim}Source:${reset} ${src.resources}`);
    console.log(`  ${dim}Target:${reset} ${destResources}`);
    if (copyDir(src.resources, destResources)) {
      console.log(`  ${green}✓${reset} Resources installed`);
      totalTransformed += transformFiles(destResources);
    } else {
      console.error(`  ${red}✗${reset} Failed to install resources`);
      process.exit(1);
    }
  }

  // Install agents
  if (!hasSkipAgents) {
    console.log(`\n  ${cyan}►${reset} Installing GSD agents...`);
    console.log(`  ${dim}Source:${reset} ${src.agents}`);
    console.log(`  ${dim}Target:${reset} ${destAgents}`);
    if (copyDir(src.agents, destAgents)) {
      console.log(`  ${green}✓${reset} Agents installed`);
      totalTransformed += transformFiles(destAgents);
    } else {
      console.error(`  ${red}✗${reset} Failed to install agents`);
      process.exit(1);
    }
  } else {
    console.log(`  ${yellow}⊘${reset} Skipping agents (--skip-agents)`);
  }

  // Install hooks
  if (!hasSkipCommands) {
    console.log(`\n  ${cyan}►${reset} Installing GSD hooks...`);
    console.log(`  ${dim}Source:${reset} ${src.hooks}`);
    console.log(`  ${dim}Target:${reset} ${destHooks}`);
    if (copyDir(src.hooks, destHooks)) {
      console.log(`  ${green}✓${reset} Hooks installed`);
      totalTransformed += transformFiles(destHooks, ['.js', '.sh']);
    } else {
      console.error(`  ${red}✗${reset} Failed to install hooks`);
      process.exit(1);
    }
  } else {
    console.log(`  ${yellow}⊘${reset} Skipping hooks (--skip-commands)`);
  }

  console.log(`\n  ${green}✓${reset} Transformed ${totalTransformed} files total`);

  console.log(`\n  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
  console.log(`  ${green}✓ GSD v${pkg.version} installed for Qwen Code!${reset}`);
  console.log(`  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);

  console.log(`  ${dim}Usage:${reset} Start Qwen Code and use commands like:`);
  console.log(`    /gsd-help`);
  console.log(`    /gsd-new-project`);
  console.log(`    /gsd-plan-phase 1`);
  console.log(`    /gsd-execute-phase 1\n`);

  if (!hasSkipAgents) {
    const agentFiles = fs.readdirSync(destAgents).filter(f => f.endsWith('.md'));
    console.log(`  ${dim}Available agents (${agentFiles.length}):${reset}`);
    agentFiles.slice(0, 10).forEach(f => console.log(`    - ${f.replace('.md', '')}`));
    if (agentFiles.length > 10) {
      console.log(`    ... and ${agentFiles.length - 10} more`);
    }
    console.log('');
  }
}

/**
 * Uninstall GSD from Qwen Code
 */
function uninstall(isGlobal) {
  console.log(`  ${yellow}Mode:${reset} Uninstall\n`);

  let destCommands, destResources, destAgents;

  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    destCommands = path.join(qwenDir, 'commands', 'gsd');
    destResources = path.join(qwenDir, 'get-shit-done');
    destAgents = path.join(qwenDir, 'agents');
  } else {
    const projectDir = process.cwd();
    destCommands = path.join(projectDir, QWEN_DIR, 'commands', 'gsd');
    destResources = path.join(projectDir, QWEN_DIR, 'get-shit-done');
    destAgents = path.join(projectDir, QWEN_DIR, 'agents');
  }

  if (!hasSkipCommands) {
    console.log(`  ${yellow}►${reset} Removing GSD commands from ${destCommands}`);
    removeDir(destCommands);
    console.log(`  ${green}✓${reset} Commands removed`);

    console.log(`\n  ${yellow}►${reset} Removing GSD resources from ${destResources}`);
    removeDir(destResources);
    console.log(`  ${green}✓${reset} Resources removed`);
  }

  if (!hasSkipAgents) {
    console.log(`\n  ${yellow}►${reset} Removing GSD agents from ${destAgents}`);
    removeDir(destAgents);
    console.log(`  ${green}✓${reset} Agents removed`);
  }

  console.log(`\n  ${green}GSD uninstalled from Qwen Code${reset}\n`);
}

// Main execution
if (hasUninstall) {
  uninstall(hasGlobal);
} else {
  install(hasGlobal || hasLocal ? hasGlobal : true);
}
