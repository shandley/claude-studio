# Claude Studio Extension

**AI-enhanced data science development with Claude Code integration**

[![License](https://img.shields.io/badge/license-Elastic--2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.7.2-green.svg)](package.json)
[![Build](https://github.com/shandley/claude-studio/actions/workflows/build.yml/badge.svg)](https://github.com/shandley/claude-studio/actions/workflows/build.yml)

Claude Studio is a VS Code/Positron extension that integrates [Claude Code](https://docs.anthropic.com/en/docs/claude-code) directly into your data science workflow. Get intelligent code assistance, data analysis, and documentation features designed for researchers, data scientists, and analysts.

---

## ✨ Features

### 🔐 **Flexible Authentication**
- **Use Your Claude Subscription** (Pro/Max) - No API costs, uses your plan's included usage
- **Or Use API Key** - Pay-per-use for non-subscribers
- Automatic authentication detection and setup

### 📊 **Data Analysis**
- **CSV/TSV/JSON Parsing**: Automatic type inference and statistics
- **Statistical Test Recommendations**: Get appropriate tests (t-test, ANOVA, correlation, chi-square, regression) with R/Python code
- **Visualization Code Generation**: Publication-ready plots (ggplot2, matplotlib/seaborn) for 6 chart types
- **Plot Improvements**: Select plotting code, get AI-powered enhancement suggestions
- **Smart Context**: Right-click data files for instant AI analysis recommendations

### 💻 **Code Intelligence**
- **Explain Code**: Detailed explanations with language context
- **Generate Documentation**: Python docstrings, R Roxygen2, JSDoc
- **Debug Assistance**: Error analysis with surrounding code context
- **Language-Aware**: Auto-detects Python, R, JavaScript/TypeScript

### 🎯 **Seamless Integration**
- **Status Bar**: Visual indicator with quick actions
- **Context Menus**: Right-click on code or data files
- **Terminal Integration**: Full Claude Code CLI capabilities including MCP servers

---

## 📦 Installation

### 1. Install and Authenticate Claude Code CLI

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Authenticate (one-time setup)
# Choose ONE of these methods:

# Option A: Claude Pro/Max Subscription (Recommended - No API costs!)
claude login
# Your browser will open → Sign in with your Claude account

# Option B: API Key (Pay-per-use)
# Get key from console.anthropic.com, configure later in extension
```

**Note**: If you have Claude Pro/Max, run `claude login` now. This is a one-time setup that works globally.

### 2. Install Extension

**From VSIX (Current)**:
1. Download the latest `.vsix` file from [Releases](https://github.com/shandley/claude-studio/releases)
2. Open VS Code/Positron
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
4. Type "Install from VSIX"
5. Select the downloaded file
6. Restart

**From Source**:
```bash
git clone https://github.com/shandley/claude-studio.git
cd claude-studio
npm install && npm run package
# Install the generated .vsix file
```

---

## 🚀 Quick Start

### Authentication Setup

Claude Studio defaults to **Subscription mode** (no API costs if you ran `claude login` during installation).

**If you already ran `claude login` during installation:**
- You're done! Just start using Claude Studio
- Skip to "Start Using Claude Studio" below

**If you skipped the login step:**

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run: **"Claude Studio: Configure Authentication"**
3. Select **"Pro/Max Subscription"**
4. Click **"Copy Command"**
5. Open your system terminal
6. Paste and run: `claude login`
7. Sign in via browser
8. Done!

**To use API Key instead:**
1. Get key from [Anthropic Console](https://console.anthropic.com/)
2. Run: **"Claude Studio: Configure Authentication"**
3. Select **"API Key"**
4. Enter your key (starts with `sk-ant-`)

### Start Using Claude Studio

**Via Command Palette**:
```
Cmd+Shift+P → "Claude Studio: Start Claude Assistant"
```

**Or Automatic**:
- Claude starts automatically when you use any feature
- A dedicated "Claude Studio" terminal opens

---

## 🎓 Getting Started Guide

**New to Claude Studio?** Check out our comprehensive tutorial:

📘 **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step vignettes with example datasets

Includes:
- 6 complete workflows with example data
- Real datasets (clinical trials, gene expression, surveys)
- R and Python example scripts
- Expected outputs and insights
- Perfect for testing with colleagues

---

## 📖 Common Workflows

### Analyze Data
1. Right-click on a `.csv`, `.tsv`, or `.json` file
2. Select **"Claude Studio: Suggest Data Analysis"**
3. Get AI recommendations for analysis, tests, and visualizations

### Generate Statistical Tests
1. Right-click on a data file
2. Select **"Claude Studio: Recommend Statistical Tests"**
3. Get appropriate tests with assumptions and R/Python code

### Generate Visualizations
1. Right-click on a data file
2. Select **"Claude Studio: Generate Visualization Code"**
3. Get publication-ready ggplot2/matplotlib code for 6 chart types

### Explain Code
1. Select code in your editor
2. Right-click → **"Claude Studio: Explain This Code"**
3. Get detailed explanation in terminal

### Generate Documentation
1. Select a function or code block
2. Right-click → **"Claude Studio: Generate Documentation"**
3. Get language-specific docs (Python docstrings, R Roxygen2, JSDoc)

### Improve Plots
1. Select plotting code (ggplot2, matplotlib, seaborn, etc.)
2. Right-click → **"Claude Studio: Improve This Plot"**
3. Get enhancement suggestions and improved code

### Debug Errors
1. Place cursor on problematic code
2. Run **"Claude Studio: Debug Error with Claude"**
3. Get error analysis from language server diagnostics

---

## ⚙️ Configuration

Access via: **Preferences → Settings → Extensions → Claude Studio**

### Key Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `claude-studio.authMethod` | `subscription` | Authentication method: "subscription" or "api-key" |
| `claude-studio.dataContextSize` | `1000` | Max rows for data context |
| `claude-studio.debug` | `false` | Enable debug logging |

**Example**:
```json
{
  "claude-studio.authMethod": "subscription",
  "claude-studio.dataContextSize": 1000,
  "claude-studio.debug": false
}
```

---

## 🆚 Claude Studio vs. Positron Assistant

| Feature | Claude Studio | Positron Assistant |
|---------|---------------|-------------------|
| **Best For** | Specific data science tasks | Conversational coding help |
| **Interaction** | Command-driven workflows | Chat sidebar |
| **Data Context** | File parsing (CSV/TSV/JSON) | Live IDE state |
| **Authentication** | Subscription or API key | API only |

**Recommendation**: Use both together for the best experience!

---

## 🐛 Troubleshooting

**Claude Code not installed**:
```bash
npm install -g @anthropic-ai/claude-code
claude --version  # Verify
```

**Authentication issues**:
- Subscription: Run `claude login` in terminal
- API Key: Run "Claude Studio: Configure Authentication" → "API Key"
- Check **Output → Claude Studio** for detailed logs

**Extension not loading**:
- Requires VS Code/Positron 1.41.0+
- Restart after installation
- Check **Output → Claude Studio** for errors

**Enable debug mode**:
```json
{
  "claude-studio.debug": true
}
```

---

## 📝 What's New

### v0.7.2 - Refined Authentication UX
- ✅ Simplified subscription authentication (copy-to-clipboard approach)
- ✅ "I'm Already Logged In" button for users who completed `claude login`
- ✅ Treats `claude login` as prerequisite for cleaner, more reliable setup

### v0.7.0 - Claude Subscription Support
- ✅ Use Claude Pro/Max subscriptions (no API costs!)
- ✅ New authentication chooser (subscription vs API key)
- ✅ OAuth login flow for subscribers
- ✅ Backward compatible with API keys

### Previous Features
- Plot improvement suggestions
- Visualization code generation (6 chart types)
- Statistical test recommendations
- Status bar integration
- Comprehensive test suite (45 tests)

See [CHANGELOG.md](CHANGELOG.md) for full history.

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Development**:
```bash
git clone https://github.com/shandley/claude-studio.git
cd claude-studio
npm install
npm run watch  # Auto-compile on changes
npm test       # Run tests
```

---

## 📄 License

[Elastic License 2.0](LICENSE)

This extension uses Claude Code CLI and Anthropic's services, which have their own terms.

---

## 🔗 Links

- **Repository**: https://github.com/shandley/claude-studio
- **Issues**: https://github.com/shandley/claude-studio/issues
- **Claude Code**: https://docs.anthropic.com/en/docs/claude-code
- **Anthropic Console**: https://console.anthropic.com/

---

**Made for data scientists, by data scientists** 🧬📊🔬
