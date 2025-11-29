import * as vscode from 'vscode';

export class ClaudeError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'ClaudeError';
    }
}

export class ErrorHandler {
    private static outputChannel?: vscode.OutputChannel;

    static initialize(outputChannel: vscode.OutputChannel): void {
        ErrorHandler.outputChannel = outputChannel;
    }

    static handle(error: any, context: string): void {
        const errorMessage = ErrorHandler.formatError(error);
        const fullMessage = `[${context}] ${errorMessage}`;

        // Log to output channel
        if (ErrorHandler.outputChannel) {
            ErrorHandler.outputChannel.appendLine(`ERROR: ${fullMessage}`);
            ErrorHandler.outputChannel.show();
        }

        // Show user notification based on error type
        if (error instanceof ClaudeError) {
            if (error.code === 'AUTH_FAILED') {
                vscode.window.showErrorMessage(
                    'Authentication failed. Please check your API key.',
                    'Configure API Key'
                ).then(selection => {
                    if (selection === 'Configure API Key') {
                        vscode.commands.executeCommand('claude-studio.configureApiKey');
                    }
                });
            } else if (error.code === 'NOT_INSTALLED') {
                vscode.window.showErrorMessage(
                    'Claude Code is not installed.',
                    'Install'
                ).then(selection => {
                    if (selection === 'Install') {
                        vscode.commands.executeCommand('claude-studio.install');
                    }
                });
            } else {
                vscode.window.showErrorMessage(`Claude Studio: ${error.message}`);
            }
        } else {
            vscode.window.showErrorMessage(`Claude Studio: ${errorMessage}`);
        }
    }

    static async withRetry<T>(
        operation: () => Promise<T>,
        options: {
            maxAttempts?: number;
            delay?: number;
            backoff?: boolean;
            context?: string;
        } = {}
    ): Promise<T> {
        const {
            maxAttempts = 3,
            delay = 1000,
            backoff = true,
            context = 'Operation'
        } = options;

        let lastError: any;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                if (attempt < maxAttempts) {
                    const waitTime = backoff ? delay * attempt : delay;
                    
                    if (ErrorHandler.outputChannel) {
                        ErrorHandler.outputChannel.appendLine(
                            `${context}: Attempt ${attempt} failed, retrying in ${waitTime}ms...`
                        );
                    }
                    
                    await ErrorHandler.delay(waitTime);
                }
            }
        }

        throw new ClaudeError(
            `${context} failed after ${maxAttempts} attempts`,
            'RETRY_FAILED',
            { originalError: lastError }
        );
    }

    private static formatError(error: any): string {
        if (error instanceof Error) {
            return error.message;
        } else if (typeof error === 'string') {
            return error;
        } else {
            return JSON.stringify(error);
        }
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export function handleAsyncError(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            ErrorHandler.handle(error, `${target.constructor.name}.${propertyKey}`);
            throw error;
        }
    };

    return descriptor;
}