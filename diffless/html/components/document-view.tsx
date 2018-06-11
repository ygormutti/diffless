import { h } from 'preact';
import * as model from '../../model';

import LineView from './line-view';

export interface Props {
    document: model.Document;
    children?: typeof LineView[];
}

export default function DocumentView(props: Props) {
    const { document } = props;
    return (
        <div className="DocumentView">
            <div className="DocumentView-header">{document.uri}</div>
            <table className="DocumentView-lines">
                {props.children}
            </table>
        </div>
    );
}
