# Claude Studio - Standalone Repository Setup

This document contains the manual steps you need to complete to publish the standalone Claude Studio repository.

## What Has Been Created

The standalone repository has been set up at: `~/claude-studio-standalone/`

### Files Created/Updated:

#### Documentation
- ✅ **README.md** - Comprehensive user documentation (410 lines)
- ✅ **CHANGELOG.md** - Version history (v0.1.0 and v0.2.0)
- ✅ **CONTRIBUTING.md** - Contributor guidelines
- ✅ **LICENSE** - Elastic License 2.0
- ✅ **CLAUDE.md** - AI context documentation (copied)
- ✅ **IMPLEMENTATION_PLAN.md** - Project roadmap (copied)
- ✅ **PHASE_2_TEST_GUIDE.md** - Testing guide (copied)

#### Configuration
- ✅ **.gitignore** - Ignores build artifacts, dependencies, IDE files
- ✅ **package.json** - Updated to v0.2.0, added package script
- ✅ **tsconfig.json** - TypeScript configuration (copied)

#### GitHub Automation
- ✅ **.github/workflows/test.yml** - CI testing on push/PR
- ✅ **.github/workflows/release.yml** - Automated releases on tags

#### Development Setup
- ✅ **.vscode/settings.json** - Recommended VS Code settings
- ✅ **.vscode/launch.json** - Debug configurations
- ✅ **.vscode/tasks.json** - Build and test tasks
- ✅ **.vscode/extensions.json** - Recommended extensions

#### Source Code
- ✅ **src/** - All extension source code (copied)
- ✅ **src/test/** - Complete test suite (45 tests)

---

## Manual Steps Required

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Name**: `claude-studio`
   - **Description**: AI-enhanced data science development with Claude
   - **Visibility**: Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

### Step 2: Initialize Git and Push

Open a terminal and run:

```bash
cd ~/claude-studio-standalone

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Claude Studio v0.2.0

- Complete extension source code
- Comprehensive test suite (45 tests, 100% DataContextProvider coverage)
- Professional documentation (README, CONTRIBUTING, CHANGELOG)
- GitHub Actions workflows for CI/CD
- Bug fix: Correct type inference for booleans vs numbers

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/claude-studio.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Verify GitHub Actions

After pushing:

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. You should see the test workflow running
4. Wait for it to complete (should pass all 45 tests)

### Step 4: Create First Release

Once tests pass:

```bash
cd ~/claude-studio-standalone

# Make sure code is compiled
npm install
npm run compile

# Create release tag
git tag -a v0.2.0 -m "Release v0.2.0

## What's New

- Comprehensive unit test suite (45 tests)
- 100% coverage of DataContextProvider
- Bug fix: Correct type inference for booleans
- Complete test infrastructure with Mocha + Chai
- Test fixtures and documentation

## Features

- Claude Code integration in Positron/VS Code
- Data file analysis (CSV/TSV/JSON)
- Code explanation and documentation generation
- Language-aware support (Python, R, JavaScript/TypeScript)
- Error debugging with language server integration

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push tag to trigger release workflow
git push origin v0.2.0
```

This will automatically:
- Run all tests
- Build the extension
- Create a GitHub release
- Upload the `.vsix` file

### Step 5: Add Repository Description and Topics

On GitHub:

1. Go to your repository homepage
2. Click the ⚙️ gear icon next to "About"
3. Add:
   - **Description**: AI-enhanced data science development with Claude
   - **Website**: (leave blank for now)
   - **Topics**: `claude`, `ai`, `data-science`, `positron`, `vscode-extension`, `typescript`, `claude-code`, `positron-ide`
4. Check "Include in the homepage"
5. Save changes

### Step 6: Configure Repository Settings

1. Go to **Settings** → **General**:
   - Enable "Issues"
   - Enable "Discussions" (recommended)
   - Disable "Projects" (unless you want to use them)
   - Disable "Wiki" (documentation is in README)

2. Go to **Settings** → **Branches**:
   - Add branch protection rule for `main`:
     - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Select status checks: `test`, `lint`

### Step 7: Update Positron Fork (Optional)

You can now decide what to do with the Positron fork:

**Option A: Archive it**
- The extension is standalone and doesn't need the fork
- Keep it for historical reference but mark as archived

**Option B: Keep for development**
- Use it for testing integration with Positron
- Link to the standalone repo in the README

**Recommended**: Archive the fork and use the standalone repo going forward.

---

## Post-Setup Tasks

### Update CLAUDE.md in Standalone Repo

The CLAUDE.md file still references the fork structure. Update it to reflect standalone development:

```bash
cd ~/claude-studio-standalone
# Edit CLAUDE.md to remove fork references and update paths
```

### Create Demo Video/GIFs (Optional)

For better documentation:
1. Record screen demos of key features
2. Convert to GIFs using tools like `ffmpeg` or `gifski`
3. Add to README.md or docs/ folder

### Set Up GitHub Discussions (Optional)

1. Go to Settings → Features → Enable Discussions
2. Create categories:
   - General
   - Q&A
   - Feature Requests
   - Show and Tell

### Future: Publish to Marketplace (v1.0.0)

When ready for public release:

1. Create a publisher account at https://marketplace.visualstudio.com/manage
2. Generate a Personal Access Token (PAT)
3. Publish:
   ```bash
   npx @vscode/vsce publish
   ```
4. Update README with marketplace badge

---

## Testing the Standalone Repository

Before making it public, test locally:

```bash
cd ~/claude-studio-standalone

# Install dependencies
npm install

# Compile
npm run compile

# Run tests
npm test

# Package extension
npm run package

# Install the .vsix in Positron
# Open Positron → Cmd+Shift+P → "Install from VSIX"
# Select the generated claude-studio-0.2.0.vsix file
```

---

## Troubleshooting

### Git Push Fails

If you get authentication errors:
```bash
# Use SSH instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/claude-studio.git
```

### GitHub Actions Fail

Check the logs in the Actions tab. Common issues:
- Missing dependencies (should be handled by `npm ci`)
- TypeScript compilation errors
- Test failures

### Tests Fail Locally

```bash
# Clean and rebuild
rm -rf node_modules out
npm install
npm run compile
npm test
```

---

## Next Steps

After completing the manual steps:

1. ✅ Repository is live on GitHub
2. ✅ Tests are running in CI
3. ✅ First release (v0.2.0) is published
4. 📝 Update CLAUDE.md to reflect standalone structure
5. 📝 Consider adding demo GIFs to README
6. 📝 Set up GitHub Discussions for community
7. 🎯 Plan next features (Phase 3: Enhanced UI)

---

## Questions?

If you encounter any issues during setup, check:
- GitHub Actions logs for CI/CD issues
- npm logs for dependency/build issues
- VS Code Extension Host for runtime issues

---

**Ready to go live!** 🚀
