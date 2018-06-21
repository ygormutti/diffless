import { bind } from 'decko';
import { Component, h } from 'preact';
import { intEnumKeys } from '../../util';

export interface Props {
    label: string;
    Enum: any;
    enabledValues: boolean[];
    onToggle: (e: number) => void;
}

export default class EnumMultiSelect extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    @bind
    onChange(event: Event) {
        const { Enum } = this.props;
        const target = event.target! as HTMLInputElement;
        this.props.onToggle(Enum[target.name]);
    }

    render() {
        const { label, Enum, enabledValues } = this.props;
        return (
            <div className="EnumMultiSelect">
                <span>{label}:</span>
                {intEnumKeys(Enum).map(k =>
                    <label key={k}>
                        <input
                            type="checkbox"
                            name={k}
                            checked={enabledValues[Enum[k]]}
                            onChange={this.onChange}
                        />
                        {k}
                    </label>,
                )}
            </div>
        );

    }
}
