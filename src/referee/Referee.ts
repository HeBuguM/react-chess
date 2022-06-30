import { PieceType, TeamType, Piece } from "../components/Chessboard/Chessboard";

export default class Referee {

    isOccupied(dropX:number, dropY:number, boardState: Piece[]) {
        const piece = boardState.find(p => p.x === dropX && p.y === dropY);
        return piece ? true : false;
    }
    
    isValidMove (grabX:number , grabY:number, dropX:number, dropY:number, type: PieceType, team: TeamType, boardState: Piece[]) {
        if(type === PieceType.PAWN) {
            const firstMove = team === TeamType.WHITE ? 1 : 6
            const pawnDirection = team === TeamType.WHITE ? 1 : -1;
            if(grabX === dropX && ((dropY - grabY  === pawnDirection && !this.isOccupied(dropX, dropY, boardState)) || (grabY === firstMove && dropY - grabY === 2*pawnDirection && !this.isOccupied(dropX, dropY-(pawnDirection), boardState)))) {
                if(!this.isOccupied(dropX, dropY, boardState)) {
                    return true;
                }
            }
        }
        return false;
    }
}