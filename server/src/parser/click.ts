import { TextDocument } from "vscode-languageserver-textdocument";
import Parser = require("tree-sitter");
import Language = require("tree-sitter-click");

export { Tree } from "tree-sitter";

const parser = new Parser();
parser.setLanguage(Language);

export function parse(document: TextDocument) {
	return parser.parse(document.getText());
}
