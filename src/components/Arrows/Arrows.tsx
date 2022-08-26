import { ArrowType } from '../../constants/Constants';

interface Props {
    arrows: ArrowType[];
    boardFlipped: boolean;
}

const Arrows = ({ arrows, boardFlipped }: Props) => {
    console.log(arrows);
    return (
        <svg className="drawings" preserveAspectRatio="xMidYMid slice" viewBox="0 0 8 8">
            <defs>
                <marker id="arrowhead-g" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01">
                    <path d="M0,0 V4 L3,2 Z" fill="#15781B"></path>
                </marker>
            </defs>
            <g>
                {arrows.map((arrow, i) =>
                    <line key={i} stroke="#15781B" strokeWidth="0.14" markerEnd="url(#arrowhead-g)" opacity="0.7"
                        x1={(boardFlipped ? 7 - arrow.start.x : arrow.start.x) + 0.5}
                        y1={(boardFlipped ? arrow.start.y : 7 - arrow.start.y) + 0.5}
                        
                        x2={(boardFlipped ? 7 - arrow.end.x : arrow.end.x) + 0.5}
                        y2={(boardFlipped ? arrow.end.y : 7 - arrow.end.y) + 0.5}
                    >
                    </line>
                )}
            </g>
        </svg>
    )
}

export default Arrows