import * as vscode from 'vscode';

export interface ClaudeStudioConfig {
    apiKey?: string;
    model: 'claude-3-opus' | 'claude-3-sonnet';
    maxTokens: number;
    temperature: number;
    dataContextSize: number;
    autoSuggest: boolean;
    debug: boolean;
}

export class ConfigManager {
    private static readonly SECTION = 'claude-studio';

    static getConfig(): ClaudeStudioConfig {
        const config = vscode.workspace.getConfiguration(ConfigManager.SECTION);

        return {
            apiKey: config.get<string>('apiKey'),
            model: config.get<'claude-3-opus' | 'claude-3-sonnet'>('model', 'claude-3-sonnet'),
            maxTokens: config.get<number>('maxTokens', 4096),
            temperature: config.get<number>('temperature', 0.7),
            dataContextSize: config.get<number>('dataContextSize', 1000),
            autoSuggest: config.get<boolean>('autoSuggest', true),
            debug: config.get<boolean>('debug', false)
        };
    }

    static async updateConfig<K extends keyof ClaudeStudioConfig>(
        key: K,
        value: ClaudeStudioConfig[K],
        target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigManager.SECTION);
        await config.update(key, value, target);
    }

    static onConfigChange(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(ConfigManager.SECTION)) {
                callback(e);
            }
        });
    }

    static isDebugMode(): boolean {
        return ConfigManager.getConfig().debug;
    }
}