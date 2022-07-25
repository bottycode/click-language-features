import { TextDocument } from 'vscode-languageserver-textdocument';

import { parse as parseClick, Tree as ClickTree } from "./click";
import { parse as parseTestie, Tree as TestieTree } from "./testie";

export { ClickTree, TestieTree };

interface File {
	document: TextDocument;
	tree?: ClickTree | TestieTree;
}

export default class Parser {
	private readonly files: Map<string, File>;

	constructor() {
		// TODO: serialize
		this.files = new Map<string, File>();
	}

	public open(document: TextDocument) {
		this.files.set(document.uri, {document: document});
	}

	public update(document: TextDocument) {
		const file = this.files.get(document.uri);

		if (!file)
			return this.open(document);

		if (document.languageId === "click")
			file.tree = parseClick(document);

		if (document.languageId === "testie")
			file.tree = parseTestie(document);
	}

	public close(document: TextDocument) {
		// TODO: deserialize
		this.files.delete(document.uri);
	}

	public get(uri: string) {
		return this.files.get(uri);
	}
}
