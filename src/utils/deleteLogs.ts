import * as vscode from "vscode";

export default async function deleteCurrentFileLogs() {
  console.log("Called inside the delete single file log");

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found!");
    return;
  }
  const document = editor.document;

  const logPattern = /console\.log\(\s*"👾.*",\s*.*\s*\);?\s*$/;
  const linesToDelete: number[] = [];

  // Find all matching lines
  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (logPattern.test(line.text)) {
      linesToDelete.push(i);
    }
  }

  if (linesToDelete.length === 0) {
    vscode.window.showInformationMessage(
      "No matching console.log statements found"
    );
    return;
  }

  // Delete lines in reverse order to maintain line indices
  await editor.edit((editBuilder) => {
    for (let i = linesToDelete.length - 1; i >= 0; i--) {
      const lineNumber = linesToDelete[i];
      const line = document.lineAt(lineNumber);
      editBuilder.delete(line.rangeIncludingLineBreak);
    }
  });
}
