import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const logSelected = vscode.commands.registerCommand(
    "easyconsolelogs.logSelected",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
      }

      const document = editor.document;
      const selection = editor.selection;

      // Get the selected text
      const textToAdd = document.getText(selection).trim();
      if (!textToAdd) {
        vscode.window.showErrorMessage(
          "Please select a variable or expression to log."
        );
        return;
      }
      const position = selection.active;
      const repoName = vscode.workspace.name || "UnknownRepo";
      const filePath = document.fileName;
      const fileContent = document.getText();

      // Find the nearest symbol (function, const, class, etc.)
      const symbol = findNearestSymbol(fileContent, position.line + 1);

      const splitPath = filePath.split(path.sep);
      const fileName = `${splitPath[splitPath.length - 2]}/${
        splitPath[splitPath.length - 1]
      }`;

      const logLine = `console.log("👾 ${repoName} :: ${fileName} :: ${symbol} :: ${
        position.line + 1
      } :: ${textToAdd}:", ${textToAdd});`;

      // Insert log line below current line
      await editor.edit((editBuilder) => {
        const newPosition = new vscode.Position(position.line + 1, 0);
        editBuilder.insert(newPosition, `\n${logLine}`);
      });

      vscode.window.showInformationMessage(`Inserted log for "${textToAdd}"`);
    }
  );

  const deleteSingleFileV2 = vscode.commands.registerCommand(
    "easyconsolelogs.deleteSingleFileLog",
    async () => {
      console.log("Called inside the delete single file log");
      
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
      }
      const document = editor.document;
      let allText = document.getText()
      const logPattern = /console\.log\(\s*"👾.*",\s*.*\s*\);?\n?/g;
      allText = allText.replaceAll(logPattern,'')
      
      await editor.edit((editBuilder)=>{
        editBuilder.replace(new vscode.Range(document.positionAt(0),document.positionAt(document.getText().length)),allText)
      })
      vscode.window.showInformationMessage(`Matched Log "${allText}"`);
      
    }
  );

  const deleteSingleFile = vscode.commands.registerCommand(
  "easyconsolelogs.deleteSingleFileLog",
  async () => {
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
      vscode.window.showInformationMessage("No matching console.log statements found");
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
    
    vscode.window.showInformationMessage(
      `Deleted ${linesToDelete.length} console.log statement(s)`
    );
  }
);


  const logIdentifier = vscode.commands.registerCommand(
    "easyconsolelogs.setLogIdentifier",
    async () => {
      const identifier = vscode.window.showInputBox({
        prompt: "Select Log identifier (default 👾)",
        placeHolder: "Type your identifier and press enter",
        validateInput: (value) => {
          if (!value.trim()) {
            return "Identifier cannot be empty";
          }
          if (value.length > 10) {
            return "Identifier cannot be greater than 10";
          }
          return null;
        },
      });
    }
  );

  context.subscriptions.push(logSelected,deleteSingleFile);
}

/**
 * Find the nearest function, const, or class name above a given line number
 */
function findNearestSymbol(fileContent: string, lineNumber: number): string {
  const lines = fileContent.split("\n");
  for (let i = lineNumber - 1; i >= 0; i--) {
    const lineText = lines[i].trim();
    const match = lineText.match(/(?:function|class|const|let|var)\s+(\w+)/);
    if (match) {
      return match[1];
    }
  }
  return "UnknownSymbol";
}

export function deactivate() {}
