import { h } from 'preact';

export interface Props {
    number: number;
    children?: JSX.Element[];
}

export default function LineView(props: Props) {
    return (
        <tr className="LineView">
            <td data-number={props.number} className="LineView-number"></td>
            <td className="LineView-content"><pre>{props.children}</pre></td>
        </tr>
    );
}
