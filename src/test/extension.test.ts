import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { afterEach } from "mocha";

suite("Insert Debug Log Command Test Suite", () => {
  vscode.window.showInformationMessage(
    "🧪 Starting tests for Insert Debug Log..."
  );
  afterEach(() => {
    setTimeout(() => {}, 1000 * 60);
  });

  test("Inserts console.log below selected variable", async () => {
    // Create a mock file in memory
    const sampleCode = `
function greet() {
  const name = "Anmol";
  return name;
}
`;

    const document = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: sampleCode,
    });

    const editor = await vscode.window.showTextDocument(document);

    // Select the word 'name' (simulate user selection)
    const line = 2; // 'const name = "Anmol";'
    const startChar = 8;
    const endChar = 12;
    editor.selection = new vscode.Selection(line, startChar, line, endChar);

    // Execute your extension command
    await vscode.commands.executeCommand("ezlogs.logSelected");

    // Get the updated text
    const updatedText = document.getText();
    const updatedLines = updatedText.split("\n");

    // Verify: there should be a console.log line inserted after the selection line
    const insertedLine = updatedLines[line + 1].trim();

    assert.ok(
      insertedLine.startsWith("console.log"),
      "Expected a console.log statement to be inserted."
    );

    assert.ok(
      insertedLine.includes("name"),
      "Expected the log line to include the selected variable name."
    );
  });

  test("Shows error if no text is selected", async () => {
    const sampleCode = `
function sum(a: number, b: number) {
  return a + b;
}
`;

    const document = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: sampleCode,
    });

    const editor = await vscode.window.showTextDocument(document);

    // No selection, just a cursor position
    editor.selection = new vscode.Selection(1, 0, 1, 0);

    // Mock showErrorMessage
    let errorShown = false;
    const originalShowErrorMessage = vscode.window.showErrorMessage;
    vscode.window.showErrorMessage = async (message: string) => {
      if (message.includes("Please select")) {
        errorShown = true;
      }
      return undefined;
    };

    // Execute the command
    await vscode.commands.executeCommand("ezlogs.logSelected");

    // Restore original
    vscode.window.showErrorMessage = originalShowErrorMessage;

    // Assert that an error message was shown
    assert.ok(errorShown, "Expected an error message for missing selection.");
  });
});
