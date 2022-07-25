import {
	CompletionItem as _CompletionItem,
	CompletionList,
	CompletionParams,
	RequestHandler,
	ResponseError,
	ServerRequestHandler,
	TextDocuments,
} from "vscode-languageserver/node";

import { getItems as clickGetItems, resolveItem as clickResolveItem } from "./click";
import { getItems as testieGetItems, resolveItem as testieResolveItem } from "./testie";
import Parser, { ClickTree, TestieTree} from "../parser";
import { TextDocument } from 'vscode-languageserver-textdocument';

export interface CompletionItemData {
	languageId: string;
}

export interface CompletionItem extends _CompletionItem {
	data?: CompletionItemData;
}

type CompletionHandler = ServerRequestHandler<CompletionParams, CompletionItem[] | CompletionList | undefined | null, CompletionItem[], void>;
type CompletionResolveHandler = RequestHandler<CompletionItem, CompletionItem, void>;

export default class Provider {
	private readonly documents: TextDocuments<TextDocument>;

	constructor(documents: TextDocuments<TextDocument>) {
		this.documents = documents;
	}

	public onCompletion: CompletionHandler = (params, token, workDoneProgress, resultProgress?) => {
		const items: CompletionItem[] = [];
		const document = this.documents.get(params.textDocument.uri);
		if (!document)
			return new ResponseError<void>(-1, "Document not found.");

		if (document.languageId === "click")
			items.push(...clickGetItems(document, params));
		if (document.languageId === "testie")
			items.push(...testieGetItems(document, params));

		return items;
	};

	public onCompletionResolve: CompletionResolveHandler = (params, token) => {
		if (params.data?.languageId === "click")
			return clickResolveItem(params);
		if (params.data?.languageId === "testie")
			return testieResolveItem(params);
		return params;
	};
}
