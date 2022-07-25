import { TextDocument } from 'vscode-languageserver-textdocument';

export default class Parser {

	constructor(document: TextDocument) {
		console.log("Click Parser:", JSON.stringify(document));
	}
}