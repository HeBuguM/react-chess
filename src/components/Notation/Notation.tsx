import "./Notation.css";

interface Props {
    moves: Array<string>;
}

export default function Notation ({ moves }: Props){ 

    return (
        <div id="notation">
            {moves.map((move,i) => <div key={i}>{move}</div>)}
        </div>
    );
};