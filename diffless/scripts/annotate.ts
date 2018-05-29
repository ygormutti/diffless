import { annotateWithDiff } from '../cli';

const { argv } = process;

// tslint:disable-next-line:no-console
console.log(annotateWithDiff(argv[2], argv[3]));
