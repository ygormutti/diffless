import { reduce } from 'lodash';
import { extname } from 'path';
import { HCSDiffTool } from './hcsdiff/diff';
import {
    DiffLevel, DiffTool, DiffToolFactory, Document, DocumentDiff,
} from './model';

const lineDiffTool = new HCSDiffTool({
    level: DiffLevel.Textual,
    similarityThreshold: 0,
    toAtomArray: document => document.lines,
});
export const lineDiff = lineDiffTool.compare;

const characterDiffTool = new HCSDiffTool({
    level: DiffLevel.Textual,
    similarityThreshold: 1,
    toAtomArray: document => document.characters,
});
export const characterDiff = characterDiffTool.compare;

export function combine(...diffs: DiffTool[]): DiffTool {
    return (left: Document, right: Document) => {
        return reduce(diffs, (acc: DocumentDiff, diffTool: DiffTool) => {
            const documentDiff = diffTool(left, right);
            const edits = acc.edits.concat(documentDiff.edits);
            const similarities = acc.similarities.concat(documentDiff.similarities);
            return new DocumentDiff(left, right, edits, similarities);
        }, new DocumentDiff(left, right, [], []));
    };
}

const TEXT_DIFF_TOOL_FACTORY = (_: unknown) => combine(lineDiff, characterDiff);

export class DiffToolRegistry {
    byExtension: Map<string, DiffToolFactory>;

    constructor(
        readonly defaultFactory: DiffToolFactory = TEXT_DIFF_TOOL_FACTORY,
    ) {
        this.byExtension = new Map();
    }

    registerExtension(extension: string, factory: DiffToolFactory) {
        console.info(`Registering ${extension} extension`);
        this.byExtension.set(extension, factory);
    }

    getByExtension(leftPath: string, rightPath: string): DiffToolFactory {
        let factory = this.defaultFactory;
        const leftExtension = extname(leftPath);
        const rightExtension = extname(rightPath);

        if (leftExtension !== rightExtension) {
            console.warn(`Left extension is "${leftExtension}", but right is "${rightExtension}"`);
        }

        const registeredFactory = this.byExtension.get(leftExtension);
        if (registeredFactory) {
            factory = registeredFactory;
        } else {
            console.warn(`No diff tools registered for "${leftExtension}" extension`);
        }

        return factory;
    }
}
