import { h, render } from 'preact';

import { Change, Document } from '../model';

import { JSIN } from '../jsin';
import FileDiff from './components/file-diff';
import './styles.scss';

const { left, right, changes } = JSIN.parse((window as any).props);
const diffDiv = document.getElementById('diff')!;

render(
    <FileDiff left={left} right={right} changes={changes} />,
    diffDiv,
    diffDiv.lastElementChild!,
);
