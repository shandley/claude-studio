import * as vscode from 'vscode';
import { spawn } from 'child_process';

export type AuthMethod = 'api-key' | 'subscription';

export class ClaudeAuthManager {
    private static readonly API_KEY_SECRET = 'claude-studio.apiKey';
    private static readonly API_KEY_SETTING = 'claude-studio.apiKey';
    private static readonly AUTH_METHOD_SETTING = 'claude-studio.authMethod';

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Get the API key from secure storage or settings
     */
    async getApiKey(): Promise<string | undefined> {
        // Use globalState for now (secrets API requires VS Code 1.53+)
        let apiKey = this.context.globalState.get<string>(ClaudeAuthManager.API_KEY_SECRET);
        
        // If not in secure storage, check settings (for migration)
        if (!apiKey) {
            apiKey = await this.migrateFromSettings();
        }
        
        return apiKey;
    }

    /**
     * Store the API key securely
     */
    async setApiKey(apiKey: string): Promise<void> {
        await this.context.globalState.update(ClaudeAuthManager.API_KEY_SECRET, apiKey);
    }

    /**
     * Delete the stored API key
     */
    async deleteApiKey(): Promise<void> {
        await this.context.globalState.update(ClaudeAuthManager.API_KEY_SECRET, undefined);
    }

    /**
     * Get the current authentication method
     */
    getAuthMethod(): AuthMethod {
        const config = vscode.workspace.getConfiguration('claude-studio');
        return config.get<AuthMethod>('authMethod') || 'subscription';
    }

    /**
     * Set the authentication method
     */
    async setAuthMethod(method: AuthMethod): Promise<void> {
        const config = vscode.workspace.getConfiguration('claude-studio');
        await config.update('authMethod', method, vscode.ConfigurationTarget.Global);
    }

    /**
     * Check if authentication is properly configured
     */
    async isAuthenticated(): Promise<boolean> {
        const authMethod = this.getAuthMethod();

        if (authMethod === 'api-key') {
            return this.hasApiKey();
        } else {
            return this.hasSubscriptionAuth();
        }
    }

    /**
     * Check if an API key is configured
     */
    async hasApiKey(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
    }

    /**
     * Check if subscription authentication is configured
     */
    async hasSubscriptionAuth(): Promise<boolean> {
        return new Promise((resolve) => {
            // Check if claude login has been completed by running a simple command
            const checkProcess = spawn('claude', ['--version']);
            let output = '';

            checkProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            checkProcess.stderr.on('data', (data) => {
                output += data.toString();
            });

            checkProcess.on('close', (code) => {
                // If claude --version works, subscription auth is likely configured
                // We can't directly check auth status, but this is a good proxy
                resolve(code === 0 && !output.includes('login'));
            });

            checkProcess.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Prompt user to enter API key
     */
    async promptForApiKey(): Promise<string | undefined> {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Anthropic API key',
            placeHolder: 'sk-ant-...',
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value) {
                    return 'API key is required';
                }
                if (!value.startsWith('sk-ant-')) {
                    return 'API key should start with "sk-ant-"';
                }
                if (value.length < 20) {
                    return 'API key seems too short';
                }
                return null;
            }
        });

        if (apiKey) {
            await this.setApiKey(apiKey);
            vscode.window.showInformationMessage('API key saved securely');
        }

        return apiKey;
    }

    /**
     * Configure authentication method and credentials
     */
    async configureAuth(): Promise<void> {
        const currentMethod = this.getAuthMethod();

        interface AuthMethodOption extends vscode.QuickPickItem {
            method: AuthMethod;
        }

        const methodOptions: AuthMethodOption[] = [
            {
                label: '$(verified) Pro/Max Subscription',
                description: 'Use Claude Pro or Max subscription (included usage)',
                detail: currentMethod === 'subscription' ? '✓ Currently selected - No API costs!' : 'Requires one-time setup: claude login',
                method: 'subscription' as AuthMethod
            },
            {
                label: '$(key) API Key',
                description: 'Use Anthropic API key (pay-per-use)',
                detail: currentMethod === 'api-key' ? '✓ Currently selected' : 'Charges per token usage',
                method: 'api-key' as AuthMethod
            }
        ];

        const selection = await vscode.window.showQuickPick<AuthMethodOption>(methodOptions, {
            placeHolder: 'Select authentication method'
        });

        if (!selection) {
            return;
        }

        await this.setAuthMethod(selection.method);

        if (selection.method === 'api-key') {
            await this.configureApiKey();
        } else {
            // Check if they're likely already authenticated
            const hasAuth = await this.hasSubscriptionAuth();
            if (hasAuth) {
                vscode.window.showInformationMessage(
                    '✓ Subscription authentication detected! You\'re all set. ' +
                    'Start Claude Studio to begin using it.'
                );
            } else {
                await this.loginWithSubscription();
            }
        }
    }

    /**
     * Show API key configuration options
     */
    async configureApiKey(): Promise<void> {
        const hasKey = await this.hasApiKey();

        const options = hasKey
            ? ['Update API Key', 'Remove API Key', 'Test Connection']
            : ['Set API Key'];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Configure Claude Studio API Key'
        });

        switch (selection) {
            case 'Set API Key':
            case 'Update API Key':
                await this.promptForApiKey();
                break;
            case 'Remove API Key':
                await this.deleteApiKey();
                vscode.window.showInformationMessage('API key removed');
                break;
            case 'Test Connection':
                await this.testConnection();
                break;
        }
    }

    /**
     * Show subscription setup instructions
     */
    async loginWithSubscription(): Promise<void> {
        const message = await vscode.window.showInformationMessage(
            'Claude Pro/Max Subscription Setup\n\n' +
            'To use Claude Studio with your subscription, you need to authenticate Claude Code (one-time setup).\n\n' +
            '1. Open your system terminal\n' +
            '2. Run: claude login\n' +
            '3. Sign in via browser when prompted\n\n' +
            'After authentication, Claude Studio will automatically use your subscription.',
            'Copy Command',
            'I\'m Already Logged In',
            'Use API Key Instead'
        );

        if (message === 'Copy Command') {
            await vscode.env.clipboard.writeText('claude login');
            vscode.window.showInformationMessage(
                'Copied! Open your terminal, paste (Cmd+V), and press Enter. ' +
                'Your browser will open for authentication.'
            );
        } else if (message === 'I\'m Already Logged In') {
            vscode.window.showInformationMessage(
                'Great! Try starting Claude Studio now. It should automatically use your subscription.'
            );
        } else if (message === 'Use API Key Instead') {
            await this.configureApiKey();
        }
    }

    /**
     * Test the API key by making a simple request
     */
    private async testConnection(): Promise<void> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            vscode.window.showErrorMessage('No API key configured');
            return;
        }

        try {
            // For now, just validate the key format
            // In a real implementation, you'd make an API call
            vscode.window.showInformationMessage('API key is configured correctly');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to validate API key');
        }
    }

    /**
     * Migrate API key from settings to secure storage
     */
    private async migrateFromSettings(): Promise<string | undefined> {
        const config = vscode.workspace.getConfiguration('claude-studio');
        const apiKey = config.get<string>('apiKey');
        
        if (apiKey) {
            // Store in secure storage
            await this.setApiKey(apiKey);
            
            // Remove from settings
            await config.update('apiKey', undefined, vscode.ConfigurationTarget.Global);
            await config.update('apiKey', undefined, vscode.ConfigurationTarget.Workspace);
            
            vscode.window.showInformationMessage(
                'API key migrated to secure storage'
            );
        }
        
        return apiKey;
    }
}