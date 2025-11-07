import * as vscode from "vscode";

export default async function deleteCurrentFileLogs() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found!");
    return;
  }

  const document = editor.document;

  const logPattern =
    /^\s*console\.log\(\s*"👾[^"]*?::[^"]*?::[^"]*?::[^"]*?::[^"]*?:",[\s\S]*?\);?\s*$/gm;

  const text = document.getText();
  const newText = text.replace(logPattern, "");

  // Check if any logs were removed
  if (text === newText) {
    vscode.window.showInformationMessage("No debug logs found to remove.");
    return;
  }

  await editor.edit((editorBuilder) => {
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );
    editorBuilder.replace(fullRange, newText);
  });
}
