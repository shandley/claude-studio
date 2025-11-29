import * as vscode from 'vscode';

/**
 * Represents the different states Claude can be in
 */
export enum ClaudeStatus {
    NotInstalled = 'not-installed',
    NotConfigured = 'not-configured',
    Idle = 'idle',
    Active = 'active',
    Error = 'error'
}

/**
 * Manages the status bar item for Claude Studio
 * Shows current Claude status and provides quick actions
 */
export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private currentStatus: ClaudeStatus = ClaudeStatus.Idle;

    constructor() {
        // Create status bar item (aligned to right, priority 100)
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );

        // Set command to execute when clicked
        this.statusBarItem.command = 'claude-studio.showQuickActions';

        // Show the status bar item
        this.statusBarItem.show();

        // Initialize with idle status
        this.updateStatus(ClaudeStatus.Idle);
    }

    /**
     * Update the status bar to reflect current Claude state
     */
    updateStatus(status: ClaudeStatus, message?: string): void {
        this.currentStatus = status;

        switch (status) {
            case ClaudeStatus.NotInstalled:
                this.statusBarItem.text = '$(cloud-download) Claude: Not Installed';
                this.statusBarItem.tooltip = 'Claude Code CLI is not installed. Click to install.';
                this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
                break;

            case ClaudeStatus.NotConfigured:
                this.statusBarItem.text = '$(key) Claude: Not Configured';
                this.statusBarItem.tooltip = 'API key not configured. Click to configure.';
                this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
                break;

            case ClaudeStatus.Idle:
                this.statusBarItem.text = '$(circle-outline) Claude: Idle';
                this.statusBarItem.tooltip = 'Claude is ready. Click for quick actions.';
                this.statusBarItem.color = undefined;
                break;

            case ClaudeStatus.Active:
                this.statusBarItem.text = '$(check) Claude: Active';
                this.statusBarItem.tooltip = 'Claude terminal is running. Click for quick actions.';
                this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
                break;

            case ClaudeStatus.Error:
                this.statusBarItem.text = '$(error) Claude: Error';
                this.statusBarItem.tooltip = message || 'An error occurred. Click for options.';
                this.statusBarItem.color = new vscode.ThemeColor('statusBarItem.errorForeground');
                break;
        }
    }

    /**
     * Get the current status
     */
    getStatus(): ClaudeStatus {
        return this.currentStatus;
    }

    /**
     * Show a temporary message in the status bar
     */
    showTemporaryMessage(message: string, durationMs: number = 3000): void {
        const originalText = this.statusBarItem.text;
        const originalTooltip = this.statusBarItem.tooltip;

        this.statusBarItem.text = `$(info) ${message}`;

        setTimeout(() => {
            this.statusBarItem.text = originalText;
            this.statusBarItem.tooltip = originalTooltip;
        }, durationMs);
    }

    /**
     * Dispose of the status bar item
     */
    dispose(): void {
        this.statusBarItem.dispose();
    }
}
