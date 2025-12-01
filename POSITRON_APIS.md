# Positron Extension APIs - Available Features

This document outlines the Positron-specific APIs available for building IDE-native features.

## 🎯 What You Have Access To

### 1. **Runtime Session Management**

```typescript
import * as positron from 'positron';

// Get active sessions
const sessions = await positron.runtime.getActiveSessions();

// Get foreground (current) session
const session = await positron.runtime.getForegroundSession();

// Watch for session changes
positron.runtime.onDidChangeForegroundSession((sessionId) => {
  // User switched console/runtime
});
```

**Use Cases:**
- Know when user switches between R and Python
- Track which runtime is active
- Monitor session lifecycle

---

### 2. **Variable Explorer Access** ⭐ **UNIQUE TO IDE**

```typescript
// Get all variables in current R/Python session
const session = await positron.runtime.getForegroundSession();
const variables = await positron.runtime.getSessionVariables(
  session.metadata.sessionId
);

// Each variable includes:
// - display_name: "patient_data"
// - display_type: "data.frame"
// - display_value: preview of data
// - length: number of elements
// - size: bytes
// - has_children: nested structure?
```

**Use Cases:**
- Know what datasets are loaded
- Detect when user creates new data
- Understand data structure before asking Claude
- Auto-suggest analyses based on loaded data

**Example:**
```typescript
// Detect data frames
const dataFrames = variables.flat().filter(v =>
  v.display_type.includes('data.frame') ||
  v.display_type.includes('DataFrame')
);

// "You have patient_data (30 rows) loaded. Suggest analysis?"
```

---

### 3. **Plot Detection** ⭐ **GAME CHANGER**

```typescript
// Watch for plots being created
const session = await positron.runtime.getSession(sessionId);

session.onDidReceiveRuntimeMessage((message) => {
  if (message.type === positron.LanguageRuntimeMessageType.Output) {
    const output = message as positron.LanguageRuntimeOutput;

    // Check for plot data
    if (output.data['image/png'] || output.data['image/svg+xml']) {
      const plotData = output.data['image/png'];  // Base64 PNG
      const plotId = output.output_id;

      // YOU NOW HAVE THE PLOT IMAGE!
      handlePlotCreated(plotData, plotId);
    }
  }
});
```

**Use Cases:**
- Automatically detect when user creates a plot
- Capture plot image + code that generated it
- Offer improvement workflow
- Send plot to Claude for analysis

---

### 4. **Code Execution with Observ monitors**

```typescript
// Execute code and get notified of results
positron.runtime.executeCode(
  'r',  // language
  'plot(cars)',  // code
  false,  // focus
  false,  // allow incomplete
  positron.RuntimeCodeExecutionMode.Interactive,
  positron.RuntimeErrorBehavior.Continue,
  {
    // Callbacks for execution events
    onStarted: () => console.log('Execution started'),

    onOutput: (message: string) => {
      // Text output during execution
    },

    onError: (message: string) => {
      // Error output
    },

    onPlot: (plotData: string) => {
      // PLOT WAS CREATED!
      // plotData is the plot image
    },

    onCompleted: (result: Record<string, any>) => {
      // Success! result contains MIME types to data
    },

    onFailed: (error: Error) => {
      // Execution failed
    },

    onFinished: () => {
      // Always called, regardless of success/failure
    }
  }
);
```

**Use Cases:**
- Run code and monitor results
- Detect plots created during execution
- Handle errors gracefully
- Track execution progress

---

### 5. **Runtime State Monitoring**

```typescript
// Watch for runtime state changes
const session = await positron.runtime.getSession(sessionId);

session.onDidChangeRuntimeState((state: RuntimeState) => {
  switch (state) {
    case positron.RuntimeState.Idle:
      // Runtime is ready, code finished
      break;
    case positron.RuntimeState.Busy:
      // Runtime is executing code
      break;
    case positron.RuntimeState.Exiting:
      // Runtime shutting down
      break;
  }
});
```

**Use Cases:**
- Know when code finishes executing
- Wait for idle state before suggesting next steps
- Detect errors during execution
- Monitor runtime health

---

### 6. **Code Execution Tracking**

```typescript
// Track all code executed in Positron
positron.runtime.onDidExecuteCode((event: CodeExecutionEvent) => {
  console.log(`Code executed: ${event.code}`);
  console.log(`Language: ${event.languageId}`);
  console.log(`Runtime: ${event.runtimeName}`);
  console.log(`Source: ${event.attribution.source}`);
  // attribution.source: 'interactive', 'script', 'notebook', 'assistant', etc.
});
```

**Use Cases:**
- Build console history
- Track what code generated plots
- Understand user workflow
- Detect repeated patterns

---

### 7. **Console Integration**

```typescript
// Get console for a language
const console = await positron.window.getConsoleForLanguage('r');

// Paste code into console
console.pasteText('improved_plot <- ggplot(...)\nprint(improved_plot)');
```

**Use Cases:**
- Insert Claude-generated code directly into console
- Run analysis scripts
- Apply plot improvements automatically

---

### 8. **Plot Render Settings** (Advanced)

```typescript
// Get current plot render settings
const settings = await positron.window.getPlotsRenderSettings();
// { size: { width: 800, height: 600 }, pixel_ratio: 2, format: 'png' }

// Watch for changes
positron.window.onDidChangePlotsRenderSettings((settings) => {
  // Plot area was resized
});
```

**Use Cases:**
- Know plot dimensions for code generation
- Adjust plot output based on viewer size
- Ensure plots match Positron's expectations

---

## 🚀 Practical Workflows You Can Build

### Workflow 1: **Plot Improvement Cycle** ⭐

```
1. User creates plot in console: plot(cars)
   ↓
2. Extension detects plot via onDidReceiveRuntimeMessage
   ↓
3. Extension captures:
   - Plot image (base64 PNG)
   - Code from onDidExecuteCode event
   - Data context from getSessionVariables
   ↓
4. Show notification: "📊 Plot created! Improve with Claude?"
   ↓
5. Send to Claude with full context:
   - Plot image
   - Code that generated it
   - Dataset info (patient_data: 30 rows, 5 columns)
   ↓
6. Claude suggests improvements
   ↓
7. User clicks "Apply" → Code inserted to console via pasteText()
   ↓
8. New plot created → Repeat
```

**Implementation:** See `src/features/plotWatcher.ts`

---

### Workflow 2: **Session Context Awareness**

```
1. Extension monitors getSessionVariables() periodically
   ↓
2. Detects new data frame: patient_data loaded
   ↓
3. Status bar shows: "R 4.5.2 | 3 data frames | 2 models"
   ↓
4. User asks Claude for help → Extension includes context:
   "Current session has:
    - patient_data (30 rows, 5 cols)
    - model_fit (linear model)
    - residuals (numeric vector)"
   ↓
5. Claude has full context without user explaining
```

**Implementation:** See `src/features/sessionMonitor.ts`

---

### Workflow 3: **Error Detective**

```
1. User runs code that fails
   ↓
2. Extension detects via onDidExecuteCode + observer.onError
   ↓
3. Extension captures:
   - Error message
   - Code that failed
   - Variables in scope
   - Recent command history
   ↓
4. Offer: "🐛 Error detected. Debug with Claude?"
   ↓
5. Send full context to Claude for debugging
```

---

### Workflow 4: **Data-Aware Suggestions**

```
1. User loads patient_data.csv
   ↓
2. Extension detects via getSessionVariables()
   ↓
3. Extension queries variable details
   ↓
4. Suggest: "Analyze patient_data with ANOVA?"
   ↓
5. User accepts → Generate and run analysis code
   ↓
6. Monitor execution via executeCode() observer
   ↓
7. Display results, offer next steps
```

---

## 📋 Implementation Checklist

To use these APIs in your extension:

1. **Import Positron API**
   ```typescript
   import * as positron from 'positron';
   ```

2. **Add to package.json**
   ```json
   {
     "extensionDependencies": ["vscode.positron"],
     "engines": {
       "positron": "^1.0.0"
     }
   }
   ```

3. **Type Definitions**
   - Already available at `/Applications/Positron.app/Contents/Resources/app/out/positron-dts/positron.d.ts`
   - TypeScript will find it automatically when you `import * as positron from 'positron'`

4. **Feature Detection**
   ```typescript
   // Check if running in Positron
   const isPositron = vscode.env.appName.includes('Positron');

   if (isPositron) {
     // Use Positron APIs
     const positron = require('positron');
   }
   ```

---

## 🎯 Recommended Next Steps

1. **Start with Plot Watcher** - Most impactful feature
   - Matches your workflow
   - Uses plot detection + variable explorer
   - Clear value proposition

2. **Add Session Monitor** - Context awareness
   - Shows what's loaded in runtime
   - Provides better Claude prompts
   - Status bar integration

3. **Extend to Error Detective** - Proactive debugging
   - Detect errors automatically
   - Gather debugging context
   - Offer Claude assistance

---

## ⚠️ Important Notes

1. **Positron-Only**: These APIs only work in Positron, not VS Code
   - Need feature detection and fallbacks
   - Extension should gracefully degrade in VS Code

2. **Type Safety**: All these are strongly typed
   - Full TypeScript support
   - Intellisense works great

3. **Async Operations**: Most operations are async
   - Use `await` extensively
   - Handle promises properly

4. **Disposal**: Always clean up
   - Dispose event listeners
   - Clear caches
   - Prevent memory leaks

---

## 🔗 Resources

- **Positron API Docs**: (Once available)
- **Type Definitions**: `/Applications/Positron.app/Contents/Resources/app/out/positron-dts/positron.d.ts`
- **Example Extensions**: Check Positron's built-in extensions for examples

---

**Bottom Line**: You have access to **everything you need** for workflow-based IDE integration:
- ✅ Plot detection
- ✅ Variable explorer
- ✅ Code execution monitoring
- ✅ Console integration
- ✅ Runtime state tracking

This is **far more powerful than MCP** and provides genuine differentiated value!
