# Contributing to Claude Studio

Thank you for your interest in contributing to Claude Studio! This guide will help you get started with development and contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)

---

## Code of Conduct

This project follows the Contributor Covenant Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

**Key principles:**
- Be respectful and inclusive
- Welcome newcomers and learners
- Focus on constructive feedback
- Prioritize the community and project goals

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git** for version control
- **VS Code** or **Positron IDE** for development
- **Claude Code CLI** installed globally (`npm install -g @anthropic-ai/claude-code`)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/claude-studio.git
   cd claude-studio
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/shandley/claude-studio.git
   ```

### Install Dependencies

```bash
npm install
```

### Compile TypeScript

```bash
npm run compile
```

### Run in Development Mode

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Test your changes in the new window

---

## Development Workflow

### Branching Strategy

- **main**: Stable, production-ready code
- **feature/your-feature-name**: New features
- **fix/your-bug-fix**: Bug fixes
- **docs/your-doc-update**: Documentation changes

### Making Changes

1. **Create a new branch** from main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Compile and test**:
   ```bash
   npm run compile
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build process or tooling changes

**Examples:**
```
feat(data-context): Add support for Excel files

fix(claude-manager): Handle Claude process crashes gracefully

docs(readme): Update installation instructions

test(data-context): Add edge case tests for empty files
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run watch
```

### Writing Tests

All new features should include tests. We use:
- **Mocha** for test running
- **Chai** for assertions
- **@vscode/test-electron** for VS Code integration tests

**Test file location**: `src/test/suite/`

**Example test:**
```typescript
import * as assert from 'assert';
import { YourClass } from '../../path/to/class';

suite('YourClass Test Suite', () => {
    let instance: YourClass;

    setup(() => {
        instance = new YourClass();
    });

    teardown(() => {
        // Clean up
    });

    test('should do something', () => {
        const result = instance.doSomething();
        assert.strictEqual(result, expected);
    });
});
```

### Test Coverage Requirements

- **New features**: Must have 80%+ coverage
- **Bug fixes**: Should include regression test
- **Critical components**: Aim for 100% coverage

See [src/test/README.md](src/test/README.md) for detailed testing guidelines.

---

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: `npm test`
2. **Compile successfully**: `npm run compile`
3. **Update documentation** if needed
4. **Add changelog entry** if applicable
5. **Rebase on latest main**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Added new tests for the feature
- [ ] Tested manually in Positron/VS Code

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed my own code
- [ ] Commented complex code sections
- [ ] Updated documentation
- [ ] No new warnings introduced
- [ ] Added tests that prove the fix/feature works
```

### Review Process

1. Maintainers will review your PR within 3-5 business days
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

---

## Coding Standards

### TypeScript Guidelines

- **Strict mode**: Always enabled (`tsconfig.json`)
- **Type annotations**: Use explicit types, avoid `any`
- **Naming conventions**:
  - Classes: `PascalCase`
  - Functions/methods: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Interfaces: `PascalCase` (prefix with `I` if ambiguous)
  - Private members: prefix with underscore `_private`

**Good:**
```typescript
export class DataContextProvider {
    private readonly _cache: Map<string, DataContext>;
    private readonly maxPreviewRows: number = 10;

    public async getFileContext(uri: vscode.Uri): Promise<DataContext | null> {
        // Implementation
    }
}
```

**Bad:**
```typescript
export class dataContextProvider {
    cache: any;
    MaxPreviewRows = 10;

    getFileContext(uri) {
        // Missing types
    }
}
```

### Code Style

- **Indentation**: 4 spaces (configured in `.editorconfig`)
- **Line length**: Maximum 100 characters
- **Quotes**: Single quotes for strings
- **Semicolons**: Required at end of statements
- **Async/await**: Prefer over promises/callbacks

### Documentation

- **Public APIs**: Require TSDoc comments
- **Complex logic**: Add inline comments explaining "why", not "what"
- **Examples**: Include for public methods

**Example:**
```typescript
/**
 * Parse a CSV/TSV file and extract structured data context.
 *
 * @param fileName - Path to the data file
 * @param content - Raw file content as string
 * @returns DataContext object with parsed information
 *
 * @example
 * ```typescript
 * const context = await provider.parseFileContent('/path/to/data.csv', csvContent);
 * console.log(context.shape); // [100, 5]
 * ```
 */
private async parseFileContent(fileName: string, content: string): Promise<DataContext> {
    // Implementation
}
```

### Error Handling

- Always catch and handle errors gracefully
- Never crash the IDE
- Provide helpful error messages to users
- Log detailed errors for debugging

**Example:**
```typescript
try {
    const data = await this.parseFile(uri);
    return data;
} catch (error) {
    console.error('Failed to parse file:', error);
    vscode.window.showErrorMessage(`Unable to parse file: ${error.message}`);
    return null;
}
```

---

## Project Structure

```
claude-studio/
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── claude/
│   │   ├── claudeManager.ts   # Claude process lifecycle
│   │   ├── claudeAPI.ts       # Subprocess communication
│   │   └── claudeAuth.ts      # API key management
│   ├── providers/
│   │   └── dataContext.ts     # Data file parsing
│   ├── commands/
│   │   └── index.ts           # Command handlers
│   ├── utils/
│   │   ├── config.ts          # Configuration
│   │   └── error.ts           # Error handling
│   └── test/
│       ├── suite/             # Test files
│       └── fixtures/          # Test data
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript config
└── README.md                  # User documentation
```

### Adding a New Component

1. Create file in appropriate directory
2. Export public API
3. Add to `src/extension.ts` if needed
4. Write tests in `src/test/suite/`
5. Update documentation

---

## Questions or Need Help?

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Email**: scott@example.com (replace with actual)

---

## License

By contributing to Claude Studio, you agree that your contributions will be licensed under the [Elastic License 2.0](LICENSE).

---

**Thank you for contributing to Claude Studio!** Your efforts help make data science development better for everyone.
