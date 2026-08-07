import * as vscode from 'vscode';

// VSCode の languageId は Markdown のコードブロック言語識別子と一致しないものがあるため変換する
const LANGUAGE_ID_TO_MARKDOWN_LANG: Record<string, string> = {
  typescript: 'ts',
  typescriptreact: 'tsx',
  javascript: 'js',
  javascriptreact: 'jsx',
  python: 'py',
  shellscript: 'sh',
  csharp: 'cs',
  markdown: 'md',
  yaml: 'yml',
  dockercompose: 'yml',
  plaintext: 'text',
};

function toMarkdownLang(languageId: string): string {
  return LANGUAGE_ID_TO_MARKDOWN_LANG[languageId] ?? languageId;
}

function getSelectionLineRange(selection: vscode.Selection): { start: number; end: number } {
  const start = selection.start.line + 1;
  // 行末まで選択すると end が次の行の先頭 (character === 0) になるため、その行は含めない
  const end =
    selection.end.character === 0 && selection.end.line > selection.start.line
      ? selection.end.line
      : selection.end.line + 1;
  return { start, end };
}

function formatLocation(filePath: string, lineRange?: { start: number; end: number }): string {
  if (!lineRange) {
    return filePath;
  }
  if (lineRange.start === lineRange.end) {
    return `${filePath}:${lineRange.start}`;
  }
  return `${filePath}:${lineRange.start}-${lineRange.end}`;
}

function buildCodeBlock(
  lang: string,
  filePath: string,
  code: string,
  lineRange?: { start: number; end: number },
): string {
  const fence = '```';
  const trimmedCode = code.replace(/\n$/, '');
  const location = formatLocation(filePath, lineRange);
  return `${fence}${lang}:${location}\n${trimmedCode}\n${fence}`;
}

async function copySelection(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { document, selection } = editor;
  const code = document.getText(selection);
  if (!code) {
    return;
  }

  const lang = toMarkdownLang(document.languageId);
  const filePath = vscode.workspace.asRelativePath(document.uri, false);
  const lineRange = getSelectionLineRange(selection);
  const block = buildCodeBlock(lang, filePath, code, lineRange);

  await vscode.env.clipboard.writeText(block);
  vscode.window.showInformationMessage('Copied selection as code block');
}

async function copyFile(uri?: vscode.Uri): Promise<void> {
  const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;
  if (!targetUri) {
    return;
  }

  const document = await vscode.workspace.openTextDocument(targetUri);
  const code = document.getText();
  const lang = toMarkdownLang(document.languageId);
  const filePath = vscode.workspace.asRelativePath(document.uri, false);
  const block = buildCodeBlock(lang, filePath, code);

  await vscode.env.clipboard.writeText(block);
  vscode.window.showInformationMessage('Copied file as code block');
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('copy-codeblock.copySelection', copySelection),
    vscode.commands.registerCommand('copy-codeblock.copyFile', copyFile),
  );
}

export function deactivate(): void {}
