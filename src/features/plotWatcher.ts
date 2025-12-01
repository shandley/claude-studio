import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ClaudeManager } from '../claude/claudeManager';
import { PlotContextBuilder } from './plotContextBuilder';

/**
 * PlotWatcher monitors R/Python runtime for plot creation and offers improvement workflow
 */
export class PlotWatcher {
    private disposables: vscode.Disposable[] = [];
    private recentPlots: Map<string, PlotCapture> = new Map();
    private positron: any;
    private contextBuilder: PlotContextBuilder;

    constructor(
        private context: vscode.ExtensionContext,
        private claudeManager: ClaudeManager
    ) {
        try {
            this.positron = require('positron');
            this.contextBuilder = new PlotContextBuilder();
        } catch (error) {
            throw new Error('Positron API not available');
        }
    }

    /**
     * Start watching for plots in active runtime sessions
     */
    async activate() {
        // Watch for code execution
        this.disposables.push(
            this.positron.runtime.onDidExecuteCode(async (event: any) => {
                // Only watch R and Python
                if (event.languageId !== 'r' && event.languageId !== 'python') {
                    return;
                }

                // Check if code looks like plotting code
                if (this.isPlotCode(event.code)) {
                    await this.watchForPlot(event);
                }
            })
        );

        // Watch for NEW sessions being created
        this.disposables.push(
            this.positron.runtime.onDidChangeForegroundSession(async (sessionId: any) => {
                if (sessionId) {
                    const session = await this.positron.runtime.getSession(sessionId);
                    if (session) {
                        this.watchSession(session);
                    }
                }
            })
        );

        // Watch existing sessions
        const sessions = await this.positron.runtime.getActiveSessions();
        for (const session of sessions) {
            this.watchSession(session);
        }
    }

    /**
     * Watch a runtime session for plot creation
     */
    private async watchSession(session: any) {
        // Get full session interface
        const fullSession = await this.positron.runtime.getSession(session.metadata.sessionId);
        if (!fullSession) {
            return;
        }

        // Listen for state changes to clean up old plots
        this.disposables.push(
            fullSession.onDidChangeRuntimeState((state: any) => {
                if (state === this.positron.RuntimeState.Idle) {
                    this.checkForRecentPlots(session);
                }
            })
        );
    }

    /**
     * Handle plot creation (legacy - kept for potential future use with Jupyter notebooks)
     */
    private async handlePlotCreated(output: any, session: any) {
        const plotId = output.output_id || output.id;
        const plotData = output.data['image/png'] || output.data['image/svg+xml'];
        const format = output.data['image/png'] ? 'png' : 'svg';

        // Store plot capture
        this.recentPlots.set(plotId, {
            id: plotId,
            data: plotData as string,
            format: format,
            code: '',
            timestamp: Date.now(),
            languageId: session.runtimeMetadata.languageId
        });

        this.showPlotNotification(plotId);
    }

    /**
     * Check for recent plots and offer improvements
     */
    private async checkForRecentPlots(session: any) {
        const now = Date.now();
        const recentThreshold = 5000; // 5 seconds

        // Clean up old plots (but don't query variables - let user do that manually)
        for (const [plotId, plot] of this.recentPlots) {
            if (now - plot.timestamp < recentThreshold) {
                this.recentPlots.delete(plotId);
            }
        }
    }

    /**
     * Show notification when plot is created
     */
    private showPlotNotification(plotId: string) {
        vscode.window.showInformationMessage(
            '📊 Plot created!',
            'Improve with Claude',
            'Dismiss'
        ).then(async selection => {
            if (selection === 'Improve with Claude') {
                const plot = this.recentPlots.get(plotId);
                if (plot) {
                    await this.improvePlotWithClaude(plot);
                }
            }
        });
    }

    /**
     * Send plot to Claude for improvement suggestions
     */
    private async improvePlotWithClaude(plot: PlotCapture) {
        try {
            // Initialize Claude if needed
            const initialized = await this.claudeManager.initialize();
            if (!initialized) {
                vscode.window.showWarningMessage('Please configure Claude Studio first');
                return;
            }

            // Start Claude terminal if not already running
            await this.claudeManager.startClaude();

            // Generate rich context
            const richContext = await this.contextBuilder.buildPlotContext({
                id: plot.id,
                code: plot.code,
                languageId: plot.languageId,
                plotUri: plot.data,
                timestamp: plot.timestamp
            });

            // Save context to file
            const contextFilePath = await this.saveContextToFile(plot.id, richContext);

            // Build the improvement prompt with reference to context file
            const prompt = this.buildImprovementPromptWithContext(contextFilePath);

            // Copy prompt to clipboard for user to paste
            await vscode.env.clipboard.writeText(prompt);

            // Show message with instructions
            const action = await vscode.window.showInformationMessage(
                '📊 Rich plot context generated! Paste prompt into Claude terminal (Cmd+V)',
                'Open Claude Terminal',
                'View Context File'
            );

            if (action === 'Open Claude Terminal') {
                vscode.commands.executeCommand('workbench.action.terminal.focus');
            } else if (action === 'View Context File') {
                const doc = await vscode.workspace.openTextDocument(contextFilePath);
                await vscode.window.showTextDocument(doc, { preview: false });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to prepare plot improvement: ${errorMessage}`);
        }
    }

    /**
     * Save plot context to a markdown file
     */
    private async saveContextToFile(plotId: string, context: string): Promise<string> {
        // Get workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        // Create .claude directory if it doesn't exist
        const claudeDir = path.join(workspaceFolder.uri.fsPath, '.claude');
        if (!fs.existsSync(claudeDir)) {
            fs.mkdirSync(claudeDir, { recursive: true });
        }

        // Write context file
        const fileName = `plot-context-${Date.now()}.md`;
        const filePath = path.join(claudeDir, fileName);
        fs.writeFileSync(filePath, context, 'utf8');

        return filePath;
    }

    /**
     * Build improvement prompt that references the rich context file
     */
    private buildImprovementPromptWithContext(contextFilePath: string): string {
        const relativePath = path.relative(
            vscode.workspace.workspaceFolders![0].uri.fsPath,
            contextFilePath
        );

        return `I just created a plot and would like your help improving it.

I've generated a detailed context file with:
- The plot code
- Data source summaries (variable types, sizes, previews)
- All session variables (data frames, models, etc.)
- Suggested areas for improvement

Please read the context file: ${relativePath}

Based on this rich context, suggest improvements to the plot focusing on:
1. Visual design (colors, labels, themes, readability)
2. Data presentation (appropriate scales, missing elements)
3. Statistical validity (outliers, patterns, data issues)
4. Code quality (best practices, efficiency)

Provide improved code that I can run directly.`;
    }


    /**
     * Check if code is likely plotting code
     */
    private isPlotCode(code: string): boolean {
        const plotPatterns = [
            // R patterns
            /\bggplot\(/i,
            /\bplot\(/i,
            /\bbarplot\(/i,
            /\bhist\(/i,
            /\bboxplot\(/i,

            // Python patterns
            /\.plot\(/i,
            /plt\.plot\(/i,
            /plt\.scatter\(/i,
            /sns\./i,  // seaborn
            /px\./i,   // plotly express
        ];

        return plotPatterns.some(pattern => pattern.test(code));
    }

    /**
     * Watch for a specific plot after code execution
     */
    private async watchForPlot(event: any) {
        // Wait a moment for the plot to render
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // Get the current plot using Positron's AI API
            const plotUri = await this.positron.ai.getCurrentPlotUri();

            if (plotUri) {
                // Create a plot ID from timestamp
                const plotId = `plot_${Date.now()}`;

                // Store plot metadata
                this.recentPlots.set(plotId, {
                    id: plotId,
                    data: plotUri,  // The URI to the plot
                    format: 'png',  // Default to PNG
                    code: event.code,
                    timestamp: Date.now(),
                    languageId: event.languageId
                });

                // Show notification
                this.showPlotNotification(plotId);
            }
        } catch (error) {
            // Silently fail - plot URI may not be available yet
        }
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}

interface PlotCapture {
    id: string;
    data: string;  // Base64 encoded plot data
    format: 'png' | 'svg';
    code: string;  // Code that generated the plot
    timestamp: number;
    languageId: string;  // 'r' or 'python'
}
