# Changelog

All notable changes to the Claude Studio extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2025-12-01

### Added
- **Positron Integration**: Advanced features for Positron IDE users
  - **Automatic Plot Detection**: Detects plot creation in R/Python console using `positron.ai.getCurrentPlotUri()`
  - **Rich Plot Context Generation**: Generates comprehensive context files with data analysis
  - **PlotWatcher** (`src/features/plotWatcher.ts`): Monitors R/Python runtime for plot creation
    - Detects plotting code patterns (ggplot, plot(), plt.plot, sns., etc.)
    - Shows notification when plot is created
    - Integrates with ClaudeManager for improvement suggestions
  - **PlotContextBuilder** (`src/features/plotContextBuilder.ts`): Generates detailed plot context
    - Statistical summaries (min, mean, max) for numeric columns
    - Data previews (first 3 rows of data frames)
    - Missing value detection and reporting
    - Column type analysis (numeric, factor, character)
    - Plot type detection (scatter, histogram, box, etc.)
    - Aesthetic extraction (color groupings, faceting)
    - Direct data querying for built-in datasets (mtcars, iris, etc.)
  - **PositronIntegration** (`src/features/positronIntegration.ts`): Detects Positron environment
  - **SessionMonitor** (`src/features/sessionMonitor.ts`): Session state tracking (disabled due to performance)
  - **Clipboard-based workflow**: Copies rich context prompt to clipboard for pasting into Claude terminal
  - **Graceful degradation**: Works in VS Code without Positron features

### Changed
- **Extension** (`src/extension.ts`):
  - Added `initializePositronFeatures()` function to conditionally enable Positron features
  - Registered Positron-specific commands: `showSessionContext`, `improveCurrentPlot`, `getSessionVariables`
  - Detects Positron environment and enables advanced features automatically
- **Package** (`package.json`):
  - Added new Positron-specific commands
  - Updated version badge

### Technical Details
- Plot detection uses event-driven architecture (`onDidExecuteCode`, `onDidChangeForegroundSession`)
- Direct data querying executes R/Python code via `session.execute()` with observer pattern
- 500ms delay for plot rendering before URI capture
- Context files saved to `.claude/plot-context-{timestamp}.md`
- Supports R base graphics, ggplot2, matplotlib, seaborn, plotly

### Documentation
- **PLOT_DETECTION_RESEARCH.md**: Comprehensive research findings on plot detection approach
- **POSITRON_APIS.md**: Documentation of Positron extension APIs
- **POSITRON_INTEGRATION_SUMMARY.md**: Integration overview
- **CLAUDE.md**: Updated with Positron integration architecture and features

### Known Issues
- SessionMonitor temporarily disabled due to performance interference with Positron's variable panel

## [0.7.2] - 2025-11-29

### Changed
- **Refined Subscription Authentication UX**
  - Authentication flow now treats `claude login` as a prerequisite step (one-time global setup)
  - Added "Copy Command" button to easily copy `claude login` to clipboard
  - Added "I'm Already Logged In" button for users who completed authentication
  - Removed terminal command injection approach (avoids shell compatibility issues)
  - Extension now detects existing authentication and guides appropriately

### Documentation
- Updated all guides to emphasize `claude login` as prerequisite in installation steps
- Clearer instructions in README.md, GETTING_STARTED.md, and SHARE_WITH_COLLEAGUES.md
- Authentication section now front and center in all documentation

### Technical
- Simplified authentication code - more reliable and maintainable
- Better alignment with how Claude Code CLI authentication actually works

## [0.7.1] - 2025-11-29

### Changed
- **Simplified Subscription Authentication Flow**
  - Assumes users run `claude login` as a prerequisite (one-time global setup)
  - Extension now detects if user is already authenticated
  - Shows helpful instructions with "Copy Command" option if not authenticated
  - Includes "I'm Already Logged In" button for users who completed setup
  - Removed complex in-extension terminal login attempts that caused issues

### Fixed
- Fixed subscription login showing shell comments instead of running commands
- Fixed zsh compatibility issues with terminal commands
- Improved authentication detection to check for existing Claude login
- Updated all documentation to emphasize `claude login` as prerequisite step

### Documentation
- Updated README.md to list `claude login` in installation steps
- Updated GETTING_STARTED.md to treat authentication as prerequisite
- Updated SHARE_WITH_COLLEAGUES.md with clearer setup flow
- All guides now emphasize one-time global setup approach

## [0.7.0] - 2025-11-29

### Added
- **Claude Pro/Max Subscription Support**: Use Claude Studio with your existing subscription instead of API keys
  - New authentication method setting: choose between "API Key" or "Subscription" (default: Subscription)
  - Subscription mode uses `claude login` for OAuth-based authentication with Pro/Max plans
  - No API key required when using subscription - uses your plan's included usage limits
  - Avoids additional API charges for Pro ($20/month) and Max ($100-200/month) subscribers
  - New command: `claude-studio.configureAuth` - Configure authentication method and credentials
  - New command: `claude-studio.loginSubscription` - Login with Pro/Max subscription
  - Updated welcome dialog to use "Configure Authentication" instead of "Configure API Key"
  - Enhanced quick actions menu with "Configure Authentication" option

### Changed
- **ClaudeAuthManager** (`src/claude/claudeAuth.ts`):
  - Added `AuthMethod` type ('api-key' | 'subscription')
  - New methods: `getAuthMethod()`, `setAuthMethod()`, `isAuthenticated()`, `hasSubscriptionAuth()`
  - New UI method: `configureAuth()` - Interactive picker for choosing auth method
  - New UI method: `loginWithSubscription()` - Guides user through `claude login` process
  - Existing `configureApiKey()` method still available for API key-specific configuration
- **ClaudeManager** (`src/claude/claudeManager.ts`):
  - Terminal creation now conditional: only sets `ANTHROPIC_API_KEY` env var when using API key method
  - When using subscription method, terminal created without API key to use OAuth token
  - `initialize()` checks authentication based on selected method
  - Success messages show which auth method is active
- **Extension** (`src/extension.ts`):
  - Registered new commands: `configureAuth`, `loginSubscription`
  - Updated status bar and quick actions to use `isAuthenticated()` instead of API key-only check
  - Welcome message changed to "Configure Authentication" for better clarity
- **Configuration** (`package.json`):
  - New setting: `claude-studio.authMethod` (enum: 'api-key' | 'subscription', default: 'subscription')
  - Updated `claude-studio.apiKey` description to clarify it's only used when authMethod is 'api-key'

### Technical Details
- Subscription authentication leverages Claude Code CLI's built-in OAuth token support
- When `ANTHROPIC_API_KEY` is not set, Claude CLI automatically uses stored OAuth credentials
- Authentication state check uses `claude --version` as a proxy for subscription auth status
- All 45 existing tests pass with no changes required
- Backward compatible: Users with API keys can continue using them by selecting "API Key" method

### Benefits for Users
- **Cost Savings**: Pro/Max subscribers no longer pay twice (subscription + API usage)
- **Unified Experience**: Use same Claude account across CLI and extension
- **Simplified Setup**: No need to create separate API keys - just login once
- **Higher Limits**: Max plan users get 5-20x higher limits than API key usage

## [0.6.0] - 2024-11-29

### Added
- **Plot Improvement Suggestions**: Interactive code-based plot enhancement
  - Select any plotting code (ggplot2, matplotlib, seaborn, base R, plotly) and get AI-powered improvement suggestions
  - Detects plotting library automatically (ggplot2, matplotlib, seaborn, plotly, base R graphics, lattice)
  - Comprehensive analysis focusing on: visual design, clarity, data presentation, publication quality, code best practices
  - Provides specific recommendations and complete improved code with explanations
  - New command: `claude-studio.improvePlot` (right-click on selected plot code)
  - Works with selected code in editor - universal approach that works in VS Code and Positron
  - Smart detection warns if selected code doesn't appear to be plotting code (optional bypass)

## [0.5.0] - 2024-11-29

### Added
- **Visualization Code Generation**: Publication-ready plot code for R and Python
  - Automatically generates ggplot2 (R) and matplotlib/seaborn (Python) code
  - Supports 6 chart types: histogram, scatter plot, box plot, bar chart, line plot, correlation heatmap
  - Context-aware recommendations based on variable types
  - Includes best practices, proper labels, themes, and colors
  - Publication-ready code with save functionality (PNG, 300 DPI)
  - Statistical annotations (correlation coefficients, p-values, test results)
  - New command: `claude-studio.generateVisualizations` (right-click on data files)
- **VisualizationGenerator**: New class for generating visualization code (`src/providers/visualizationGenerator.ts`)
  - Smart chart type selection based on data structure
  - Best practices guidance for each chart type
  - Customization recommendations

## [0.4.0] - 2024-11-29

### Added
- **Statistical Test Recommendations**: Intelligent analysis-driven test suggestions
  - Automatically analyzes data structure (variable types, counts) from CSV/TSV/JSON files
  - Recommends appropriate statistical tests: t-test, ANOVA, correlation, chi-square, regression
  - Provides test assumptions, when to use each test, and code examples in R and Python
  - Context-aware recommendations based on: numeric vs categorical variables, sample size, research design
  - New command: `claude-studio.recommendTests` (right-click on data files)
- **StatisticalTestAnalyzer**: New class for analyzing data and generating test recommendations (`src/providers/statisticalAnalyzer.ts`)
  - Covers descriptive statistics, normality testing, bivariate analysis (correlation, t-test, ANOVA, chi-square)
  - Includes multivariate recommendations (multiple regression)
  - Generates formatted prompts for Claude with complete test details

## [0.3.0] - 2024-11-29

### Added
- **Status Bar Integration**: Interactive status bar item showing Claude's current state
  - Visual indicators for different states: Not Installed, Not Configured, Idle, Active, Error
  - Color-coded icons for quick status recognition
  - Click to access quick actions menu with context-sensitive options
  - Real-time status updates as Claude state changes
  - Quick access to: Start/Stop Claude, Configure API Key, Show Output, Restart Claude
- **StatusBarManager**: New class for managing status bar lifecycle and state (`src/ui/statusBar.ts`)
- **ClaudeStatus Enum**: Five states to track Claude's lifecycle
- **Quick Actions Command**: `claude-studio.showQuickActions` for status bar click handler

### Changed
- Extension activation now initializes status bar and checks Claude installation state
- All command handlers now update status bar after execution
- Improved error handling with status bar feedback

## [0.2.1] - 2024-11-29

### Changed
- **Simplified CI/CD**: GitHub Actions now only validates builds, not tests
  - Running VS Code extension tests in CI proved overly complex for this project's needs
  - Tests run locally and pass (45 tests, 100% DataContextProvider coverage)
  - CI now focuses on: compilation, packaging, and release automation
  - Renamed workflow from `test.yml` to `build.yml` to reflect purpose
- **Build Process**: Compilation includes automatic fixture copying using native Node.js fs module
  - Created `scripts/copy-fixtures.js` for cross-platform file copying
  - Ensures test fixtures available when running tests locally

### Technical Philosophy
- **Pragmatic approach**: For personal/team extensions, manual testing + local test suite is sufficient
- **CI purpose**: Verify code compiles and package can be built
- **Quality assurance**: Maintained through local testing and real-world usage

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

### [0.3.0] - Planned (Phase 3: Enhanced Features)
- Status bar integration (status indicators, quick actions)
- Inline code suggestions
- Enhanced terminal integration (formatting, history)

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
