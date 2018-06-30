import classNames = require('classnames');
import { bind } from 'decko';
import { Component, h } from 'preact';

import { Edit, EditType } from '../../model';

export interface Props {
    edit: Edit;
    enabled: boolean;
    highlighted: boolean;
    children?: any;
    toggleEditHighlight: (edit: Edit, mouseIsOver: boolean) => void;
}

export default class EditView extends Component<Props> {
    render() {
        const { edit, children, highlighted, enabled } = this.props;
        return (
            <span
                className={classNames('EditView', EditType[edit.type], {
                    'EditView--enabled': enabled,
                    'EditView--highlighted': highlighted,
                })}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
            >
                {children}
            </span>
        );
    }

    @bind
    onMouseOver() { this.toggleEditHighlight(true); }

    @bind
    onMouseOut() { this.toggleEditHighlight(false); }

    toggleEditHighlight(mouseIsOver: boolean) {
        const { edit, enabled, toggleEditHighlight } = this.props;
        if (!enabled) return;
        toggleEditHighlight(edit, mouseIsOver);
    }
}
