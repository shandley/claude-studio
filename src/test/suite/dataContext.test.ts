import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { DataContextProvider, DataContext, ColumnInfo } from '../../providers/dataContext';

// Mock VS Code extension context
class MockExtensionContext {
    subscriptions: any[] = [];
    workspaceState: any;
    globalState: any;
    extensionPath: string = '';
    storagePath: string | undefined;
    globalStoragePath: string = '';
    logPath: string = '';
    extensionUri: any;
    environmentVariableCollection: any;
    extensionMode: any;
    storageUri: any;
    globalStorageUri: any;
    logUri: any;
    secrets: any;
}

suite('DataContextProvider Test Suite', () => {
    let provider: DataContextProvider;
    let fixturesPath: string;

    setup(() => {
        const mockContext = new MockExtensionContext() as any;
        provider = new DataContextProvider(mockContext);
        fixturesPath = path.join(__dirname, '..', 'fixtures');
    });

    teardown(() => {
        provider.clearCache();
    });

    suite('CSV File Parsing', () => {
        test('should parse CSV file correctly', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            // Use private method via reflection
            const context = await (provider as any).parseFileContent(csvPath, csvContent);

            assert.strictEqual(context.type, 'dataframe');
            assert.strictEqual(context.name, 'sample.csv');
            assert.deepStrictEqual(context.shape, [5, 5]); // 5 rows, 5 columns
            assert.strictEqual(context.columns?.length, 5);
        });

        test('should correctly identify column names from CSV', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);

            const expectedColumns = ['name', 'age', 'salary', 'join_date', 'active'];
            const actualColumns = context.columns?.map((c: ColumnInfo) => c.name);

            assert.deepStrictEqual(actualColumns, expectedColumns);
        });

        test('should infer correct data types from CSV', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);

            const columnTypes: Record<string, string> = {};
            context.columns?.forEach((col: ColumnInfo) => {
                columnTypes[col.name] = col.dtype;
            });

            assert.strictEqual(columnTypes['name'], 'string');
            assert.strictEqual(columnTypes['age'], 'int');
            assert.strictEqual(columnTypes['salary'], 'float');
            assert.strictEqual(columnTypes['join_date'], 'datetime');
            assert.strictEqual(columnTypes['active'], 'bool');
        });

        test('should detect missing values in CSV', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);

            // Diana has missing salary value
            const salaryColumn = context.columns?.find((c: ColumnInfo) => c.name === 'salary');
            assert.strictEqual(salaryColumn?.nullCount, 1);
        });

        test('should calculate correct summary statistics for CSV', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);

            assert.strictEqual(context.summary?.rowCount, 5);
            assert.strictEqual(context.summary?.columnCount, 5);
            assert.strictEqual(context.summary?.missingValues, 1);
        });

        test('should handle empty CSV file', async () => {
            const csvPath = path.join(fixturesPath, 'empty.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);

            assert.strictEqual(context.type, 'dataframe');
            assert.deepStrictEqual(context.shape, [0, 0]);
        });

        test('should create preview with limited rows', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);

            // Preview should be limited to maxPreviewRows (10)
            assert.ok(context.preview);
            assert.ok(context.preview.length <= 10);
        });
    });

    suite('TSV File Parsing', () => {
        test('should parse TSV file correctly', async () => {
            const tsvPath = path.join(fixturesPath, 'sample.tsv');
            const tsvContent = fs.readFileSync(tsvPath, 'utf8');

            const context = await (provider as any).parseFileContent(tsvPath, tsvContent);

            assert.strictEqual(context.type, 'dataframe');
            assert.strictEqual(context.name, 'sample.tsv');
            assert.deepStrictEqual(context.shape, [4, 4]);
            assert.strictEqual(context.columns?.length, 4);
        });

        test('should correctly identify column names from TSV', async () => {
            const tsvPath = path.join(fixturesPath, 'sample.tsv');
            const tsvContent = fs.readFileSync(tsvPath, 'utf8');

            const context = await (provider as any).parseFileContent(tsvPath, tsvContent);

            const expectedColumns = ['product', 'quantity', 'price', 'date'];
            const actualColumns = context.columns?.map((c: ColumnInfo) => c.name);

            assert.deepStrictEqual(actualColumns, expectedColumns);
        });

        test('should infer correct data types from TSV', async () => {
            const tsvPath = path.join(fixturesPath, 'sample.tsv');
            const tsvContent = fs.readFileSync(tsvPath, 'utf8');

            const context = await (provider as any).parseFileContent(tsvPath, tsvContent);

            const columnTypes: Record<string, string> = {};
            context.columns?.forEach((col: ColumnInfo) => {
                columnTypes[col.name] = col.dtype;
            });

            assert.strictEqual(columnTypes['product'], 'string');
            assert.strictEqual(columnTypes['quantity'], 'int');
            assert.strictEqual(columnTypes['price'], 'float');
            assert.strictEqual(columnTypes['date'], 'datetime');
        });
    });

    suite('JSON File Parsing', () => {
        test('should parse JSON array correctly', async () => {
            const jsonPath = path.join(fixturesPath, 'sample_array.json');
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');

            const context = await (provider as any).parseFileContent(jsonPath, jsonContent);

            assert.strictEqual(context.type, 'dataframe');
            assert.strictEqual(context.name, 'sample_array.json');
            assert.deepStrictEqual(context.shape, [3, 4]);
            assert.strictEqual(context.columns?.length, 4);
        });

        test('should extract correct columns from JSON array', async () => {
            const jsonPath = path.join(fixturesPath, 'sample_array.json');
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');

            const context = await (provider as any).parseFileContent(jsonPath, jsonContent);

            const columnNames = context.columns?.map((c: ColumnInfo) => c.name).sort();
            const expectedNames = ['id', 'name', 'price', 'inStock'].sort();

            assert.deepStrictEqual(columnNames, expectedNames);
        });

        test('should infer correct data types from JSON', async () => {
            const jsonPath = path.join(fixturesPath, 'sample_array.json');
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');

            const context = await (provider as any).parseFileContent(jsonPath, jsonContent);

            const columnTypes: Record<string, string> = {};
            context.columns?.forEach((col: ColumnInfo) => {
                columnTypes[col.name] = col.dtype;
            });

            assert.strictEqual(columnTypes['id'], 'int');
            assert.strictEqual(columnTypes['name'], 'string');
            assert.strictEqual(columnTypes['price'], 'float');
            assert.strictEqual(columnTypes['inStock'], 'bool');
        });

        test('should handle JSON object (not array)', async () => {
            const jsonPath = path.join(fixturesPath, 'sample_object.json');
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');

            const context = await (provider as any).parseFileContent(jsonPath, jsonContent);

            assert.strictEqual(context.type, 'object');
            assert.strictEqual(context.name, 'sample_object.json');
            assert.ok(context.raw);
        });

        test('should convert JSON to table preview format', async () => {
            const jsonPath = path.join(fixturesPath, 'sample_array.json');
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');

            const context = await (provider as any).parseFileContent(jsonPath, jsonContent);

            assert.ok(context.preview);
            assert.strictEqual(context.preview.length, 3); // 3 rows
            assert.strictEqual(context.preview[0].length, 4); // 4 columns
        });
    });

    suite('Type Inference', () => {
        test('should infer int type correctly', () => {
            const values = ['1', '2', '3', '100'];
            const dtype = (provider as any).inferDataType(values);
            assert.strictEqual(dtype, 'int');
        });

        test('should infer float type correctly', () => {
            const values = ['1.5', '2.3', '3.14159'];
            const dtype = (provider as any).inferDataType(values);
            assert.strictEqual(dtype, 'float');
        });

        test('should infer bool type correctly', () => {
            const values = ['true', 'false', 'true'];
            const dtype = (provider as any).inferDataType(values);
            assert.strictEqual(dtype, 'bool');
        });

        test('should infer datetime type correctly', () => {
            const values = ['2024-01-15', '2024-02-20', '2024-03-10'];
            const dtype = (provider as any).inferDataType(values);
            assert.strictEqual(dtype, 'datetime');
        });

        test('should infer string type for mixed values', () => {
            const values = ['hello', 'world', '123', 'test'];
            const dtype = (provider as any).inferDataType(values);
            assert.strictEqual(dtype, 'string');
        });

        test('should handle null/empty values in type inference', () => {
            const values = ['1', '', '3', null];
            const dtype = (provider as any).inferDataType(values);
            assert.strictEqual(dtype, 'int');
        });

        test('should return null type for all empty values', () => {
            const values = ['', null, undefined, ''];
            const dtype = (provider as any).inferDataType(values);
            assert.strictEqual(dtype, 'null');
        });
    });

    suite('Date Detection', () => {
        test('should recognize YYYY-MM-DD format', () => {
            const isDate = (provider as any).isDateString('2024-01-15');
            assert.strictEqual(isDate, true);
        });

        test('should recognize MM/DD/YYYY format', () => {
            const isDate = (provider as any).isDateString('01/15/2024');
            assert.strictEqual(isDate, true);
        });

        test('should recognize ISO datetime format', () => {
            const isDate = (provider as any).isDateString('2024-01-15T10:30:00');
            assert.strictEqual(isDate, true);
        });

        test('should reject non-date strings', () => {
            const isDate = (provider as any).isDateString('hello world');
            assert.strictEqual(isDate, false);
        });

        test('should reject numbers as dates', () => {
            const isDate = (provider as any).isDateString(123);
            assert.strictEqual(isDate, false);
        });
    });

    suite('File Type Detection', () => {
        test('should recognize CSV files', () => {
            const isData = (provider as any).isDataFile('test.csv');
            assert.strictEqual(isData, true);
        });

        test('should recognize TSV files', () => {
            const isData = (provider as any).isDataFile('test.tsv');
            assert.strictEqual(isData, true);
        });

        test('should recognize JSON files', () => {
            const isData = (provider as any).isDataFile('test.json');
            assert.strictEqual(isData, true);
        });

        test('should reject non-data files', () => {
            const isData = (provider as any).isDataFile('test.txt');
            assert.strictEqual(isData, false);
        });

        test('should handle files without extensions', () => {
            const isData = (provider as any).isDataFile('testfile');
            assert.strictEqual(isData, false);
        });

        test('should be case-insensitive', () => {
            const isData = (provider as any).isDataFile('TEST.CSV');
            assert.strictEqual(isData, true);
        });
    });

    suite('Data Formatting for Claude', () => {
        test('should format dataframe context correctly', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);
            const formatted = provider.formatForClaude(context);

            assert.ok(formatted.includes('sample.csv'));
            assert.ok(formatted.includes('5 rows × 5 columns'));
            assert.ok(formatted.includes('Columns:'));
            assert.ok(formatted.includes('name'));
            assert.ok(formatted.includes('age'));
            assert.ok(formatted.includes('Preview'));
        });

        test('should include column types in formatted output', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);
            const formatted = provider.formatForClaude(context);

            assert.ok(formatted.includes('(int)'));
            assert.ok(formatted.includes('(float)'));
            assert.ok(formatted.includes('(string)'));
            assert.ok(formatted.includes('(bool)'));
            assert.ok(formatted.includes('(datetime)'));
        });

        test('should include missing value counts', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);
            const formatted = provider.formatForClaude(context);

            assert.ok(formatted.includes('missing values'));
        });

        test('should format preview data as table', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            const context = await (provider as any).parseFileContent(csvPath, csvContent);
            const formatted = provider.formatForClaude(context);

            assert.ok(formatted.includes('|')); // Table separator
            assert.ok(formatted.includes('---')); // Header separator
        });

        test('should format non-dataframe context', async () => {
            const jsonPath = path.join(fixturesPath, 'sample_object.json');
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');

            const context = await (provider as any).parseFileContent(jsonPath, jsonContent);
            const formatted = provider.formatForClaude(context);

            assert.ok(formatted.includes('sample_object.json'));
            assert.ok(formatted.length > 0);
        });
    });

    suite('Cache Management', () => {
        test('should cache parsed contexts', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            // Parse once
            await (provider as any).parseFileContent(csvPath, csvContent);

            // Check cache
            const cache = (provider as any).cache;
            assert.ok(cache.has(csvPath));
        });

        test('should clear cache on demand', async () => {
            const csvPath = path.join(fixturesPath, 'sample.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');

            // Parse and cache
            await (provider as any).parseFileContent(csvPath, csvContent);

            // Clear cache
            provider.clearCache();

            // Check cache is empty
            const cache = (provider as any).cache;
            assert.strictEqual(cache.size, 0);
        });
    });

    suite('Edge Cases', () => {
        test('should handle CSV with only headers', () => {
            const content = 'col1,col2,col3\n';
            const context = (provider as any).parseDelimitedFile('test.csv', content, ',');

            assert.strictEqual(context.type, 'dataframe');
            assert.deepStrictEqual(context.shape, [0, 3]);
        });

        test('should handle malformed JSON gracefully', async () => {
            const content = '{ invalid json }';
            const context = await (provider as any).parseFileContent('test.json', content);

            assert.strictEqual(context.type, 'unknown');
            assert.ok(context.raw);
        });

        test('should handle CSV with irregular columns', () => {
            const content = 'a,b,c\n1,2\n3,4,5,6\n';
            const context = (provider as any).parseDelimitedFile('test.csv', content, ',');

            // Should still parse without crashing
            assert.strictEqual(context.type, 'dataframe');
        });

        test('should handle empty JSON array', async () => {
            const content = '[]';
            const context = await (provider as any).parseFileContent('test.json', content);

            assert.strictEqual(context.type, 'dataframe');
            assert.deepStrictEqual(context.shape, [0, 0]);
        });

        test('should handle files with whitespace', () => {
            const content = '  name  ,  age  \n  Alice  ,  30  \n';
            const context = (provider as any).parseDelimitedFile('test.csv', content, ',');

            // Should trim whitespace
            assert.strictEqual(context.columns?.[0].name, 'name');
            assert.strictEqual(context.preview?.[0]?.[0], 'Alice');
        });
    });
});
