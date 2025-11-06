import * as vscode from "vscode";
import logSelectedHandler from "./utils/logSelected";
import deleteCurrentFileLogs from "./utils/deleteLogs";

/**
 * Finds the innermost symbol at the current selection/cursor.
 */

export function activate(context: vscode.ExtensionContext) {
  const logSelected = vscode.commands.registerCommand(
    "ezlogs.logSelected",
    logSelectedHandler
  );

  const deleteSingleFile = vscode.commands.registerCommand(
    "ezlogs.deleteSingleFileLog",
    deleteCurrentFileLogs
  );

  const logIdentifier = vscode.commands.registerCommand(
    "ezlogs.setLogIdentifier",
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

  context.subscriptions.push(logSelected, deleteSingleFile);
}

export function deactivate() {}
