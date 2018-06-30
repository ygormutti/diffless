import { h, render } from 'preact';

import { JSIN } from '../jsin';
import FileDiff from './components/file-diff';
import './styles.scss';

const { left, right, edits } = JSIN.parse((window as any).props);
const diffDiv = document.getElementById('diff')!;

render(
    <FileDiff left={left} right={right} edits={edits} />,
    diffDiv,
    diffDiv.lastElementChild!,
);
