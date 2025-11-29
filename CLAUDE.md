# Claude Studio Extension

## Project Overview

Claude Studio is a standalone VS Code/Positron extension that integrates Claude Code CLI into data science workflows. It provides intelligent code assistance, data file analysis, and documentation generation specifically for researchers and data scientists.

**Repository**: https://github.com/shandley/claude-studio
**Current Version**: v0.5.0
**License**: Elastic License 2.0

## Current Status

**Completed (Phases 1-5)**:
- Core Claude Code CLI integration via terminal
- Secure API key management (VS Code globalState)
- Data file parsing (CSV/TSV/JSON) with type inference
- Code explanation and documentation generation
- Language-aware features (Python, R, JavaScript/TypeScript)
- Error debugging with language server integration
- Comprehensive test suite (45 tests, 100% DataContextProvider coverage)
- CI/CD automation (build validation, automated releases)
- **Status bar integration** (interactive status indicator with quick actions)
- **Statistical test recommendations** (intelligent analysis-driven test suggestions with R/Python code)
- **Visualization code generation** (publication-ready ggplot2 and matplotlib/seaborn code)

**Next Phase (Phase 4 - Remaining Features)**:
- Plot improvement suggestions (analyze existing plots and suggest enhancements)
- Research documentation generation (methods sections, results formatting)

**Future Enhancements**:
- Inline code suggestions
- Enhanced terminal integration

## Architecture

### Core Components

```
src/
├── extension.ts              # Activation, command registration
├── claude/
│   ├── claudeManager.ts      # Process lifecycle management
│   ├── claudeAPI.ts          # Subprocess communication
│   └── claudeAuth.ts         # Secure API key storage
├── providers/
│   └── dataContext.ts        # CSV/TSV/JSON parsing, type inference
├── commands/
│   └── index.ts              # Command handlers
└── utils/
    ├── config.ts             # Configuration management
    └── error.ts              # Error handling
```

### Key Design Principles

- **VS Code API Only**: No Positron-specific APIs, works in both VS Code and Positron
- **Terminal-based**: Claude Code runs in dedicated terminal with environment variables
- **Asynchronous**: All operations non-blocking
- **Fail Gracefully**: Never crash the IDE
- **Privacy First**: API keys in secure storage, data sampling happens locally

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch
```

### Testing

```bash
# Run all tests (launches VS Code Extension Host)
npm test

# Tests execute in ~10-15ms
# Output: 45 passing, 0 failing
```

### Debugging

1. Open project in VS Code/Positron
2. Press F5 to launch Extension Development Host
3. Test commands in new window
4. Check Debug Console for logs
5. Set breakpoints in TypeScript files

### Building

```bash
# Create VSIX package
npm run package

# Generates: claude-studio-0.2.1.vsix
```

### Manual Testing in Positron

1. Compile: `npm run compile`
2. Package: `npm run package`
3. Open Positron
4. Cmd+Shift+P → "Install from VSIX"
5. Select generated `.vsix` file
6. Restart Positron
7. Test commands:
   - Start Claude Assistant
   - Configure API Key
   - Explain This Code (select code first)
   - Generate Documentation (select function)
   - Analyze Data (right-click CSV/JSON file)

## Available Commands

All commands prefixed with "Claude Studio:" in command palette.

**Core**:
- Start Claude Assistant
- Stop Claude
- Configure API Key
- Install Claude Code CLI

**Code Operations** (require text selection):
- Explain This Code
- Generate Documentation (language-specific: docstrings, Roxygen2, JSDoc)
- Debug Error with Claude

**Data Operations** (CSV/TSV/JSON files):
- Analyze Data with Claude
- Suggest Data Analysis

## Adding New Features

### 1. Add a New Command

**package.json**:
```json
{
  "contributes": {
    "commands": [{
      "command": "claude-studio.yourCommand",
      "title": "Claude Studio: Your Command",
      "category": "Claude Studio"
    }]
  }
}
```

**src/commands/index.ts**:
```typescript
export async function yourCommand(context: vscode.ExtensionContext) {
    // Implementation
}
```

**src/extension.ts**:
```typescript
context.subscriptions.push(
    vscode.commands.registerCommand(
        'claude-studio.yourCommand',
        () => yourCommand(context)
    )
);
```

### 2. Add Context Menu Integration

**package.json**:
```json
{
  "menus": {
    "editor/context": [{
      "command": "claude-studio.yourCommand",
      "group": "claude",
      "when": "editorHasSelection"
    }]
  }
}
```

### 3. Add Tests

**src/test/suite/yourFeature.test.ts**:
```typescript
import * as assert from 'assert';
import { YourClass } from '../../path/to/class';

suite('Your Feature Test Suite', () => {
    test('should do something', () => {
        const result = yourFunction();
        assert.strictEqual(result, expected);
    });
});
```

## Configuration Settings

Users can customize via Settings → Extensions → Claude Studio:

- `claude-studio.model`: Claude model (default: claude-3-sonnet)
- `claude-studio.maxTokens`: Max response tokens (default: 4096)
- `claude-studio.temperature`: Response creativity 0-1 (default: 0.7)
- `claude-studio.dataContextSize`: Max rows for data context (default: 1000)
- `claude-studio.autoSuggest`: Enable auto suggestions (default: true)
- `claude-studio.debug`: Enable debug logging (default: false)

## Data Context Provider

**Key Features**:
- Parses CSV, TSV, JSON files
- Infers data types: int, float, bool, string, datetime
- Detects missing values
- Calculates column statistics
- Creates data preview (first 10 rows)
- Formats context for Claude

**Type Inference Logic** (src/providers/dataContext.ts:218):
```typescript
// Order matters: booleans must be checked before numbers
// because Number(true) = 1, Number(false) = 0
1. Check for booleans
2. Check for numbers (int vs float)
3. Check for dates (YYYY-MM-DD, MM/DD/YYYY, ISO)
4. Default to string
```

## Release Process

**For new releases**:

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Commit changes: `git commit -m "chore: Release v0.x.x"`
4. Create tag: `git tag -a v0.x.x -m "Release v0.x.x"`
5. Push: `git push origin main --tags`
6. GitHub Actions automatically creates release with VSIX

## Common Issues

**Extension not loading**:
- Check VS Code/Positron version (requires 1.41.0+)
- View Output → Claude Studio for errors
- Try reinstalling from VSIX

**Tests failing**:
- Ensure compiled: `npm run compile`
- Fixtures copied: `node scripts/copy-fixtures.js`
- Clean rebuild: `rm -rf out && npm run compile`

**Claude not responding**:
- Verify API key: Command Palette → "Claude Studio: Configure API Key"
- Check Claude Code installed: `claude --version`
- View terminal output for errors

## Performance Notes

- Extension activates on startup (fast: <100ms)
- Data context limited to 1000 rows by default
- Type inference processes preview only (first 10 rows)
- Caching used for parsed data contexts

## Next Development Priorities

**Phase 3: Enhanced Features**:
1. Add status bar integration
   - Show Claude status (active/idle/error)
   - Quick access to commands
   - API usage indicators
2. Implement inline suggestions
   - Code completion integration
   - Contextual suggestions
   - Smart triggering based on context
3. Enhanced terminal integration
   - Better output formatting
   - Command history navigation
   - Response highlighting

**Phase 4: Data Science Features**:
1. Statistical test recommendations
2. Visualization code generation
3. Plot improvement suggestions
4. Research documentation generation

## Resources

- **Documentation**: See README.md, CONTRIBUTING.md, CHANGELOG.md
- **Tests**: See src/test/README.md
- **VS Code API**: https://code.visualstudio.com/api
- **Claude Code**: https://docs.anthropic.com/en/docs/claude-code
- **Positron**: https://github.com/posit-dev/positron

## Notes for AI Assistants

This is a working extension in active development. All code compiles, tests pass, and features work in production. Focus on:
- Maintaining existing architecture patterns
- Adding comprehensive tests for new features
- Following TypeScript strict mode
- Preserving backward compatibility
- Documenting public APIs with TSDoc

When asked to add features, refer to the "Adding New Features" section for patterns.
