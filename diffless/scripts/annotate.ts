import { annotateWithDiff } from '../io';

const { argv } = process;

// tslint:disable-next-line:no-console
console.log(annotateWithDiff(argv[2], argv[3]));
