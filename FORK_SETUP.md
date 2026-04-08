# Fork GSD 仓库并推送到您的 GitHub

## 快速脚本

```bash
#!/bin/bash
# fork-gsd.sh - Fork and setup GSD repository

# 配置 - 替换为您的 GitHub 用户名
GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="get-shit-done"
LOCAL_DIR="E:/personwork/gsd-qwen"

echo "=== GSD Fork Setup ==="

# 1. 检查是否已配置 GitHub
if [ -z "$GITHUB_USERNAME" ] || [ "$GITHUB_USERNAME" = "YOUR_USERNAME" ]; then
    echo "❌ Error: Please set your GitHub username in this script"
    exit 1
fi

# 2. 导航到工作目录
cd "$LOCAL_DIR" || exit 1

# 3. 备份当前目录（如果存在）
if [ -d "$REPO_NAME" ]; then
    echo "⚠️  Backing up existing $REPO_NAME directory..."
    mv "$REPO_NAME" "$REPO_NAME-$(date +%Y%m%d-%H%M%S)"
fi

# 4. 克隆您的 fork
echo "📦 Cloning your fork..."
git clone "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

cd "$REPO_NAME" || exit 1

# 5. 添加 upstream remote
echo "🔗 Adding upstream remote..."
git remote add upstream "https://github.com/gsd-build/$REPO_NAME.git"

# 6. 验证 remotes
echo "✅ Remotes configured:"
git remote -v

# 7. 说明下一步
echo ""
echo "=== Next Steps ==="
echo "1. Copy your Qwen Code integration files from backup:"
echo "   cp -r ../$REPO_NAME-*/bin/install-qwen*.js bin/"
echo "   cp -r ../$REPO_NAME-*/bin/install-hooks-qwen.js bin/"
echo "   cp -r ../$REPO_NAME-*/bin/verify-qwen-install.js bin/"
echo ""
echo "2. Add and commit changes:"
echo "   git add ."
echo "   git commit -m 'feat: integrate GSD with Qwen Code CLI'"
echo ""
echo "3. Push to your fork:"
echo "   git push origin main"
echo ""
echo "4. Keep your fork updated from upstream:"
echo "   git fetch upstream"
echo "   git merge upstream/main"
echo "   git push origin main"
```

## 使用说明

1. **编辑脚本**：将 `YOUR_USERNAME` 替换为您的 GitHub 用户名
2. **运行脚本**（Git Bash 中）：
   ```bash
   bash fork-gsd.sh
   ```
3. **按照提示完成设置**

## 手动步骤（如果不想用脚本）

### 1. 在 GitHub 上创建 Fork
- 访问：https://github.com/gsd-build/get-shit-done
- 点击右上角 "Fork" 按钮
- 选择您的账户

### 2. 重新克隆
```bash
cd E:\personwork\gsd-qwen
ren get-shit-done get-shit-done-original

git clone https://github.com/YOUR_USERNAME/get-shit-done.git
cd get-shit-done
```

### 3. 添加 Upstream Remote
```bash
git remote add upstream https://github.com/gsd-build/get-shit-done.git
git remote -v
# 应该看到：
# origin    https://github.com/YOUR_USERNAME/get-shit-done.git (fetch/push)
# upstream  https://github.com/gsd-build/get-shit-done.git (fetch/push)
```

### 4. 复制您的修改
```bash
# 从备份目录复制 Qwen Code 集成文件
cp ../get-shit-done-original/bin/install-qwen*.js bin/
cp ../get-shit-done-original/bin/install-hooks-qwen.js bin/
cp ../get-shit-done-original/bin/verify-qwen-install.js bin/

# 复制文档（如果有）
cp ../get-shit-done-original/*.md . 2>/dev/null || true
```

### 5. 提交并推送
```bash
git add .
git commit -m "feat: integrate GSD with Qwen Code CLI

- Add Qwen Code installation scripts
- Add hooks configuration installer  
- Add verification script
- Add integration documentation"

git push origin main
```

## 保持 Fork 更新

### 定期同步原仓库的更新
```bash
# 获取原仓库的最新更改
git fetch upstream

# 合并到您的 main 分支
git checkout main
git merge upstream/main

# 推送到您的 fork
git push origin main
```

### 如果有冲突
```bash
# 解决冲突后
git add .
git commit
git push origin main
```

## 验证安装脚本是否工作

```bash
# 测试安装
cd E:\personwork\gsd-qwen\get-shit-done
node bin/install-qwen-unified.js --global
node bin/install-hooks-qwen.js --global
node bin/verify-qwen-install.js
```
