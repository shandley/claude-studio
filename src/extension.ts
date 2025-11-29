import * as vscode from 'vscode';
import * as path from 'path';
import { ClaudeManager } from './claude/claudeManager';
import { ClaudeAuthManager } from './claude/claudeAuth';
import { ErrorHandler } from './utils/error';
import { ConfigManager } from './utils/config';
import { DataContextProvider } from './providers/dataContext';
import { ClaudeCommands } from './commands/index';

let claudeManager: ClaudeManager;
let authManager: ClaudeAuthManager;
let dataProvider: DataContextProvider;
let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Claude Studio extension is now active!');

    // Initialize output channel
    outputChannel = vscode.window.createOutputChannel('Claude Studio');
    ErrorHandler.initialize(outputChannel);

    // Initialize managers
    claudeManager = new ClaudeManager(context);
    authManager = new ClaudeAuthManager(context);
    dataProvider = new DataContextProvider(context);

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
            'Welcome to Claude Studio! Would you like to configure your API key now?',
            'Configure',
            'Later'
        );
        
        if (selection === 'Configure') {
            vscode.commands.executeCommand('claude-studio.configureApiKey');
        }
        
        context.globalState.update('claude-studio.hasShownWelcome', true);
    }
}

function registerCommands(context: vscode.ExtensionContext): void {
    // Start Claude command
    const startCommand = vscode.commands.registerCommand('claude-studio.start', async () => {
        try {
            await claudeManager.startClaude();
        } catch (error) {
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
            } catch (error) {
                ErrorHandler.handle(error, 'Configure API Key');
            }
        }
    );

    // Stop Claude command
    const stopCommand = vscode.commands.registerCommand('claude-studio.stop', async () => {
        try {
            await claudeManager.stopClaude();
            vscode.window.showInformationMessage('Claude Studio stopped');
        } catch (error) {
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

    context.subscriptions.push(
        startCommand,
        analyzeCommand,
        configureApiKeyCommand,
        stopCommand,
        installCommand
    );
}

export function deactivate() {
    console.log('Claude Studio extension deactivated');
    
    if (claudeManager) {
        claudeManager.dispose();
    }
    
    if (outputChannel) {
        outputChannel.dispose();
    }
}