import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import { ClaudeAuthManager } from './claudeAuth';
import { ClaudeAPI } from './claudeAPI';
import { ConfigManager } from '../utils/config';
import { ErrorHandler, ClaudeError } from '../utils/error';

export class ClaudeManager {
    private terminal?: vscode.Terminal;
    private outputChannel: vscode.OutputChannel;
    private isInitialized = false;
    private authManager: ClaudeAuthManager;
    private claudeAPI?: ClaudeAPI;

    constructor(private context: vscode.ExtensionContext) {
        this.outputChannel = vscode.window.createOutputChannel('Claude Studio');
        this.authManager = new ClaudeAuthManager(context);
    }

    async initialize(): Promise<boolean> {
        try {
            // Check if Claude Code is installed
            const isInstalled = await this.checkClaudeInstallation();
            if (!isInstalled) {
                const install = await vscode.window.showWarningMessage(
                    'Claude Code is not installed. Would you like to install it?',
                    'Install',
                    'Cancel'
                );

                if (install === 'Install') {
                    await this.installClaude();
                } else {
                    return false;
                }
            }

            // Check authentication based on selected method
            const isAuthenticated = await this.authManager.isAuthenticated();
            if (!isAuthenticated) {
                const authMethod = this.authManager.getAuthMethod();

                if (authMethod === 'api-key') {
                    await this.authManager.promptForApiKey();
                } else {
                    await this.authManager.loginWithSubscription();
                }
                return false;
            }

            // Initialize Claude API only if using API key method
            const authMethod = this.authManager.getAuthMethod();
            if (authMethod === 'api-key') {
                const apiKey = await this.authManager.getApiKey();
                if (apiKey) {
                    this.claudeAPI = new ClaudeAPI(apiKey);
                }
            }

            this.isInitialized = true;
            this.log('Claude Manager initialized successfully');
            return true;
        } catch (error) {
            this.handleError('Failed to initialize Claude Manager', error);
            return false;
        }
    }

    async startClaude(): Promise<void> {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                return;
            }
        }

        try {
            const authMethod = this.authManager.getAuthMethod();

            // Create terminal with or without API key based on auth method
            if (authMethod === 'api-key') {
                const apiKey = await this.authManager.getApiKey();
                if (!apiKey) {
                    throw new ClaudeError('No API key configured', 'AUTH_REQUIRED');
                }

                // Create terminal with API key in environment
                this.terminal = vscode.window.createTerminal({
                    name: 'Claude Studio',
                    env: {
                        ANTHROPIC_API_KEY: apiKey
                    }
                });

                this.log('Claude Code started with API key authentication');
            } else {
                // Create terminal without setting API key - use subscription auth
                this.terminal = vscode.window.createTerminal({
                    name: 'Claude Studio'
                });

                this.log('Claude Code started with subscription authentication');
            }

            // Show the terminal
            this.terminal.show();

            // Start Claude Code in the terminal
            this.terminal.sendText('claude');

            const authMethodLabel = authMethod === 'api-key' ? 'API Key' : 'Pro/Max Subscription';
            vscode.window.showInformationMessage(`Claude Studio is ready! (Using ${authMethodLabel})`);
        } catch (error) {
            this.handleError('Failed to start Claude', error);
        }
    }

    async stopClaude(): Promise<void> {
        if (this.terminal) {
            this.terminal.dispose();
            this.terminal = undefined;
        }

        if (this.claudeAPI) {
            await this.claudeAPI.stop();
            this.claudeAPI = undefined;
        }

        this.log('Claude stopped');
    }

    async sendCommand(command: string): Promise<string> {
        if (!this.terminal) {
            throw new Error('Claude is not running');
        }

        // Send command to Claude terminal
        this.terminal.sendText(command);
        
        // TODO: Implement response capture
        return 'Command sent to Claude';
    }

    private async checkClaudeInstallation(): Promise<boolean> {
        return new Promise((resolve) => {
            const checkProcess = spawn('which', ['claude']);
            
            checkProcess.on('close', (code) => {
                resolve(code === 0);
            });

            checkProcess.on('error', () => {
                resolve(false);
            });
        });
    }

    private async installClaude(): Promise<void> {
        const terminal = vscode.window.createTerminal('Claude Installation');
        terminal.show();
        terminal.sendText('npm install -g @anthropic-ai/claude-code');
        
        await vscode.window.showInformationMessage(
            'Installing Claude Code... Please wait for the installation to complete.',
            'OK'
        );
    }


    private log(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }

    private handleError(message: string, error: any): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.log(`ERROR: ${message} - ${errorMessage}`);
        this.outputChannel.show();
        vscode.window.showErrorMessage(`Claude Studio: ${message}`);
    }

    dispose(): void {
        this.stopClaude();
        this.outputChannel.dispose();
    }
}