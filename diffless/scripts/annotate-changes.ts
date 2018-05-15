import { annotateWithChangesFile } from '../io';

const { argv } = process;

// tslint:disable-next-line:no-console
console.log(annotateWithChangesFile(argv[2], argv[3], argv[4]));
