import { bind, debounce } from 'decko';
import { Component, h } from 'preact';

import { DiffLevel, Document, Edit, EditType } from '../../../model';
import { intEnumKeys } from '../../../util';

import EnumMultiSelect from '../enum-multi-select';
import SideBySideFileDiff from './side-by-side';

export interface Props {
    left: Document;
    right: Document;
    edits: Edit[];
}

export interface State {
    enabledDiffLevels: boolean[];
    enabledEditTypes: boolean[];
    highlightedEdit?: Edit;
}

export default class FileDiff extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            enabledDiffLevels: Array(intEnumKeys(DiffLevel).length).fill(true),
            enabledEditTypes: Array(intEnumKeys(EditType).length).fill(true),
        };
    }

    render() {
        const { left, right, edits } = this.props;
        const { enabledDiffLevels, enabledEditTypes, highlightedEdit } = this.state;

        return (
            <div className="FileDiff">
                <div className="FileDiff-controls">
                    <EnumMultiSelect
                        label="Diff levels"
                        Enum={DiffLevel}
                        enabledValues={enabledDiffLevels}
                        onToggle={this.toggleLevel}
                    />
                    <EnumMultiSelect
                        label="Edit types"
                        Enum={EditType}
                        enabledValues={enabledEditTypes}
                        onToggle={this.toggleType}
                    />
                </div>

                <SideBySideFileDiff
                    left={left}
                    right={right}
                    edits={edits}
                    enabledDiffLevels={enabledDiffLevels}
                    enabledEditTypes={enabledEditTypes}
                    highlightedEdit={highlightedEdit}
                    setHighlightedEdit={this.setHighlightedEdit}
                />

                <div className="FileDiff-status">
                    {highlightedEdit ? highlightedEdit.code : ''}
                </div>
            </div>
        );
    }

    @bind
    toggleLevel(diffLevel: DiffLevel) {
        const { enabledDiffLevels } = this.state;
        enabledDiffLevels[diffLevel] = !enabledDiffLevels[diffLevel];
        this.setState({ enabledDiffLevels });
    }

    @bind
    toggleType(editType: EditType) {
        const { enabledEditTypes } = this.state;
        enabledEditTypes[editType] = !enabledEditTypes[editType];
        this.setState({ enabledEditTypes });
    }

    @bind
    @debounce
    setHighlightedEdit(edit?: Edit) {
        this.setState({ highlightedEdit: edit });
    }
}
