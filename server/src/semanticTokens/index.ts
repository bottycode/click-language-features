import {
	ResponseError,
	SemanticTokens,
	SemanticTokensBuilder,
	SemanticTokensDelta,
	SemanticTokensDeltaParams,
	SemanticTokensDeltaPartialResult,
	SemanticTokensLegend,
	SemanticTokensParams,
	SemanticTokensPartialResult,
	SemanticTokensRangeParams,
	ServerRequestHandler,
} from 'vscode-languageserver/node';

import { getTokens as clickGetTokens } from "./click";
import { getTokens as testieGetTokens } from "./testie";
import Parser, { ClickTree, TestieTree} from "../parser";

type FullRequestHandler = ServerRequestHandler<SemanticTokensParams, SemanticTokens, SemanticTokensPartialResult, void>;
type DeltaRequestHandler = ServerRequestHandler<SemanticTokensDeltaParams, SemanticTokensDelta | SemanticTokens, SemanticTokensDeltaPartialResult | SemanticTokensDeltaPartialResult, void>;
type RangeRequestHandler = ServerRequestHandler<SemanticTokensRangeParams, SemanticTokens, SemanticTokensPartialResult, void>;

export interface ParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

export default class Provider {
	private readonly parser: Parser;
	private readonly tokenTypes = new Map<string, number>();
	private readonly tokenModifiers = new Map<string, number>();

	constructor(parser: Parser, legend: SemanticTokensLegend) {
		this.parser = parser;
		legend.tokenTypes.forEach((type, index) => this.tokenTypes.set(type, index));
		legend.tokenModifiers.forEach((type, index) => this.tokenModifiers.set(type, index));
	}

	public onFull: FullRequestHandler = (params, token, workDoneProgress, resultProgress?) => {
		let tokens: ParsedToken[] = [];
		const file = this.parser.get(params.textDocument.uri);
		const builder = new SemanticTokensBuilder();
		if (!file)
			return new ResponseError<void>(-1, "File not parsed.");

		if (file.document.languageId === "click")
			tokens = clickGetTokens(file.tree! as ClickTree);
		if (file.document.languageId === "testie")
			tokens = testieGetTokens(file.tree! as TestieTree);

		tokens.forEach(token => builder.push(
			token.line,
			token.startCharacter,
			token.length,
			this.encodeTokenType(token.tokenType),
			this.encodeTokenModifiers(token.tokenModifiers)
		));

		return builder.build();
	};

	public onDelta: DeltaRequestHandler = (params, token, workDoneProgress, resultProgress?) => {
		return this.onFull(params, token, workDoneProgress);
	};

	public onRange: RangeRequestHandler = (params, token, workDoneProgress, resultProgress?) => {
		return this.onFull(params, token, workDoneProgress);
	};

	private encodeTokenType(tokenType: string): number {
		if (this.tokenTypes.has(tokenType)) {
			return this.tokenTypes.get(tokenType)!;
		}
		return this.tokenTypes.size;
	}

	private encodeTokenModifiers(strTokenModifiers: string[]): number {
		let result = 0;
		for (let i = 0; i < strTokenModifiers.length; i++) {
			const tokenModifier = strTokenModifiers[i];
			if (this.tokenModifiers.has(tokenModifier)) {
				result = result | (1 << this.tokenModifiers.get(tokenModifier)!);
			}
		}
		return result;
	}
}