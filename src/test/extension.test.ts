import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const fixturesRoot = path.join(__dirname, '..', '..', 'test-fixtures');

function fixturePath(...segments: string[]): string {
  return path.join(fixturesRoot, ...segments);
}

suite('copy-codeblock extension', () => {
  const fixtureUri = vscode.Uri.file(fixturePath('src', 'sample.ts'));

  setup(async () => {
    await vscode.env.clipboard.writeText('');
  });

  test('copySelection copies only the selected range as a fenced code block', async () => {
    const document = await vscode.workspace.openTextDocument(fixtureUri);
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(2, 1));

    await vscode.commands.executeCommand('copy-codeblock.copySelection');

    const clipboardText = await vscode.env.clipboard.readText();
    const expected = [
      '```ts:src/sample.ts:1-3',
      'export function greet(name: string): string {',
      '  return `Hello, ${name}!`;',
      '}',
      '```',
    ].join('\n');

    assert.strictEqual(clipboardText, expected);
  });

  test('copyFile copies the whole file as a fenced code block', async () => {
    await vscode.commands.executeCommand('copy-codeblock.copyFile', fixtureUri);

    const clipboardText = await vscode.env.clipboard.readText();
    const expected = [
      '```ts:src/sample.ts',
      'export function greet(name: string): string {',
      '  return `Hello, ${name}!`;',
      '}',
      '',
      'export function add(a: number, b: number): number {',
      '  return a + b;',
      '}',
      '```',
    ].join('\n');

    assert.strictEqual(clipboardText, expected);
  });

  test('copySelection works for files in deeply nested directories', async () => {
    const nestedUri = vscode.Uri.file(fixturePath('deep', 'nested', 'folder', 'module.ts'));
    const document = await vscode.workspace.openTextDocument(nestedUri);
    const editor = await vscode.window.showTextDocument(document);
    const lineLength = document.lineAt(0).text.length;
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, lineLength));

    await vscode.commands.executeCommand('copy-codeblock.copySelection');

    const clipboardText = await vscode.env.clipboard.readText();
    const expected = ['```ts:deep/nested/folder/module.ts:1', 'export const value = 42;', '```'].join('\n');

    assert.strictEqual(clipboardText, expected);
  });

  test('copySelection omits the exclusive end line when selection ends at column 0', async () => {
    const document = await vscode.workspace.openTextDocument(fixtureUri);
    const editor = await vscode.window.showTextDocument(document);
    // 1–2行目を行選択したときと同じく、終端は3行目先頭
    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(2, 0));

    await vscode.commands.executeCommand('copy-codeblock.copySelection');

    const clipboardText = await vscode.env.clipboard.readText();
    const expected = [
      '```ts:src/sample.ts:1-2',
      'export function greet(name: string): string {',
      '  return `Hello, ${name}!`;',
      '```',
    ].join('\n');

    assert.strictEqual(clipboardText, expected);
  });
});

suite('copyFile across directory depths and file types', () => {
  const cases: Array<{ relativePath: string; lang: string }> = [
    { relativePath: 'src/sample.ts', lang: 'ts' },
    { relativePath: 'src/utils/helper.js', lang: 'js' },
    { relativePath: 'components/Button.tsx', lang: 'tsx' },
    { relativePath: 'scripts/deploy.sh', lang: 'sh' },
    { relativePath: 'tools/format.py', lang: 'py' },
    { relativePath: 'README.md', lang: 'md' },
    { relativePath: 'deep/nested/folder/module.ts', lang: 'ts' },
  ];

  setup(async () => {
    await vscode.env.clipboard.writeText('');
  });

  for (const { relativePath, lang } of cases) {
    test(`copies "${relativePath}" with language "${lang}"`, async () => {
      const absolutePath = fixturePath(...relativePath.split('/'));
      const uri = vscode.Uri.file(absolutePath);

      await vscode.commands.executeCommand('copy-codeblock.copyFile', uri);

      const clipboardText = await vscode.env.clipboard.readText();
      const fileContent = fs.readFileSync(absolutePath, 'utf8').replace(/\n$/, '');
      const expected = [`\`\`\`${lang}:${relativePath}`, fileContent, '```'].join('\n');

      assert.strictEqual(clipboardText, expected);
    });
  }
});
