import { annotateWithEditsFile } from '../cli';

const { argv } = process;

// tslint:disable-next-line:no-console
console.log(annotateWithEditsFile(argv[2], argv[3], argv[4]));
