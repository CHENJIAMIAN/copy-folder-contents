import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const defaultExtensions = ".vue, .js, .jsx, .ts";

  let copyFolderContents1Command = vscode.commands.registerCommand(
    "extension.copyFolderContents1",
    () => {
      const options: vscode.QuickPickOptions = {
        canPickMany: false,
        placeHolder: vscode.l10n.t("placeholder"),
      };
      vscode.window.showInputBox(options).then((extensions) => {
        if (extensions === undefined) {
          // 用户取消输入，进行相应处理
          return;
        }
        if (extensions.trim() === "") {
          // 用户没有输入扩展名，使用默认值
          extensions = defaultExtensions;
        }
        if (extensions) {
          vscode.window
            .showOpenDialog({
              canSelectFiles: false,
              canSelectFolders: true,
              canSelectMany: false,
              openLabel: "Copy",
            })
            .then((folders) => {
              if (folders && folders.length > 0) {
                const folderPath = folders[0].fsPath;
                const files = getFilesInFolder(folderPath);
                console.log("files", files);
                const filteredFiles = filterFilesByExtensions(
                  files,
                  extensions!
                );
                console.log("filteredFiles", filteredFiles);
                const filteredFiles2 = filterFilesByExcludedItems(
                  filteredFiles,
                  ".test."
                );
                console.log("filteredFiles2", filteredFiles2);
                const copiedContent = generateCopiedContent(
                  folderPath,
                  filteredFiles2
                );
                console.log("copiedContent", copiedContent);
                vscode.env.clipboard.writeText(copiedContent).then(
                  () => {
                    vscode.window.showInformationMessage(
                      vscode.l10n.t("copySuccess") + copiedContent.slice(0, 50)
                    );
                  },
                  (error) => {
                    vscode.window.showErrorMessage(
                      vscode.l10n.t("copyError") + `${error}`
                    );
                  }
                );
              }
            });
        }
      });
    }
  );

  const copyFolderContents2Command = vscode.commands.registerCommand(
    "extension.copyFolderContents2",
    (uri: vscode.Uri) => {
      if (!uri.fsPath) {
        vscode.window.showErrorMessage(vscode.l10n.t("errorMessage"));
        return;
      }

      const folderPath = uri.fsPath;
      const files = getFilesInFolder(folderPath);
      console.log("files", files);

      const options: vscode.QuickPickOptions = {
        canPickMany: false,
        placeHolder: vscode.l10n.t("placeholder"),
      };

      vscode.window.showInputBox(options).then((extensions) => {
        if (extensions === undefined) {
          return;
        }

        if (extensions.trim() === "") {
          extensions = defaultExtensions;
        }

        const filteredFiles = filterFilesByExtensions(files, extensions!);
        console.log("filteredFiles", filteredFiles);
        const filteredFiles2 = filterFilesByExcludedItems(
          filteredFiles,
          ".test."
        );
        console.log("filteredFiles2", filteredFiles2);
        const copiedContent = generateCopiedContent(folderPath, filteredFiles2);
        console.log("copiedContent", copiedContent);

        vscode.env.clipboard.writeText(copiedContent).then(
          () => {
            vscode.window.showInformationMessage(
              vscode.l10n.t("copiedMessage") + copiedContent.slice(0, 50)
            );
          },
          (error) => {
            vscode.window.showErrorMessage(
              vscode.l10n.t("failedMessage") + `${error}`
            );
          }
        );
      });
    }
  );

  context.subscriptions.push(copyFolderContents1Command);
  context.subscriptions.push(copyFolderContents2Command);
}

function getFilesInFolder(folderPath: string): string[] {
  let files: string[] = [];
  const items = fs.readdirSync(folderPath);
  items.forEach((item) => {
    const filePath = path.join(folderPath, item);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      files.push(filePath);
    } else if (stat.isDirectory()) {
      const subFiles = getFilesInFolder(filePath);
      files = files.concat(subFiles);
    }
  });
  return files;
}

function filterFilesByExtensions(
  files: string[],
  extensions: string
): string[] {
  const extensionList = extensions.split(",").map((ext) => ext.trim());
  return files.filter((file) => {
    const fileExt = path.extname(file).toLowerCase();
    return extensionList.includes(fileExt);
  });
}

function filterFilesByExcludedItems(
  files: string[],
  excludedItems: string
): string[] {
  const excludedExtensions = excludedItems.split(",");

  return files.filter((file) => {
    return !excludedExtensions.some((item) => file.includes(item));
  });
}

function generateCopiedContent(folderPath: string, files: string[]): string {
  let copiedContent = "";
  files.forEach((file) => {
    const relativePath = path.relative(folderPath, file);
    const fileContent = fs.readFileSync(file, "utf8");
    copiedContent += `${relativePath}:\n\`\`\`\n${fileContent}\n\`\`\`\n\n\n`;
  });
  return copiedContent.trim();
}

export function deactivate() {}
