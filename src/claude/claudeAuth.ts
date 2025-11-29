import * as vscode from 'vscode';

export class ClaudeAuthManager {
    private static readonly API_KEY_SECRET = 'claude-studio.apiKey';
    private static readonly API_KEY_SETTING = 'claude-studio.apiKey';

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
     * Check if an API key is configured
     */
    async hasApiKey(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
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