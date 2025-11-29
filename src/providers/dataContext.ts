import * as vscode from 'vscode';

export interface ColumnInfo {
    name: string;
    dtype: string;
    nullCount?: number;
    uniqueCount?: number;
}

export interface DataStatistics {
    rowCount: number;
    columnCount: number;
    missingValues?: number;
    memoryUsage?: string;
}

export interface DataContext {
    name: string;
    type: 'dataframe' | 'array' | 'object' | 'unknown';
    shape?: [number, number];
    columns?: ColumnInfo[];
    preview?: any[][];
    summary?: DataStatistics;
    raw?: any;
}

export class DataContextProvider {
    private cache: Map<string, DataContext> = new Map();
    private readonly maxPreviewRows = 10;
    private readonly maxContextSize = 1000; // Maximum rows to include in context

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Extract context from active editor (for CSV/TSV files)
     */
    async getEditorDataContext(): Promise<DataContext | null> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        const document = editor.document;
        const fileName = document.fileName;

        // Check if it's a data file
        if (!this.isDataFile(fileName)) {
            return null;
        }

        const content = document.getText();
        return this.parseFileContent(fileName, content);
    }

    /**
     * Extract context from a URI (for file explorer context menu)
     */
    async getFileDataContext(uri: vscode.Uri): Promise<DataContext | null> {
        if (!this.isDataFile(uri.fsPath)) {
            return null;
        }

        try {
            const content = await vscode.workspace.fs.readFile(uri);
            const text = new TextDecoder().decode(content);
            return this.parseFileContent(uri.fsPath, text);
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    }

    /**
     * Parse file content into structured data context
     */
    private async parseFileContent(fileName: string, content: string): Promise<DataContext> {
        const name = fileName.split('/').pop() || 'unknown';
        const extension = fileName.split('.').pop()?.toLowerCase();

        let context: DataContext = {
            name,
            type: 'unknown',
            raw: content
        };

        if (extension === 'csv' || extension === 'tsv') {
            const delimiter = extension === 'csv' ? ',' : '\t';
            context = this.parseDelimitedFile(name, content, delimiter);
        } else if (extension === 'json') {
            context = this.parseJsonFile(name, content);
        }

        // Cache the context
        this.cache.set(fileName, context);
        return context;
    }

    /**
     * Parse CSV/TSV files
     */
    private parseDelimitedFile(name: string, content: string, delimiter: string): DataContext {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            return { name, type: 'dataframe', shape: [0, 0] };
        }

        // Parse headers
        const headers = lines[0].split(delimiter).map(h => h.trim());
        const columnCount = headers.length;

        // Parse data rows
        const dataRows = lines.slice(1, this.maxPreviewRows + 1);
        const preview: any[][] = dataRows.map(row => 
            row.split(delimiter).map(cell => cell.trim())
        );

        // Analyze columns
        const columns: ColumnInfo[] = headers.map((header, idx) => {
            const columnData = preview.map(row => row[idx]);
            return {
                name: header,
                dtype: this.inferDataType(columnData),
                nullCount: columnData.filter(v => !v || v === 'null' || v === 'NA').length,
                uniqueCount: new Set(columnData).size
            };
        });

        // Calculate statistics
        const rowCount = lines.length - 1; // Exclude header
        const summary: DataStatistics = {
            rowCount,
            columnCount,
            missingValues: columns.reduce((sum, col) => sum + (col.nullCount || 0), 0)
        };

        return {
            name,
            type: 'dataframe',
            shape: [rowCount, columnCount],
            columns,
            preview,
            summary
        };
    }

    /**
     * Parse JSON files
     */
    private parseJsonFile(name: string, content: string): DataContext {
        try {
            const data = JSON.parse(content);
            
            if (Array.isArray(data)) {
                // Array of objects (common data format)
                const preview = data.slice(0, this.maxPreviewRows);
                const columns = this.extractJsonColumns(preview);
                
                return {
                    name,
                    type: 'dataframe',
                    shape: [data.length, columns.length],
                    columns,
                    preview: this.jsonToTablePreview(preview, columns),
                    summary: {
                        rowCount: data.length,
                        columnCount: columns.length
                    }
                };
            } else {
                // Single object or other structure
                return {
                    name,
                    type: 'object',
                    raw: JSON.stringify(data, null, 2).slice(0, 1000)
                };
            }
        } catch (error) {
            return {
                name,
                type: 'unknown',
                raw: content.slice(0, 1000)
            };
        }
    }

    /**
     * Extract column information from JSON array
     */
    private extractJsonColumns(data: any[]): ColumnInfo[] {
        if (data.length === 0) return [];

        const allKeys = new Set<string>();
        data.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                Object.keys(item).forEach(key => allKeys.add(key));
            }
        });

        return Array.from(allKeys).map(key => ({
            name: key,
            dtype: this.inferDataType(data.map(item => item?.[key])),
            uniqueCount: new Set(data.map(item => item?.[key])).size
        }));
    }

    /**
     * Convert JSON data to table preview format
     */
    private jsonToTablePreview(data: any[], columns: ColumnInfo[]): any[][] {
        return data.map(row => 
            columns.map(col => row?.[col.name] ?? null)
        );
    }

    /**
     * Infer data type from column values
     */
    private inferDataType(values: any[]): string {
        const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');

        if (nonNullValues.length === 0) return 'null';

        // Check if all values are booleans (must be before number check since Number(true) = 1)
        if (nonNullValues.every(v => v === 'true' || v === 'false' || v === true || v === false)) {
            return 'bool';
        }

        // Check if all values are numbers
        if (nonNullValues.every(v => !isNaN(Number(v)))) {
            return nonNullValues.some(v => v.toString().includes('.')) ? 'float' : 'int';
        }

        // Check if values look like dates
        if (nonNullValues.some(v => this.isDateString(v))) {
            return 'datetime';
        }

        return 'string';
    }

    /**
     * Check if a string looks like a date
     */
    private isDateString(value: any): boolean {
        if (typeof value !== 'string') return false;
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}$/,
            /^\d{2}\/\d{2}\/\d{4}$/,
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
        ];
        return datePatterns.some(pattern => pattern.test(value));
    }

    /**
     * Check if a file is a data file
     */
    private isDataFile(fileName: string): boolean {
        const dataExtensions = ['csv', 'tsv', 'json', 'xlsx', 'xls'];
        const extension = fileName.split('.').pop()?.toLowerCase();
        return extension ? dataExtensions.includes(extension) : false;
    }

    /**
     * Format data context for Claude
     */
    formatForClaude(context: DataContext): string {
        let formatted = `Data: ${context.name}\n`;
        
        if (context.type === 'dataframe' && context.shape) {
            formatted += `Shape: ${context.shape[0]} rows × ${context.shape[1]} columns\n\n`;
            
            if (context.columns) {
                formatted += 'Columns:\n';
                context.columns.forEach(col => {
                    formatted += `- ${col.name} (${col.dtype})`;
                    if (col.nullCount) {
                        formatted += ` - ${col.nullCount} missing values`;
                    }
                    formatted += '\n';
                });
                formatted += '\n';
            }
            
            if (context.preview && context.preview.length > 0) {
                formatted += 'Preview (first 10 rows):\n';
                // Add headers
                if (context.columns) {
                    formatted += context.columns.map(c => c.name).join(' | ') + '\n';
                    formatted += context.columns.map(() => '---').join(' | ') + '\n';
                }
                // Add data rows
                context.preview.forEach(row => {
                    formatted += row.join(' | ') + '\n';
                });
            }
        } else if (context.raw) {
            formatted += `\n${context.raw}`;
        }
        
        return formatted;
    }

    /**
     * Clear cached contexts
     */
    clearCache(): void {
        this.cache.clear();
    }
}