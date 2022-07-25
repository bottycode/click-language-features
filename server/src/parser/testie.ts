import { Range, TextDocument } from "vscode-languageserver-textdocument";

function splitRange(range: Range): Range[] {
	const ranges: Range[] = [];

	for (let line = range.start.line; line <= range.end.line; line++) {
		ranges.push({
			start: {
				line: line,
				character: line > range.start.line ? 0 : range.start.character,
			},
			end: {
				line: line < range.end.line ? line + 1 : line,
				character: line < range.end.line ? 0 : range.end.character,
			},
		});
	}

	return ranges;
}

export abstract class Node {
	document: TextDocument;
	range: Range;
	tree: Tree;
	parent: Node | null;
	children: Node[];
	text: string;
	lines: string[];
	nodeName: string;

	constructor(parent: Node | Tree, range: Range) {
		if (parent instanceof Node) {
			this.tree = parent.tree;
			this.parent = parent;
		} else {
			this.tree = parent;
			this.parent = null;
		}
		this.range = range;
		this.children = [];
		this.document = this.tree.document;
		this.text = this.document.getText(range);
		this.lines = this.text.split(/(?<=\n)/);
		this.nodeName = this.constructor.name;
	}

	public get length() {
		return this.document.offsetAt(this.range.end) - this.document.offsetAt(this.range.start);
	}

	public print(indent = 0) {
		function log(message?: any, ...optionalParams: any[]) {
			process.stdout.write("\t".repeat(indent));
			console.log(message, ...optionalParams);
		}

		log(`${this.constructor.name} : [${this.range.start.line},${this.range.start.character}] ==> [${this.range.end.line},${this.range.end.character}]`);

		for (const child of this.children) {
			child.print(indent + 1);
		}
	}
}

class RootNode extends Node {
	constructor(tree: Tree) {
		const range: Range = {
			start: tree.document.positionAt(0),
			end: tree.document.positionAt(tree.document.getText().length),
		};
		super(tree, range);

		const cmdlines: [number, RegExpMatchArray][] = [];

		let textOffset = 0;
		for (const line of this.lines) {
			const sectionMatch = line.match(/^%\s*(\w+)\s*(.*?)\s*$/);
			if (sectionMatch) {
				cmdlines.push([textOffset, sectionMatch]);
			}
			textOffset += line.length;
		}

		for (let cmdIndex = textOffset = 0; cmdIndex < cmdlines.length; cmdIndex++) {
			const sectionOffset = cmdlines[cmdIndex][0];
			const sectionMatch = cmdlines[cmdIndex][1];

			if (textOffset < sectionOffset) {
				textOffset = sectionOffset;
			}

			if (textOffset > sectionOffset) {
				continue;
			}

			const nextOffset = (cmdlines[cmdIndex + 1] || [this.text.length])[0];
			const range: Range = {
				start: this.document.positionAt(sectionOffset),
				end: this.document.positionAt(nextOffset),
			};

			const sectionNode = new SectionNode(this, range, sectionMatch);
			this.children.push(sectionNode);
			textOffset += sectionNode.length;
		}

		const garbageNodes: GarbageNode[] = [];

		this.children.forEach(sectionNode => {
			//
		});
		this.children.push(...garbageNodes);
	}
}

class SectionNode extends Node {
	constructor(parent: Node, range: Range, cmdline: RegExpMatchArray) {
		super(parent, range);

		const sectionName = cmdline[1].toLowerCase();
		const sectionArgs = cmdline[2].split(/\s+/);

		if (sectionName.match(/^(file|std(in|out|err)|(expect|ignore)[vx]?)$/)) {
			const lenArg = sectionArgs.filter(arg => arg.match(/^\+(\d+)$/));
			if (lenArg && lenArg.length === 1) {
				this.range.end = this.document.positionAt(
					this.document.offsetAt(range.start) + cmdline[0].length + Number(lenArg[0])
				);
			}
		}

		const cmdlineRange: Range = {
			start: this.range.start,
			end: this.document.positionAt(
				this.document.offsetAt(this.range.start) + cmdline[0].length
			),
		};
		this.children.push(new CmdlineNode(this, cmdlineRange));

		const contentRange: Range = {
			start: cmdlineRange.end,
			end: this.range.end,
		};
		splitRange(contentRange).forEach(range => this.children.push(new ContentNode(this, range)));
	}
}

class CmdlineNode extends Node {
	constructor(parent: Node, range: Range) {
		super(parent, range);

		const nameMatch = this.lines[0].match(/^%\s*\w+/);
		if (!nameMatch) {
			return;
		}

		const nameRange: Range = {
			start: this.range.start,
			end: this.document.positionAt(
				this.document.offsetAt(this.range.start) + nameMatch[0].length
			),
		};
		this.children.push(new CmdNameNode(this, nameRange));

		const argsRange: Range = {
			start: nameRange.end,
			end: this.range.end,
		};
		this.children.push(new CmdArgsNode(this, argsRange));
	}
}

class ContentNode extends Node {
	constructor(parent: Node, range: Range) {
		super(parent, range);
	}
}

class CmdNameNode extends Node {
	constructor(parent: Node, range: Range) {
		super(parent, range);
	}
}

class CmdArgsNode extends Node {
	constructor(parent: Node, range: Range) {
		super(parent, range);
	}
}

class GarbageNode extends Node {
	constructor(parent: Node, range: Range) {
		super(parent, range);
	}
}

export class Tree {
	readonly document: TextDocument;
	readonly rootNode: Node;

	constructor(document: TextDocument) {
		this.document = document;
		this.rootNode = new RootNode(this);
	}
}

export function parse(document: TextDocument) {
	const tree = new Tree(document);
	// tree.rootNode.print();
	return tree;
}
