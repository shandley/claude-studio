# Claude Studio - Testing Guide for Colleagues

Hi! Thanks for helping test Claude Studio. This guide will get you up and running quickly.

## 📥 What You Need

1. **Installation File**: `claude-studio-0.7.0.vsix` (included)
2. **VS Code or Positron** (version 1.41.0+)
3. **Claude Pro/Max subscription** OR **Anthropic API key**

## 🚀 Quick Setup (5 minutes)

### Step 1: Install and Authenticate Claude Code CLI

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Authenticate (choose ONE):

# Option A: Claude Pro/Max (Recommended - $0 additional cost!)
claude login
# Browser opens → Sign in → Done!

# Option B: API Key (Pay-per-use)
# Skip for now, configure in extension later
```

**Verify:** `claude --version` should show version 2.0.x

### Step 2: Install Extension

1. Open VS Code/Positron
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: "Install from VSIX"
4. Select `claude-studio-0.7.1.vsix`
5. Restart when prompted

### Step 3: Start Testing

```
Cmd+Shift+P → "Claude Studio: Start Claude Assistant"
```

You should see "Claude Studio" terminal open and status bar show "Claude Active" ✅

## 🧪 Testing Checklist

### Example Datasets (All Included!)

The extension includes ready-to-use example datasets in the `examples/` directory:

- ✅ `patient_data.csv` - Clinical trial data (30 patients, 3 treatment groups)
- ✅ `gene_expression.csv` - RNA-seq data (20 genes, differential expression)
- ✅ `survey_results.tsv` - Employee survey (25 responses)
- ✅ `metadata.json` - Microbiome metadata (5 samples)

### Features to Test

**Data Analysis** (5 minutes):
- [ ] Open `examples/data/patient_data.csv`
- [ ] Right-click → "Claude Studio: Suggest Data Analysis"
- [ ] Right-click → "Claude Studio: Recommend Statistical Tests"
- [ ] Right-click → "Claude Studio: Generate Visualization Code"

**Code Intelligence** (3 minutes):
- [ ] Open `examples/scripts/analyze_patients.R`
- [ ] Select a function → Right-click → "Claude Studio: Explain This Code"
- [ ] Select a function → Right-click → "Claude Studio: Generate Documentation"

**Plot Improvement** (2 minutes):
- [ ] Open `examples/scripts/basic_plot.R` (or basic_plot.py)
- [ ] Select the plot code
- [ ] Right-click → "Claude Studio: Improve This Plot"
- [ ] Compare suggestions

## 📖 Detailed Tutorial

For complete step-by-step vignettes: **See [GETTING_STARTED.md](GETTING_STARTED.md)**

Includes:
- 6 complete workflows with expected outputs
- Detailed explanations of each feature
- Tips for testing with your own data
- Troubleshooting common issues

## ❓ What to Evaluate

Please provide feedback on:

### Functionality
- [ ] Did installation work smoothly?
- [ ] Did authentication work (subscription or API key)?
- [ ] Did data analysis recommendations make sense?
- [ ] Were statistical test suggestions appropriate?
- [ ] Was generated code correct and runnable?
- [ ] Did documentation generation work well?

### Quality
- [ ] Are recommendations scientifically sound?
- [ ] Is generated code publication-quality?
- [ ] Are explanations clear and helpful?
- [ ] Would you use this in your workflow?

### Performance
- [ ] Response time acceptable?
- [ ] Any errors or crashes?
- [ ] Status bar working correctly?

## 💰 Cost Information

**Claude Pro/Max Users** (Subscription mode):
- ✅ $0 additional cost
- ✅ Uses your plan's included usage
- ✅ Higher limits than API (5-20x more)
- Example: Max $100/month plan includes generous usage

**API Key Users**:
- Charges per token used
- Check pricing at https://console.anthropic.com/
- Approximately $0.01-0.10 per analysis (varies by complexity)

## 🐛 Common Issues

**"Claude Code is not installed"**
```bash
npm install -g @anthropic-ai/claude-code
```

**Authentication fails**
- Subscription: Make sure `claude login` completed successfully
- API Key: Verify key starts with "sk-ant-"
- Check **Output → Claude Studio** for detailed errors

**Extension not responding**
- Check status bar shows current state
- Try: `Cmd+Shift+P` → "Reload Window"
- Enable debug: Settings → Claude Studio → Debug: true

## 📊 What Makes This Useful?

### Time Savings
- **Manual**: 30-60 min to write analysis code + documentation
- **With Claude Studio**: 5-10 min with AI assistance
- **Benefit**: 5-6x faster with same quality

### Quality Improvements
- Publication-ready visualization code
- Best practices built-in
- Statistical test selection assistance
- Consistent documentation format

### Learning Tool
- Explains code you don't understand
- Suggests appropriate statistical tests
- Shows best practices for plotting
- Generates proper documentation

## 📝 Feedback Form

After testing, please share:

1. **What worked well?**
   - Which features were most useful?
   - What would you use regularly?

2. **What needs improvement?**
   - Any bugs or errors?
   - Confusing documentation?
   - Missing features?

3. **Would you use this?**
   - In your daily workflow?
   - For specific tasks only?
   - Not useful for your work?

4. **Authentication experience?**
   - Did subscription mode work?
   - Any cost concerns with API mode?

## 🎯 Quick Wins to Try

### 5-Minute Test
```
1. Open examples/data/patient_data.csv
2. Right-click → "Suggest Data Analysis"
3. Copy recommended ANOVA code
4. Run in R/Python console
5. Compare with manual analysis
```

### 10-Minute Test
```
1. Open examples/data/gene_expression.csv
2. Right-click → "Generate Visualization Code"
3. Copy volcano plot code
4. Run and save figure
5. Evaluate publication-readiness
```

### 15-Minute Full Test
```
1. Go through Vignette 1 in GETTING_STARTED.md
2. Complete workflow: explore → test → visualize → document
3. Compare time vs manual approach
4. Assess code quality
```

## 📞 Questions or Problems?

- **Check**: [GETTING_STARTED.md](GETTING_STARTED.md) for detailed vignettes
- **Check**: [README.md](README.md) for complete documentation
- **Issues**: Email me or file at https://github.com/shandley/claude-studio/issues

## 🎁 Included Files

```
claude-studio-0.7.0.vsix              # Extension installer
GETTING_STARTED.md                    # Detailed tutorial
examples/
  ├── README.md                       # Examples overview
  ├── data/
  │   ├── patient_data.csv           # Clinical trial data
  │   ├── gene_expression.csv        # RNA-seq data
  │   ├── survey_results.tsv         # Survey data
  │   └── metadata.json              # Sample metadata
  └── scripts/
      ├── analyze_patients.R         # R analysis functions
      ├── analyze_expression.py      # Python analysis class
      ├── basic_plot.R               # R plot to improve
      └── basic_plot.py              # Python plot to improve
```

## ✨ Key Features to Highlight

**Dual Authentication**:
- 🆕 Use your Claude Pro/Max subscription (no API costs!)
- Or use API key (pay-per-use)

**Data Intelligence**:
- Smart CSV/TSV/JSON parsing
- Statistical test recommendations with R/Python code
- Publication-ready visualization generation
- AI-powered data analysis suggestions

**Code Assistant**:
- Explain any code
- Generate documentation (docstrings, Roxygen2, JSDoc)
- Debug errors with context
- Improve existing plots

**Seamless Integration**:
- Right-click menus
- Status bar with quick actions
- Terminal integration
- Full Claude Code capabilities

## 🎓 Next Steps After Testing

1. **Try your own data** - Use real research datasets
2. **Customize settings** - Preferences → Claude Studio
3. **Integrate into workflow** - Daily analysis, documentation, figures
4. **Share feedback** - Help improve the extension!

---

**Thank you for testing!** 🙏

Your feedback helps make Claude Studio better for the entire data science community.

**Questions?** Just ask!

---

**Version**: 0.7.0 | **Tester Guide** | Last Updated: 2025-11-29
