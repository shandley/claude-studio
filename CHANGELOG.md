# Changelog

All notable changes to the Claude Studio extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2024-11-29

### Fixed
- **CI Test Failures**: Test fixtures now properly copied to output directory during compilation
  - Created Node.js script (`scripts/copy-fixtures.js`) for reliable cross-platform file copying
  - Updated compile script to automatically copy test fixtures from `src/test/fixtures/` to `out/test/fixtures/`
  - Resolves GitHub Actions test failures on all platforms (Windows/macOS/Linux)

### Changed
- **Build Process**: Compilation now includes automatic fixture copying using native Node.js fs module
- **GitHub Actions**: Added `fail-fast: false` to test matrix to see all platform results
- **GitHub Actions**: Added verification step to debug fixture copying in CI

## [0.2.0] - 2024-11-29

### Added
- **Comprehensive Unit Test Suite**: 45 tests covering all DataContextProvider functionality
  - CSV/TSV/JSON file parsing tests
  - Type inference and date detection tests
  - Data formatting tests
  - Cache management tests
  - Edge case handling tests
- **Test Infrastructure**: Full Mocha + Chai setup with VS Code extension testing
- **Test Fixtures**: Sample data files for all supported formats
- **Test Documentation**: Detailed README in `src/test/` with testing guidelines
- **GitHub Actions Ready**: Prepared for CI/CD integration (workflows to be added)

### Fixed
- **Type Inference Bug**: Boolean values in JSON files were incorrectly detected as integers
  - Root cause: `Number(true)` returns 1, causing boolean check to fail
  - Solution: Reordered type checks to test for booleans before numbers
  - Affected: DataContextProvider.inferDataType() method

### Changed
- **Package Scripts**: Added `test`, `pretest`, and `test-unit` npm scripts
- **Dev Dependencies**: Added mocha, chai, @vscode/test-electron, glob, and related type definitions

### Technical Details
- **Test Coverage**: 100% of DataContextProvider (9 files, ~800 lines of test code)
- **Test Performance**: All tests execute in ~11ms
- **Build Size**: Extension package remains lightweight at ~73KB

## [0.1.0] - 2024-06-29

### Added
- **Initial Release**: Claude Studio extension for Positron IDE
- **Phase 1: Foundation**
  - ClaudeManager for Claude Code CLI lifecycle management
  - ClaudeAPI for subprocess communication
  - ClaudeAuth for secure API key storage
  - ConfigManager for centralized settings
  - ErrorHandler for consistent error reporting

- **Phase 2: Core Features**
  - **DataContextProvider**: Intelligent data file parsing
    - CSV/TSV file parsing with delimiter detection
    - JSON file parsing (arrays and objects)
    - Automatic type inference (int, float, string, datetime, bool)
    - Column statistics and missing value detection
    - Smart data sampling (first 10 rows for preview)

  - **Commands**:
    - `Claude Studio: Start Claude Assistant` - Launch Claude in terminal
    - `Claude Studio: Configure API Key` - Secure API key setup
    - `Claude Studio: Stop Claude` - Terminate Claude session
    - `Claude Studio: Install Claude Code CLI` - Installation helper
    - `Claude Studio: Analyze Data with Claude` - Data file analysis
    - `Claude Studio: Explain This Code` - Code explanation with language context
    - `Claude Studio: Generate Documentation` - Language-specific doc generation
    - `Claude Studio: Suggest Data Analysis` - Statistical analysis recommendations
    - `Claude Studio: Debug Error with Claude` - Error analysis and debugging

  - **Context Menu Integration**:
    - Editor context menu for code operations
    - Explorer context menu for data files
    - Language-aware menu item visibility

  - **Language Support**:
    - Python (docstrings, Pyright error detection)
    - R (Roxygen2 documentation)
    - JavaScript/TypeScript (JSDoc)

### Features
- **Secure API Key Storage**: Uses VS Code's globalState (no plaintext in settings)
- **Terminal Integration**: Dedicated "Claude Studio" terminal with environment variables
- **Smart Data Parsing**: Automatic column type detection and statistics
- **Error Intelligence**: Integrates with Positron's language servers
- **Configuration**: Flexible settings for model, tokens, temperature, etc.

### Technical
- **TypeScript**: Strict mode enabled for type safety
- **Architecture**: Clean separation of concerns (claude/, providers/, commands/, utils/)
- **Dependencies**: Minimal external dependencies, VS Code API only
- **Performance**: Fast activation (<100ms), lightweight footprint

### Documentation
- Comprehensive README.md
- IMPLEMENTATION_PLAN.md with 5-phase roadmap
- CLAUDE.md for AI assistant context
- PHASE_2_TEST_GUIDE.md for testing guidance

---

## Future Releases

### [0.3.0] - Planned (Phase 3: Enhanced UI)
- Webview-based Claude panel (optional)
- Status bar integration
- Inline suggestions
- Message history UI

### [0.4.0] - Planned (Phase 4: Data Science Features)
- Statistical test recommendations
- Visualization code generation
- Plot improvement suggestions
- Research documentation generation

### [0.5.0] - Planned (Phase 5: Polish & Release)
- VS Code Marketplace publication
- Complete documentation website
- Video tutorials
- Community features (discussions, templates)

---

## Legend

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities

[0.2.0]: https://github.com/shandley/claude-studio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/shandley/claude-studio/releases/tag/v0.1.0
