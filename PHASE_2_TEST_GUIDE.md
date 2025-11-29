# Phase 2 Testing Guide

## Installation
1. Uninstall the previous version:
   ```bash
   code --uninstall-extension shandley.claude-studio
   ```

2. Install the new version:
   ```bash
   code --install-extension claude-studio-0.1.0.vsix
   ```

3. Reload Positron

## New Features to Test

### 1. Explain Code Command
- **How to test**: 
  - Open any Python or R file
  - Select a function or code block
  - Right-click → "Claude Studio: Explain This Code"
  - Or use Command Palette: "Claude Studio: Explain This Code"
- **Expected**: Claude explains what the code does and how it works

### 2. Generate Documentation
- **How to test**:
  - Select a function without documentation
  - Right-click → "Claude Studio: Generate Documentation"
  - Or use Command Palette: "Claude Studio: Generate Documentation"
- **Expected**: Claude generates appropriate docstrings (Python/R) or JSDoc (JavaScript)

### 3. Suggest Data Analysis
- **How to test**:
  - Right-click on a CSV/TSV/JSON file in Explorer
  - Select "Claude Studio: Suggest Data Analysis"
  - Or open a data file and use Command Palette
- **Expected**: Claude analyzes the data structure and suggests:
  - Exploratory analysis steps
  - Statistical tests
  - Visualization recommendations
  - Data quality checks

### 4. Debug Error
- **How to test**:
  - Open a file with errors (or create some syntax errors)
  - Use Command Palette: "Claude Studio: Debug Error with Claude"
  - Or right-click in editor → "Claude Studio: Debug Error with Claude"
- **Expected**: Claude identifies errors and suggests fixes

## Enhanced Data Context Provider
The extension now intelligently parses data files:
- **CSV/TSV**: Extracts columns, data types, missing values, preview
- **JSON**: Handles arrays of objects as dataframes
- **Smart sampling**: Shows first 10 rows for context

## Test Scenarios

### Basic Workflow Test
1. Start Claude: `Cmd+Shift+P` → "Claude Studio: Start Claude Assistant"
2. Open a CSV file
3. Right-click → "Claude Studio: Suggest Data Analysis"
4. Claude should analyze the data structure and provide recommendations

### Code Documentation Test
1. Create a Python function:
   ```python
   def calculate_statistics(data, method='mean'):
       if method == 'mean':
           return sum(data) / len(data)
       elif method == 'median':
           sorted_data = sorted(data)
           n = len(sorted_data)
           if n % 2 == 0:
               return (sorted_data[n//2-1] + sorted_data[n//2]) / 2
           return sorted_data[n//2]
   ```
2. Select the entire function
3. Right-click → "Claude Studio: Generate Documentation"
4. Claude should generate a proper docstring

### Error Debugging Test
1. Create code with an error:
   ```python
   def process_data(df):
       result = df.groupby('category').mean()
       return reslt  # Typo here
   ```
2. Run "Claude Studio: Debug Error with Claude"
3. Claude should identify the typo and suggest the fix

## Troubleshooting

### Commands not appearing
- Ensure extension is activated (check Output → Claude Studio)
- Reload window: `Cmd+Shift+P` → "Developer: Reload Window"

### Context menus not showing
- Check file extension is supported (.csv, .tsv, .json, .py, .r)
- For code commands, ensure you have text selected

### Claude not responding
- Verify Claude is started first
- Check API key is configured
- Look at Output panel for errors

## Performance Notes
- Large files are automatically sampled (first 100 lines for analysis)
- Data context extraction is cached for efficiency
- Commands execute asynchronously to avoid blocking UI