# Claude Studio Extension for Positron

**AI-enhanced data science development with Claude Code integration**

[![License](https://img.shields.io/badge/license-Elastic--2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-green.svg)](package.json)
[![Tests](https://img.shields.io/badge/tests-45%20passing-success.svg)](src/test)

Claude Studio is a [Positron IDE](https://github.com/posit-dev/positron) extension that integrates [Claude Code](https://docs.anthropic.com/en/docs/claude-code) directly into your data science development workflow. It provides intelligent code assistance, data analysis, and documentation features specifically designed for researchers, data scientists, and analysts.

---

## 🌟 Features

### 🤖 **Claude Code Integration**
- Launch Claude directly in Positron's terminal
- Secure API key management
- Full Claude Code CLI capabilities including MCP servers

### 📊 **Intelligent Data Analysis**
- **CSV/TSV/JSON Parsing**: Automatic data structure detection and type inference
- **Smart Context**: Extracts column names, data types, and statistics
- **Data Suggestions**: Get AI-powered analysis recommendations for your datasets

### 💻 **Code Intelligence**
- **Explain Code**: Get detailed explanations of selected code with language context
- **Generate Documentation**: Create Python docstrings, R Roxygen2, or JSDoc documentation
- **Debug Assistance**: Analyze errors with surrounding code context
- **Language-Aware**: Automatically detects Python, R, and JavaScript/TypeScript

### 🎯 **Context Menu Integration**
- Right-click on code → Explain, Document, or Debug
- Right-click on data files → Analyze or Get Suggestions
- Seamless workflow integration

---

## 📦 Installation

### Prerequisites
- [Positron IDE](https://github.com/posit-dev/positron) (or VS Code 1.41.0+)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed
- [Anthropic API key](https://console.anthropic.com/)

### Install Claude Code CLI

```bash
# Via npm (recommended)
npm install -g @anthropic-ai/claude-code

# Via Homebrew
brew install claude-code
```

### Install Extension

#### From VSIX (Current)
1. Download the latest `.vsix` file from [Releases](https://github.com/shandley/claude-studio/releases)
2. Open Positron
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
4. Type "Install from VSIX"
5. Select the downloaded `.vsix` file
6. Restart Positron

#### From Source
```bash
git clone https://github.com/shandley/claude-studio.git
cd claude-studio
npm install
npm run compile
npm run package
# Install the generated .vsix file in Positron
```

---

## 🚀 Getting Started

### 1. Configure API Key

First time setup:
1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run: **"Claude Studio: Configure API Key"**
3. Enter your Anthropic API key
4. Key is stored securely in Positron's global state

### 2. Start Claude

**Option A: Via Command Palette**
```
Cmd+Shift+P → "Claude Studio: Start Claude Assistant"
```

**Option B: Automatic (when using commands)**
- Claude will start automatically when you use any feature
- A dedicated terminal named "Claude Studio" will open

### 3. Use the Features

#### Explain Code
1. Select code in your editor
2. Right-click → **"Claude Studio: Explain This Code"**
3. Claude analyzes and explains in the terminal

#### Generate Documentation
1. Select a function or code block
2. Right-click → **"Claude Studio: Generate Documentation"**
3. Receive language-specific documentation (Python docstrings, R Roxygen2, JSDoc)

#### Analyze Data Files
1. Right-click on a `.csv`, `.tsv`, or `.json` file in Explorer
2. Select **"Claude Studio: Suggest Data Analysis"**
3. Get AI-powered recommendations for statistical analysis

#### Debug Errors
1. Place cursor on problematic code
2. Run **"Claude Studio: Debug Error with Claude"**
3. Claude analyzes errors from Positron's language server (Pyright, etc.)

---

## 📖 Usage Examples

### Example 1: Explain Python Code
```python
# Select this code and right-click → "Explain This Code"
def calculate_mean(data):
    return sum(data) / len(data)
```

**Claude will explain:**
- What the function does
- How it works
- Any edge cases or issues (e.g., division by zero)

### Example 2: Generate R Documentation
```r
# Select this function and right-click → "Generate Documentation"
analyze_correlation <- function(x, y, method = "pearson") {
  cor.test(x, y, method = method)
}
```

**Claude generates Roxygen2:**
```r
#' Analyze Correlation Between Two Vectors
#'
#' @param x Numeric vector
#' @param y Numeric vector
#' @param method Correlation method ("pearson", "kendall", "spearman")
#' @return A correlation test object
#' @export
```

### Example 3: Analyze CSV Data
Right-click on `sales_data.csv` → "Suggest Data Analysis"

**Claude receives:**
```
Data: sales_data.csv
Shape: 100 rows × 8 columns

Columns:
- date (datetime)
- product (string)
- quantity (int)
- price (float)
- region (string)
...

Preview (first 10 rows):
[table preview]
```

**Claude suggests:**
- Exploratory data analysis steps
- Appropriate statistical tests
- Visualization recommendations
- Data quality checks

---

## ⚙️ Configuration

Access settings via: **Preferences → Settings → Extensions → Claude Studio**

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `claude-studio.model` | `claude-3-sonnet` | Claude model to use |
| `claude-studio.maxTokens` | `4096` | Maximum tokens for responses |
| `claude-studio.temperature` | `0.7` | Response creativity (0-1) |
| `claude-studio.dataContextSize` | `1000` | Max rows for data context |
| `claude-studio.autoSuggest` | `true` | Enable automatic suggestions |
| `claude-studio.debug` | `false` | Enable debug logging |

### Example Settings (JSON)
```json
{
  "claude-studio.model": "claude-3-opus",
  "claude-studio.temperature": 0.3,
  "claude-studio.debug": true
}
```

---

## 🎨 How It Compares

### Claude Studio vs. Positron Assistant

| Feature | Claude Studio | Positron Assistant |
|---------|---------------|-------------------|
| **Architecture** | Terminal-based (Claude Code CLI) | Built-in chat sidebar |
| **Interaction** | Command-driven workflows | Conversational AI |
| **Data Context** | File parsing (CSV/TSV/JSON) | Live IDE state access |
| **Use Case** | Specific data science tasks | General coding assistance |
| **Best For** | Structured workflows | Exploratory conversations |
| **Provider** | Claude Code only | Claude API + GitHub Copilot |

**Recommendation**: Use **both** together:
- **Positron Assistant** for conversational help and agent mode
- **Claude Studio** for specific tasks like "explain this code" or "analyze this CSV"

---

## 🧪 Testing

The extension includes a comprehensive test suite with 100% coverage of the DataContextProvider.

### Run Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Watch mode during development
npm run watch
```

### Test Coverage

- **45 tests** covering:
  - CSV/TSV/JSON file parsing
  - Type inference and date detection
  - Data formatting
  - Cache management
  - Edge cases

Results: **45 passing (11ms), 0 failing**

See [src/test/README.md](src/test/README.md) for detailed test documentation.

---

## 🏗️ Architecture

### Components

```
claude-studio/
├── src/
│   ├── extension.ts           # Extension activation & commands
│   ├── claude/
│   │   ├── claudeManager.ts   # Claude Code lifecycle management
│   │   ├── claudeAPI.ts       # Subprocess communication
│   │   └── claudeAuth.ts      # Secure API key storage
│   ├── providers/
│   │   └── dataContext.ts     # Data file parsing & analysis
│   ├── commands/
│   │   └── index.ts           # Command implementations
│   └── utils/
│       ├── config.ts          # Configuration management
│       └── error.ts           # Error handling
└── test/
    ├── suite/
    │   └── dataContext.test.ts  # Unit tests
    └── fixtures/                # Test data files
```

### Key Features

- **Terminal Integration**: Runs Claude Code in dedicated terminal with environment variables
- **Smart Data Parsing**: Infers types (int, float, string, datetime, bool) from data files
- **Language Detection**: Automatically detects Python, R, JavaScript/TypeScript
- **Error Intelligence**: Integrates with Positron's language servers (Pyright, etc.)
- **Secure Storage**: API keys stored in VS Code's secure globalState

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/shandley/claude-studio.git
cd claude-studio

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Watch mode for development
npm run watch
```

### Adding Tests

See [src/test/README.md](src/test/README.md) for testing guidelines.

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

### Latest Release: v0.2.0

- ✅ Added comprehensive unit test suite (45 tests)
- ✅ Fixed type inference bug (booleans vs numbers)
- ✅ Complete test infrastructure with Mocha + Chai
- ✅ Test fixtures and documentation

---

## 🐛 Troubleshooting

### Common Issues

**Q: "Claude Code is not installed"**
```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code
# Verify installation
claude --version
```

**Q: Extension not loading**
- Check Positron version (1.41.0+)
- Restart Positron
- Check Output → Claude Studio for errors

**Q: API key errors**
- Run "Claude Studio: Configure API Key"
- Verify key at https://console.anthropic.com/
- Check Output → Claude Studio for details

**Q: Tests failing**
- Ensure VS Code test environment is downloaded
- Run: `npm install`
- Run: `npm test`

### Enable Debug Logging

```json
{
  "claude-studio.debug": true
}
```

Check **Output → Claude Studio** for detailed logs.

---

## 📄 License

This extension is licensed under the [Elastic License 2.0](LICENSE).

**Note**: This extension requires the Claude Code CLI and Anthropic API, which have their own terms of service.

---

## 🔗 Links

- **Repository**: https://github.com/shandley/claude-studio
- **Issues**: https://github.com/shandley/claude-studio/issues
- **Positron IDE**: https://github.com/posit-dev/positron
- **Claude Code Docs**: https://docs.anthropic.com/en/docs/claude-code
- **Anthropic API**: https://console.anthropic.com/

---

## 🙏 Acknowledgments

- Built for [Positron IDE](https://github.com/posit-dev/positron) by Posit PBC
- Powered by [Claude Code](https://www.anthropic.com/claude) from Anthropic
- Inspired by the data science community's need for AI-native tools

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/shandley/claude-studio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shandley/claude-studio/discussions)

---

**Made with ❤️ for data scientists, by data scientists**
