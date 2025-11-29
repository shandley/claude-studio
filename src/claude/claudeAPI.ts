import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface ClaudeCommand {
    command: string;
    context?: any;
    timeout?: number;
}

export interface ClaudeResponse {
    success: boolean;
    output?: string;
    error?: string;
}

export class ClaudeAPI extends EventEmitter {
    private process?: ChildProcess;
    private isRunning = false;
    private commandQueue: Array<{
        command: ClaudeCommand;
        resolve: (response: ClaudeResponse) => void;
        reject: (error: Error) => void;
    }> = [];
    private currentCommand?: {
        command: ClaudeCommand;
        resolve: (response: ClaudeResponse) => void;
        reject: (error: Error) => void;
        output: string[];
        timeout?: NodeJS.Timeout;
    };

    constructor(private apiKey: string) {
        super();
    }

    /**
     * Start the Claude Code process
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.process = spawn('claude', [], {
                env: {
                    ...process.env,
                    ANTHROPIC_API_KEY: this.apiKey
                },
                shell: true
            });

            this.process.stdout?.on('data', (data) => {
                this.handleOutput(data.toString());
            });

            this.process.stderr?.on('data', (data) => {
                this.handleError(data.toString());
            });

            this.process.on('close', (code) => {
                this.isRunning = false;
                this.emit('closed', code);
                
                // Reject any pending commands
                this.rejectPendingCommands('Claude process closed unexpectedly');
            });

            this.process.on('error', (error) => {
                this.isRunning = false;
                reject(error);
            });

            // Give Claude a moment to start
            setTimeout(() => {
                this.isRunning = true;
                resolve();
            }, 1000);
        });
    }

    /**
     * Stop the Claude Code process
     */
    async stop(): Promise<void> {
        if (!this.process) {
            return;
        }

        this.process.kill();
        this.process = undefined;
        this.isRunning = false;
        
        // Clear any pending commands
        this.rejectPendingCommands('Claude process stopped');
    }

    /**
     * Send a command to Claude
     */
    async sendCommand(command: ClaudeCommand): Promise<ClaudeResponse> {
        if (!this.isRunning) {
            throw new Error('Claude is not running');
        }

        return new Promise((resolve, reject) => {
            this.commandQueue.push({ command, resolve, reject });
            this.processNextCommand();
        });
    }

    /**
     * Process the next command in the queue
     */
    private processNextCommand(): void {
        if (this.currentCommand || this.commandQueue.length === 0) {
            return;
        }

        const next = this.commandQueue.shift()!;
        this.currentCommand = {
            ...next,
            output: []
        };

        // Set up timeout if specified
        if (next.command.timeout) {
            this.currentCommand.timeout = setTimeout(() => {
                this.handleCommandTimeout();
            }, next.command.timeout);
        }

        // Send the command
        this.process?.stdin?.write(next.command.command + '\n');
    }

    /**
     * Handle output from Claude
     */
    private handleOutput(data: string): void {
        if (!this.currentCommand) {
            this.emit('output', data);
            return;
        }

        this.currentCommand.output.push(data);

        // Check if command is complete (basic implementation)
        // In a real implementation, you'd need to parse Claude's output format
        if (this.isCommandComplete(data)) {
            this.completeCurrentCommand();
        }
    }

    /**
     * Handle error output from Claude
     */
    private handleError(data: string): void {
        if (this.currentCommand) {
            this.currentCommand.output.push(`ERROR: ${data}`);
        }
        this.emit('error', data);
    }

    /**
     * Check if the current command is complete
     */
    private isCommandComplete(output: string): boolean {
        // Basic implementation - check for common completion patterns
        // This would need to be more sophisticated in production
        return output.includes('>>>') || 
               output.includes('Command completed') ||
               output.includes('Error:');
    }

    /**
     * Complete the current command
     */
    private completeCurrentCommand(): void {
        if (!this.currentCommand) {
            return;
        }

        // Clear timeout
        if (this.currentCommand.timeout) {
            clearTimeout(this.currentCommand.timeout);
        }

        // Prepare response
        const output = this.currentCommand.output.join('');
        const hasError = output.includes('Error:') || output.includes('ERROR:');
        
        const response: ClaudeResponse = {
            success: !hasError,
            output: hasError ? undefined : output,
            error: hasError ? output : undefined
        };

        // Resolve the promise
        this.currentCommand.resolve(response);
        this.currentCommand = undefined;

        // Process next command
        this.processNextCommand();
    }

    /**
     * Handle command timeout
     */
    private handleCommandTimeout(): void {
        if (!this.currentCommand) {
            return;
        }

        const error = new Error('Command timed out');
        this.currentCommand.reject(error);
        this.currentCommand = undefined;

        // Process next command
        this.processNextCommand();
    }

    /**
     * Reject all pending commands
     */
    private rejectPendingCommands(reason: string): void {
        const error = new Error(reason);
        
        if (this.currentCommand) {
            this.currentCommand.reject(error);
            this.currentCommand = undefined;
        }

        while (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift()!;
            command.reject(error);
        }
    }
}