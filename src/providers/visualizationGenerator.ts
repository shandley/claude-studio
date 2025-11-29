import { DataContext, ColumnInfo } from './dataContext';

/**
 * Represents a visualization recommendation with code
 */
export interface VisualizationRecommendation {
    chartType: string;
    description: string;
    whenToUse: string;
    bestPractices: string[];
    rCode: string;
    pythonCode: string;
    variables: string[];
}

/**
 * Generates visualization code recommendations based on data structure
 */
export class VisualizationGenerator {

    /**
     * Analyze data and recommend appropriate visualizations
     */
    static generateRecommendations(dataContext: DataContext): VisualizationRecommendation[] {
        if (!dataContext.columns || dataContext.columns.length === 0) {
            return [];
        }

        const recommendations: VisualizationRecommendation[] = [];
        const numericVars = dataContext.columns.filter(c => c.dtype === 'int' || c.dtype === 'float');
        const categoricalVars = dataContext.columns.filter(c => c.dtype === 'string');
        const dateVars = dataContext.columns.filter(c => c.dtype === 'datetime');
        const boolVars = dataContext.columns.filter(c => c.dtype === 'bool');

        // 1. Histograms for numeric variables
        if (numericVars.length > 0) {
            numericVars.slice(0, 2).forEach(numVar => {
                recommendations.push(this.generateHistogram(numVar, dataContext.name));
            });
        }

        // 2. Scatter plots for pairs of numeric variables
        if (numericVars.length >= 2) {
            recommendations.push(this.generateScatterPlot(
                numericVars[0],
                numericVars[1],
                dataContext.name
            ));
        }

        // 3. Box plots: numeric by categorical
        if (numericVars.length > 0 && (categoricalVars.length > 0 || boolVars.length > 0)) {
            const groupVar = categoricalVars.length > 0 ? categoricalVars[0] : boolVars[0];
            recommendations.push(this.generateBoxPlot(
                numericVars[0],
                groupVar,
                dataContext.name
            ));
        }

        // 4. Bar charts for categorical variables
        if (categoricalVars.length > 0) {
            recommendations.push(this.generateBarChart(
                categoricalVars[0],
                dataContext.name
            ));
        }

        // 5. Time series line plots
        if (dateVars.length > 0 && numericVars.length > 0) {
            recommendations.push(this.generateLinePlot(
                dateVars[0],
                numericVars[0],
                dataContext.name
            ));
        }

        // 6. Correlation heatmap
        if (numericVars.length >= 3) {
            recommendations.push(this.generateCorrelationHeatmap(
                numericVars.slice(0, 5),
                dataContext.name
            ));
        }

        return recommendations;
    }

    /**
     * Generate histogram code
     */
    private static generateHistogram(variable: ColumnInfo, datasetName: string): VisualizationRecommendation {
        return {
            chartType: 'Histogram',
            description: `Distribution of ${variable.name}`,
            whenToUse: 'Visualizing the distribution of a single numeric variable',
            bestPractices: [
                'Choose appropriate bin width (experiment with bins parameter)',
                'Add density curve for better interpretation',
                'Use meaningful axis labels',
                'Consider log scale if data is skewed'
            ],
            variables: [variable.name],
            rCode: `# Histogram: ${variable.name}
library(ggplot2)

ggplot(df, aes(x = ${variable.name})) +
  geom_histogram(bins = 30, fill = "steelblue", color = "white", alpha = 0.7) +
  geom_density(aes(y = after_stat(count)), color = "darkred", linewidth = 1) +
  labs(
    title = "Distribution of ${variable.name}",
    x = "${variable.name}",
    y = "Frequency"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
    axis.title = element_text(size = 12)
  )

# Save the plot
ggsave("histogram_${variable.name}.png", width = 8, height = 6, dpi = 300)`,
            pythonCode: `# Histogram: ${variable.name}
import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 6))
sns.histplot(data=df, x='${variable.name}', bins=30, kde=True, color='steelblue')
plt.title('Distribution of ${variable.name}', fontsize=14, fontweight='bold')
plt.xlabel('${variable.name}', fontsize=12)
plt.ylabel('Frequency', fontsize=12)
plt.grid(axis='y', alpha=0.3)
plt.tight_layout()

# Save the plot
plt.savefig('histogram_${variable.name}.png', dpi=300, bbox_inches='tight')
plt.show()`
        };
    }

    /**
     * Generate scatter plot code
     */
    private static generateScatterPlot(xVar: ColumnInfo, yVar: ColumnInfo, datasetName: string): VisualizationRecommendation {
        return {
            chartType: 'Scatter Plot',
            description: `Relationship between ${xVar.name} and ${yVar.name}`,
            whenToUse: 'Exploring relationships between two continuous variables',
            bestPractices: [
                'Add regression line to show trend',
                'Use transparency if many overlapping points',
                'Consider adding confidence intervals',
                'Label outliers if present'
            ],
            variables: [xVar.name, yVar.name],
            rCode: `# Scatter Plot: ${xVar.name} vs ${yVar.name}
library(ggplot2)

ggplot(df, aes(x = ${xVar.name}, y = ${yVar.name})) +
  geom_point(alpha = 0.6, size = 2, color = "steelblue") +
  geom_smooth(method = "lm", se = TRUE, color = "darkred", fill = "pink") +
  labs(
    title = "${yVar.name} vs ${xVar.name}",
    x = "${xVar.name}",
    y = "${yVar.name}"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
    axis.title = element_text(size = 12)
  )

# Add correlation coefficient
cor_value <- cor(df$${xVar.name}, df$${yVar.name}, use = "complete.obs")
cat(sprintf("Correlation: r = %.3f\\n", cor_value))

# Save the plot
ggsave("scatter_${xVar.name}_${yVar.name}.png", width = 8, height = 6, dpi = 300)`,
            pythonCode: `# Scatter Plot: ${xVar.name} vs ${yVar.name}
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

plt.figure(figsize=(10, 6))
sns.scatterplot(data=df, x='${xVar.name}', y='${yVar.name}', alpha=0.6, s=50)
sns.regplot(data=df, x='${xVar.name}', y='${yVar.name}',
            scatter=False, color='darkred')

plt.title('${yVar.name} vs ${xVar.name}', fontsize=14, fontweight='bold')
plt.xlabel('${xVar.name}', fontsize=12)
plt.ylabel('${yVar.name}', fontsize=12)
plt.grid(alpha=0.3)

# Add correlation coefficient
r, p = stats.pearsonr(df['${xVar.name}'].dropna(), df['${yVar.name}'].dropna())
plt.text(0.05, 0.95, f'r = {r:.3f}, p = {p:.3e}',
         transform=plt.gca().transAxes, fontsize=10,
         verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.tight_layout()
plt.savefig('scatter_${xVar.name}_${yVar.name}.png', dpi=300, bbox_inches='tight')
plt.show()`
        };
    }

    /**
     * Generate box plot code
     */
    private static generateBoxPlot(numVar: ColumnInfo, groupVar: ColumnInfo, datasetName: string): VisualizationRecommendation {
        return {
            chartType: 'Box Plot',
            description: `${numVar.name} across different ${groupVar.name} groups`,
            whenToUse: 'Comparing distributions of a numeric variable across categorical groups',
            bestPractices: [
                'Show individual points if sample size is small',
                'Use violin plots for better distribution visualization',
                'Order groups meaningfully (e.g., by median)',
                'Highlight significant differences'
            ],
            variables: [numVar.name, groupVar.name],
            rCode: `# Box Plot: ${numVar.name} by ${groupVar.name}
library(ggplot2)

ggplot(df, aes(x = ${groupVar.name}, y = ${numVar.name}, fill = ${groupVar.name})) +
  geom_boxplot(alpha = 0.7, outlier.shape = 16) +
  geom_jitter(width = 0.2, alpha = 0.3, size = 1) +
  labs(
    title = "${numVar.name} by ${groupVar.name}",
    x = "${groupVar.name}",
    y = "${numVar.name}"
  ) +
  scale_fill_brewer(palette = "Set2") +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
    axis.title = element_text(size = 12),
    legend.position = "none"
  )

# Statistical test (ANOVA if 3+ groups, t-test if 2 groups)
groups <- unique(df$${groupVar.name})
if (length(groups) == 2) {
  test_result <- t.test(${numVar.name} ~ ${groupVar.name}, data = df)
  print(test_result)
} else if (length(groups) > 2) {
  test_result <- aov(${numVar.name} ~ ${groupVar.name}, data = df)
  print(summary(test_result))
}

# Save the plot
ggsave("boxplot_${numVar.name}_by_${groupVar.name}.png", width = 8, height = 6, dpi = 300)`,
            pythonCode: `# Box Plot: ${numVar.name} by ${groupVar.name}
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

plt.figure(figsize=(10, 6))
sns.boxplot(data=df, x='${groupVar.name}', y='${numVar.name}', palette='Set2')
sns.stripplot(data=df, x='${groupVar.name}', y='${numVar.name}',
              color='black', alpha=0.3, size=3)

plt.title('${numVar.name} by ${groupVar.name}', fontsize=14, fontweight='bold')
plt.xlabel('${groupVar.name}', fontsize=12)
plt.ylabel('${numVar.name}', fontsize=12)
plt.grid(axis='y', alpha=0.3)
plt.xticks(rotation=45, ha='right')

# Statistical test
groups = df.groupby('${groupVar.name}')['${numVar.name}'].apply(list)
if len(groups) == 2:
    t_stat, p_val = stats.ttest_ind(*groups.values)
    print(f"t-test: t={t_stat:.3f}, p={p_val:.3e}")
elif len(groups) > 2:
    f_stat, p_val = stats.f_oneway(*groups.values)
    print(f"ANOVA: F={f_stat:.3f}, p={p_val:.3e}")

plt.tight_layout()
plt.savefig('boxplot_${numVar.name}_by_${groupVar.name}.png', dpi=300, bbox_inches='tight')
plt.show()`
        };
    }

    /**
     * Generate bar chart code
     */
    private static generateBarChart(variable: ColumnInfo, datasetName: string): VisualizationRecommendation {
        return {
            chartType: 'Bar Chart',
            description: `Frequency distribution of ${variable.name}`,
            whenToUse: 'Showing counts or frequencies of categorical variables',
            bestPractices: [
                'Order bars by frequency for easier interpretation',
                'Use horizontal bars if category names are long',
                'Add value labels on bars',
                'Limit to top N categories if too many'
            ],
            variables: [variable.name],
            rCode: `# Bar Chart: ${variable.name}
library(ggplot2)
library(dplyr)

# Create frequency table and order by count
df_freq <- df %>%
  count(${variable.name}) %>%
  arrange(desc(n))

ggplot(df_freq, aes(x = reorder(${variable.name}, n), y = n, fill = ${variable.name})) +
  geom_bar(stat = "identity", alpha = 0.8) +
  geom_text(aes(label = n), hjust = -0.2, size = 3.5) +
  coord_flip() +
  labs(
    title = "Distribution of ${variable.name}",
    x = "${variable.name}",
    y = "Count"
  ) +
  scale_fill_brewer(palette = "Set3") +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
    axis.title = element_text(size = 12),
    legend.position = "none"
  )

# Save the plot
ggsave("barplot_${variable.name}.png", width = 8, height = 6, dpi = 300)`,
            pythonCode: `# Bar Chart: ${variable.name}
import matplotlib.pyplot as plt
import seaborn as sns

# Create frequency table
value_counts = df['${variable.name}'].value_counts().sort_values(ascending=True)

plt.figure(figsize=(10, 6))
ax = value_counts.plot(kind='barh', color=sns.color_palette('Set3', len(value_counts)))

# Add value labels
for i, v in enumerate(value_counts.values):
    ax.text(v + 0.5, i, str(v), va='center', fontsize=10)

plt.title('Distribution of ${variable.name}', fontsize=14, fontweight='bold')
plt.xlabel('Count', fontsize=12)
plt.ylabel('${variable.name}', fontsize=12)
plt.grid(axis='x', alpha=0.3)
plt.tight_layout()

plt.savefig('barplot_${variable.name}.png', dpi=300, bbox_inches='tight')
plt.show()`
        };
    }

    /**
     * Generate line plot code
     */
    private static generateLinePlot(dateVar: ColumnInfo, numVar: ColumnInfo, datasetName: string): VisualizationRecommendation {
        return {
            chartType: 'Line Plot (Time Series)',
            description: `Trend of ${numVar.name} over time`,
            whenToUse: 'Visualizing how a numeric variable changes over time',
            bestPractices: [
                'Ensure dates are properly formatted',
                'Add smoothed trend line if data is noisy',
                'Highlight significant events or changes',
                'Use appropriate date formatting on x-axis'
            ],
            variables: [dateVar.name, numVar.name],
            rCode: `# Line Plot: ${numVar.name} over ${dateVar.name}
library(ggplot2)
library(lubridate)

# Ensure date column is properly formatted
df$${dateVar.name} <- as.Date(df$${dateVar.name})

ggplot(df, aes(x = ${dateVar.name}, y = ${numVar.name})) +
  geom_line(color = "steelblue", linewidth = 1) +
  geom_point(color = "darkblue", size = 2, alpha = 0.6) +
  geom_smooth(method = "loess", se = TRUE, color = "darkred",
              fill = "pink", alpha = 0.2) +
  labs(
    title = "${numVar.name} Over Time",
    x = "Date",
    y = "${numVar.name}"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
    axis.title = element_text(size = 12),
    axis.text.x = element_text(angle = 45, hjust = 1)
  )

# Save the plot
ggsave("lineplot_${numVar.name}_over_time.png", width = 10, height = 6, dpi = 300)`,
            pythonCode: `# Line Plot: ${numVar.name} over ${dateVar.name}
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Ensure date column is properly formatted
df['${dateVar.name}'] = pd.to_datetime(df['${dateVar.name}'])
df_sorted = df.sort_values('${dateVar.name}')

plt.figure(figsize=(12, 6))
plt.plot(df_sorted['${dateVar.name}'], df_sorted['${numVar.name}'],
         marker='o', linestyle='-', color='steelblue', alpha=0.7, label='Actual')

# Add smoothed trend
from scipy.ndimage import gaussian_filter1d
smoothed = gaussian_filter1d(df_sorted['${numVar.name}'].fillna(method='ffill'), sigma=2)
plt.plot(df_sorted['${dateVar.name}'], smoothed,
         color='darkred', linewidth=2, label='Trend')

plt.title('${numVar.name} Over Time', fontsize=14, fontweight='bold')
plt.xlabel('Date', fontsize=12)
plt.ylabel('${numVar.name}', fontsize=12)
plt.xticks(rotation=45, ha='right')
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()

plt.savefig('lineplot_${numVar.name}_over_time.png', dpi=300, bbox_inches='tight')
plt.show()`
        };
    }

    /**
     * Generate correlation heatmap code
     */
    private static generateCorrelationHeatmap(variables: ColumnInfo[], datasetName: string): VisualizationRecommendation {
        const varNames = variables.map(v => v.name);
        return {
            chartType: 'Correlation Heatmap',
            description: `Correlation matrix for numeric variables`,
            whenToUse: 'Visualizing relationships among multiple numeric variables',
            bestPractices: [
                'Use diverging color palette centered at zero',
                'Display correlation coefficients in cells',
                'Order variables by hierarchical clustering',
                'Consider only displaying lower triangle'
            ],
            variables: varNames,
            rCode: `# Correlation Heatmap
library(ggplot2)
library(reshape2)

# Select numeric variables and calculate correlation
numeric_cols <- c(${varNames.map(v => `"${v}"`).join(', ')})
cor_matrix <- cor(df[, numeric_cols], use = "complete.obs")

# Reshape for ggplot
cor_melted <- melt(cor_matrix)

ggplot(cor_melted, aes(Var1, Var2, fill = value)) +
  geom_tile(color = "white") +
  geom_text(aes(label = sprintf("%.2f", value)), size = 3) +
  scale_fill_gradient2(low = "blue", mid = "white", high = "red",
                       midpoint = 0, limit = c(-1, 1)) +
  labs(
    title = "Correlation Heatmap",
    x = "",
    y = "",
    fill = "Correlation"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
    axis.text.x = element_text(angle = 45, hjust = 1),
    panel.grid = element_blank()
  )

# Save the plot
ggsave("heatmap_correlation.png", width = 8, height = 7, dpi = 300)`,
            pythonCode: `# Correlation Heatmap
import matplotlib.pyplot as plt
import seaborn as sns

# Select numeric variables and calculate correlation
numeric_cols = [${varNames.map(v => `'${v}'`).join(', ')}]
cor_matrix = df[numeric_cols].corr()

plt.figure(figsize=(10, 8))
sns.heatmap(cor_matrix, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, square=True, linewidths=1,
            cbar_kws={"shrink": 0.8})

plt.title('Correlation Heatmap', fontsize=14, fontweight='bold', pad=20)
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()

plt.savefig('heatmap_correlation.png', dpi=300, bbox_inches='tight')
plt.show()`
        };
    }

    /**
     * Format recommendations as a Claude prompt
     */
    static formatRecommendationsForClaude(
        dataContext: DataContext,
        recommendations: VisualizationRecommendation[]
    ): string {
        let prompt = `I have a dataset and need help creating visualizations:\n\n`;

        // Add data context
        if (dataContext.shape) {
            prompt += `**Dataset**: ${dataContext.name}\n`;
            prompt += `**Size**: ${dataContext.shape[0]} rows × ${dataContext.shape[1]} columns\n\n`;
        }

        prompt += `**Variables**:\n`;
        dataContext.columns?.forEach(col => {
            const nullInfo = col.nullCount && col.nullCount > 0 ? ` (${col.nullCount} missing)` : '';
            prompt += `- ${col.name}: ${col.dtype}${nullInfo}\n`;
        });

        prompt += `\n---\n\nHere are recommended visualizations with code:\n\n`;

        recommendations.forEach((rec, idx) => {
            prompt += `## ${idx + 1}. ${rec.chartType}: ${rec.description}\n\n`;
            prompt += `**When to use**: ${rec.whenToUse}\n\n`;
            prompt += `**Best practices**:\n`;
            rec.bestPractices.forEach(bp => {
                prompt += `- ${bp}\n`;
            });
            prompt += `\n`;

            prompt += `**R (ggplot2)**:\n\`\`\`r\n${rec.rCode}\n\`\`\`\n\n`;
            prompt += `**Python (matplotlib/seaborn)**:\n\`\`\`python\n${rec.pythonCode}\n\`\`\`\n\n`;
            prompt += `---\n\n`;
        });

        prompt += `\nPlease help me:\n`;
        prompt += `1. Review these visualization recommendations and suggest improvements\n`;
        prompt += `2. Recommend which visualizations are most important for my data\n`;
        prompt += `3. Suggest any additional visualizations I should consider\n`;
        prompt += `4. Provide guidance on making these publication-ready\n`;

        return prompt;
    }
}
