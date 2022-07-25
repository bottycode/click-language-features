import {
	CompletionItemKind,
	CompletionParams,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { CompletionItem } from "../completion";

export function getItems(document: TextDocument, params: CompletionParams): CompletionItem[] {
	const items: CompletionItem[] = [];
	const line = document.getText({start: {line: params.position.line, character: 0}, end: params.position});

	if (line.match(/^%\s*\w*$/)) {
		items.push(
			{label: "script",  kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "require", kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "desc",    kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "info",    kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "cut",     kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "file",    kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "expect",  kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "expectv", kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "expectx", kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "stdin",   kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "stdout",  kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "stderr",  kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "ignore",  kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "ignorev", kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "ignorex", kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "eot",     kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "eof",     kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
			{label: "include", kind: CompletionItemKind.Interface, data: {languageId: "testie"}},
		);
	}

	const cmdMatch = line.match(/^%\s*(\w+)(\s+\S+)*\s+-$/);
	if (cmdMatch) {
		if (!line.match(/\s-q\s/) && cmdMatch[1].match(/^require$/)) {
			items.push({label: "q", kind: CompletionItemKind.Variable, data: {languageId: "testie"}});
		}
		if (!line.match(/\s-a\s/) && cmdMatch[1].match(/^(expect[vx]?|std(out|err))$/)) {
			items.push({label: "a", kind: CompletionItemKind.Variable, data: {languageId: "testie"}});
		}
		if (!line.match(/\s-d\s/) && cmdMatch[1].match(/^(file|std(out|err)|(expect|ignore)[vx]?)$/)) {
			items.push({label: "d", kind: CompletionItemKind.Variable, data: {languageId: "testie"}});
		}
		if (!line.match(/\s-i\s/) && cmdMatch[1].match(/^(std(out|err)|(expect|ignore)x?)$/)) {
			items.push({label: "i", kind: CompletionItemKind.Variable, data: {languageId: "testie"}});
		}
		if (!line.match(/\s-w\s/) && cmdMatch[1].match(/^(std(out|err)|expectx?)$/)) {
			items.push({label: "w", kind: CompletionItemKind.Variable, data: {languageId: "testie"}});
		}
	}

	if (line.match(/^%\s*file\s+(.*\s+)?\w+$/)) {
		items.push({label: "stdin", kind: CompletionItemKind.File, data: {languageId: "testie"}});
	}
	if (line.match(/^%\s*(expect|ignore)[vx]?\s+(.*\s+)?\w+$/)) {
		items.push(
			{label: "stdout", kind: CompletionItemKind.File, data: {languageId: "testie"}},
			{label: "stderr", kind: CompletionItemKind.File, data: {languageId: "testie"}},
		);
	}

	return items;
}

export function resolveItem(params: CompletionItem): CompletionItem {
	if (params.kind === CompletionItemKind.Interface) {
		if (params.label === "script") {
			params.detail = "%script";
			params.documentation = {
				kind: "markdown",
				value:
					"The shell script (in __sh__ syntax) that controls the test. Testie will run\n" +
					"each command in sequence. Every command in the script must succeed, with\n" +
					"exit status 0, or the test will fail. Use __%file__ sections to define script\n" +
					"input files and __%expect*__ sections to check script output files for expected\n" +
					"values.\n" +
					"\n" +
					"The __%script__ section can contain multiple subtests. To start a new subtest,\n" +
					"execute a command like \"testie_subtest SECTIONNAME\". Testie will report the\n" +
					"offending SECTIONNAME when standard output or error doesn't match an\n" +
					"expected value.\n",
			};
		} else if (params.label === "require") {
			params.detail = "%require [-q]";
			params.documentation = {
				kind: "markdown",
				value:
					"A shell script (in __sh__ syntax) defining prerequisites that must be satisfied\n" +
					"before the test can run. Every command in the script must succeed, with\n" +
					"exit status 0, for the test to run. Standard output and error are not\n" +
					"checked, however. The `-q` flag tells testie not to print an error message\n" +
					"if a requirement fails.\n" +
					"\n" +
					"Testie runs the requirement script before creating any other test files.\n" +
					"For example, contents of __%file__ sections are not available.\n",
			};
		} else if (params.label === "desc") {
			params.detail = "%desc";
			params.documentation = {
				kind: "markdown",
				value:
					"This section is ignored. It is intended for information about the test.\n",
			};
		} else if (params.label === "info") {
			params.detail = "%info";
			params.documentation = {
				kind: "markdown",
				value:
					"A short description of the test. In `--superverbose` mode, the first\n" +
					"paragraph of its contents is printed before the test results.\n",
			};
		} else if (params.label === "cut") {
			params.detail = "%cut";
			params.documentation = {
				kind: "markdown",
				value:
					"This section is ignored. It is intended to comment out obsolete parts of\n" +
					"the test.\n",
			};
		} else if (params.label === "file") {
			params.detail = "%file [-d] [+LENGTH] FILENAME...";
			params.documentation = {
				kind: "markdown",
				value:
					"Create an input file for the script. `FILENAME` can be 'stdin', which sets\n" +
					"the script's standard input. If `LENGTH` is provided, the file data consists\n" +
					"of the `LENGTH` bytes following this line. Otherwise, it consists of the data\n" +
					"up to the next section. The `-d` flag tells testie to delete the\n" +
					"first character of each line in the section; this makes it possible to\n" +
					"include files that have lines that start with __%__.\n",
			};
		} else if (params.label === "expect") {
			params.detail = "%expect [-a] [-d] [-i] [-w] [+LENGTH] FILENAME...";
			params.documentation = {
				kind: "markdown",
				value:
					"An expected output file for the script. Arguments are as for __%expectv__.\n" +
					"\n" +
					"Testie will run the script, then compare the file generated by script\n" +
					"with the provided data. The files are compared line-by-line. Testie\n" +
					"ignores blank lines and trailing whitespace on each line. It also\n" +
					"ignores lines in the script output that match __%ignore__ patterns.\n" +
					"__%expect__ lines can contain Perl regular expressions, enclosed by two\n" +
					"sets of braces; so the __%expect__ line\n" +
					"\n" +
					"```\n" +
					"    foo{{(bar)?}}\n" +
					"```\n" +
					"\n" +
					"matches either 'foo' or 'foobar'.\n" +
					"\n" +
					"Document an __%expect__ line with \"{{?comment}}\" blocks. For example:\n" +
					"\n" +
					"```\n" +
					"    foo                {{? the sort was in the right order}}\n" +
					"```\n" +
					"\n" +
					"Testie ignores whitespace before and after the \"{{?comment}}\" block, and if\n" +
					"the actual output differs from this expected line, it prints the comment in\n" +
					"addition to the line differences.\n" +
					"\n" +
					"The `-a` and `-d` flags may also be used for __%expect__ sections. Also, the\n" +
					"`-i` flag makes any regular expressions case-insensitive (text outside of\n" +
					"regular expressions must match case), and the `-w` flag ignores any\n" +
					"differences in amount of whitespace within a line.\n",
			};
		} else if (params.label === "expectv") {
			params.detail = "%expectv [-a] [-d] [+LENGTH] FILENAME...";
			params.documentation = {
				kind: "markdown",
				value:
					"An expected output file for the script. `FILENAME` can be 'stdout', for\n" +
					"standard output. If `LENGTH` is provided, the file data consists of the\n" +
					"`LENGTH` bytes following this line; otherwise, it consists of the data up to\n" +
					"the next section.\n" +
					"\n" +
					"Testie will run the script, then compare the script's output file with the\n" +
					"provided data. They must match exactly or the test fails.\n" +
					"\n" +
					"The `-a` flag marks this expected output as an alternate. Testie will\n" +
					"compare the script's output file with each provided alternate; the test\n" +
					"succeeds if any of the alternates match. The `-d` flag behaves as in\n" +
					"__%file__.\n",
			};
		} else if (params.label === "expectx") {
			params.detail = "%expectx [-a] [-d] [-i] [-w] [+LENGTH] FILENAME...";
			params.documentation = {
				kind: "markdown",
				value:
					"__%expectx__ is just like __%expect__, except that every line is treated as a\n" +
					"regular expression. The input is parsed for \"{{?comment}}\" blocks, but\n" +
					"other brace pairs are treated according to the normal regular expression\n" +
					"rules.\n",
			};
		} else if (params.label === "stdin") {
			params.detail = "%stdin [+LENGTH]";
			params.documentation = {
				kind: "markdown",
				value:
					"Same as '__%file__ stdin [ARGS]'.\n",
			};
		} else if (params.label === "stdout") {
			params.detail = "%stdout [-a] [-d] [-i] [-w] [+LENGTH]";
			params.documentation = {
				kind: "markdown",
				value:
					"Same as '__%expect__ stdout'.\n",
			};
		} else if (params.label === "stderr") {
			params.detail = "%stderr [-a] [-d] [-i] [-w] [+LENGTH]";
			params.documentation = {
				kind: "markdown",
				value:
					"Same as '__%expect__ stderr'.\n",
			};
		} else if (params.label === "ignore") {
			params.detail = "%ignore [-d] [-i] [+LENGTH] [FILENAME]";
			params.documentation = {
				kind: "markdown",
				value:
					"Like '__%ignorex__', but '__%ignore__' parses regular expressions only inside\n" +
					"double braces (\"{{ }}\").\n",
			};
		} else if (params.label === "ignorev") {
			params.detail = "%ignorev [-d] [+LENGTH] [FILENAME]";
			params.documentation = {
				kind: "markdown",
				value:
					"Like '__%ignorex__', but '__%ignorev__' lines must match exactly.\n",
			};
		} else if (params.label === "ignorex") {
			params.detail = "%ignorex [-d] [-i] [+LENGTH] [FILENAME]";
			params.documentation = {
				kind: "markdown",
				value:
					"Each line in the __%ignorex__ section is a Perl regular expression. Lines in\n" +
					"the supplied `FILENAME` that match any of those regular expressions will not\n" +
					"be considered when comparing files with __%expect__ data. The regular\n" +
					"expression must match the whole line. `FILENAME` may be 'all', in which case\n" +
					"the regular expressions will apply to all __%expect__ files. \"{{?comment}}\"\n" +
					"blocks are ignored.\n",
			};
		} else if (params.label === "eot") {
			params.detail = "%eot";
			params.documentation = {
				kind: "markdown",
				value:
					"Marks the end of the current test. The rest of the file will be parsed for\n" +
					"additional tests.\n",
			};
		} else if (params.label === "eof") {
			params.detail = "%eof";
			params.documentation = {
				kind: "markdown",
				value:
					"The rest of the file is ignored.\n",
			};
		} else if (params.label === "include") {
			params.detail = "%include FILENAME";
			params.documentation = {
				kind: "markdown",
				value:
					"Interpolate the contents of another testie file.\n",
			};
		}
	} else if (params.kind === CompletionItemKind.Variable) {
		if (params.label === "q") {
			params.documentation = {
				kind: "markdown",
				value:
					"The `-q` flag tells testie not to print an error message\n" +
					"if a requirement fails.\n",
			};
		} else if (params.label === "a") {
			params.documentation = {
				kind: "markdown",
				value:
					"The `-a` flag marks this expected output as an alternate. Testie will\n" +
					"compare the script's output file with each provided alternate; the test\n" +
					"succeeds if any of the alternates match.\n",
			};
		} else if (params.label === "d") {
			params.documentation = {
				kind: "markdown",
				value:
					"The `-d` flag tells testie to delete the\n" +
					"first character of each line in the section; this makes it possible to\n" +
					"include files that have lines that start with __%__.\n",
			};
		} else if (params.label === "i") {
			params.documentation = {
				kind: "markdown",
				value:
					"The `-i` flag makes any regular expressions case-insensitive (text outside of\n" +
					"regular expressions must match case)\n",
			};
		} else if (params.label === "w") {
			params.documentation = {
				kind: "markdown",
				value:
					"The `-w` flag ignores any\n" +
					"differences in amount of whitespace within a line.\n",
			};
		}
	} else if (params.kind === CompletionItemKind.File) {
		if (params.label === "stdin") {
			params.documentation = {
				kind: "markdown",
				value:
					"Standard input.\n",
			};
		} else if (params.label === "stdout") {
			params.documentation = {
				kind: "markdown",
				value:
					"Standard output.\n",
			};
		} else if (params.label === "stderr") {
			params.documentation = {
				kind: "markdown",
				value:
					"Standard error.\n",
			};
		}
	}

	return params;
}