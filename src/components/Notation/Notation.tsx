import { Paper } from "@mui/material";
import { GameScore, MoveHistory } from "../../models/Constants";
import "./Notation.css";

interface Props {
    moves: MoveHistory[];
    score: GameScore;
    boardMove: number;
    changeBoardMove: any;
}

export default function Notation ({ moves, score, boardMove, changeBoardMove }: Props){ 
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
                    <div className={`moveBoard ${boardMove === ((i+1)*2)-1 ? "active" : ""}`} title={moves[0].FEN} onClick={ () => changeBoardMove(((i+1)*2)-1)}>{moves[0].notation}</div>
                    {moves[1] && <div className={`moveBoard ${boardMove === (i+1)*2 ? "active" : ""}`} title={moves[1] ? moves[1].FEN : ""} onClick={() => changeBoardMove((i+1)*2)}>{moves[1] && moves[1].notation}</div>}
                </div>
            )}
        </Paper>
        { score.type && 
            <Paper sx={{marginTop: 2, padding: "5px",textAlign: "center",color: score.white > score.black ? "black" : "",backgroundColor: score.black > score.white ? "black" : (score.white > score.black ? "white" : "") }}>
                <div style={{fontSize: '1.5em'}}>
                    {score.white === 0.5 ? '½' : score.white}-{score.black === 0.5 ? '½' : score.black}
                </div>
                <div>
                    {score.black > score.white ? "Black Wins" : (score.white > score.black ? "White Wins" : "Draw")}  •  {score.type}
                </div>
            </Paper>
        }
        </>
    );
};

