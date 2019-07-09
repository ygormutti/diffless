import { buildAnnotatedHTML, readTextFile } from '../cli';
import { JSIN } from '../jsin';
import { DiffLevel, Document, Edit, EditOperation, Location } from '../model';

const { argv } = process;

export function annotateWithEditsFile(leftPath: string, rightPath: string, editsPath: string) {
    const left = new Document('string:left', readTextFile(leftPath));
    const right = new Document('string:right', readTextFile(rightPath));

    const jsonEdits = JSIN.parse(readTextFile(editsPath)) as JsonEdit[];
    const edits = jsonEdits.map(e => toEdit(e));

    return buildAnnotatedHTML(left, right, edits);
}

interface JsonEdit {
    right?: Location;
    left?: Location;
    level: keyof typeof DiffLevel;
    operation: keyof typeof EditOperation;
}

function toEdit(objFromJson: JsonEdit): Edit {
    return new Edit(
        DiffLevel[objFromJson.level],
        EditOperation[objFromJson.operation],
        objFromJson.left,
        objFromJson.right,
    );
}

console.info(annotateWithEditsFile(argv[2], argv[3], argv[4]));
