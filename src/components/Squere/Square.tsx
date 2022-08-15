import "./Square.css";

interface Props {
    number: number;
    coordinates: string;
    piece_type?: string;
    team?: string;
}

export default function Square ({ number , piece_type, team, coordinates}: Props){ 
    let square_type = number % 2 === 0 ? 'dark' : 'light';
    return (
        <div className={`square ${square_type}`} data-coordinates={coordinates} >
            {piece_type && <div className={`chess-piece ${piece_type} ${team}`}></div>}
        </div>
    );
};