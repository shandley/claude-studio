import * as vscode from 'vscode';

/**
 * SessionMonitor tracks runtime session state and provides context awareness
 */
export class SessionMonitor {
    private disposables: vscode.Disposable[] = [];
    private statusBarItem: vscode.StatusBarItem;
    private currentSession: any;
    private positron: any;

    constructor(private context: vscode.ExtensionContext) {
        try {
            this.positron = require('positron');
        } catch (error) {
            throw new Error('Positron API not available');
        }

        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'claude-studio.showSessionContext';
    }

    /**
     * Start monitoring runtime sessions
     */
    async activate() {
        // Watch for session changes
        this.disposables.push(
            this.positron.runtime.onDidChangeForegroundSession((sessionId: any) => {
                if (sessionId) {
                    this.updateCurrentSession(sessionId);
                } else {
                    this.currentSession = undefined;
                    this.updateStatusBar();
                }
            })
        );

        // Initialize with current session
        const session = await this.positron.runtime.getForegroundSession();
        if (session) {
            await this.updateCurrentSession(session.metadata.sessionId);
        }

        this.statusBarItem.show();
    }

    /**
     * Update current session and status bar
     */
    private async updateCurrentSession(sessionId: string) {
        const session = await this.positron.runtime.getSession(sessionId);
        if (session) {
            this.currentSession = session;
            this.watchSession(session);
            await this.updateStatusBar();
        }
    }

    /**
     * Watch session for state changes
     */
    private async watchSession(session: any) {
        const fullSession = await this.positron.runtime.getSession(session.metadata.sessionId);
        if (!fullSession) return;

        // Watch for state changes
        this.disposables.push(
            fullSession.onDidChangeRuntimeState(async (state: any) => {
                await this.updateStatusBar();

                // Don't auto-analyze - it interferes with Positron's variable panel
                // Only analyze when user explicitly requests it via showSessionContext()
            })
        );
    }

    /**
     * Update status bar with session info
     */
    private async updateStatusBar() {
        if (!this.currentSession) {
            this.statusBarItem.text = '$(debug-disconnect) No Runtime';
            this.statusBarItem.tooltip = 'No active runtime session';
            return;
        }

        // Just show runtime info without querying variables (to avoid slowing down Positron's variable panel)
        this.statusBarItem.text = `$(server-process) ${this.currentSession.runtimeMetadata.runtimeShortName}`;
        this.statusBarItem.tooltip = `Runtime: ${this.currentSession.runtimeMetadata.runtimeName}\nClick for session context`;
    }

    /**
     * Analyze current session context
     */
    private async analyzeSessionContext() {
        if (!this.currentSession) return;

        const variables = await this.positron.runtime.getSessionVariables(
            this.currentSession.metadata.sessionId
        );

        // Find interesting variables (data frames, models, etc.)
        const dataFrames = variables.flat().filter((v: any) =>
            v.display_type.includes('data.frame') ||
            v.display_type.includes('DataFrame') ||
            v.display_type.includes('tibble')
        );

        const models = variables.flat().filter((v: any) =>
            v.display_type.includes('lm') ||
            v.display_type.includes('model') ||
            v.display_type.includes('estimator')
        );

        // Store context for later use
        this.context.workspaceState.update('sessionContext', {
            dataFrames: dataFrames.map((df: any) => ({
                name: df.display_name,
                type: df.display_type,
                size: `${df.length} rows`
            })),
            models: models.map((m: any) => ({
                name: m.display_name,
                type: m.display_type
            })),
            timestamp: Date.now()
        });
    }

    /**
     * Get current session context as formatted string
     */
    async getSessionContextString(): Promise<string> {
        if (!this.currentSession) {
            return 'No active runtime session';
        }

        const variables = await this.positron.runtime.getSessionVariables(
            this.currentSession.metadata.sessionId
        );

        const allVars = variables.flat();

        // Group by type
        const dataFrames = allVars.filter((v: any) => v.display_type.includes('data.frame') || v.display_type.includes('DataFrame'));
        const vectors = allVars.filter((v: any) => v.display_type.includes('numeric') || v.display_type.includes('character'));
        const models = allVars.filter((v: any) => v.display_type.includes('lm') || v.display_type.includes('model'));

        let context = `# Current ${this.currentSession.runtimeMetadata.languageName} Session\n\n`;

        if (dataFrames.length > 0) {
            context += '## Data Frames\n';
            dataFrames.forEach((df: any) => {
                context += `- ${df.display_name} (${df.display_type}): ${df.length} elements\n`;
            });
            context += '\n';
        }

        if (models.length > 0) {
            context += '## Models\n';
            models.forEach((m: any) => {
                context += `- ${m.display_name} (${m.display_type})\n`;
            });
            context += '\n';
        }

        if (vectors.length > 0 && vectors.length <= 10) {
            context += '## Variables\n';
            vectors.forEach((v: any) => {
                context += `- ${v.display_name} (${v.display_type}): ${v.display_value}\n`;
            });
            context += '\n';
        }

        return context;
    }

    /**
     * Show session context in quick pick
     */
    async showSessionContext() {
        if (!this.currentSession) {
            vscode.window.showInformationMessage('No active runtime session');
            return;
        }

        const variables = await this.positron.runtime.getSessionVariables(
            this.currentSession.metadata.sessionId
        );

        const items = variables.flat().map((v: any) => ({
            label: `$(symbol-variable) ${v.display_name}`,
            description: v.display_type,
            detail: `${v.display_value} (${v.length} elements, ${formatBytes(v.size)})`
        }));

        await vscode.window.showQuickPick(items, {
            placeHolder: 'Session Variables'
        });
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.statusBarItem.dispose();
    }
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
