import { TextDocumentChangeEvent } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import ClickServer from "../server";
import clicktestParser from "../parsers/clicktest";


export function onDidOpen(
	this: ClickServer,
	event: TextDocumentChangeEvent<TextDocument>
) {
	console.log("\nonDidOpen():");
	if (event.document.languageId === "click") {
		return;
	} else if (event.document.languageId === "clicktest") {
		clicktestParser.open(event.document);
	} else {
		return;
	}
}

export function onDidChangeContent(
	event: TextDocumentChangeEvent<TextDocument>
) {
	console.log("\nonDidChangeContent():");
	if (event.document.languageId === "click") {
		return;
	} else if (event.document.languageId === "clicktest") {
		clicktestParser.update(event.document);
	} else {
		return;
	}
}

export function onWillSave(
	event: TextDocumentChangeEvent<TextDocument>
) {
	console.log("\nonWillSave():");
	if (event.document.languageId === "click") {
		return;
	} else if (event.document.languageId === "clicktest") {
		return;
	} else {
		return;
	}
}

export function onDidSave(
	event: TextDocumentChangeEvent<TextDocument>
) {
	console.log("\nonDidSave():");
	if (event.document.languageId === "click") {
		return;
	} else if (event.document.languageId === "clicktest") {
		return;
	} else {
		return;
	}
}

export function onDidClose(
	event: TextDocumentChangeEvent<TextDocument>
) {
	console.log("\nonDidClose():");
	if (event.document.languageId === "click") {
		return;
	} else if (event.document.languageId === "clicktest") {
		clicktestParser.close(event.document);
	} else {
		return;
	}
}