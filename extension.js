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
     async function () {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user

    try {
      const editor = vscode.window.activeTextEditor;
      function tryToInsert(lineNumberToCheck) {
        if (typeof lineNumberToCheck === "number" && lineNumberToCheck >= 0) {
          const activeLine = editor.document.lineAt(lineNumberToCheck);
          const activeText = activeLine.text;
          const hasDescribe = activeText.match(/^\s*describe\(/);
          const hasDescribeOnly = activeText.match(/^\s*describe\.only\(/);
          const hasIt = activeText.match(/^\s*it\(/);
          const hasItOnly = activeText.match(/^\s*it\.only\(/);
          if (hasIt || hasItOnly || hasDescribe) {
            editor.edit((editBuilder) => {
              const fromIt = "it(";
              const toIt = "it.only(";
              const fromDesc = "describe(";
              const toDesc = "describe.only(";

              // first remove other onlys
              removeOnlyHandler(editBuilder);
              if (hasItOnly || hasDescribeOnly) {
                // will have been removed along with others
                return;
              }
                let newLine;
                if (hasIt) newLine = activeText.replace(fromIt, toIt);
                if (hasDescribe) newLine = activeText.replace(fromDesc, toDesc);
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
          vscode.window.showWarningMessage("No it or describe statements were found!");
        }
      }
      const startingLine = editor.selection.active.line;
      tryToInsert(startingLine);
    } catch (error) {
      console.error("error:", error);
      vscode.window.showWarningMessage("No it or describe statements were found!");
    }
  }
  );

  context.subscriptions.push(addOnlyCommand);

  const removeOnly = vscode.commands.registerCommand(
    "test-only.removeOnly",
    () => removeOnlyHandler()
  );
  context.subscriptions.push(removeOnly);
}

async function removeOnlyHandler(_editBuilder) {
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
      const hasDescribeOnly = activeText.includes("describe.only(");

      if (hasItOnly || hasDescribeOnly) {
        linesToEdit.push(lineNumber);
      }
    }
    if (linesToEdit.length) {
      const cleanOnly = (editBuilder) => {
        linesToEdit.forEach((lineNumber) => {
          const activeLine = editor.document.lineAt(lineNumber);
          const activeText = activeLine.text;
          let newLine;
          if (hasItOnly) newLine = activeText.replace("it.only(", "it(");
          if (hasDescribeOnly) newLine = activeText.replace("describe.only(", "describe(");
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
      };
      if (_editBuilder) {
        cleanOnly(_editBuilder);
      } else {
        editor.edit(cleanOnly);
      }
    }
  } catch (error) {
    console.error("error:", error);
    vscode.window.showWarningMessage("Error removing onlys!");
  }
}
// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
