# Claude Studio - AI-Enhanced Data Science IDE

## Project Overview
Claude Studio is a Positron IDE extension that integrates Claude Code directly into the data science development environment. This project transforms Positron into an AI-native IDE specifically designed for researchers, data scientists, and analysts.

## Current Development Status
**Phase**: Phase 2 - Core Features Implementation
**Status**: Phase 1 complete, Phase 2 features implemented
**Timeline**: Week 2 of 5-week development cycle
**Completed**: 
- ✅ Phase 1: Basic Claude integration and terminal management
- ✅ Phase 2: Core data science commands and context providers
**Next Steps**: Test Phase 2 features, then begin Phase 3 (Enhanced UI)

## Quick Start for AI Development

### Understanding the Codebase
This is a fork of Positron (https://github.com/posit-dev/positron), which itself is built on VS Code. The key directories are:
- `/extensions/` - Where our Claude Studio extension will live
- `/src/vs/workbench/` - Positron's workbench components we'll integrate with
- `/src/vs/platform/` - Core platform services we'll utilize

### Development Environment Setup
```bash
# Clone the repository
git clone https://github.com/shandley/claude-studio.git
cd claude-studio

# Install dependencies
yarn install

# Create extension directory
mkdir -p extensions/claude-studio
cd extensions/claude-studio

# Initialize extension
npm init -y
npm install -D typescript @types/vscode @types/node
```

### Key Integration Points
1. **Terminal Service**: Access via `ITerminalService` for Claude Code execution
2. **Data Viewer**: Hook into Positron's data viewing capabilities
3. **Editor Actions**: Add context menu items and code actions
4. **Webview API**: Create Claude chat interface
5. **Configuration**: Use VS Code's configuration API for settings

## Architecture Decisions

### Why Extension-Based Approach?
- **Maintainability**: Independent versioning and updates
- **Distribution**: Easy installation via marketplace
- **Development Speed**: 5 weeks vs 8+ weeks for core integration
- **Risk Mitigation**: No need to maintain Positron fork long-term

### Core Components
1. **ClaudeManager**: Manages Claude Code process lifecycle
2. **DataContextProvider**: Extracts context from data frames and visualizations
3. **ClaudePanel**: Webview-based chat interface
4. **CommandRegistry**: All Claude-related commands

### Integration Strategy
- Use subprocess for Claude Code CLI execution
- Leverage VS Code's extension APIs exclusively
- Maintain compatibility with future Positron updates
- Focus on data science-specific features

## Development Guidelines

### Code Standards
- **Language**: TypeScript with strict mode enabled
- **Style**: ESLint with Positron's configuration
- **Testing**: Jest for unit tests, VS Code test runner for integration
- **Documentation**: TSDoc for all public APIs

### Key Principles
1. **Non-blocking**: All Claude operations must be asynchronous
2. **Fail Gracefully**: Never crash the IDE, always provide fallbacks
3. **Privacy First**: Clear user consent for data context sharing
4. **Performance**: Lazy load components, minimize memory usage

### Security Requirements
- API keys stored in VS Code SecretStorage only
- No sensitive data in logs or telemetry
- Data sampling happens locally before sending
- Support for air-gapped environments

## Feature Implementation Guide

### Phase 1: Foundation (Week 1)
Focus on getting Claude Code running within Positron:
```typescript
// Main activation point
export async function activate(context: vscode.ExtensionContext) {
    const claudeManager = new ClaudeManager(context);
    await claudeManager.initialize();
    
    // Register basic command
    context.subscriptions.push(
        vscode.commands.registerCommand('claude-studio.start', 
            () => claudeManager.startClaude())
    );
}
```

### Phase 2: Core Features (Week 2)
Implement data science-specific commands:
- Extract dataframe context
- Add "Analyze with Claude" to data viewer
- Create code explanation features

### Phase 3: Enhanced UI (Week 3)
Build the Claude panel interface:
- Webview-based chat
- Syntax highlighted code blocks
- Copy/insert code functionality

### Phase 4: Data Science Features (Week 4)
Add specialized capabilities:
- Statistical test recommendations
- Visualization improvements
- Documentation generation

### Phase 5: Polish & Release (Week 5)
Prepare for public release:
- Complete test coverage
- Write user documentation
- Create demo videos

## Testing Strategy

### Unit Tests
Test individual components in isolation:
```typescript
describe('ClaudeManager', () => {
    it('should initialize with correct configuration', async () => {
        const manager = new ClaudeManager(mockContext);
        await manager.initialize();
        expect(manager.isReady()).toBe(true);
    });
});
```

### Integration Tests
Test extension within Positron:
- Command execution
- UI rendering
- Data context extraction

### Manual Testing Checklist
- [ ] Extension installs without errors
- [ ] Claude commands appear in palette
- [ ] API key configuration works
- [ ] Data analysis features function
- [ ] No performance degradation

## API Key Configuration
Users will need to provide their Anthropic API key:
1. Open command palette
2. Run "Claude Studio: Configure API Key"
3. Enter API key (stored securely)
4. Verify connection

## Common Tasks

### Adding a New Command
1. Define command in `package.json`
2. Implement handler in `commands/`
3. Register in `extension.ts`
4. Add tests
5. Update documentation

### Debugging the Extension
```bash
# In VS Code
1. Open the claude-studio folder
2. Press F5 to launch Extension Development Host
3. Test commands in the new window
4. Check Debug Console for logs
```

### Building for Release
```bash
# Build extension
npm run build

# Package for distribution
vsce package

# Publish to marketplace (when ready)
vsce publish
```

## Data Science Use Cases

### Primary Workflows
1. **Exploratory Data Analysis**: Get insights about datasets quickly
2. **Statistical Modeling**: Receive guidance on appropriate tests
3. **Visualization**: Generate and improve plots
4. **Documentation**: Create methods sections and result descriptions

### Example Commands
- "Claude, analyze this dataframe for outliers"
- "What statistical test should I use for this comparison?"
- "Help me create a publication-ready visualization"
- "Generate a methods paragraph for this analysis"

## Performance Considerations
- Limit data context to 1000 rows by default
- Use streaming for large responses
- Cache frequent operations
- Lazy load UI components

## Future Enhancements
1. **Local Model Support**: Run models locally for privacy
2. **Collaborative Features**: Share Claude conversations
3. **Custom Prompts**: Data science-specific prompt library
4. **Research Templates**: Pre-built analysis workflows

## Troubleshooting

### Common Issues
1. **Claude not responding**: Check API key and network
2. **Performance issues**: Reduce data context size
3. **Extension not loading**: Check Positron compatibility

### Debug Mode
Enable verbose logging:
```json
"claude-studio.debug": true
```

## Contributing
This project follows Positron's contribution guidelines with additional requirements:
- All AI features must be optional
- Respect user privacy and consent
- Focus on data science workflows
- Maintain backward compatibility

## Resources
- [Positron Documentation](https://github.com/posit-dev/positron/wiki)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)

## License
This extension follows Positron's Elastic License 2.0. See LICENSE file for details.

## Support
- GitHub Issues: Bug reports and feature requests
- Discussions: General questions and ideas
- Email: support@claude-studio.dev (when launched)

---
**Note**: This document is the source of truth for AI assistants working on this project. Always refer to this file for project context and development guidelines.