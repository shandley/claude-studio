# Claude Studio Examples

Example datasets and scripts for testing Claude Studio features.

## 📊 Datasets

### `data/patient_data.csv`
**Clinical trial data with 30 patients**

- **Use for**: Statistical tests, group comparisons, clinical research workflows
- **Columns**:
  - `patient_id`: Unique identifier (P001-P030)
  - `age`: Patient age in years (37-66)
  - `gender`: Male/Female
  - `treatment`: DrugA, DrugB, or Placebo (balanced design, n=10 each)
  - `blood_pressure_systolic`: Systolic BP in mmHg (115-152)
  - `blood_pressure_diastolic`: Diastolic BP in mmHg (74-95)
  - `cholesterol`: Total cholesterol mg/dL (165-255)
  - `outcome`: Improved, NoChange, or Worsened
  - `follow_up_days`: All 90 days
- **Research questions**:
  - Does treatment affect blood pressure?
  - Which treatment is most effective?
  - Relationship between age and baseline BP?

### `data/gene_expression.csv`
**Differential gene expression data (20 genes)**

- **Use for**: Volcano plots, significance testing, genomics workflows
- **Columns**:
  - `gene_id`: Ensembl ID (ENSG001-ENSG020)
  - `gene_name`: Common gene names (TP53, BRCA1, EGFR, etc.)
  - `control_mean`: Mean expression in control (720-1500 counts)
  - `treatment_mean`: Mean expression in treatment (750-2850 counts)
  - `fold_change`: Treatment/Control ratio (1.03-2.00)
  - `p_value`: Statistical significance (0.0001-0.623)
  - `significant`: Boolean flag (p < 0.05, |FC| > 1.5)
- **Research questions**:
  - Which genes are differentially expressed?
  - What pathways are enriched?
  - Correlation between fold change and significance?
- **Expected results**: 12 significant genes, 8 non-significant

### `data/survey_results.tsv`
**Employee satisfaction survey (25 respondents, tab-delimited)**

- **Use for**: Categorical analysis, chi-square tests, survey data
- **Columns**:
  - `respondent_id`: R001-R025
  - `age_group`: 18-24, 25-34, 35-44, 45-54, 55-64
  - `education`: Bachelors, Masters, PhD
  - `satisfaction`: 1-5 scale (3-5 in this sample)
  - `hours_per_week`: Work hours (35-62)
  - `stress_level`: 1-5 scale (2-5)
  - `work_from_home`: Yes/No
- **Research questions**:
  - Does remote work affect satisfaction?
  - Relationship between hours and stress?
  - Satisfaction differences by education level?

### `data/metadata.json`
**Microbiome sample metadata (5 samples, JSON format)**

- **Use for**: JSON parsing, metadata analysis, quality control
- **Fields**:
  - `sample_id`: S001-S005
  - `study`: "Microbiome_Study_2024"
  - `collection_date`: January 2024 dates
  - `sample_type`: Gut or Skin
  - `host_species`: "Homo sapiens"
  - `age_years`: 28-55
  - `reads_sequenced`: 1.2M-1.75M reads
  - `quality_score`: Phred scores 34.8-37.2
  - `diversity_index`: Shannon diversity 2.98-3.89
- **Use cases**:
  - Sample quality metrics
  - Diversity comparisons
  - Metadata validation

## 💻 Analysis Scripts

### `scripts/analyze_patients.R`
**R functions for clinical trial analysis**

Functions included:
- `analyze_treatment_effect()`: Group-wise outcome analysis
- `plot_blood_pressure()`: Boxplot by treatment
- `compare_age_distribution()`: t-test between groups
- `calculate_effect_size()`: Cohen's d calculation

**Use for**:
- Testing "Explain Code" feature
- Testing "Generate Documentation" (Roxygen2)
- Demonstrating R/tidyverse workflows

### `scripts/analyze_expression.py`
**Python module for gene expression analysis**

Functions and classes:
- `load_expression_data()`: CSV loading
- `filter_significant_genes()`: Apply thresholds
- `plot_volcano()`: Generate volcano plot
- `calculate_pathway_enrichment()`: Enrichment analysis
- `ExpressionAnalyzer`: Class for complete analysis pipeline

**Use for**:
- Testing "Explain Code" feature
- Testing "Generate Documentation" (Python docstrings)
- Demonstrating matplotlib/pandas workflows
- Testing error debugging (add typos and use "Debug Error")

## 🎯 Quick Start

### Test Data Analysis Features

```bash
# 1. Open VS Code/Positron in this repository
cd claude-studio-standalone

# 2. Try data analysis
# - Open examples/data/patient_data.csv
# - Right-click → "Claude Studio: Suggest Data Analysis"
# - Right-click → "Claude Studio: Recommend Statistical Tests"
# - Right-click → "Claude Studio: Generate Visualization Code"
```

### Test Code Intelligence Features

```bash
# 1. Open R script
# - Open examples/scripts/analyze_patients.R
# - Select a function
# - Right-click → "Claude Studio: Explain This Code"
# - Right-click → "Claude Studio: Generate Documentation"

# 2. Open Python script
# - Open examples/scripts/analyze_expression.py
# - Select the ExpressionAnalyzer class
# - Right-click → "Claude Studio: Generate Documentation"
```

### Test Plot Improvement

```bash
# 1. Create a simple plot in R or Python
# 2. Select the plot code
# 3. Right-click → "Claude Studio: Improve This Plot"
# 4. Compare original vs improved code
```

## 📖 Full Tutorial

See [GETTING_STARTED.md](../GETTING_STARTED.md) for complete vignettes and workflows using these examples.

## 💡 Tips

- **Start small**: Begin with `patient_data.csv` (simplest example)
- **Try different formats**: Test CSV, TSV, and JSON parsing
- **Compare languages**: Use both R and Python scripts
- **Test error handling**: Add typos to scripts, use "Debug Error"
- **Real data next**: After examples work, try your own datasets

## 📝 Expected Behavior

### Data Analysis Recommendations

When you right-click on `patient_data.csv` → "Suggest Data Analysis":

**Claude should recommend**:
- Descriptive statistics by treatment group
- ANOVA to compare blood pressure across groups
- Chi-square test for treatment vs outcome
- Correlation analysis (age vs BP)
- Visualizations (box plots, scatter plots)

### Statistical Tests

When you right-click → "Recommend Statistical Tests":

**Claude should suggest**:
- ✅ One-way ANOVA (3 groups: DrugA, DrugB, Placebo)
- ✅ Post-hoc tests (pairwise comparisons)
- ✅ Chi-square test of independence
- ✅ Pearson correlation
- ✅ Complete R and Python code examples

### Visualization Code

When you right-click → "Generate Visualization Code":

**Claude should generate**:
- Box plot: blood pressure by treatment
- Bar chart: outcome frequencies
- Scatter plot: age vs blood pressure
- Histogram: age distribution
- Publication-ready code with proper labels and themes

## 🔬 Using Your Own Data

After testing with examples:

1. **Prepare your data**:
   - CSV/TSV: Include column headers
   - JSON: Use array of objects format
   - Clean data (handle missing values)

2. **Test the same features**:
   - Right-click file → Suggest Analysis
   - Right-click file → Recommend Tests
   - Right-click file → Generate Visualizations

3. **Evaluate results**:
   - Are recommendations appropriate?
   - Is generated code correct?
   - How does it compare to manual analysis?

## 🐛 Known Limitations

- **Data size**: Large files (>1000 rows) are sampled automatically
- **Missing values**: May affect type inference
- **Complex structures**: Nested JSON may need manual formatting
- **Code context**: Works best with well-structured functions

## 📞 Questions?

- Full documentation: [README.md](../README.md)
- Detailed tutorial: [GETTING_STARTED.md](../GETTING_STARTED.md)
- Report issues: https://github.com/shandley/claude-studio/issues

---

**Happy testing!** These examples are designed to demonstrate Claude Studio's capabilities. Always validate AI-generated recommendations with your domain expertise.
