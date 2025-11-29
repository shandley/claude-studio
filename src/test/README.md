# Claude Studio Extension - Test Suite

## Overview

Comprehensive unit tests for the Claude Studio extension, focusing on the DataContextProvider component.

## Test Coverage

### DataContextProvider (45 tests)

#### CSV File Parsing (7 tests)
- ✅ Parse CSV file correctly
- ✅ Identify column names from CSV
- ✅ Infer correct data types from CSV
- ✅ Detect missing values in CSV
- ✅ Calculate correct summary statistics for CSV
- ✅ Handle empty CSV file
- ✅ Create preview with limited rows

#### TSV File Parsing (3 tests)
- ✅ Parse TSV file correctly
- ✅ Identify column names from TSV
- ✅ Infer correct data types from TSV

#### JSON File Parsing (5 tests)
- ✅ Parse JSON array correctly
- ✅ Extract correct columns from JSON array
- ✅ Infer correct data types from JSON
- ✅ Handle JSON object (not array)
- ✅ Convert JSON to table preview format

#### Type Inference (7 tests)
- ✅ Infer int type correctly
- ✅ Infer float type correctly
- ✅ Infer bool type correctly
- ✅ Infer datetime type correctly
- ✅ Infer string type for mixed values
- ✅ Handle null/empty values in type inference
- ✅ Return null type for all empty values

#### Date Detection (5 tests)
- ✅ Recognize YYYY-MM-DD format
- ✅ Recognize MM/DD/YYYY format
- ✅ Recognize ISO datetime format
- ✅ Reject non-date strings
- ✅ Reject numbers as dates

#### File Type Detection (6 tests)
- ✅ Recognize CSV files
- ✅ Recognize TSV files
- ✅ Recognize JSON files
- ✅ Reject non-data files
- ✅ Handle files without extensions
- ✅ Be case-insensitive

#### Data Formatting for Claude (5 tests)
- ✅ Format dataframe context correctly
- ✅ Include column types in formatted output
- ✅ Include missing value counts
- ✅ Format preview data as table
- ✅ Format non-dataframe context

#### Cache Management (2 tests)
- ✅ Cache parsed contexts
- ✅ Clear cache on demand

#### Edge Cases (5 tests)
- ✅ Handle CSV with only headers
- ✅ Handle malformed JSON gracefully
- ✅ Handle CSV with irregular columns
- ✅ Handle empty JSON array
- ✅ Handle files with whitespace

## Running Tests

### All Tests (VS Code Extension Host)
```bash
npm test
```

This will:
1. Compile TypeScript (`npm run compile`)
2. Download VS Code test environment
3. Run tests in the VS Code extension host
4. Report results

### Watch Mode (for development)
```bash
npm run watch
```
Then run tests manually when changes are detected.

## Test Structure

```
src/test/
├── README.md                    # This file
├── runTest.ts                   # VS Code test runner
├── fixtures/                    # Test data files
│   ├── sample.csv              # Sample CSV with various data types
│   ├── sample.tsv              # Sample TSV file
│   ├── sample_array.json       # JSON array of objects
│   ├── sample_object.json      # JSON single object
│   └── empty.csv               # Empty file for edge cases
└── suite/
    ├── index.ts                # Test suite loader
    └── dataContext.test.ts     # DataContextProvider tests
```

## Test Fixtures

### sample.csv
- 5 rows × 5 columns
- Data types: string, int, float, datetime, bool
- Includes 1 missing value

### sample.tsv
- 4 rows × 4 columns
- Tab-delimited format
- Data types: string, int, float, datetime

### sample_array.json
- Array of 3 objects
- Data types: int, string, float, bool

### sample_object.json
- Single JSON object (not tabular)
- Tests non-array JSON handling

### empty.csv
- Empty file for edge case testing

## Writing New Tests

### Test Template
```typescript
import * as assert from 'assert';
import * as path from 'path';
import { DataContextProvider } from '../../providers/dataContext';

suite('Your Test Suite', () => {
    let provider: DataContextProvider;

    setup(() => {
        const mockContext = new MockExtensionContext() as any;
        provider = new DataContextProvider(mockContext);
    });

    teardown(() => {
        provider.clearCache();
    });

    test('should do something', () => {
        // Your test here
        assert.strictEqual(actual, expected);
    });
});
```

### Best Practices
1. **Use descriptive test names**: Tests should read like documentation
2. **Test one thing**: Each test should validate a single behavior
3. **Use setup/teardown**: Clean state between tests
4. **Test edge cases**: Empty data, malformed input, etc.
5. **Keep fixtures small**: Minimal data to prove the point

## Continuous Integration

To add CI testing (future):

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Debugging Tests

### VS Code Debugger
1. Open `claude-studio` folder in VS Code
2. Set breakpoints in test files
3. Press `F5` or use "Run Extension" from debug panel
4. Tests will run with debugger attached

### Manual Debugging
```bash
# Compile first
npm run compile

# Run with more verbose output
npm test -- --verbose
```

## Known Issues & Limitations

1. **VS Code Environment Required**: Tests need the VS Code extension host
2. **No Mocking**: Currently tests use real file I/O
3. **Limited to DataContextProvider**: Other components not yet tested

## Future Test Coverage

### Components to Test
- [ ] ClaudeManager
- [ ] ClaudeAPI
- [ ] ClaudeAuth
- [ ] Command handlers
- [ ] ConfigManager
- [ ] ErrorHandler

### Integration Tests
- [ ] End-to-end command execution
- [ ] Claude API integration
- [ ] File context menu interactions
- [ ] Terminal integration

## Test Metrics

**Current Status** (as of 2024-11-29):
- Total Tests: 45
- Passing: 45
- Failing: 0
- Coverage: ~100% of DataContextProvider
- Execution Time: ~11ms

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add test fixtures if needed
4. Update this README with new test descriptions
5. Aim for >80% code coverage

## Questions?

See the main [IMPLEMENTATION_PLAN.md](../../IMPLEMENTATION_PLAN.md) for overall project structure.
