import "./Square.css";

interface Props {
    number: number;
    coordinates: string;
    image?: string;
}

export default function Square ({ number , image, coordinates}: Props){ 
    let square_type = number % 2 === 0 ? 'light' : 'dark';
    return (
        <div className={`square ${square_type}-square`} data-coordinates={coordinates}>
            {image && <div style={{backgroundImage: `url(${image})`}} className="chess-piece"></div>}
        </div>
    );
};