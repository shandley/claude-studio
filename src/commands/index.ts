import * as vscode from 'vscode';
import { ClaudeManager } from '../claude/claudeManager';
import { DataContextProvider } from '../providers/dataContext';
import { StatisticalTestAnalyzer } from '../providers/statisticalAnalyzer';
import { VisualizationGenerator } from '../providers/visualizationGenerator';
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
     * Recommend statistical tests based on data structure
     */
    async recommendStatisticalTests(uri?: vscode.Uri): Promise<void> {
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

            if (!dataContext.columns || dataContext.columns.length === 0) {
                vscode.window.showInformationMessage('Unable to analyze data structure');
                return;
            }

            // Analyze data and generate recommendations
            const recommendations = StatisticalTestAnalyzer.analyzeAndRecommend(dataContext);

            if (recommendations.length === 0) {
                vscode.window.showInformationMessage('No recommendations generated for this dataset');
                return;
            }

            // Format recommendations as a Claude prompt
            const prompt = StatisticalTestAnalyzer.formatRecommendationsForClaude(dataContext, recommendations);

            // Send to Claude
            await this.claudeManager.sendCommand(prompt);
            vscode.window.showInformationMessage(`Analyzing ${dataContext.name} - ${recommendations.length} statistical tests recommended`);
        } catch (error) {
            ErrorHandler.handle(error, 'Recommend Statistical Tests');
        }
    }

    /**
     * Generate visualization code based on data structure
     */
    async generateVisualizations(uri?: vscode.Uri): Promise<void> {
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

            if (!dataContext.columns || dataContext.columns.length === 0) {
                vscode.window.showInformationMessage('Unable to analyze data structure');
                return;
            }

            // Generate visualization recommendations
            const recommendations = VisualizationGenerator.generateRecommendations(dataContext);

            if (recommendations.length === 0) {
                vscode.window.showInformationMessage('No visualization recommendations generated');
                return;
            }

            // Format recommendations as a Claude prompt
            const prompt = VisualizationGenerator.formatRecommendationsForClaude(dataContext, recommendations);

            // Send to Claude
            await this.claudeManager.sendCommand(prompt);
            vscode.window.showInformationMessage(`Generated ${recommendations.length} visualization${recommendations.length > 1 ? 's' : ''} for ${dataContext.name}`);
        } catch (error) {
            ErrorHandler.handle(error, 'Generate Visualizations');
        }
    }

    /**
     * Improve existing plot code
     */
    async improvePlot(): Promise<void> {
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
                vscode.window.showInformationMessage('Please select plotting code to improve');
                return;
            }

            // Detect language and plotting library
            const languageId = editor.document.languageId;
            const plottingContext = this.detectPlottingLibrary(selectedText, languageId);

            if (!plottingContext.isPlotCode) {
                const proceed = await vscode.window.showWarningMessage(
                    'Selected code does not appear to contain plotting functions. Continue anyway?',
                    'Yes', 'No'
                );
                if (proceed !== 'Yes') {
                    return;
                }
            }

            // Build comprehensive improvement prompt
            const prompt = `Please analyze and improve this ${plottingContext.library || languageId} plotting code:

\`\`\`${languageId}
${selectedText}
\`\`\`

Provide detailed improvement suggestions focusing on:

**1. Visual Design & Aesthetics**
- Color schemes (consider colorblind-friendly palettes)
- Theme and styling
- Font sizes and readability
- Aspect ratio and figure size

**2. Clarity & Communication**
- Axis labels and titles (clear, informative)
- Legend placement and formatting
- Grid lines and reference lines
- Annotations and text placement

**3. Data Presentation**
- Appropriate chart type for the data
- Statistical annotations (if applicable)
- Error bars or confidence intervals
- Highlighting important patterns

**4. Publication Quality**
- High-resolution output settings
- Professional theme
- Consistent styling
- Accessibility considerations

**5. Code Best Practices**
- Clean, readable code structure
- Efficient plotting approach
- Commented code for key decisions
- Reusable/modular design

Please provide:
1. A brief analysis of the current plot
2. Specific improvement recommendations
3. Complete improved code with explanations
4. Any additional suggestions for exploration

Language context: ${languageId}
${plottingContext.library ? `Plotting library: ${plottingContext.library}` : ''}`;

            // Send to Claude
            await this.claudeManager.sendCommand(prompt);
            vscode.window.showInformationMessage('Analyzing plot code with Claude...');
        } catch (error) {
            ErrorHandler.handle(error, 'Improve Plot');
        }
    }

    /**
     * Detect plotting library from code
     */
    private detectPlottingLibrary(code: string, languageId: string): { isPlotCode: boolean; library?: string } {
        const lowerCode = code.toLowerCase();

        // R plotting libraries
        if (languageId === 'r') {
            if (lowerCode.includes('ggplot') || lowerCode.includes('geom_')) {
                return { isPlotCode: true, library: 'ggplot2' };
            }
            if (lowerCode.includes('plot(') || lowerCode.includes('hist(') ||
                lowerCode.includes('boxplot(') || lowerCode.includes('barplot(')) {
                return { isPlotCode: true, library: 'base R graphics' };
            }
            if (lowerCode.includes('lattice') || lowerCode.includes('xyplot')) {
                return { isPlotCode: true, library: 'lattice' };
            }
        }

        // Python plotting libraries
        if (languageId === 'python') {
            if (lowerCode.includes('plt.') || lowerCode.includes('matplotlib')) {
                return { isPlotCode: true, library: 'matplotlib' };
            }
            if (lowerCode.includes('sns.') || lowerCode.includes('seaborn')) {
                return { isPlotCode: true, library: 'seaborn' };
            }
            if (lowerCode.includes('plotly') || lowerCode.includes('go.')) {
                return { isPlotCode: true, library: 'plotly' };
            }
            if (lowerCode.includes('px.')) {
                return { isPlotCode: true, library: 'plotly express' };
            }
        }

        return { isPlotCode: false };
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

        // Register recommend statistical tests command
        context.subscriptions.push(
            vscode.commands.registerCommand('claude-studio.recommendTests', (uri?: vscode.Uri) => commands.recommendStatisticalTests(uri))
        );

        // Register generate visualizations command
        context.subscriptions.push(
            vscode.commands.registerCommand('claude-studio.generateVisualizations', (uri?: vscode.Uri) => commands.generateVisualizations(uri))
        );

        // Register improve plot command
        context.subscriptions.push(
            vscode.commands.registerCommand('claude-studio.improvePlot', () => commands.improvePlot())
        );
    }
}