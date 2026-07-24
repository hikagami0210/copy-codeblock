# Copy Code Block

Copy selected code or an entire file to the clipboard as a fenced Markdown code block, with the file path in the fence header — ready to paste into chat, docs, or issues.

````
```ts:src/utils/helper.ts
export function helper() {
  // ...
}
```
````

## Features

- **Select code in the editor, right-click → "Copy as Code Block"**
  Copies only the selected text, fenced with the language and the file's path relative to the workspace.
- **Right-click a tab's filename → "Copy File as Code Block"**
  Copies the entire file's contents, fenced the same way.

Both commands work identically in VS Code and Cursor.

## Requirements

None.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT
