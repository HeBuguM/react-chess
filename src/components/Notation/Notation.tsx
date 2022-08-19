import { Paper } from "@mui/material";
import { GameScore } from "../../Constants";
import "./Notation.css";

interface Props {
    moves: Array<string>;
    score: GameScore
}

export default function Notation ({ moves, score }: Props){ 
    let full_moves = [];
    for (let i = 0; i < moves.length; i += 2) {
        const chunk = moves.slice(i, i + 2);
        full_moves.push(chunk);
    }
    return (
        <> 
        <Paper id="notation">
            {full_moves.map((moves,i) => 
                <div className="fullMove" key={i}>
                    <div className="moveNo">{i+1}</div>
                    <div className="moveWhite">{moves[0]}</div>
                    <div className="moveBlack">{moves[1]}</div>
                </div>
            )}
        </Paper>
        { score.type && 
            <Paper sx={{marginTop: 2, padding: "5px",textAlign: "center",backgroundColor: score.black > score.white ? "black" : (score.white > score.black ? "white" : "") }}>
                <div style={{fontSize: '1.5em'}}>
                    {score.white === 0.5 ? '½' : score.white}-{score.black === 0.5 ? '½' : score.white}
                </div>
                <div>
                    {score.black > score.white ? "Black Wins" : (score.white > score.black ? "White Wins" : "Draw")}  •  {score.type}
                </div>
            </Paper>
        }
        </>
    );
};

