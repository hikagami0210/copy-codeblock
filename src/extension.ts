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

function buildCodeBlock(lang: string, filePath: string, code: string): string {
  const fence = '```';
  const trimmedCode = code.replace(/\n$/, '');
  return `${fence}${lang}:${filePath}\n${trimmedCode}\n${fence}`;
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
  const block = buildCodeBlock(lang, filePath, code);

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
