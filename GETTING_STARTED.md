# Getting Started with Claude Studio

Welcome! This guide will walk you through all of Claude Studio's features using example datasets and real workflows. Perfect for testing the extension with your colleagues.

---

## 📋 Prerequisites

Before starting, make sure you have:

1. ✅ **VS Code or Positron** installed (version 1.41.0+)
2. ✅ **Claude Studio extension** installed (see [README.md](README.md))
3. ✅ **Claude Code CLI** installed (`npm install -g @anthropic-ai/claude-code`)
4. ✅ **Authentication** configured (Pro/Max subscription or API key)

---

## 🎯 Quick Setup Check

### Verify Installation

```bash
# Check Claude Code is installed
claude --version
# Should show: 2.0.x (Claude Code)
```

### Configure Authentication

**Option 1: Claude Pro/Max Subscription (Recommended)**
```
1. Cmd+Shift+P → "Claude Studio: Configure Authentication"
2. Select "Pro/Max Subscription"
3. Run `claude login` in the terminal
4. Complete browser authentication
```

**Option 2: API Key**
```
1. Cmd+Shift+P → "Claude Studio: Configure Authentication"
2. Select "API Key"
3. Enter your API key from console.anthropic.com
```

### Start Claude Studio

```
Cmd+Shift+P → "Claude Studio: Start Claude Assistant"
```

You should see a "Claude Studio" terminal open. Status bar should show "Claude Active" ✅

---

## 📊 Example Datasets

This guide includes example datasets in `examples/data/`:

| File | Type | Description | Use Case |
|------|------|-------------|----------|
| `patient_data.csv` | CSV | Clinical trial data (30 patients) | Statistical tests, group comparisons |
| `gene_expression.csv` | CSV | RNA-seq differential expression (20 genes) | Volcano plots, significance testing |
| `survey_results.tsv` | TSV | Employee satisfaction survey (25 responses) | Categorical analysis, chi-square tests |
| `metadata.json` | JSON | Microbiome sample metadata (5 samples) | JSON parsing, metadata analysis |

---

## 🧪 Vignette 1: Analyzing Clinical Trial Data

**Goal**: Analyze patient outcomes by treatment group

### Step 1: Explore the Data

1. Open `examples/data/patient_data.csv` in VS Code/Positron
2. Right-click on the file → **"Claude Studio: Suggest Data Analysis"**

**What happens**: Claude Studio:
- Parses the CSV file (30 rows × 9 columns)
- Detects column types (age: int, gender: string, blood_pressure_systolic: int, etc.)
- Calculates summary statistics
- Sends context to Claude for analysis recommendations

**Claude will suggest**:
- Exploratory data analysis (EDA) steps
- Group comparisons by treatment
- Statistical tests to use
- Visualization recommendations

### Step 2: Get Statistical Test Recommendations

1. Right-click on `patient_data.csv` → **"Claude Studio: Recommend Statistical Tests"**

**What Claude recommends**:
- ✅ **ANOVA** (compare blood pressure across 3 treatment groups)
- ✅ **Chi-square test** (association between treatment and outcome)
- ✅ **t-tests** (pairwise comparisons)
- ✅ **Correlation** (age vs blood pressure)

**Includes**:
- Test assumptions
- When to use each test
- Complete R and Python code examples

### Step 3: Generate Visualizations

1. Right-click on `patient_data.csv` → **"Claude Studio: Generate Visualization Code"**

**Claude generates code for**:
- **Box plot**: Blood pressure by treatment group
- **Bar chart**: Outcome frequencies by treatment
- **Scatter plot**: Age vs blood pressure with regression line
- **Histogram**: Age distribution

**Code quality**:
- ✅ Publication-ready (300 DPI)
- ✅ Proper labels and titles
- ✅ Best practices (themes, colors, annotations)
- ✅ Both R (ggplot2) and Python (matplotlib/seaborn)

### Step 4: Try It Out

**Copy the R code Claude generates**:
```r
# Example: Box plot of blood pressure by treatment
library(ggplot2)

data <- read.csv("examples/data/patient_data.csv")

ggplot(data, aes(x = treatment, y = blood_pressure_systolic, fill = treatment)) +
  geom_boxplot() +
  theme_minimal() +
  labs(
    title = "Systolic Blood Pressure by Treatment Group",
    x = "Treatment",
    y = "Systolic BP (mmHg)"
  ) +
  scale_fill_brewer(palette = "Set2")

ggsave("blood_pressure_boxplot.png", width = 8, height = 6, dpi = 300)
```

**Expected insights**:
- DrugA and DrugB show lower blood pressure than Placebo
- Median systolic BP: DrugA (~130), DrugB (~135), Placebo (~140)
- Suggests treatment effect worth formal testing

---

## 🧬 Vignette 2: Gene Expression Analysis

**Goal**: Identify significantly differentially expressed genes

### Step 1: Analyze the Data

1. Open `examples/data/gene_expression.csv`
2. Right-click → **"Claude Studio: Suggest Data Analysis"**

**Data structure**:
- 20 genes with control vs treatment expression
- Fold change and p-values calculated
- Boolean `significant` flag (p < 0.05, |FC| > 1.5)

### Step 2: Generate Volcano Plot

1. Right-click → **"Claude Studio: Generate Visualization Code"**
2. Ask Claude for a **scatter plot** of fold_change vs p_value

**Claude will generate**:
```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

data = pd.read_csv("examples/data/gene_expression.csv")

fig, ax = plt.subplots(figsize=(10, 8))

colors = data['significant'].map({True: 'red', False: 'gray'})
ax.scatter(data['fold_change'], -np.log10(data['p_value']), c=colors, alpha=0.6)

ax.axhline(-np.log10(0.05), color='blue', linestyle='--', label='p=0.05')
ax.axvline(1.5, color='blue', linestyle='--')
ax.axvline(-1.5, color='blue', linestyle='--')

ax.set_xlabel('Fold Change')
ax.set_ylabel('-log10(p-value)')
ax.set_title('Volcano Plot: Differential Gene Expression')
ax.legend()

plt.tight_layout()
plt.savefig('volcano_plot.png', dpi=300)
plt.show()
```

**Expected results**:
- 12 significantly upregulated genes (red, right side)
- 8 non-significant genes (gray, center)
- Clear separation at p=0.05 threshold

### Step 3: Statistical Tests

1. Right-click → **"Claude Studio: Recommend Statistical Tests"**

**Claude recommends**:
- ✅ **Correlation**: control_mean vs treatment_mean
- ✅ **t-test**: Compare fold_change between significant vs non-significant
- ✅ **Chi-square**: Test independence of significance and gene function (if you had that data)

---

## 📝 Vignette 3: Survey Data Analysis

**Goal**: Analyze employee satisfaction survey

### Step 1: Explore TSV Data

1. Open `examples/data/survey_results.tsv`
2. Right-click → **"Claude Studio: Suggest Data Analysis"**

**What Claude sees**:
- Tab-delimited format (automatically detected)
- 25 respondents
- Categorical variables (age_group, education, work_from_home)
- Numeric variables (satisfaction, hours_per_week, stress_level)

### Step 2: Statistical Tests

1. Right-click → **"Claude Studio: Recommend Statistical Tests"**

**Claude recommends**:
- ✅ **Chi-square test**: work_from_home vs satisfaction
- ✅ **ANOVA**: satisfaction across age_groups
- ✅ **Correlation**: hours_per_week vs stress_level
- ✅ **t-test**: satisfaction for WFH vs not WFH

### Step 3: Visualizations

**Ask Claude for**:
- Bar chart: satisfaction by work_from_home status
- Box plot: hours_per_week by education level
- Scatter: hours_per_week vs stress_level

**Example insight**:
- Remote workers tend to report higher satisfaction
- Stress level correlates with hours worked
- PhD holders work more hours on average

---

## 💻 Vignette 4: Code Intelligence Features

**Goal**: Document and improve existing code

### Step 1: Explain Code

1. Open `examples/scripts/analyze_patients.R`
2. Select the `analyze_treatment_effect` function
3. Right-click → **"Claude Studio: Explain This Code"**

**Claude explains**:
- What the function does (groups data and calculates improvement rates)
- How it works (uses dplyr, non-standard evaluation with `!!sym()`)
- Parameters and return values
- Potential edge cases (empty groups, NA handling)

### Step 2: Generate Documentation

1. Select the `calculate_effect_size` function
2. Right-click → **"Claude Studio: Generate Documentation"**

**Claude generates Roxygen2**:
```r
#' Calculate Cohen's d Effect Size
#'
#' Calculates the standardized effect size (Cohen's d) between two groups
#' by comparing their means relative to pooled standard deviation.
#'
#' @param data A data frame containing the outcome and grouping variables
#' @param group_var Character string naming the grouping variable
#' @param outcome_var Character string naming the outcome variable
#'
#' @return Numeric value representing Cohen's d effect size. Values of
#'   0.2, 0.5, and 0.8 represent small, medium, and large effects respectively.
#'
#' @examples
#' \dontrun{
#' effect <- calculate_effect_size(clinical_data, "treatment", "blood_pressure")
#' }
#'
#' @export
```

### Step 3: Document Python Code

1. Open `examples/scripts/analyze_expression.py`
2. Select the `ExpressionAnalyzer` class
3. Right-click → **"Claude Studio: Generate Documentation"**

**Claude generates docstrings**:
```python
"""
Analyzer for differential gene expression data.

This class provides methods to analyze RNA-seq expression data,
identify significantly differentially expressed genes, and
generate summary statistics.

Attributes:
    data (pd.DataFrame): Gene expression data with columns for
        fold_change, p_value, and gene identifiers.
    significant_genes (pd.DataFrame): Subset of data containing
        only statistically significant genes after analysis.

Example:
    >>> analyzer = ExpressionAnalyzer(expression_data)
    >>> results = analyzer.run_analysis(p_threshold=0.05, fc_threshold=1.5)
    >>> stats = analyzer.get_summary_stats()
"""
```

### Step 4: Debug Errors

1. Open `examples/scripts/analyze_expression.py`
2. Add a typo: change `pd.read_csv` to `pd.read_cs`
3. Place cursor on the line
4. Run **"Claude Studio: Debug Error with Claude"**

**Claude analyzes**:
- Error from Pylance/Pyright language server
- Surrounding code context
- Suggests fix: `pd.read_csv` (correct method name)
- Explains what the error means

---

## 🎨 Vignette 5: Improving Existing Plots

**Goal**: Enhance a basic plot with AI suggestions

### Step 1: Create a Basic Plot

Create this simple R plot in a new file:

```r
library(ggplot2)
data <- read.csv("examples/data/patient_data.csv")

ggplot(data, aes(x = treatment, y = blood_pressure_systolic)) +
  geom_boxplot()
```

### Step 2: Get Improvement Suggestions

1. Select the entire plot code
2. Right-click → **"Claude Studio: Improve This Plot"**

**Claude detects**: ggplot2 code

**Claude suggests improvements**:
- ✅ Add informative title and axis labels
- ✅ Use color to distinguish treatment groups
- ✅ Add theme for professional appearance
- ✅ Show individual data points with jitter
- ✅ Add mean indicators
- ✅ Increase figure size for readability
- ✅ Save at publication quality (300 DPI)

**Claude provides complete improved code**:
```r
library(ggplot2)
data <- read.csv("examples/data/patient_data.csv")

ggplot(data, aes(x = treatment, y = blood_pressure_systolic, fill = treatment)) +
  geom_boxplot(alpha = 0.7, outlier.shape = NA) +
  geom_jitter(width = 0.2, alpha = 0.3, size = 2) +
  stat_summary(fun = mean, geom = "point", shape = 23, size = 3, fill = "white") +
  theme_minimal(base_size = 14) +
  theme(
    legend.position = "none",
    panel.grid.major.x = element_blank()
  ) +
  labs(
    title = "Systolic Blood Pressure by Treatment Group",
    subtitle = "Clinical trial outcomes (N=30)",
    x = "Treatment",
    y = "Systolic Blood Pressure (mmHg)"
  ) +
  scale_fill_brewer(palette = "Set2")

ggsave("improved_blood_pressure.png", width = 10, height = 7, dpi = 300)
```

### Step 3: Compare Results

**Before**: Basic boxplot, no labels, no context
**After**: Publication-ready with:
- Clear title and subtitle
- Individual data points visible
- Mean markers
- Professional theme
- Color-coded groups
- High resolution export

---

## 🔄 Vignette 6: Complete Workflow

**Goal**: End-to-end analysis from data to publication-ready figure

### Scenario: Clinical Trial Report

**Task**: Create analysis of blood pressure outcomes by treatment for a research paper.

### Workflow

**1. Initial Exploration** (2 minutes)
```
- Open patient_data.csv
- Right-click → "Suggest Data Analysis"
- Read Claude's recommendations
```

**2. Statistical Analysis** (3 minutes)
```
- Right-click → "Recommend Statistical Tests"
- Copy recommended ANOVA code
- Run in R console
- Interpret results with Claude
```

**3. Visualization** (3 minutes)
```
- Right-click → "Generate Visualization Code"
- Select box plot code
- Run in R
- Save initial plot
```

**4. Plot Improvement** (2 minutes)
```
- Select plot code
- Right-click → "Improve This Plot"
- Replace with improved code
- Generate final figure
```

**5. Documentation** (2 minutes)
```
- Select analysis function
- Right-click → "Generate Documentation"
- Add Roxygen2 to code
- Export for reproducibility
```

**Total time**: ~12 minutes for complete analysis with publication-ready outputs!

---

## 🎓 Tips for Colleagues Testing

### Best Practices

1. **Start with Authentication**
   - Pro/Max users: Use subscription mode (saves money!)
   - API key users: Get key from console.anthropic.com first

2. **Use Example Data**
   - All examples in `examples/data/` are ready to use
   - Try different file types (CSV, TSV, JSON)
   - Datasets are realistic but small (fast testing)

3. **Try All Features**
   - Data analysis suggestions
   - Statistical test recommendations
   - Visualization generation
   - Code explanation
   - Documentation generation
   - Plot improvements

4. **Compare with Your Workflow**
   - How long would this take manually?
   - How does code quality compare?
   - Are suggestions scientifically sound?

### What to Test

**Data Analysis**:
- [ ] Right-click CSV → Suggest Analysis
- [ ] Right-click TSV → Recommend Tests
- [ ] Right-click JSON → Generate Visualizations
- [ ] Compare suggestions with manual analysis

**Code Intelligence**:
- [ ] Select R function → Explain Code
- [ ] Select Python class → Generate Documentation
- [ ] Introduce error → Debug with Claude
- [ ] Select plot code → Improve Plot

**Authentication**:
- [ ] Test subscription login (if you have Pro/Max)
- [ ] Test API key configuration
- [ ] Switch between methods
- [ ] Verify costs (subscription should be $0 additional)

### Common Questions

**Q: Which authentication should I use?**
A: If you have Claude Pro/Max, use subscription (no API costs). Otherwise, use API key.

**Q: Can I use my own data?**
A: Yes! Claude Studio works with any CSV/TSV/JSON files. Example data is just for testing.

**Q: Does it work in VS Code and Positron?**
A: Yes, both are supported (version 1.41.0+).

**Q: How much does it cost?**
A:
- Subscription mode: $0 additional (uses your Pro/Max plan)
- API key mode: Pay per token (check console.anthropic.com for pricing)

**Q: Can I trust the statistical recommendations?**
A: Claude provides sound suggestions, but always verify with your statistical knowledge. This is a tool to assist, not replace, statistical expertise.

---

## 📚 Next Steps

After testing with examples:

1. **Try Your Own Data**
   - Open your actual research data
   - Test the same workflows
   - Evaluate relevance to your work

2. **Customize Settings**
   - Settings → Extensions → Claude Studio
   - Adjust `dataContextSize` for larger datasets
   - Enable debug mode if troubleshooting

3. **Share Feedback**
   - What features are most useful?
   - What could be improved?
   - Any bugs or issues?

4. **Integrate into Workflow**
   - Add to daily data analysis
   - Use for documentation
   - Generate publication figures

---

## 🐛 Troubleshooting

**Issue: "Claude Code is not installed"**
```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

**Issue: Authentication fails**
```
Subscription: Run `claude login` in terminal
API Key: Check key starts with "sk-ant-"
Both: Check Output → Claude Studio for errors
```

**Issue: Extension not responding**
```
1. Check status bar (should show state)
2. Restart extension: Cmd+Shift+P → "Reload Window"
3. Check Output → Claude Studio for errors
4. Enable debug mode in settings
```

**Issue: Recommendations seem off**
```
- Make sure data is clean (no missing values in preview)
- Check column types are correct (integer vs string)
- Try smaller data context (reduce dataContextSize)
- Provide more context in manual queries
```

---

## 💡 Example Use Cases

### For Your Colleagues

**Bioinformatician**:
- Analyze gene_expression.csv
- Generate volcano plots
- Get pathway enrichment suggestions
- Document analysis scripts

**Clinical Researcher**:
- Analyze patient_data.csv
- Compare treatment groups
- Generate publication figures
- Statistical test selection

**Data Scientist**:
- Analyze survey_results.tsv
- Categorical data analysis
- Correlation studies
- Report generation

**Lab Manager**:
- Parse metadata.json
- Track sample quality
- Generate QC reports
- Document workflows

---

## 📞 Support

**Questions or Issues?**
- GitHub Issues: https://github.com/shandley/claude-studio/issues
- Check README.md for detailed docs
- Review CHANGELOG.md for latest features

---

**Happy testing!** 🚀

We hope Claude Studio accelerates your data science workflow. This is designed to complement your expertise, not replace it. Always validate recommendations with your domain knowledge.

**Version**: 0.7.0 | **Last Updated**: 2025-11-29
