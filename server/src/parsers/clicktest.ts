import { Range, TextDocument } from 'vscode-languageserver-textdocument';

enum CommandType {
	SCRIPT,
	REQUIRE,
	INFO,
	DESC,
	CUT,
	STDIN,
	FILE,
	STDOUT,
	STDERR,
	EXPECT,
	EXPECTX,
	EXPECTV,
	IGNORE,
	IGNOREV,
	IGNOREX,
	INCLUDE,
}

interface Argument {
	argument: string;
	value: string | null;
}

interface Command {
	command: CommandType;
	arguments: Argument[];
}

interface Section {
	command: Range;
	content: Range;
}

interface File {
	document: TextDocument;
	sections: Section[];
}

class Parser {
	private readonly files;

	constructor() {
		this.files = new Map<string, File>();
	}

	public open(document: TextDocument) {
		let file = this.files.get(document.uri);

		if (file !== undefined) {
			return;
		}

		file = {document: document, sections: []};
		this.files.set(document.uri, file);
	}

	public update(document: TextDocument) {
		const file = this.files.get(document.uri);

		if (file === undefined) {
			return this.open(document);
		}

		this.parse(file);
	}

	public close(document: TextDocument) {
		const file = this.files.get(document.uri);

		if (file === undefined) {
			return;
		}

		this.files.delete(document.uri);
	}

	public getFile(uri: string) {
		return this.files.get(uri);
	}

	private parse(file: File) {
		let offset = 0;
		file.document.getText().split(/(?<=\n)(?=%)/).forEach((text) => {
			if (text.charAt(0) === '%') {
				const command = text.split(/(?<=\n)/, 1)[0];
				file.sections.push({
					command: {
						start: file.document.positionAt(offset),
						end: file.document.positionAt(offset + command.length),
					},
					content: {
						start: file.document.positionAt(offset + command.length + 1),
						end: file.document.positionAt(offset + text.length),
					}
				});
			}
			offset += text.length;
		});
	}
}

const parser = new Parser();
export default parser;