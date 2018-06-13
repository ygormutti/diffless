import * as classnames from 'classnames';
import { bind } from 'decko';
import { Component, h } from 'preact';

import { Change, ChangeType } from '../../model';

export interface Props {
    change: Change;
    enabled: boolean;
    highlighted: boolean;
    children?: any;
    toggleChangeHighlight: (change: Change, mouseIsOver: boolean) => void;
}

export default class ChangeView extends Component<Props> {
    render() {
        const { change, children, highlighted, enabled } = this.props;
        return (
            <span
                className={(classnames as any).default('ChangeView', ChangeType[change.type], {
                    'ChangeView--enabled': enabled,
                    'ChangeView--highlighted': highlighted,
                })}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
            >
                {children}
            </span>
        );
    }

    @bind
    onMouseOver() { this.toggleChangeHighlight(true); }

    @bind
    onMouseOut() { this.toggleChangeHighlight(false); }

    toggleChangeHighlight(mouseIsOver: boolean) {
        const { change, toggleChangeHighlight } = this.props;
        toggleChangeHighlight(change, mouseIsOver);
    }
}
