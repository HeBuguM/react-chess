import { Paper } from "@mui/material";
import "./Notation.css";

interface Props {
    moves: Array<string>;
}

export default function Notation ({ moves }: Props){ 
    let full_moves = [];
    for (let i = 0; i < moves.length; i += 2) {
        const chunk = moves.slice(i, i + 2);
        full_moves.push(chunk);
    }
    return (
        <Paper id="notation">
            {full_moves.map((moves,i) => 
                <div className="fullMove" key={i}>
                    <div className="moveNo">{i+1}</div>
                    <div className="moveWhite">{moves[0]}</div>
                    <div className="moveBlack">{moves[1]}</div>
                </div>
            )}
        </Paper>
    );
};

