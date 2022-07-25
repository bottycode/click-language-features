import { Node, Tree } from "../parser/testie";
import { ParsedToken } from "../semanticTokens";

export function getTokens(tree: Tree): ParsedToken[] {
	function node2token(node: Node, tokenType: string, tokenModifiers: string[]): ParsedToken {
		return {
			line: node.range.start.line,
			startCharacter: node.range.start.character,
			length: node.length,
			tokenType: tokenType,
			tokenModifiers: tokenModifiers,
		};
	}
	const tokens: ParsedToken[] = [];
	tree.rootNode.children.forEach(node => {
		if (node.nodeName === "GarbageNode") {
			tokens.push(node2token(node, "comment", ["deprecated"]));
			return;
		}
		if (node.children.length < 2) {
			return;
		}
		const cmdlineNode = node.children[0];
		const contentNodes = node.children.slice(1);
		if (cmdlineNode.children.length !== 2) {
			return;
		}
		const cmdNameNode = cmdlineNode.children[0];
		const cmdArgsNode = cmdlineNode.children[1];
		tokens.push(node2token(cmdNameNode, "keyword", []));
		tokens.push(node2token(cmdArgsNode, "parameter", []));

		const cmdMatch = cmdNameNode.text.match(/(?<=^%\s*)\S+/);
		if (!cmdMatch) {
			return;
		}
		if (cmdMatch[0].match(/^(script|require)$/)) {
			contentNodes.forEach(contentNode => {
				tokens.push(node2token(contentNode, "enumMember", []));
			});
		} else if (cmdMatch[0].match(/^(info|desc|cut)$/)) {
			contentNodes.forEach(contentNode => {
				tokens.push(node2token(contentNode, "string", []));
			});
		} else if (cmdMatch[0].match(/^(include|eo[tf])$/)) {
			contentNodes.forEach(contentNode => {
				tokens.push(node2token(contentNode, "comment", ["deprecated"]));
			});
		} else if (cmdMatch[0].match(/^(file|stdin)$/)) {
			contentNodes.forEach(contentNode => {
				tokens.push(node2token(contentNode, "interface", []));
			});
		} else if (cmdMatch[0].match(/^(expect[vx]?|std(out|err))$/)) {
			contentNodes.forEach(contentNode => {
				tokens.push(node2token(contentNode, "method", []));
			});
		} else if (cmdMatch[0].match(/^ignore[vx]?$/)) {
			contentNodes.forEach(contentNode => {
				tokens.push(node2token(contentNode, "property", []));
			});
		}
	});
	return tokens;
}