// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const addOnlyCommand = vscode.commands.registerCommand(
    "test-only.addOnly",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      try {
        const editor = vscode.window.activeTextEditor;
        function tryToInsert(lineNumberToCheck) {
          if (typeof lineNumberToCheck === "number" && lineNumberToCheck >= 0) {
            const activeLine = editor.document.lineAt(lineNumberToCheck);
            const activeText = activeLine.text;
            const hasIt = activeText.match(/^\s*it\(/);
            const hasItOnly = activeText.match(/^\s*it\.only\(/);
            if (hasIt || hasItOnly) {
              editor.edit((editBuilder) => {
                let from = "it(";
                let to = "it.only(";
                if (hasItOnly) {
                  const tmp = from;
                  from = to;
                  to = tmp;
                }
                const newLine = activeText.replace(from, to);
                const range = new vscode.Range(
                  lineNumberToCheck,
                  0,
                  lineNumberToCheck,
                  activeText.length
                );
                try {
                  editBuilder.replace(range, newLine);
                } catch (error) {
                  console.error("error:", error);
                }
              });
            } else {
              tryToInsert(lineNumberToCheck - 1);
            }
          } else {
            vscode.window.showWarningMessage("No it statement found!");
          }
        }
        const startingLine = editor.selection.active.line;
        tryToInsert(startingLine);
      } catch (error) {
        console.error("error:", error);
        vscode.window.showWarningMessage("No it statement found!");
      }
    }
  );

  context.subscriptions.push(addOnlyCommand);

  const removeOnly = vscode.commands.registerCommand(
    "test-only.removeOnly",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      try {
        const editor = vscode.window.activeTextEditor;

        const linesToEdit = [];
        for (
          let lineNumber = 0;
          lineNumber < editor.document.lineCount;
          lineNumber++
        ) {
          const activeLine = editor.document.lineAt(lineNumber);
          const activeText = activeLine.text;
          const hasItOnly = activeText.includes("it.only(");

          if (hasItOnly) {
            linesToEdit.push(lineNumber);
          }
        }
        if (linesToEdit.length) {
          editor.edit((editBuilder) => {
            linesToEdit.forEach((lineNumber) => {
              const activeLine = editor.document.lineAt(lineNumber);
              const activeText = activeLine.text;
              const newLine = activeText.replace("it.only(", "it(");
              const range = new vscode.Range(
                lineNumber,
                0,
                lineNumber,
                activeText.length
              );
              try {
                editBuilder.replace(range, newLine);
              } catch (error) {
                console.error("error:", error);
              }
            });
          });
        }
      } catch (error) {
        console.error("error:", error);
        vscode.window.showWarningMessage("Error removing onlys!");
      }
    }
  );
  context.subscriptions.push(removeOnly);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
