import { bind } from 'decko';
import { Component, h } from 'preact';
import { Change, ChangeLevel, ChangeType, Document } from '../../../model';
import { intEnumKeys } from '../../../util';

import EnumMultiSelect from '../enum-multi-select';
import SideBySideFileDiff from './side-by-side';

export interface Props {
    left: Document;
    right: Document;
    changes: Change[];
}

export interface State {
    enabledChangeLevels: boolean[];
    enabledChangeTypes: boolean[];
    highlightedChange?: Change;
}

export default class FileDiff extends Component<Props, State> {
    constructor() {
        super();

        this.state = {
            enabledChangeLevels: Array(intEnumKeys(ChangeLevel).length).fill(true),
            enabledChangeTypes: Array(intEnumKeys(ChangeType).length).fill(true),
        };
    }

    @bind
    toggleLevel(changeLevel: ChangeLevel) {
        const { enabledChangeLevels } = this.state;
        enabledChangeLevels[changeLevel] = !enabledChangeLevels[changeLevel];
        this.setState({ enabledChangeLevels });
    }

    @bind
    toggleType(changeType: ChangeType) {
        const { enabledChangeTypes } = this.state;
        enabledChangeTypes[changeType] = !enabledChangeTypes[changeType];
        this.setState({ enabledChangeTypes });
    }

    render() {
        const { left, right, changes } = this.props;
        const { enabledChangeLevels, enabledChangeTypes, highlightedChange } = this.state;

        return (
            <div className="FileDiff">
                <div className="FileDiff-controls">
                    <EnumMultiSelect
                        label="Change levels"
                        Enum={ChangeLevel}
                        enabledValues={enabledChangeLevels}
                        onToggle={this.toggleLevel}
                    />
                    <EnumMultiSelect
                        label="Change types"
                        Enum={ChangeType}
                        enabledValues={enabledChangeTypes}
                        onToggle={this.toggleType}
                    />
                </div>

                <SideBySideFileDiff
                    left={left}
                    right={right}
                    changes={changes}
                    enabledChangeLevels={enabledChangeLevels}
                    enabledChangeTypes={enabledChangeTypes}
                    highlightedChange={highlightedChange}
                />
            </div>
        );
    }
}
