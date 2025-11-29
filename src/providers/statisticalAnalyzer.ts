import { DataContext, ColumnInfo } from './dataContext';

/**
 * Represents a statistical test recommendation
 */
export interface TestRecommendation {
    testName: string;
    category: string;
    description: string;
    whenToUse: string;
    assumptions: string[];
    rCode?: string;
    pythonCode?: string;
}

/**
 * Variable classification for statistical analysis
 */
interface VariableClassification {
    numericVars: ColumnInfo[];
    categoricalVars: ColumnInfo[];
    dateVars: ColumnInfo[];
    booleanVars: ColumnInfo[];
}

/**
 * Analyzes data structure and recommends appropriate statistical tests
 */
export class StatisticalTestAnalyzer {

    /**
     * Analyze data context and generate test recommendations
     */
    static analyzeAndRecommend(dataContext: DataContext): TestRecommendation[] {
        if (!dataContext.columns || dataContext.columns.length === 0) {
            return [];
        }

        const classification = this.classifyVariables(dataContext.columns);
        const recommendations: TestRecommendation[] = [];

        // Add recommendations based on variable types and counts
        recommendations.push(...this.getDescriptiveStatsRecommendations(classification));
        recommendations.push(...this.getBivariateRecommendations(classification));
        recommendations.push(...this.getMultivariateRecommendations(classification));

        return recommendations;
    }

    /**
     * Classify variables by type
     */
    private static classifyVariables(columns: ColumnInfo[]): VariableClassification {
        return {
            numericVars: columns.filter(c => c.dtype === 'int' || c.dtype === 'float'),
            categoricalVars: columns.filter(c => c.dtype === 'string'),
            dateVars: columns.filter(c => c.dtype === 'datetime'),
            booleanVars: columns.filter(c => c.dtype === 'bool')
        };
    }

    /**
     * Recommendations for descriptive statistics
     */
    private static getDescriptiveStatsRecommendations(vars: VariableClassification): TestRecommendation[] {
        const recommendations: TestRecommendation[] = [];

        if (vars.numericVars.length > 0) {
            recommendations.push({
                testName: 'Descriptive Statistics',
                category: 'Exploratory',
                description: 'Calculate mean, median, standard deviation, and quartiles for numeric variables',
                whenToUse: 'Initial exploration of numeric data distribution',
                assumptions: ['Data should be measured on an interval or ratio scale'],
                rCode: `# Descriptive statistics in R
summary(df$${vars.numericVars[0].name})
sd(df$${vars.numericVars[0].name}, na.rm = TRUE)

# For all numeric variables
library(psych)
describe(df[, c(${vars.numericVars.map(v => `"${v.name}"`).join(', ')})])`,
                pythonCode: `# Descriptive statistics in Python
import pandas as pd

df['${vars.numericVars[0].name}'].describe()

# For all numeric variables
df[[${vars.numericVars.map(v => `'${v.name}'`).join(', ')}]].describe()`
            });

            recommendations.push({
                testName: 'Normality Tests',
                category: 'Assumption Testing',
                description: 'Test if numeric variables follow a normal distribution (Shapiro-Wilk, Kolmogorov-Smirnov)',
                whenToUse: 'Before using parametric tests that assume normality',
                assumptions: ['Sample size should be appropriate (Shapiro-Wilk: n < 5000)'],
                rCode: `# Shapiro-Wilk test in R
shapiro.test(df$${vars.numericVars[0].name})

# Visual check
hist(df$${vars.numericVars[0].name})
qqnorm(df$${vars.numericVars[0].name})
qqline(df$${vars.numericVars[0].name})`,
                pythonCode: `# Shapiro-Wilk test in Python
from scipy import stats
import matplotlib.pyplot as plt

stats.shapiro(df['${vars.numericVars[0].name}'].dropna())

# Visual check
plt.hist(df['${vars.numericVars[0].name}'].dropna())
stats.probplot(df['${vars.numericVars[0].name}'].dropna(), dist="norm", plot=plt)
plt.show()`
            });
        }

        return recommendations;
    }

    /**
     * Recommendations for bivariate analysis
     */
    private static getBivariateRecommendations(vars: VariableClassification): TestRecommendation[] {
        const recommendations: TestRecommendation[] = [];

        // Two numeric variables: Correlation
        if (vars.numericVars.length >= 2) {
            recommendations.push({
                testName: 'Correlation Analysis',
                category: 'Association',
                description: 'Measure linear relationship between two numeric variables (Pearson) or monotonic relationship (Spearman)',
                whenToUse: 'Exploring relationships between continuous variables',
                assumptions: [
                    'Pearson: Linear relationship, both variables normally distributed, no outliers',
                    'Spearman: Monotonic relationship (no normality assumption needed)'
                ],
                rCode: `# Correlation in R
# Pearson correlation
cor.test(df$${vars.numericVars[0].name}, df$${vars.numericVars[1].name}, method = "pearson")

# Spearman correlation (non-parametric)
cor.test(df$${vars.numericVars[0].name}, df$${vars.numericVars[1].name}, method = "spearman")

# Visualization
plot(df$${vars.numericVars[0].name}, df$${vars.numericVars[1].name})`,
                pythonCode: `# Correlation in Python
from scipy import stats

# Pearson correlation
stats.pearsonr(df['${vars.numericVars[0].name}'].dropna(),
               df['${vars.numericVars[1].name}'].dropna())

# Spearman correlation
stats.spearmanr(df['${vars.numericVars[0].name}'].dropna(),
                df['${vars.numericVars[1].name}'].dropna())

# Visualization
df.plot.scatter(x='${vars.numericVars[0].name}', y='${vars.numericVars[1].name}')`
            });
        }

        // Numeric + Categorical (2 groups): t-test
        if (vars.numericVars.length >= 1 && vars.categoricalVars.length >= 1) {
            recommendations.push({
                testName: 'Independent Samples t-test',
                category: 'Group Comparison',
                description: 'Compare means of a numeric variable between two groups',
                whenToUse: 'Comparing a continuous outcome between two independent groups',
                assumptions: [
                    'Independent observations',
                    'Numeric variable is normally distributed in each group',
                    'Equal variances (homogeneity)',
                    'For unequal variances, use Welch\'s t-test'
                ],
                rCode: `# t-test in R
# Assuming ${vars.categoricalVars[0].name} has 2 groups
t.test(${vars.numericVars[0].name} ~ ${vars.categoricalVars[0].name}, data = df)

# Welch's t-test (unequal variances)
t.test(${vars.numericVars[0].name} ~ ${vars.categoricalVars[0].name}, data = df, var.equal = FALSE)

# Mann-Whitney U (non-parametric alternative)
wilcox.test(${vars.numericVars[0].name} ~ ${vars.categoricalVars[0].name}, data = df)`,
                pythonCode: `# t-test in Python
from scipy import stats

group1 = df[df['${vars.categoricalVars[0].name}'] == 'group1']['${vars.numericVars[0].name}']
group2 = df[df['${vars.categoricalVars[0].name}'] == 'group2']['${vars.numericVars[0].name}']

# Independent t-test
stats.ttest_ind(group1, group2)

# Mann-Whitney U (non-parametric)
stats.mannwhitneyu(group1, group2)`
            });

            recommendations.push({
                testName: 'One-Way ANOVA',
                category: 'Group Comparison',
                description: 'Compare means of a numeric variable across 3+ groups',
                whenToUse: 'Comparing a continuous outcome across multiple independent groups',
                assumptions: [
                    'Independent observations',
                    'Numeric variable is normally distributed in each group',
                    'Equal variances across groups (homogeneity)',
                    'For violations, use Kruskal-Wallis test'
                ],
                rCode: `# ANOVA in R
model <- aov(${vars.numericVars[0].name} ~ ${vars.categoricalVars[0].name}, data = df)
summary(model)

# Post-hoc test if significant
TukeyHSD(model)

# Kruskal-Wallis (non-parametric alternative)
kruskal.test(${vars.numericVars[0].name} ~ ${vars.categoricalVars[0].name}, data = df)`,
                pythonCode: `# ANOVA in Python
from scipy import stats

# Create groups
groups = [group['${vars.numericVars[0].name}'].values
          for name, group in df.groupby('${vars.categoricalVars[0].name}')]

# One-way ANOVA
stats.f_oneway(*groups)

# Kruskal-Wallis (non-parametric)
stats.kruskal(*groups)`
            });
        }

        // Two categorical variables: Chi-square
        if (vars.categoricalVars.length >= 2) {
            recommendations.push({
                testName: 'Chi-Square Test of Independence',
                category: 'Association',
                description: 'Test association between two categorical variables',
                whenToUse: 'Examining if two categorical variables are independent',
                assumptions: [
                    'Independent observations',
                    'Expected frequency ≥ 5 in at least 80% of cells',
                    'For small samples, use Fisher\'s exact test'
                ],
                rCode: `# Chi-square test in R
table <- table(df$${vars.categoricalVars[0].name}, df$${vars.categoricalVars[1].name})
chisq.test(table)

# Fisher's exact test (for small samples)
fisher.test(table)`,
                pythonCode: `# Chi-square test in Python
from scipy import stats
import pandas as pd

contingency_table = pd.crosstab(df['${vars.categoricalVars[0].name}'],
                                 df['${vars.categoricalVars[1].name}'])
stats.chi2_contingency(contingency_table)

# Fisher's exact test
stats.fisher_exact(contingency_table)`
            });
        }

        return recommendations;
    }

    /**
     * Recommendations for multivariate analysis
     */
    private static getMultivariateRecommendations(vars: VariableClassification): TestRecommendation[] {
        const recommendations: TestRecommendation[] = [];

        // Multiple regression
        if (vars.numericVars.length >= 2) {
            recommendations.push({
                testName: 'Multiple Linear Regression',
                category: 'Prediction',
                description: 'Model relationship between one outcome variable and multiple predictor variables',
                whenToUse: 'Predicting a continuous outcome from multiple predictors',
                assumptions: [
                    'Linear relationship between predictors and outcome',
                    'Independence of observations',
                    'Homoscedasticity (constant variance of residuals)',
                    'Normality of residuals',
                    'No multicollinearity among predictors'
                ],
                rCode: `# Multiple regression in R
model <- lm(${vars.numericVars[0].name} ~ ${vars.numericVars.slice(1, 3).map(v => v.name).join(' + ')}, data = df)
summary(model)

# Check assumptions
plot(model)

# Check multicollinearity
library(car)
vif(model)`,
                pythonCode: `# Multiple regression in Python
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

X = df[[${vars.numericVars.slice(1, 3).map(v => `'${v.name}'`).join(', ')}]]
y = df['${vars.numericVars[0].name}']

X = sm.add_constant(X)
model = sm.OLS(y, X).fit()
print(model.summary())

# Check multicollinearity (VIF)
vif_data = pd.DataFrame()
vif_data["feature"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(len(X.columns))]
print(vif_data)`
            });
        }

        return recommendations;
    }

    /**
     * Format recommendations as a Claude prompt
     */
    static formatRecommendationsForClaude(
        dataContext: DataContext,
        recommendations: TestRecommendation[]
    ): string {
        let prompt = `I have a dataset with the following structure:\n\n`;

        // Add data context summary
        if (dataContext.shape) {
            prompt += `**Dataset**: ${dataContext.name}\n`;
            prompt += `**Size**: ${dataContext.shape[0]} rows × ${dataContext.shape[1]} columns\n\n`;
        }

        prompt += `**Variables**:\n`;
        dataContext.columns?.forEach(col => {
            const nullInfo = col.nullCount && col.nullCount > 0 ? ` (${col.nullCount} missing)` : '';
            prompt += `- ${col.name}: ${col.dtype}${nullInfo}\n`;
        });

        prompt += `\n---\n\nBased on this data structure, here are recommended statistical tests:\n\n`;

        recommendations.forEach((rec, idx) => {
            prompt += `## ${idx + 1}. ${rec.testName} (${rec.category})\n\n`;
            prompt += `**Description**: ${rec.description}\n\n`;
            prompt += `**When to use**: ${rec.whenToUse}\n\n`;
            prompt += `**Assumptions**:\n`;
            rec.assumptions.forEach(assumption => {
                prompt += `- ${assumption}\n`;
            });
            prompt += `\n`;

            if (rec.rCode) {
                prompt += `**R Code**:\n\`\`\`r\n${rec.rCode}\n\`\`\`\n\n`;
            }

            if (rec.pythonCode) {
                prompt += `**Python Code**:\n\`\`\`python\n${rec.pythonCode}\n\`\`\`\n\n`;
            }

            prompt += `---\n\n`;
        });

        prompt += `\nPlease help me:\n`;
        prompt += `1. Refine these recommendations based on the specific variables in my dataset\n`;
        prompt += `2. Suggest which tests are most appropriate for my research questions\n`;
        prompt += `3. Provide guidance on checking assumptions before running these tests\n`;
        prompt += `4. Recommend any additional exploratory visualizations I should create\n`;

        return prompt;
    }
}
