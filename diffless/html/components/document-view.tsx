import { h } from 'preact';
import * as model from '../../model';

import LineView from './line-view';

export interface Props {
    document: model.Document;
    children?: any;
}

export default function DocumentView(props: Props) {
    const { document, children } = props;
    return (
        <div className="DocumentView">
            <div className="DocumentView-header">{document.uri}</div>
            <table className="DocumentView-lines">
                {children}
            </table>
        </div>
    );
}
