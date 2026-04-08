#!/usr/bin/env node

/**
 * GSD Installer for Qwen Code CLI
 * Installs GSD commands to ~/.qwen/commands/gsd/ and resources to ~/.qwen/get-shit-done/
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

// Get version from package.json
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const QWEN_DIR = '.qwen';
const GSD_COMMANDS_DIR = path.join('commands', 'gsd');
const GSD_RESOURCES_DIR = 'get-shit-done';

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');
const hasHelp = args.includes('--help') || args.includes('-h');

const banner = '\n' +
  cyan + '   ██████╗ ███████╗██████╗\n' +
  '  ██╔════╝ ██╔════╝██╔══██╗\n' +
  '  ██║  ███╗███████╗██║  ██║\n' +
  '  ██║   ██║╚════██║██║  ██║\n' +
  '  ╚██████╔╝███████║██████╔╝\n' +
  '   ╚═════╝ ╚══════╝╚═════╝' + reset + '\n' +
  '\n' +
  '  Get Shit Done ' + dim + 'v' + pkg.version + reset + '\n' +
  '  Installing for Qwen Code CLI\n';

console.log(banner);

if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} node bin/install-qwen.js [options]\n\n  ${yellow}Options:${reset}\n    ${cyan}-g, --global${reset}              Install globally (to ~/.qwen/)\n    ${cyan}-l, --local${reset}               Install locally (to current project/.qwen/)\n    ${cyan}-u, --uninstall${reset}           Uninstall GSD from Qwen Code\n    ${cyan}-h, --help${reset}                Show this help message\n\n  ${yellow}Examples:${reset}\n    ${dim}# Install globally${reset}\n    node bin/install-qwen.js --global\n\n    ${dim}# Install locally${reset}\n    node bin/install-qwen.js --local\n\n    ${dim}# Uninstall globally${reset}\n    node bin/install-qwen.js --global --uninstall\n`);
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
    commands: path.join(gsdRoot, GSD_COMMANDS_DIR),
    resources: path.join(gsdRoot, GSD_RESOURCES_DIR),
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
 * Transform command file content: replace ~/.claude/ with ~/.qwen/
 */
function transformCommandFile(content) {
  return content
    .replace(/@~\/\.claude\/get-shit-done\//g, '@~/.qwen/get-shit-done/')
    .replace(/@\$HOME\/\.claude\/get-shit-done\//g, '@$HOME/.qwen/get-shit-done/')
    .replace(/\$HOME\/\.claude\/get-shit-done\//g, '$HOME/.qwen/get-shit-done/')
    .replace(/~\/\.claude\/get-shit-done\//g, '~/.qwen/get-shit-done/');
}

/**
 * Install GSD commands to Qwen Code
 */
function install(isGlobal) {
  console.log(`  ${cyan}Mode:${reset} ${isGlobal ? 'Global' : 'Local'} installation\n`);

  const src = getSourceDirs();
  let destCommands, destResources;

  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    destCommands = path.join(qwenDir, 'commands', 'gsd');
    destResources = path.join(qwenDir, 'get-shit-done');
  } else {
    const projectDir = process.cwd();
    destCommands = path.join(projectDir, QWEN_DIR, 'commands', 'gsd');
    destResources = path.join(projectDir, QWEN_DIR, 'get-shit-done');
  }

  console.log(`  ${dim}Source commands:${reset} ${src.commands}`);
  console.log(`  ${dim}Target commands:${reset} ${destCommands}`);
  console.log(`  ${dim}Source resources:${reset} ${src.resources}`);
  console.log(`  ${dim}Target resources:${reset} ${destResources}\n`);

  // Install commands
  console.log(`  ${cyan}►${reset} Installing GSD commands...`);
  if (copyDir(src.commands, destCommands)) {
    console.log(`  ${green}✓${reset} Commands installed to ${destCommands}`);
  } else {
    console.error(`  ${red}✗${reset} Failed to install commands`);
    process.exit(1);
  }

  // Install resources (workflows, agents, templates, etc.)
  console.log(`\n  ${cyan}►${reset} Installing GSD resources...`);
  if (copyDir(src.resources, destResources)) {
    console.log(`  ${green}✓${reset} Resources installed to ${destResources}`);
  } else {
    console.error(`  ${red}✗${reset} Failed to install resources`);
    process.exit(1);
  }

  // Transform command files: update path references
  console.log(`\n  ${cyan}►${reset} Transforming path references...`);
  let transformed = 0;
  const transformDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        transformDir(fullPath);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.toml')) {
        try {
          let content = fs.readFileSync(fullPath, 'utf8');
          const newContent = transformCommandFile(content);
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
  transformDir(destCommands);
  console.log(`  ${green}✓${reset} Transformed ${transformed} files`);

  console.log(`\n  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
  console.log(`  ${green}✓ GSD v${pkg.version} installed for Qwen Code!${reset}`);
  console.log(`  ${green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);

  console.log(`  ${dim}Usage:${reset} Start Qwen Code and use commands like:`);
  console.log(`    /gsd-help`);
  console.log(`    /gsd-new-project`);
  console.log(`    /gsd-plan-phase 1`);
  console.log(`    /gsd-execute-phase 1\n`);
}

/**
 * Uninstall GSD from Qwen Code
 */
function uninstall(isGlobal) {
  console.log(`  ${yellow}Mode:${reset} Uninstall\n`);

  let destCommands, destResources;

  if (isGlobal) {
    const qwenDir = getQwenGlobalDir();
    destCommands = path.join(qwenDir, 'commands', 'gsd');
    destResources = path.join(qwenDir, 'get-shit-done');
  } else {
    const projectDir = process.cwd();
    destCommands = path.join(projectDir, QWEN_DIR, 'commands', 'gsd');
    destResources = path.join(projectDir, QWEN_DIR, 'get-shit-done');
  }

  console.log(`  ${yellow}►${reset} Removing GSD commands from ${destCommands}`);
  removeDir(destCommands);
  console.log(`  ${green}✓${reset} Commands removed`);

  console.log(`\n  ${yellow}►${reset} Removing GSD resources from ${destResources}`);
  removeDir(destResources);
  console.log(`  ${green}✓${reset} Resources removed`);

  console.log(`\n  ${green}GSD uninstalled from Qwen Code${reset}\n`);
}

// Main execution
if (hasUninstall) {
  uninstall(hasGlobal);
} else {
  // Default to global install if no flag specified
  install(hasGlobal || hasLocal ? hasGlobal : true);
}
