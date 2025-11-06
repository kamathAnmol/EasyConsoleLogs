import * as vscode from "vscode";
import * as path from "path";

export async function getCurrentSymbol(
  editor: vscode.TextEditor
): Promise<vscode.DocumentSymbol | null> {
  const position = editor.selection.active;

  // Get all document symbols for the current file
  const symbols =
    (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
      "vscode.executeDocumentSymbolProvider",
      editor.document.uri
    )) || [];

  // Recursive search for innermost symbol
  function findSymbol(
    symbols: vscode.DocumentSymbol[]
  ): vscode.DocumentSymbol | null {
    for (const symbol of symbols) {
      if (symbol.range.contains(position)) {
        // Check deeper symbols first
        const inner = findSymbol(symbol.children);
        return inner || symbol;
      }
    }
    return null;
  }

  return findSymbol(symbols);
}

const logSelectedHandler = async () => {
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

  // Find the nearest symbol using VS Code API
  const currentSymbol = await getCurrentSymbol(editor);

  const splitPath = filePath.split(path.sep);
  const fileName = `${splitPath[splitPath.length - 2]}/${
    splitPath[splitPath.length - 1]
  }`;

  const logLine = `console.log("👾 ${repoName} :: ${fileName} :: ${
    currentSymbol?.name || "unknown symbol"
  } :: ${position.line + 1} :: ${textToAdd}:", ${textToAdd});`;

  // Insert log line below current line
  await editor.edit((editBuilder) => {
    const line = (currentSymbol?.range?.end?.line || position.line) + 1;
    const newPosition = new vscode.Position(line, 0);
    editBuilder.insert(newPosition, `${logLine}\n`);
  });
};

export default logSelectedHandler;
