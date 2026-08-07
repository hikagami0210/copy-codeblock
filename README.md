# Copy as Fenced Code Block

Copy selected code or an entire file to the clipboard as a fenced Markdown code block, with the file path in the fence header — ready to paste into chat, docs, or issues.

Selection (with line range):

````
```ts:src/utils/helper.ts:1-3
export function helper() {
  // ...
}
```
````

Whole file:

````
```ts:src/utils/helper.ts
export function helper() {
  // ...
}
```
````

## Features

- **Select code in the editor, right-click → "Copy as Code Block"**
  Copies only the selected text, fenced with the language, the file's path relative to the workspace, and the 1-based line range (e.g. `:1-3`, or `:5` for a single line).
- **Right-click a tab's filename → "Copy File as Code Block"**
  Copies the entire file's contents, fenced with language and path (no line range).

Both commands work identically in VS Code and Cursor.

## Requirements

None.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
