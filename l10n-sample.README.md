**l10n-sample README**

此文件夹包含一个示例 VS Code 扩展，演示如何本地化扩展。示例展示了用英语和日语显示两个命令：Hello 和 Bye。

VS Code 扩展的源代码的本地化包含 4 个重要部分：

* **package.nls.json** - 用于翻译扩展的 package.json 文件中的静态文本内容的文件
* **vscode.l10n.t** - 用于在扩展源代码中标记需要翻译的字符串的 API
* **@vscode/l10n-dev** - 用于从 vscode 扩展中提取可国际化 (l10n) 字符串，以及处理 XLF 文件的工具
* **@vscode/l10n** -  用于加载翻译内容到扩展的子进程中的库

**package.nls.json**

查看 `package.nls.json` 文件。此文件包含您扩展清单 (package.json) 中静态文本内容的翻译。该文件中的 key 与 package.json 文件中的 key 相同。对应的值即是相应 key 的翻译文本。
 
现在打开 `package.json `文件。您会注意到文件中的键（例如 `extension.sayHello.title`）由 `%s` 包围。

**vscode.l10n.t**

`l10n` 是 VS Code 官方 API 中的一个新命名空间。这是标记一个字符串"需要翻译"的新方法，它替代了原先使用 `vscode-nls` 和 `vscode-nls-dev` 包的方式。

**用法**

在 `extension.ts` 和 `command/sayBye.ts` 中，您会注意到 `vscode.l10n.t()` 的用法。这是您标记字符串为可本地化字符串的方式。本地化字符串将从  `bundle.l10n.<LANG>.`json 文件中提取（如果该文件存在的话）。在本仓库中，我们有一个日语版本的文件。此 API 有三种函数签名：

```
function t(message: string, ...args: Array<string | number>): string;
function t(message: string, args: Record<string, any>): string;
function t(options: { message: string; args?: Array<string | number> | Record<string, any>; comment: string[] }): string;
```

这些字符串支持参数和注释。参数用于替换字符串中的占位符，如  `Hello {0}`  ，其中 `{0}` 是一个占位符，将使用指定索引处的参数或指定 args 对象的 `name` 属性进行填充。注释用于为翻译人员提供上下文。例如，如果您有一个字符串 `Hello {0}`，翻译人员可能不知道 `{0}` 代表什么。因此，您可以提供注释来解释 ` {0}` 的意思。

**扩展清单中的 l10n 属性**

要使此功能工作，您必须在扩展清单中添加以下内容（您可以在此示例扩展中看到）：

```json
{
    // example
    "main": "./out/extension.js",
    // ...
    "l10n": "./l10n"
}
```

这告诉 VS Code 在哪里可以找到您扩展的本地化字符串，应该设置为包含 `bundle.l10n.<LANG>.json` 文件的目录。您可以将 `l10n` 设置为您想要的任何内容，但请注意，它必须是到您扩展的根目录的相对路径。在运行时，该属性将用于为您的扩展加载正确的本地化字符串，因此您需要确保将具有本地化字符串的文件放在正确的位置。

**@vscode/l10n-dev**

这个包用于从您的扩展中提取字符串以及处理 XLF 文件。它是一个可以从命令行运行的 CLI 工具。您可以在其仓库: [invalid URL removed]。但对于本示例，我们只介绍基础知识。

首先，如果您要生成包含示例本地化字符串的 `bundle.l10n.json` 文件，请运行：

```bash
npx @vscode/l10n-dev export -o ./l10n ./src
```

这将在 l10n 文件夹中生成一个 `bundle.l10n.json ` 文件。该文件包含扩展中所有可本地化的字符串。然后您可以为要支持的每种语言创建一个 `bundle.l10n.<LANG> .json` 文件，并添加要翻译的字符串的键值对。

如果您不会另一种语言，但想测试本地化更改，可以使用 `@vscode/l10n-dev` 软件包中内置的伪本地化 (Pseudolocalization) 生成器。试一试：

```bash
npx @vscode/l10n-dev generate-pseudo -o ./l10n/ ./l10n/bundle.l10n.json ./package.nls.json
```

这将创建一个 `package.nls.qps-ploc.json` 文件和一个 `bundle.l10n.qps-ploc.json` 文件。如果您安装了 伪语言包: ([invalid URL removed])，就能将 VS Code 设置为此区域设置，从而从相应的 `qps-ploc` 文件中提取此扩展的字符串。 `qps-ploc` 是 VS Code 使用的伪本地化语言代码。

**进阶**

VS Code 团队与微软的另一团队合作，后者负责处理 XLF 文件并为我们的字符串进行翻译。  因此，我们使用 `@vscode/l10n-dev` 工具将 `bundle.l10n.json` 和  `package.nls.json`  文件转换为 XLF 文件。 如果要生成 XLF 文件，可以运行：

```bash
npx @vscode/l10n-dev generate-xlf -o ./l10n-sample.xlf ./l10n/bundle.l10n.json ./package.nls.json
```

`l10n-dev` 工具还支持将 XLF 文件转换回 `bundle.l10n.json ` 和 `package.nls.json `  文件，但我们不会在这里介绍，因为本示例不需要。

**@vscode/l10n**

在本仓库中，您可以看到有一个 `cli.ts` 文件。此文件使用 `node` 可执行文件直接在扩展外部运行。这是一个简单的示例，演示了如何使用 `@vscode/l10n` 包在子进程内加载扩展的本地化字符串。

那些 `l10n.t` 调用将从传入的文件 uri 中提取字符串... 但是这个包的重要性在于这些  `l10n.t()` 调用也会被我们用于字符串提取的工具提取到，以进行本地化。