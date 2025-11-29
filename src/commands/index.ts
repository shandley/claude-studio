import * as vscode from 'vscode';
import { ClaudeManager } from '../claude/claudeManager';
import { DataContextProvider } from '../providers/dataContext';
import { ErrorHandler } from '../utils/error';

export class ClaudeCommands {
    constructor(
        private claudeManager: ClaudeManager,
        private dataProvider: DataContextProvider
    ) {}

    /**
     * Explain selected code
     */
    async explainCode(): Promise<void> {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found');
                return;
            }

            // Check if Claude is initialized
            const initialized = await this.claudeManager.initialize();
            if (!initialized) {
                return;
            }

            // Get selected text or current line
            const selection = editor.selection;
            const selectedText = selection.isEmpty 
                ? editor.document.lineAt(selection.active.line).text
                : editor.document.getText(selection);

            if (!selectedText.trim()) {
                vscode.window.showInformationMessage('No code selected');
                return;
            }

            // Get language context
            const languageId = editor.document.languageId;
            const fileName = editor.document.fileName.split('/').pop() || 'untitled';

            // Build prompt
            const prompt = `Please explain this ${languageId} code from ${fileName}:

\`\`\`${languageId}
${selectedText}
\`\`\`

Provide a clear explanation of:
1. What this code does
2. How it works
3. Any important concepts or patterns used`;

            // Send to Claude
            await this.claudeManager.sendCommand(prompt);
            vscode.window.showInformationMessage('Explaining code with Claude...');
        } catch (error) {
            ErrorHandler.handle(error, 'Explain Code');
        }
    }

    /**
     * Generate documentation for selected code
     */
    async generateDocumentation(): Promise<void> {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found');
                return;
            }

            // Check if Claude is initialized
            const initialized = await this.claudeManager.initialize();
            if (!initialized) {
                return;
            }

            // Get selected text
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            if (!selectedText.trim()) {
                vscode.window.showInformationMessage('No code selected');
                return;
            }

            // Get language context
            const languageId = editor.document.languageId;
            
            // Build appropriate prompt based on language
            let docStyle = 'docstring';
            if (languageId === 'typescript' || languageId === 'javascript') {
                docStyle = 'JSDoc';
            } else if (languageId === 'python') {
                docStyle = 'Google style docstring';
            } else if (languageId === 'r') {
                docStyle = 'Roxygen2';
            }

            const prompt = `Generate ${docStyle} documentation for this ${languageId} code:

\`\`\`${languageId}
${selectedText}
\`\`\`

Requirements:
- Include parameter descriptions with types
- Document return values
- Add usage examples if appropriate
- Describe any exceptions/errors raised
- Keep it concise but informative`;

            // Send to Claude
            await this.claudeManager.sendCommand(prompt);
            vscode.window.showInformationMessage('Generating documentation with Claude...');
        } catch (error) {
            ErrorHandler.handle(error, 'Generate Documentation');
        }
    }

    /**
     * Suggest data analysis based on current data context
     */
    async suggestAnalysis(uri?: vscode.Uri): Promise<void> {
        try {
            // Check if Claude is initialized
            const initialized = await this.claudeManager.initialize();
            if (!initialized) {
                return;
            }

            // Get data context
            let dataContext = null;
            if (uri) {
                dataContext = await this.dataProvider.getFileDataContext(uri);
            } else {
                dataContext = await this.dataProvider.getEditorDataContext();
            }

            if (!dataContext) {
                vscode.window.showInformationMessage('No data file selected');
                return;
            }

            // Format data context for Claude
            const contextString = this.dataProvider.formatForClaude(dataContext);

            const prompt = `Please suggest appropriate data analysis for this dataset:

${contextString}

Provide:
1. Initial exploratory data analysis steps
2. Appropriate statistical tests based on the data types
3. Visualization recommendations
4. Data quality checks to perform
5. Potential insights to investigate

Consider the data types, missing values, and overall structure in your recommendations.`;

            // Send to Claude
            await this.claudeManager.sendCommand(prompt);
            vscode.window.showInformationMessage('Getting analysis suggestions from Claude...');
        } catch (error) {
            ErrorHandler.handle(error, 'Suggest Analysis');
        }
    }

    /**
     * Debug error with Claude's help
     */
    async debugError(): Promise<void> {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found');
                return;
            }

            // Check if Claude is initialized
            const initialized = await this.claudeManager.initialize();
            if (!initialized) {
                return;
            }

            // Get the current document content
            const document = editor.document;
            const languageId = document.languageId;
            
            // Try to find error markers in the current file
            const diagnostics = vscode.languages.getDiagnostics(document.uri);
            const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);

            if (errors.length === 0) {
                // No errors found, ask user to select text containing error
                const selection = editor.selection;
                const selectedText = selection.isEmpty 
                    ? document.getText()
                    : document.getText(selection);

                const prompt = `Help me debug this ${languageId} code:

\`\`\`${languageId}
${selectedText}
\`\`\`

Please:
1. Identify potential issues in this code
2. Explain what might be causing problems
3. Suggest fixes with code examples
4. Provide debugging strategies`;

                await this.claudeManager.sendCommand(prompt);
            } else {
                // Format errors for Claude
                const errorContext = errors.map(error => {
                    const line = document.lineAt(error.range.start.line);
                    return `Error at line ${error.range.start.line + 1}: ${error.message}
Code: ${line.text}`;
                }).join('\n\n');

                const surroundingCode = this.getSurroundingCode(document, errors[0].range.start.line);

                const prompt = `Help me debug these errors in my ${languageId} code:

${errorContext}

Surrounding code context:
\`\`\`${languageId}
${surroundingCode}
\`\`\`

Please:
1. Explain what's causing each error
2. Provide the corrected code
3. Explain why the fix works
4. Suggest any best practices to avoid similar errors`;

                await this.claudeManager.sendCommand(prompt);
            }

            vscode.window.showInformationMessage('Debugging with Claude...');
        } catch (error) {
            ErrorHandler.handle(error, 'Debug Error');
        }
    }

    /**
     * Get surrounding code context for better error analysis
     */
    private getSurroundingCode(document: vscode.TextDocument, errorLine: number, contextLines: number = 5): string {
        const startLine = Math.max(0, errorLine - contextLines);
        const endLine = Math.min(document.lineCount - 1, errorLine + contextLines);
        
        const lines: string[] = [];
        for (let i = startLine; i <= endLine; i++) {
            const line = document.lineAt(i);
            const prefix = i === errorLine ? '>>> ' : '    ';
            lines.push(`${prefix}${i + 1}: ${line.text}`);
        }
        
        return lines.join('\n');
    }

    /**
     * Register all commands
     */
    static registerCommands(
        context: vscode.ExtensionContext,
        claudeManager: ClaudeManager,
        dataProvider: DataContextProvider
    ): void {
        const commands = new ClaudeCommands(claudeManager, dataProvider);

        // Register explain code command
        context.subscriptions.push(
            vscode.commands.registerCommand('claude-studio.explainCode', () => commands.explainCode())
        );

        // Register generate documentation command
        context.subscriptions.push(
            vscode.commands.registerCommand('claude-studio.generateDocs', () => commands.generateDocumentation())
        );

        // Register suggest analysis command
        context.subscriptions.push(
            vscode.commands.registerCommand('claude-studio.suggestAnalysis', (uri?: vscode.Uri) => commands.suggestAnalysis(uri))
        );

        // Register debug error command
        context.subscriptions.push(
            vscode.commands.registerCommand('claude-studio.debugError', () => commands.debugError())
        );
    }
}