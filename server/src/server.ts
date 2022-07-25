import * as LSP from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import {
	onDidOpen,
	onDidClose,
	onDidChangeContent,
	onWillSave,
	onDidSave,
} from "./handlers/textDocument";

import {
	onSemanticTokensRequestRange,
	onSemanticTokensRequestFull,
	onSemanticTokensRequestDelta,
} from "./handlers/semanticTokens";

let clientInfo: LSP.InitializeParams;
let serverInfo: LSP.InitializeResult;

export default class ClickServer {
	private readonly connection;
	private readonly documents;

	constructor() {
		// Create a connection for the server, using Node's IPC as a transport.
		// Also include all preview / proposed LSP features.
		this.connection = LSP.createConnection(LSP.ProposedFeatures.all);

		// Create a simple text document manager.
		this.documents = new LSP.TextDocuments(TextDocument);

		this.connection.onInitialize((params: LSP.InitializeParams) => {
			clientInfo = params;
			serverInfo = {
				serverInfo: {
					name: "Click Language Server",
					version: "1.0.0",
				},
				capabilities: this.setServerCapabilities(clientInfo.capabilities)
			};
			return serverInfo;
		});

		// Register handlers
		this.connection.onInitialized(() => {

			this.documents.onDidOpen(onDidOpen.bind(this));
			this.documents.onDidClose(onDidClose.bind(this));
			this.documents.onDidChangeContent(onDidChangeContent.bind(this));
			this.documents.onWillSave(onWillSave.bind(this));
			this.documents.onDidSave(onDidSave.bind(this));

			if (serverInfo.capabilities.semanticTokensProvider?.range) {
				this.connection.languages.semanticTokens.onRange(onSemanticTokensRequestRange);
			}
			if (serverInfo.capabilities.semanticTokensProvider?.full) {
				this.connection.languages.semanticTokens.on(onSemanticTokensRequestFull);
				if (serverInfo.capabilities.semanticTokensProvider.full !== true && serverInfo.capabilities.semanticTokensProvider.full.delta) {
					this.connection.languages.semanticTokens.onDelta(onSemanticTokensRequestDelta);
				}
			}
		});
	}

	public listen() {
		// Make the text document manager listen on the connection
		// for open, change and close text document events
		this.documents.listen(this.connection);

		// Listen on the connection
		this.connection.listen();
	}

	private setServerCapabilities(clientCapabilities: LSP.ClientCapabilities) {
		const serverCapabilities: LSP.ServerCapabilities = {};

		// Text Document
		serverCapabilities.textDocumentSync = {
			openClose: true,
			change: LSP.TextDocumentSyncKind.Incremental,
			willSave: true,
			save: true,
		};

		// Semantic Tokens
		if (clientCapabilities.textDocument?.semanticTokens) {
			serverCapabilities.semanticTokensProvider = {
				legend: {
					tokenTypes: clientCapabilities.textDocument.semanticTokens.tokenTypes,
					tokenModifiers: clientCapabilities.textDocument.semanticTokens.tokenModifiers,
				},
				range: clientCapabilities.textDocument.semanticTokens.requests.range,
				full: clientCapabilities.textDocument.semanticTokens.requests.full,
			};
		}

		return serverCapabilities;
	}
}