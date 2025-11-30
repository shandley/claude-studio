import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeManager } from './claude/claudeManager';
import { ClaudeAuthManager } from './claude/claudeAuth';
import { ErrorHandler } from './utils/error';
import { ConfigManager } from './utils/config';
import { DataContextProvider } from './providers/dataContext';
import { ClaudeCommands } from './commands/index';
import { StatusBarManager, ClaudeStatus } from './ui/statusBar';

let claudeManager: ClaudeManager;
let authManager: ClaudeAuthManager;
let dataProvider: DataContextProvider;
let outputChannel: vscode.OutputChannel;
let statusBarManager: StatusBarManager;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Claude Studio extension is now active!');

    // Initialize output channel
    outputChannel = vscode.window.createOutputChannel('Claude Studio');
    ErrorHandler.initialize(outputChannel);

    // Initialize managers
    claudeManager = new ClaudeManager(context);
    authManager = new ClaudeAuthManager(context);
    dataProvider = new DataContextProvider(context);
    statusBarManager = new StatusBarManager();

    // Initialize status bar with current state
    await updateStatusBar();

    // Register commands
    registerCommands(context);
    
    // Register Phase 2 commands
    ClaudeCommands.registerCommands(context, claudeManager, dataProvider);

    // Watch for configuration changes
    context.subscriptions.push(
        ConfigManager.onConfigChange(async (e) => {
            if (ConfigManager.isDebugMode()) {
                outputChannel.appendLine('Configuration changed');
            }
        })
    );

    // Show welcome message if first time
    const hasShownWelcome = context.globalState.get('claude-studio.hasShownWelcome', false);
    if (!hasShownWelcome) {
        const selection = await vscode.window.showInformationMessage(
            'Welcome to Claude Studio! Would you like to configure authentication now?',
            'Configure',
            'Later'
        );

        if (selection === 'Configure') {
            vscode.commands.executeCommand('claude-studio.configureAuth');
        }

        context.globalState.update('claude-studio.hasShownWelcome', true);
    }
}

function registerCommands(context: vscode.ExtensionContext): void {
    // Start Claude command
    const startCommand = vscode.commands.registerCommand('claude-studio.start', async () => {
        try {
            await claudeManager.startClaude();
            statusBarManager.updateStatus(ClaudeStatus.Active);
        } catch (error) {
            statusBarManager.updateStatus(ClaudeStatus.Error, 'Failed to start Claude');
            ErrorHandler.handle(error, 'Start Claude');
        }
    });

    // Analyze data command
    const analyzeCommand = vscode.commands.registerCommand('claude-studio.analyzeData', async (uri?: vscode.Uri) => {
        try {
            // Check if Claude is running
            const initialized = await claudeManager.initialize();
            if (!initialized) {
                return;
            }

            let dataToAnalyze: string = '';
            let fileName: string = '';

            // If called from explorer context menu with a file URI
            if (uri && uri.scheme === 'file') {
                fileName = path.basename(uri.fsPath);
                
                // Read file content
                const fileContent = await vscode.workspace.fs.readFile(uri);
                dataToAnalyze = new TextDecoder().decode(fileContent);
                
                // For large files, just take a sample
                const lines = dataToAnalyze.split('\n');
                if (lines.length > 100) {
                    dataToAnalyze = lines.slice(0, 100).join('\n') + '\n\n... (showing first 100 lines)';
                }
                
                vscode.window.showInformationMessage(`Analyzing ${fileName} with Claude...`);
            } else {
                // Original behavior - analyze selected text in editor
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No file selected or active editor found');
                    return;
                }

                fileName = path.basename(editor.document.fileName);
                
                // Get selected text or current line
                const selection = editor.selection;
                dataToAnalyze = selection.isEmpty 
                    ? editor.document.lineAt(selection.active.line).text
                    : editor.document.getText(selection);
            }

            // Send to Claude with context
            const prompt = uri 
                ? `Please analyze this data from ${fileName}:\n\n${dataToAnalyze}`
                : `Please analyze this selected data from ${fileName}:\n\n${dataToAnalyze}`;
                
            await claudeManager.sendCommand(prompt);
        } catch (error) {
            ErrorHandler.handle(error, 'Analyze Data');
        }
    });

    // Configure API key command
    const configureApiKeyCommand = vscode.commands.registerCommand(
        'claude-studio.configureApiKey',
        async () => {
            try {
                await authManager.configureApiKey();
                await updateStatusBar();
            } catch (error) {
                ErrorHandler.handle(error, 'Configure API Key');
            }
        }
    );

    // Configure authentication command
    const configureAuthCommand = vscode.commands.registerCommand(
        'claude-studio.configureAuth',
        async () => {
            try {
                await authManager.configureAuth();
                await updateStatusBar();
            } catch (error) {
                ErrorHandler.handle(error, 'Configure Authentication');
            }
        }
    );

    // Login with subscription command
    const loginSubscriptionCommand = vscode.commands.registerCommand(
        'claude-studio.loginSubscription',
        async () => {
            try {
                await authManager.loginWithSubscription();
                await updateStatusBar();
            } catch (error) {
                ErrorHandler.handle(error, 'Login with Subscription');
            }
        }
    );

    // Stop Claude command
    const stopCommand = vscode.commands.registerCommand('claude-studio.stop', async () => {
        try {
            await claudeManager.stopClaude();
            statusBarManager.updateStatus(ClaudeStatus.Idle);
            vscode.window.showInformationMessage('Claude Studio stopped');
        } catch (error) {
            statusBarManager.updateStatus(ClaudeStatus.Error, 'Failed to stop Claude');
            ErrorHandler.handle(error, 'Stop Claude');
        }
    });

    // Install Claude command
    const installCommand = vscode.commands.registerCommand('claude-studio.install', async () => {
        const terminal = vscode.window.createTerminal('Claude Installation');
        terminal.show();
        terminal.sendText('npm install -g @anthropic-ai/claude-code');
        
        vscode.window.showInformationMessage(
            'Installing Claude Code... Please wait for the installation to complete.'
        );
    });

    // Quick actions command (triggered by status bar click)
    const quickActionsCommand = vscode.commands.registerCommand('claude-studio.showQuickActions', async () => {
        const items: vscode.QuickPickItem[] = [];
        const currentStatus = statusBarManager.getStatus();

        // Build menu based on current status
        if (currentStatus === ClaudeStatus.NotInstalled) {
            items.push({ label: '$(cloud-download) Install Claude Code', description: 'Install Claude Code CLI globally' });
        } else if (currentStatus === ClaudeStatus.NotConfigured) {
            items.push({ label: '$(shield) Configure Authentication', description: 'Choose API Key or Pro/Max Subscription' });
        } else if (currentStatus === ClaudeStatus.Idle) {
            items.push({ label: '$(play) Start Claude', description: 'Start Claude terminal' });
            items.push({ label: '$(shield) Configure Authentication', description: 'Change auth method or credentials' });
        } else if (currentStatus === ClaudeStatus.Active) {
            items.push({ label: '$(stop) Stop Claude', description: 'Stop Claude terminal' });
            items.push({ label: '$(terminal) Show Terminal', description: 'Focus Claude terminal' });
        } else if (currentStatus === ClaudeStatus.Error) {
            items.push({ label: '$(refresh) Restart Claude', description: 'Stop and start Claude' });
            items.push({ label: '$(shield) Configure Authentication', description: 'Change auth method or credentials' });
        }

        // Common actions
        items.push({ label: '$(output) Show Output', description: 'Open Claude Studio output channel' });

        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a Claude action'
        });

        if (!selection) {
            return;
        }

        // Execute selected action
        if (selection.label.includes('Install')) {
            await vscode.commands.executeCommand('claude-studio.install');
        } else if (selection.label.includes('Configure Authentication')) {
            await vscode.commands.executeCommand('claude-studio.configureAuth');
        } else if (selection.label.includes('Configure API Key')) {
            await vscode.commands.executeCommand('claude-studio.configureApiKey');
        } else if (selection.label.includes('Start Claude')) {
            await vscode.commands.executeCommand('claude-studio.start');
        } else if (selection.label.includes('Stop Claude')) {
            await vscode.commands.executeCommand('claude-studio.stop');
        } else if (selection.label.includes('Show Terminal')) {
            // TODO: Focus the Claude terminal
            vscode.window.showInformationMessage('Please switch to the "Claude Studio" terminal');
        } else if (selection.label.includes('Restart')) {
            await vscode.commands.executeCommand('claude-studio.stop');
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay
            await vscode.commands.executeCommand('claude-studio.start');
        } else if (selection.label.includes('Show Output')) {
            outputChannel.show();
        }
    });

    context.subscriptions.push(
        startCommand,
        analyzeCommand,
        configureApiKeyCommand,
        configureAuthCommand,
        loginSubscriptionCommand,
        stopCommand,
        installCommand,
        quickActionsCommand
    );
}

/**
 * Update the status bar to reflect the current Claude state
 */
async function updateStatusBar(): Promise<void> {
    try {
        // Check if Claude is installed
        const spawn = require('child_process').spawn;
        const isInstalled = await new Promise<boolean>((resolve) => {
            const checkProcess = spawn('which', ['claude']);
            checkProcess.on('close', (code: number) => resolve(code === 0));
            checkProcess.on('error', () => resolve(false));
        });

        if (!isInstalled) {
            statusBarManager.updateStatus(ClaudeStatus.NotInstalled);
            return;
        }

        // Check if authentication is configured (API key or subscription)
        const isAuthenticated = await authManager.isAuthenticated();
        if (!isAuthenticated) {
            statusBarManager.updateStatus(ClaudeStatus.NotConfigured);
            return;
        }

        // If we get here, Claude is installed and configured but not running
        statusBarManager.updateStatus(ClaudeStatus.Idle);
    } catch (error) {
        statusBarManager.updateStatus(ClaudeStatus.Error, 'Failed to check Claude status');
    }
}

export function deactivate() {
    console.log('Claude Studio extension deactivated');

    if (claudeManager) {
        claudeManager.dispose();
    }

    if (statusBarManager) {
        statusBarManager.dispose();
    }

    if (outputChannel) {
        outputChannel.dispose();
    }
}