import {
	CompletionOptions,
	createConnection,
	InitializeParams,
	InitializeResult,
	ProposedFeatures,
	SemanticTokensOptions,
	TextDocuments,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

import Parser from "./parser";
import CompletionProvider from "./completion";
import SemanticTokensProvider from './semanticTokens';

class ClickLanguageServer {
	private readonly connection = createConnection(ProposedFeatures.all);
	private readonly documents = new TextDocuments(TextDocument);
	private readonly serverInfo: InitializeResult = {
		serverInfo: {
			name: "Click Language Server",
			version: process.env.npm_package_version,
		},
		capabilities: {},
	};
	private readonly parser = new Parser();
	private completionProvider?: CompletionProvider;
	private semanticTokensProvider?: SemanticTokensProvider;

	constructor() {
		this.documents.onDidOpen(event => this.parser.open(event.document));
		this.documents.onDidChangeContent(event => this.parser.update(event.document));
		this.documents.onDidClose(event => this.parser.close(event.document));

		this.connection.onInitialize((params: InitializeParams): InitializeResult => {
			if (params.capabilities.textDocument?.completion) {
				const capabilities = params.capabilities.textDocument.completion;
				const handlers = this.connection;
				const options: CompletionOptions = {
					resolveProvider: true,
					triggerCharacters: [ "%", "-" ],
				};

				this.completionProvider = new CompletionProvider(this.documents);

				handlers.onCompletion(this.completionProvider.onCompletion);
				handlers.onCompletionResolve(this.completionProvider.onCompletionResolve);

				this.serverInfo.capabilities.completionProvider = options;
			}

			if (params.capabilities?.textDocument?.semanticTokens) {
				const capabilities = params.capabilities.textDocument.semanticTokens;
				const handlers = this.connection.languages.semanticTokens;
				const options: SemanticTokensOptions = {
					legend: {
						tokenTypes: capabilities.tokenTypes,
						tokenModifiers: capabilities.tokenModifiers,
					}
				};

				this.semanticTokensProvider = new SemanticTokensProvider(this.parser, options.legend);

				if (capabilities.requests.range) {
					options.range = capabilities.requests.range;
					handlers.onRange(this.semanticTokensProvider.onRange);
				}
				if (capabilities.requests.full) {
					options.full = capabilities.requests.full;
					handlers.on(this.semanticTokensProvider.onFull);
					if (capabilities.requests.full !== true && capabilities.requests.full.delta) {
						handlers.onDelta(this.semanticTokensProvider.onDelta);
					}
				}

				this.serverInfo.capabilities.semanticTokensProvider = options;
			}

			return this.serverInfo;
		});
	}

	public listen() {
		this.documents.listen(this.connection);
		this.connection.listen();
	}
}

const server = new ClickLanguageServer();
server.listen();
