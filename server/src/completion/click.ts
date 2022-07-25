import {
	CompletionItemKind,
	CompletionParams,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { CompletionItem, CompletionItemData } from "../completion";

export function getItems(document: TextDocument, params: CompletionParams): CompletionItem[] {
	return [];
}

export function resolveItem(params: CompletionItem): CompletionItem {
	return params;
}