import {
	CancellationToken,
	ResultProgressReporter,
	SemanticTokens,
	SemanticTokensDelta,
	SemanticTokensDeltaParams,
	SemanticTokensDeltaPartialResult,
	SemanticTokensParams,
	SemanticTokensPartialResult,
	SemanticTokensRangeParams,
	WorkDoneProgressReporter,
} from 'vscode-languageserver/node';
import clicktestParser from "../parsers/clicktest";

export function onSemanticTokensRequestRange(
	params: SemanticTokensRangeParams,
	token: CancellationToken,
	workDoneProgress: WorkDoneProgressReporter,
	resultProgress?: ResultProgressReporter<SemanticTokensPartialResult> | undefined
) {
	const result: SemanticTokens = {
		data: []
	};

	return result;
}

export function onSemanticTokensRequestFull(
	params: SemanticTokensParams,
	token: CancellationToken,
	workDoneProgress: WorkDoneProgressReporter,
	resultProgress?: ResultProgressReporter<SemanticTokensPartialResult> | undefined
): SemanticTokens {
	const result: SemanticTokens = {
		data: []
	};
	const file = clicktestParser.getFile(params.textDocument.uri);

	if (file === undefined) {
		return result;
	}

	let lastLine = 0;
	file.sections.forEach((section) => {
		result.data.push(section.command.start.line - lastLine);
		result.data.push(section.command.start.character);
		result.data.push(file.document.offsetAt(section.command.end) - file.document.offsetAt(section.command.start));
		result.data.push(0, 0);
		lastLine = section.command.start.line;
	});

	return result;
}

export function onSemanticTokensRequestDelta(
	params: SemanticTokensDeltaParams,
	token: CancellationToken,
	workDoneProgress: WorkDoneProgressReporter,
	resultProgress?: ResultProgressReporter<SemanticTokensDeltaPartialResult> | undefined
): SemanticTokensDelta | SemanticTokens {
	const result: SemanticTokens = {
		data: []
	};
	console.log("onSemanticTokensRequestDelta:", JSON.stringify(params, undefined, '\t'));
	return result;
}