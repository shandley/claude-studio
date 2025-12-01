import * as vscode from 'vscode';

/**
 * Positron Integration - Detects and uses Positron-specific APIs
 */
export class PositronIntegration {
    private isPositron: boolean = false;
    private positronAPI: any;

    constructor(private context: vscode.ExtensionContext) {
        this.detectPositron();
    }

    /**
     * Detect if running in Positron
     */
    private detectPositron() {
        // Check if Positron is available
        this.isPositron = vscode.env.appName.includes('Positron');

        if (this.isPositron) {
            try {
                // Try to load Positron API
                this.positronAPI = require('positron');
                console.log('✅ Positron APIs available');
            } catch (error) {
                console.log('⚠️ Running in Positron but APIs not available:', error);
                this.isPositron = false;
            }
        } else {
            console.log('📝 Running in VS Code (Positron features disabled)');
        }
    }

    /**
     * Get whether Positron APIs are available
     */
    isAvailable(): boolean {
        return this.isPositron && this.positronAPI !== undefined;
    }

    /**
     * Get Positron API (if available)
     */
    getAPI(): any {
        return this.positronAPI;
    }

    /**
     * Get foreground session info
     */
    async getForegroundSessionInfo(): Promise<string | null> {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            const session = await this.positronAPI.runtime.getForegroundSession();
            if (!session) {
                return 'No active runtime session';
            }

            return `${session.runtimeMetadata.runtimeName} (${session.runtimeMetadata.languageId})`;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    /**
     * Get session variables
     */
    async getSessionVariables(): Promise<any[]> {
        if (!this.isAvailable()) {
            return [];
        }

        try {
            const session = await this.positronAPI.runtime.getForegroundSession();
            if (!session) {
                return [];
            }

            const variables = await this.positronAPI.runtime.getSessionVariables(
                session.metadata.sessionId
            );

            return variables.flat();
        } catch (error) {
            console.error('Error getting variables:', error);
            return [];
        }
    }

    /**
     * Execute code in active runtime
     */
    async executeCode(code: string, languageId: string): Promise<boolean> {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            await this.positronAPI.runtime.executeCode(
                languageId,
                code,
                true,  // focus console
                false, // don't allow incomplete
                this.positronAPI.RuntimeCodeExecutionMode.Interactive,
                this.positronAPI.RuntimeErrorBehavior.Continue
            );
            return true;
        } catch (error) {
            console.error('Error executing code:', error);
            return false;
        }
    }

    /**
     * Watch for plots (returns disposable)
     */
    watchForPlots(callback: (plotData: string, plotId: string) => void): vscode.Disposable | null {
        if (!this.isAvailable()) {
            return null;
        }

        const subscription = this.positronAPI.runtime.onDidExecuteCode(async (event: any) => {
            // Get the session that executed the code
            const session = await this.positronAPI.runtime.getForegroundSession();
            if (!session) return;

            const fullSession = await this.positronAPI.runtime.getSession(session.metadata.sessionId);
            if (!fullSession) return;

            // Listen for runtime messages temporarily
            const messageDisposable = fullSession.onDidReceiveRuntimeMessage((message: any) => {
                if (message.type === this.positronAPI.LanguageRuntimeMessageType.Output) {
                    const output = message;

                    // Check for plot data
                    if (output.data && (output.data['image/png'] || output.data['image/svg+xml'])) {
                        const plotData = output.data['image/png'] || output.data['image/svg+xml'];
                        const plotId = output.output_id || output.id;

                        callback(plotData as string, plotId);
                    }
                }
            });

            // Clean up after a short delay (plot should arrive quickly)
            setTimeout(() => messageDisposable.dispose(), 5000);
        });

        return subscription;
    }
}

/**
 * Helper to check if Positron is available
 */
export function isPositronAvailable(): boolean {
    return vscode.env.appName.includes('Positron');
}

/**
 * Example usage in extension.ts:
 *
 * // In activate()
 * const positron = new PositronIntegration(context);
 *
 * if (positron.isAvailable()) {
 *   // Use Positron features
 *   const sessionInfo = await positron.getForegroundSessionInfo();
 *   console.log('Active session:', sessionInfo);
 *
 *   // Watch for plots
 *   const plotWatcher = positron.watchForPlots((plotData, plotId) => {
 *     vscode.window.showInformationMessage(`Plot created: ${plotId}`);
 *   });
 *   context.subscriptions.push(plotWatcher);
 * } else {
 *   // Fall back to basic features
 *   vscode.window.showInformationMessage('Running in VS Code (limited features)');
 * }
 */
