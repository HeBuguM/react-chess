import { ArrowType } from '../../Constants';

interface Props {
    arrows: ArrowType[];
    boardFlipped: boolean;
}

const Arrows = ({ arrows, boardFlipped }: Props) => {
    return (
        <svg className="drawings" preserveAspectRatio="xMidYMid slice" viewBox="-4 -4 8 8">
            <defs>
                <marker id="arrowhead-g" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01">
                    <path d="M0,0 V4 L3,2 Z" fill="#15781B"></path>
                </marker>
            </defs>
            <g>
                {arrows.map((arrow, i) =>
                    <line key={i} stroke="#15781B" strokeWidth="0.15" markerEnd="url(#arrowhead-g)" opacity="0.7"
                        x1={arrow.start.x - 3.5} y1={7 - arrow.start.y - 3.5} x2={arrow.end.x - 3.5} y2={7 - arrow.end.y - 3.5}
                    >
                    </line>
                )}
            </g>
        </svg>
    )
}

export default Arrows