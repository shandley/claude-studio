import * as vscode from 'vscode';

/**
 * PlotContextBuilder creates rich, detailed context for plots
 * that includes data summaries, visual properties, and session information
 */
export class PlotContextBuilder {
    private positron: any;

    constructor() {
        try {
            this.positron = require('positron');
        } catch (error) {
            throw new Error('Positron API not available');
        }
    }

    /**
     * Build comprehensive plot context as markdown
     */
    async buildPlotContext(plotData: {
        id: string;
        code: string;
        languageId: string;
        plotUri: string;
        timestamp: number;
    }): Promise<string> {
        const sections: string[] = [];

        // Header
        sections.push(`# Plot Context`);
        sections.push(`Generated: ${new Date(plotData.timestamp).toLocaleString()}`);
        sections.push('');

        // Plot Code
        sections.push('## Plot Code');
        sections.push('```' + plotData.languageId);
        sections.push(plotData.code);
        sections.push('```');
        sections.push('');

        // Data Sources
        const dataSources = this.extractDataSources(plotData.code, plotData.languageId);
        if (dataSources.length > 0) {
            sections.push('## Data Sources');

            for (const dataSource of dataSources) {
                const summary = await this.getDataSummary(dataSource);
                if (summary) {
                    sections.push(`### ${dataSource}`);
                    sections.push(summary);
                    sections.push('');
                }
            }
        }

        // Session Context
        const sessionContext = await this.getSessionContext();
        if (sessionContext) {
            sections.push('## Session Variables');
            sections.push(sessionContext);
            sections.push('');
        }

        // Plot Analysis
        sections.push('## Plot Analysis');
        const plotAnalysis = this.analyzePlotCode(plotData.code, plotData.languageId);
        sections.push(`- **Type**: ${plotAnalysis.type}`);
        sections.push(`- **Library**: ${plotAnalysis.library}`);
        sections.push(`- **Language**: ${plotData.languageId}`);

        if (plotAnalysis.variables.length > 0) {
            sections.push(`- **Variables plotted**: ${plotAnalysis.variables.join(', ')}`);
        }

        if (plotAnalysis.aesthetics.length > 0) {
            sections.push(`- **Aesthetics**: ${plotAnalysis.aesthetics.join(', ')}`);
        }

        if (plotAnalysis.observations.length > 0) {
            sections.push('');
            sections.push('**Observations**:');
            plotAnalysis.observations.forEach(obs => {
                sections.push(`- ${obs}`);
            });
        }

        sections.push('');

        // Suggestions Framework
        sections.push('## Suggested Analysis');
        sections.push('When reviewing this plot, consider:');
        sections.push('- **Visual Design**: Colors, themes, labels, readability');
        sections.push('- **Data Presentation**: Are the right variables shown? Is the scale appropriate?');
        sections.push('- **Statistical Validity**: Are there outliers, patterns, or issues visible?');
        sections.push('- **Code Quality**: Best practices, efficiency, maintainability');
        sections.push('');

        return sections.join('\n');
    }

    /**
     * Extract data source variable names from plot code
     */
    private extractDataSources(code: string, languageId: string): string[] {
        const sources = new Set<string>();

        if (languageId === 'r') {
            // ggplot: ggplot(dataframe, ...)
            const ggplotMatch = code.match(/ggplot\s*\(\s*([a-zA-Z_][a-zA-Z0-9_\.]*)/);
            if (ggplotMatch) {
                sources.add(ggplotMatch[1]);
            }

            // base plot: plot(dataframe$col, ...)
            const baseMatch = code.match(/plot\s*\(\s*([a-zA-Z_][a-zA-Z0-9_\.]*)/);
            if (baseMatch) {
                sources.add(baseMatch[1]);
            }

            // data= parameter
            const dataMatches = code.matchAll(/data\s*=\s*([a-zA-Z_][a-zA-Z0-9_\.]*)/g);
            for (const match of dataMatches) {
                sources.add(match[1]);
            }

        } else if (languageId === 'python') {
            // pandas: df.plot()
            const pandasMatch = code.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.plot\s*\(/);
            if (pandasMatch) {
                sources.add(pandasMatch[1]);
            }

            // seaborn: sns.scatterplot(data=df, ...)
            const seabornMatch = code.match(/data\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (seabornMatch) {
                sources.add(seabornMatch[1]);
            }

            // matplotlib with array references
            const arrayMatches = code.matchAll(/plt\.\w+\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)/g);
            for (const match of arrayMatches) {
                sources.add(match[1]);
            }
        }

        return Array.from(sources);
    }

    /**
     * Get detailed summary for a data variable
     */
    private async getDataSummary(variableName: string): Promise<string | null> {
        try {
            const session = await this.positron.runtime.getForegroundSession();
            if (!session) return null;

            // First, try to find it in session variables
            const variables = await this.positron.runtime.getSessionVariables(
                session.metadata.sessionId
            );

            const allVars = variables.flat();
            const targetVar = allVars.find((v: any) => v.display_name === variableName);

            if (targetVar) {
                const lines: string[] = [];
                lines.push(`**Type**: ${targetVar.display_type}`);
                lines.push(`**Size**: ${this.formatSize(targetVar.size)}`);

                if (targetVar.length) {
                    if (targetVar.display_type.includes('data.frame') ||
                        targetVar.display_type.includes('DataFrame')) {
                        lines.push(`**Dimensions**: ${targetVar.length} rows`);
                    } else {
                        lines.push(`**Length**: ${targetVar.length} elements`);
                    }
                }

                if (targetVar.display_value && targetVar.display_value !== 'NULL') {
                    lines.push(`**Preview**: ${targetVar.display_value}`);
                }

                return lines.join('\n');
            }

            // If not found in variables, try to query it directly (for built-in datasets)
            return await this.queryDataSourceDirectly(variableName, session);
        } catch (error) {
            return null;
        }
    }

    /**
     * Query a data source directly using runtime execution
     * (for built-in datasets like mtcars that don't appear in variables)
     */
    private async queryDataSourceDirectly(variableName: string, session: any): Promise<string | null> {
        try {
            const languageId = session.runtimeMetadata?.languageId;

            if (languageId === 'r') {
                // Execute comprehensive R code to get rich data info
                const code = `
if (exists("${variableName}")) {
    obj <- ${variableName}
    cat(sprintf("**Type**: %s\\n", paste(class(obj), collapse=", ")))

    if (is.data.frame(obj)) {
        cat(sprintf("**Dimensions**: %d rows × %d columns\\n", nrow(obj), ncol(obj)))

        # Column names (first 8)
        cols <- names(obj)
        if (length(cols) <= 8) {
            cat(sprintf("**Columns**: %s\\n", paste(cols, collapse=", ")))
        } else {
            cat(sprintf("**Columns**: %s, ...\\n", paste(head(cols, 8), collapse=", ")))
        }

        # Column types
        cat("\\n**Column Types**:\\n")
        for (i in 1:min(8, ncol(obj))) {
            col_class <- class(obj[[i]])[1]
            cat(sprintf("- %s: %s\\n", names(obj)[i], col_class))
        }
        if (ncol(obj) > 8) cat("- ...\\n")

        # Missing values
        total_na <- sum(is.na(obj))
        cat(sprintf("\\n**Missing Values**: %d total", total_na))
        if (total_na > 0) {
            na_cols <- sapply(obj, function(x) sum(is.na(x)))
            na_cols <- na_cols[na_cols > 0]
            if (length(na_cols) > 0) {
                cat(" (")
                cat(paste(sapply(names(na_cols), function(n) sprintf("%s: %d", n, na_cols[n])), collapse=", "))
                cat(")")
            }
        }
        cat("\\n")

        # Summary statistics for numeric columns
        numeric_cols <- sapply(obj, is.numeric)
        if (any(numeric_cols)) {
            cat("\\n**Summary Statistics** (numeric columns):\\n")
            for (col in names(obj)[numeric_cols][1:min(5, sum(numeric_cols))]) {
                vals <- obj[[col]]
                cat(sprintf("- %s: min=%.1f, mean=%.1f, max=%.1f\\n",
                    col, min(vals, na.rm=TRUE), mean(vals, na.rm=TRUE), max(vals, na.rm=TRUE)))
            }
            if (sum(numeric_cols) > 5) cat("- ...\\n")
        }

        # Factor levels
        factor_cols <- sapply(obj, is.factor)
        if (any(factor_cols)) {
            cat("\\n**Factor Levels**:\\n")
            for (col in names(obj)[factor_cols][1:min(3, sum(factor_cols))]) {
                levels_str <- paste(head(levels(obj[[col]]), 5), collapse=", ")
                n_levels <- nlevels(obj[[col]])
                if (n_levels > 5) {
                    cat(sprintf("- %s: %s, ... (%d levels)\\n", col, levels_str, n_levels))
                } else {
                    cat(sprintf("- %s: %s\\n", col, levels_str))
                }
            }
            if (sum(factor_cols) > 3) cat("- ...\\n")
        }

        # Data preview
        cat("\\n**Preview** (first 3 rows):\\n")
        cat("\`\`\`\\n")
        print(head(obj, 3), row.names=TRUE)
        cat("\`\`\`\\n")

    } else if (is.vector(obj)) {
        cat(sprintf("**Length**: %d\\n", length(obj)))
        if (is.numeric(obj)) {
            cat(sprintf("**Range**: %.1f to %.1f\\n", min(obj, na.rm=TRUE), max(obj, na.rm=TRUE)))
            cat(sprintf("**Mean**: %.1f\\n", mean(obj, na.rm=TRUE)))
        }
        na_count <- sum(is.na(obj))
        cat(sprintf("**Missing Values**: %d\\n", na_count))
    }
} else {
    cat("Not found")
}`.trim();

                return new Promise((resolve) => {
                    let output = '';

                    const observer = {
                        onOutput: (message: string) => {
                            output += message;
                        },
                        onFinished: () => {
                            if (output && !output.includes('Not found')) {
                                resolve(output.trim());
                            } else {
                                resolve(null);
                            }
                        },
                        onError: () => {
                            resolve(null);
                        }
                    };

                    // Execute the query code
                    session.execute(code, 'code', true, observer);
                });

            } else if (languageId === 'python') {
                // Execute comprehensive Python code to get rich data info
                const code = `
try:
    import pandas as pd
    import numpy as np
    obj = ${variableName}

    print(f"**Type**: {type(obj).__name__}")

    if isinstance(obj, pd.DataFrame):
        print(f"**Dimensions**: {obj.shape[0]} rows × {obj.shape[1]} columns")

        # Column names
        cols = obj.columns.tolist()
        if len(cols) <= 8:
            print(f"**Columns**: {', '.join(cols)}")
        else:
            print(f"**Columns**: {', '.join(cols[:8])}, ...")

        # Column types
        print("\\n**Column Types**:")
        for col in cols[:8]:
            print(f"- {col}: {obj[col].dtype}")
        if len(cols) > 8:
            print("- ...")

        # Missing values
        total_na = obj.isna().sum().sum()
        print(f"\\n**Missing Values**: {total_na} total", end="")
        if total_na > 0:
            na_cols = obj.isna().sum()
            na_cols = na_cols[na_cols > 0]
            if len(na_cols) > 0:
                na_str = ", ".join([f"{col}: {count}" for col, count in na_cols.items()])
                print(f" ({na_str})", end="")
        print()

        # Summary statistics for numeric columns
        numeric_cols = obj.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            print("\\n**Summary Statistics** (numeric columns):")
            for col in numeric_cols[:5]:
                vals = obj[col]
                print(f"- {col}: min={vals.min():.1f}, mean={vals.mean():.1f}, max={vals.max():.1f}")
            if len(numeric_cols) > 5:
                print("- ...")

        # Categorical columns
        cat_cols = obj.select_dtypes(include=['object', 'category']).columns
        if len(cat_cols) > 0:
            print("\\n**Categorical Columns**:")
            for col in cat_cols[:3]:
                unique_vals = obj[col].unique()[:5]
                n_unique = obj[col].nunique()
                if n_unique > 5:
                    print(f"- {col}: {', '.join(map(str, unique_vals))}, ... ({n_unique} unique)")
                else:
                    print(f"- {col}: {', '.join(map(str, unique_vals))}")
            if len(cat_cols) > 3:
                print("- ...")

        # Data preview
        print("\\n**Preview** (first 3 rows):")
        print("\`\`\`")
        print(obj.head(3).to_string())
        print("\`\`\`")

    elif isinstance(obj, (list, np.ndarray)):
        print(f"**Length**: {len(obj)}")
        if isinstance(obj, np.ndarray) and obj.dtype.kind in 'biufc':
            print(f"**Range**: {obj.min():.1f} to {obj.max():.1f}")
            print(f"**Mean**: {obj.mean():.1f}")
        na_count = pd.isna(obj).sum() if hasattr(obj, '__iter__') else 0
        print(f"**Missing Values**: {na_count}")

except Exception as e:
    print("Not found")`.trim();

                return new Promise((resolve) => {
                    let output = '';

                    const observer = {
                        onOutput: (message: string) => {
                            output += message;
                        },
                        onFinished: () => {
                            if (output && !output.includes('Not found')) {
                                resolve(output.trim());
                            } else {
                                resolve(null);
                            }
                        },
                        onError: () => {
                            resolve(null);
                        }
                    };

                    session.execute(code, 'code', true, observer);
                });
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get session context (all variables)
     */
    private async getSessionContext(): Promise<string | null> {
        try {
            const session = await this.positron.runtime.getForegroundSession();
            if (!session) return null;

            const variables = await this.positron.runtime.getSessionVariables(
                session.metadata.sessionId
            );

            if (!variables || variables.length === 0) return null;

            const allVars = variables.flat();

            // Categorize variables
            const dataFrames = allVars.filter((v: any) =>
                v.display_type.includes('data.frame') ||
                v.display_type.includes('DataFrame') ||
                v.display_type.includes('tibble')
            );

            const models = allVars.filter((v: any) =>
                v.display_type.includes('lm') ||
                v.display_type.includes('glm') ||
                v.display_type.includes('model') ||
                v.display_type.includes('estimator')
            );

            const vectors = allVars.filter((v: any) =>
                (v.display_type.includes('numeric') ||
                 v.display_type.includes('integer') ||
                 v.display_type.includes('character')) &&
                !dataFrames.includes(v) &&
                !models.includes(v)
            );

            const lines: string[] = [];

            if (dataFrames.length > 0) {
                lines.push('### Data Frames');
                dataFrames.slice(0, 5).forEach((df: any) => {
                    lines.push(`- **${df.display_name}** (${df.display_type}): ${df.length} rows, ${this.formatSize(df.size)}`);
                });
                lines.push('');
            }

            if (models.length > 0) {
                lines.push('### Statistical Models');
                models.slice(0, 3).forEach((m: any) => {
                    lines.push(`- **${m.display_name}** (${m.display_type})`);
                });
                lines.push('');
            }

            if (vectors.length > 0 && vectors.length <= 8) {
                lines.push('### Other Variables');
                vectors.forEach((v: any) => {
                    lines.push(`- **${v.display_name}** (${v.display_type}): ${v.display_value || 'N/A'}`);
                });
                lines.push('');
            }

            return lines.length > 0 ? lines.join('\n') : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Analyze plot code to extract type, variables, and provide observations
     */
    private analyzePlotCode(code: string, languageId: string): {
        type: string;
        library: string;
        variables: string[];
        aesthetics: string[];
        observations: string[];
    } {
        const result = {
            type: 'Unknown',
            library: 'Unknown',
            variables: [] as string[],
            aesthetics: [] as string[],
            observations: [] as string[]
        };

        if (languageId === 'r') {
            // Detect library
            if (code.includes('ggplot')) {
                result.library = 'ggplot2';

                // Detect geom type
                if (code.includes('geom_point')) {
                    result.type = 'Scatter plot';
                    result.observations.push('Scatter plots show relationships between two continuous variables');
                } else if (code.includes('geom_line')) {
                    result.type = 'Line plot';
                    result.observations.push('Line plots are ideal for time series or ordered data');
                } else if (code.includes('geom_bar') || code.includes('geom_col')) {
                    result.type = 'Bar chart';
                    result.observations.push('Bar charts compare categorical data');
                } else if (code.includes('geom_histogram')) {
                    result.type = 'Histogram';
                    result.observations.push('Histograms show the distribution of a continuous variable');
                } else if (code.includes('geom_boxplot')) {
                    result.type = 'Box plot';
                    result.observations.push('Box plots show distribution and outliers');
                } else if (code.includes('geom_density')) {
                    result.type = 'Density plot';
                } else if (code.includes('geom_smooth')) {
                    result.type = 'Smoothed plot';
                }

                // Extract aesthetics from aes()
                const aesMatch = code.match(/aes\s*\(([^)]+)\)/);
                if (aesMatch) {
                    const aesContent = aesMatch[1];
                    if (aesContent.includes('x\s*=')) result.aesthetics.push('x-axis mapping');
                    if (aesContent.includes('y\s*=')) result.aesthetics.push('y-axis mapping');
                    if (aesContent.includes('color\s*=') || aesContent.includes('col\s*=')) {
                        result.aesthetics.push('color grouping');
                        result.observations.push('Color grouping detected - ensure colors are distinguishable');
                    }
                    if (aesContent.includes('size\s*=')) result.aesthetics.push('size mapping');
                    if (aesContent.includes('shape\s*=')) result.aesthetics.push('shape mapping');
                    if (aesContent.includes('fill\s*=')) result.aesthetics.push('fill mapping');

                    // Extract variable names
                    const varMatches = aesContent.matchAll(/(?:x|y|color|col|size|shape|fill)\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)/g);
                    for (const match of varMatches) {
                        if (!result.variables.includes(match[1])) {
                            result.variables.push(match[1]);
                        }
                    }
                }

                // Check for faceting
                if (code.includes('facet_wrap') || code.includes('facet_grid')) {
                    result.aesthetics.push('faceting');
                    result.observations.push('Faceted plot - showing subgroups separately');
                }

            } else {
                result.library = 'Base R';

                if (code.includes('hist(')) {
                    result.type = 'Histogram';
                    result.observations.push('Base R histogram - consider ggplot2 for more customization');
                } else if (code.includes('plot(')) {
                    result.type = 'Scatter/Line plot';
                } else if (code.includes('boxplot(')) {
                    result.type = 'Box plot';
                } else if (code.includes('barplot(')) {
                    result.type = 'Bar chart';
                }
            }

        } else if (languageId === 'python') {
            // Detect library
            if (code.includes('sns.')) {
                result.library = 'Seaborn';

                if (code.includes('scatterplot')) {
                    result.type = 'Scatter plot';
                } else if (code.includes('lineplot')) {
                    result.type = 'Line plot';
                } else if (code.includes('barplot')) {
                    result.type = 'Bar plot';
                } else if (code.includes('histplot')) {
                    result.type = 'Histogram';
                } else if (code.includes('boxplot')) {
                    result.type = 'Box plot';
                } else if (code.includes('heatmap')) {
                    result.type = 'Heatmap';
                    result.observations.push('Heatmaps show correlations or patterns in matrix data');
                } else if (code.includes('pairplot')) {
                    result.type = 'Pair plot';
                    result.observations.push('Pair plots show relationships between all variable pairs');
                }

                // Extract hue parameter
                if (code.includes('hue=')) {
                    result.aesthetics.push('color grouping');
                    result.observations.push('Color grouping detected - ensure palette is appropriate');
                }

            } else if (code.includes('px.')) {
                result.library = 'Plotly Express';
                result.observations.push('Plotly creates interactive plots');

            } else if (code.includes('plt.')) {
                result.library = 'Matplotlib';

                if (code.includes('scatter')) result.type = 'Scatter plot';
                else if (code.includes('plot')) result.type = 'Line plot';
                else if (code.includes('bar')) result.type = 'Bar chart';
                else if (code.includes('hist')) result.type = 'Histogram';

            } else if (code.includes('.plot(')) {
                result.library = 'Pandas';
                result.type = 'Pandas plot';
            }
        }

        // General observations
        if (!code.includes('xlab') && !code.includes('ylab') && !code.includes('xlabel') && !code.includes('ylabel') && !code.includes('labs(')) {
            result.observations.push('Consider adding axis labels for clarity');
        }

        if (!code.includes('title') && !code.includes('ggtitle')) {
            result.observations.push('Consider adding a descriptive title');
        }

        return result;
    }

    /**
     * Format byte size to human readable
     */
    private formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}
